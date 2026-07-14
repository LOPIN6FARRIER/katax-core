import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

/**
 * Schema for lazy/deferred schema resolution.
 * Essential for recursive schemas where a schema references itself.
 *
 * @example
 * ```typescript
 * interface Category {
 *   name: string
 *   subcategories: Category[]
 * }
 *
 * const categorySchema: BaseSchema<Category> = k.lazy(() =>
 *   k.object({
 *     name: k.string(),
 *     subcategories: k.array(categorySchema)
 *   })
 * )
 * ```
 */
export class LazySchema<T> extends BaseSchema<T> {
  private _cached: BaseSchema<T> | null = null

  constructor(private resolver: () => BaseSchema<T>) {
    super()
  }

  private getSchema(): BaseSchema<T> {
    if (this._cached === null) {
      this._cached = this.resolver()
    }
    return this._cached
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    return this.getSchema()._parse(input, path)
  }

  toJsonSchema(): JsonSchema {
    return {
      ...this._jsonSchema,
      ...this.getSchema().toJsonSchema(),
    }
  }

  protected _clone(): LazySchema<T> {
    const cloned = new LazySchema(this.resolver)
    cloned._cached = this._cached
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  protected async _parseAsyncNested(value: T, path: Issue["path"]): Promise<Issue[]> {
    const schema = this.getSchema()
    if (schema._asyncValidators.length > 0 ||
        typeof (schema as any)._parseAsyncNested === 'function') {
      const result = await schema.safeParseAsync(value)
      if (!result.success) {
        return result.issues || []
      }
    }
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.getSchema().hasAsyncValidation()
  }
}
