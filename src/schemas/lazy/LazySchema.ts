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
let lazyAnchorCounter = 0

/** `$anchor` values must match ^[A-Za-z_][-A-Za-z0-9._]*$ (JSON Schema 2020-12). */
function toAnchorName(name: string): string {
  const cleaned = name.replace(/[^-A-Za-z0-9._]/g, "_")
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`
}

export class LazySchema<T> extends BaseSchema<T> {
  private _cached: BaseSchema<T> | null = null
  private _resolving = false
  private _resolvingJsonSchema = false
  private _recursiveJsonSchema = false
  private _checkingAsyncValidation = false
  private readonly _anchor: string

  constructor(private resolver: () => BaseSchema<T>, name?: string) {
    super()
    this._anchor = toAnchorName(name ?? `KataxLazy${++lazyAnchorCounter}`)
  }

  private getSchema(): BaseSchema<T> {
    if (this._cached === null) {
      if (this._resolving) {
        throw new Error(
          "k.lazy(): circular reference detected while resolving the schema. " +
            "The resolver function referenced its own lazy schema before returning " +
            "(e.g. via a container schema that eagerly inspects its element schema). " +
            "Make sure the resolver only builds the schema and doesn't trigger " +
            "resolution of itself synchronously.",
        )
      }
      this._resolving = true
      try {
        this._cached = this.resolver()
      } finally {
        this._resolving = false
      }
    }
    return this._cached
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    return this.getSchema()._parse(input, path)
  }

  /**
   * A self-referential schema (e.g. a tree) is emitted once, tagged with
   * `$anchor`, and every recursive occurrence becomes `{ $ref: "#<anchor>" }`
   * (JSON Schema 2020-12 / OpenAPI 3.1). `$anchor` is only added when the
   * schema actually recurses, so non-recursive lazy schemas are unchanged.
   *
   * Name the anchor with k.lazy(resolver, "Category") to get a readable `$ref`.
   */
  toJsonSchema(): JsonSchema {
    if (this._resolvingJsonSchema) {
      this._recursiveJsonSchema = true
      return { $ref: `#${this._anchor}` }
    }
    this._resolvingJsonSchema = true
    this._recursiveJsonSchema = false
    try {
      const resolved: JsonSchema = {
        ...this.getSchema().toJsonSchema(),
        ...this._jsonSchema,
      }
      return this._recursiveJsonSchema ? { $anchor: this._anchor, ...resolved } : resolved
    } finally {
      this._resolvingJsonSchema = false
      this._recursiveJsonSchema = false
    }
  }

  protected _clone(): LazySchema<T> {
    const cloned = new LazySchema(this.resolver, this._anchor)
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
    // A self-referential schema graph makes this traversal cyclic (object -> array
    // -> this same lazy schema -> object -> ...). Break the cycle on re-entry: the
    // recursive branch itself contributes nothing new that the outer call hasn't
    // already accounted for.
    if (this._checkingAsyncValidation) {
      return false
    }
    this._checkingAsyncValidation = true
    try {
      return this.getSchema().hasAsyncValidation()
    } finally {
      this._checkingAsyncValidation = false
    }
  }
}
