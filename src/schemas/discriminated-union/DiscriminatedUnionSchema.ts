import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived, isIssueArray } from "../../core/result"

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

    const schema = this.schemasMap[discriminatorValue as string]
    if (!schema) {
      return [{ path: [...path, this.key as string], message: `Invalid discriminator value '${String(discriminatorValue)}'. Expected one of: ${Object.keys(this.schemasMap).join(", ")}` }]
    }

    return schema._parse(input, path) as DiscriminatedUnionOutput<R>
  }

  protected _clone(): DiscriminatedUnionSchema<K, R> {
    const cloned = new DiscriminatedUnionSchema(this.key, { ...this.schemasMap })
    cloned._asyncValidators = [...this._asyncValidators]
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
