import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived, isIssueArray } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

type DiscriminatedUnionOutput<R extends Record<string, BaseSchema<any>>> = {
  [P in keyof R]: R[P] extends BaseSchema<infer T> ? T : never
}[keyof R]

export class DiscriminatedUnionSchema<K extends string, R extends Record<string, BaseSchema<any>>> extends BaseSchema<DiscriminatedUnionOutput<R>> {
  constructor(private key: K, private schemasMap: R) {
    super()
    if (Object.keys(schemasMap).length === 0) {
      throw new Error("DiscriminatedUnion requires at least one schema")
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | DiscriminatedUnionOutput<R> {
    if (typeof input !== "object" || input === null) {
      return [{ path, message: `Expected an object, received ${describeReceived(input)}` }]
    }

    const discriminatorValue = (input as Record<string, unknown>)[this.key]
    if (discriminatorValue === undefined) {
      return [{ path: [...path, this.key as string], message: `Expected discriminator key '${String(this.key)}' to be present` }]
    }

    // Own keys only: a value like "toString" or "constructor" must not resolve to
    // an Object.prototype member (that crashed with "schema._parse is not a function").
    const schema = Object.prototype.hasOwnProperty.call(this.schemasMap, discriminatorValue as string)
      ? this.schemasMap[discriminatorValue as string]
      : undefined
    if (!schema) {
      return [{ path: [...path, this.key as string], message: `Invalid discriminator value '${String(discriminatorValue)}'. Expected one of: ${Object.keys(this.schemasMap).join(", ")}` }]
    }

    return schema._parse(input, path) as DiscriminatedUnionOutput<R>
  }

  /**
   * Each branch is selected only by its discriminator value, so every branch in
   * the JSON Schema pins that key (`const` + `required`). Without it, two
   * branches whose other fields overlap could both match and `oneOf` would
   * reject valid data.
   */
  toJsonSchema(): JsonSchema {
    return {
      ...this._jsonSchema,
      oneOf: Object.entries(this.schemasMap).map(([value, s]) =>
        this._pinDiscriminator(s.toJsonSchema(), value),
      ),
    }
  }

  private _pinDiscriminator(branch: JsonSchema, mapKey: string): JsonSchema {
    const key = this.key as string
    const declared = branch.properties?.[key]
    // Keep the branch's own literal (it may be a number/boolean, e.g. k.literal(1)).
    const keySchema: JsonSchema =
      declared && ("const" in declared || declared.enum) ? declared : { const: mapKey }

    if (branch.properties) {
      const required = branch.required ?? []
      return {
        ...branch,
        properties: { ...branch.properties, [key]: keySchema },
        required: required.includes(key) ? required : [...required, key],
      }
    }
    return {
      allOf: [branch, { type: "object", properties: { [key]: keySchema }, required: [key] }],
    }
  }

  protected _clone(): DiscriminatedUnionSchema<K, R> {
    const cloned = new DiscriminatedUnionSchema(this.key, { ...this.schemasMap })
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  protected async _parseAsyncNested(value: DiscriminatedUnionOutput<R>, path: Issue["path"]): Promise<Issue[]> {
    const obj = value as Record<string, unknown>
    const discriminatorValue = obj[this.key]
    const schema = this.schemasMap[discriminatorValue as string]
    if (schema) {
      if (schema._asyncValidators.length > 0 ||
          typeof (schema as any)._parseAsyncNested === 'function') {
        const asyncResult = await schema.safeParseAsync(value)
        if (!asyncResult.success) {
          return asyncResult.issues || []
        }
      }
    }
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return Object.values(this.schemasMap).some((schema) => schema.hasAsyncValidation())
  }
}
