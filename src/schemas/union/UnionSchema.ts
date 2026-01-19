import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

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
  constructor(private schemas: T) {
    super()
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
      if (!this.isIssueArray(result)) {
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

  private isIssueArray(result: unknown): result is Issue[] {
    return Array.isArray(result) && result.length > 0 &&
      typeof result[0] === 'object' && result[0] !== null &&
      'path' in result[0] && 'message' in result[0]
  }

  protected _clone(): UnionSchema<T> {
    const cloned = new UnionSchema([...this.schemas] as T)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: UnionToTuple<T[number]>, path: Issue["path"]): Promise<Issue[]> {
    // Find which schema matched and run its async validation
    for (const schema of this.schemas) {
      const result = schema._parse(value, path)
      if (!this.isIssueArray(result)) {
        // This schema matched, run its async validation
        if (schema._asyncValidators.length > 0 ||
            typeof (schema as any)._parseAsyncNested === 'function') {
          const asyncResult = await schema.safeParseAsync(value)
          if (!asyncResult.success) {
            return asyncResult.issues || []
          }
        }
        break
      }
    }
    return []
  }
}
