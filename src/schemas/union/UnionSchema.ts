import { BaseSchema } from "../../core/BaseSchema"
import { Issue, isIssueArray } from "../../core/result"

type UnionToTuple<T> = T extends BaseSchema<infer U> ? U : never

/**
 * Schema for validating union types (value must match one of the schemas).
 *
 * @example
 * ```typescript
 * const schema = k.union([k.string(), k.number()])
 * schema.parse("hello") // "hello"
 * schema.parse(42) // 42
 * schema.parse(true) // throws - not string or number
 * ```
 */
export class UnionSchema<T extends BaseSchema<any>[]> extends BaseSchema<UnionToTuple<T[number]>> {
  private schemas: T
  private _lastMatchedSchema: BaseSchema<any> | null = null

  constructor(schemas: T) {
    super()
    this.schemas = schemas
    if (schemas.length === 0) {
      throw new Error("Union schema requires at least one schema")
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | UnionToTuple<T[number]> {
    const allIssues: Issue[][] = []

    // Try each schema in order
    for (const schema of this.schemas) {
      const result = schema._parse(input, path)

      // Check if result is NOT an array of Issues (i.e., it's valid data)
      if (!isIssueArray(result)) {
        this._lastMatchedSchema = schema
        return result as UnionToTuple<T[number]>
      }

      allIssues.push(result as Issue[])
    }

    // None matched - combine all issues
    return [{
      path,
      message: `Value does not match any of the union schemas`
    }]
  }

  protected _clone(): UnionSchema<T> {
    const cloned = new UnionSchema([...this.schemas] as T)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: UnionToTuple<T[number]>, path: Issue["path"]): Promise<Issue[]> {
    if (this._lastMatchedSchema) {
      const schema = this._lastMatchedSchema
      this._lastMatchedSchema = null
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
    return this.schemas.some((schema) => schema.hasAsyncValidation())
  }
}
