import { BaseSchema } from "../../core/BaseSchema"
import { Issue, isIssueArray } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
type IntersectionResult<T extends BaseSchema<any>[]> = UnionToIntersection<T[number] extends BaseSchema<infer U> ? U : never>

export class IntersectionSchema<T extends BaseSchema<any>[]> extends BaseSchema<IntersectionResult<T>> {
  private schemas: T
  private _matchedSchemas: BaseSchema<any>[] = []

  constructor(schemas: T) {
    super()
    this.schemas = schemas
    if (schemas.length === 0) {
      throw new Error("Intersection schema requires at least one schema")
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | IntersectionResult<T> {
    const allIssues: Issue[] = []
    let mergedResult: Record<string, unknown> | null = null
    let nonObjectResult: unknown = undefined
    this._matchedSchemas = []

    for (const schema of this.schemas) {
      const result = schema._parse(input, path)

      if (isIssueArray(result)) {
        allIssues.push(...result)
      } else if (result !== null && typeof result === 'object' && !Array.isArray(result)) {
        this._matchedSchemas.push(schema)
        if (nonObjectResult !== undefined) {
          allIssues.push({ path, message: "Cannot intersect object with non-object type" })
        } else {
          const objResult = result as Record<string, unknown>
          if (mergedResult) {
            for (const k of Object.keys(objResult)) {
              mergedResult[k] = objResult[k]
            }
          } else {
            mergedResult = {}
            for (const k of Object.keys(objResult)) {
              mergedResult[k] = objResult[k]
            }
          }
        }
      } else {
        this._matchedSchemas.push(schema)
        if (mergedResult !== null) {
          allIssues.push({ path, message: "Cannot intersect object with non-object type" })
        } else {
          nonObjectResult = result
        }
      }
    }

    if (allIssues.length > 0) {
      return allIssues
    }

    if (mergedResult !== null) {
      return mergedResult as IntersectionResult<T>
    }
    return nonObjectResult as IntersectionResult<T>
  }

  toJsonSchema(): JsonSchema {
    return {
      ...this._jsonSchema,
      allOf: this.schemas.map((s) => s.toJsonSchema()),
    }
  }

  protected _clone(): IntersectionSchema<T> {
    const cloned = new IntersectionSchema([...this.schemas] as T)
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  protected async _parseAsyncNested(value: IntersectionResult<T>, path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []

    for (const schema of this._matchedSchemas) {
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

  protected _hasAsyncValidationNested(): boolean {
    return this.schemas.some((schema) => schema.hasAsyncValidation())
  }
}
