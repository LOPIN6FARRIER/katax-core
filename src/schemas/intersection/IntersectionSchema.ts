import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
type IntersectionResult<T extends BaseSchema<any>[]> = UnionToIntersection<T[number] extends BaseSchema<infer U> ? U : never>

/**
 * Schema for validating intersection types (value must match ALL schemas).
 * Primarily useful for combining object schemas.
 *
 * @example
 * ```typescript
 * const baseSchema = k.object({ id: k.number() })
 * const nameSchema = k.object({ name: k.string() })
 * const schema = k.intersection([baseSchema, nameSchema])
 * schema.parse({ id: 1, name: "John" }) // { id: 1, name: "John" }
 * ```
 */
export class IntersectionSchema<T extends BaseSchema<any>[]> extends BaseSchema<IntersectionResult<T>> {
  constructor(private schemas: T) {
    super()
    if (schemas.length === 0) {
      throw new Error("Intersection schema requires at least one schema")
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | IntersectionResult<T> {
    const allIssues: Issue[] = []
    let mergedResult: Record<string, unknown> = {}

    // Validate against all schemas
    for (const schema of this.schemas) {
      const result = schema._parse(input, path)

      if (this.isIssueArray(result)) {
        allIssues.push(...result)
      } else if (typeof result === 'object' && result !== null) {
        // Merge object results
        mergedResult = { ...mergedResult, ...result }
      } else {
        // For non-object schemas, just ensure validation passes
        mergedResult = result as any
      }
    }

    if (allIssues.length > 0) {
      return allIssues
    }

    return mergedResult as IntersectionResult<T>
  }

  private isIssueArray(result: unknown): result is Issue[] {
    return Array.isArray(result) && result.length > 0 &&
      typeof result[0] === 'object' && result[0] !== null &&
      'path' in result[0] && 'message' in result[0]
  }

  protected _clone(): IntersectionSchema<T> {
    const cloned = new IntersectionSchema([...this.schemas] as T)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: IntersectionResult<T>, path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []

    // Run async validation on all schemas
    for (const schema of this.schemas) {
      if (schema._asyncValidators.length > 0 ||
          typeof (schema as any)._parseAsyncNested === 'function') {
        const asyncResult = await schema.safeParseAsync(value)
        if (!asyncResult.success) {
          allIssues.push(...(asyncResult.issues || []))
        }
      }
    }

    return allIssues
  }
}
