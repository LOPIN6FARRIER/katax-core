import { BaseSchema } from "../../core/BaseSchema"
import { Issue, isIssueArray, describeReceived } from "../../core/result"

type CustomValidator<T> = (value: unknown, path: Issue["path"]) => Issue[] | T

/**
 * Schema for creating custom validation logic.
 * Allows users to define their own parsing and validation rules.
 *
 * @example
 * ```typescript
 * const positiveEven = k.custom<number>((value, path) => {
 *   if (typeof value !== 'number') {
 *     return [{ path, message: 'Expected number' }]
 *   }
 *   if (value <= 0 || value % 2 !== 0) {
 *     return [{ path, message: 'Expected positive even number' }]
 *   }
 *   return value
 * })
 * ```
 */
export class CustomSchema<T> extends BaseSchema<T> {
  private refinements: Array<{ check: (value: T) => boolean; message: string | ((value: T) => string) }> = []

  constructor(private validator: CustomValidator<T>) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    const result = this.validator(input, path)

    if (isIssueArray(result)) {
      return result
    }

    // Run refinements
    const issues: Issue[] = []
    for (const refinement of this.refinements) {
      if (!refinement.check(result)) {
        const message = typeof refinement.message === 'function'
          ? refinement.message(result)
          : refinement.message
        issues.push({ path, message })
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return result
  }

  protected _clone(): CustomSchema<T> {
    const cloned = new CustomSchema(this.validator)
    cloned.refinements = [...this.refinements]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  /**
   * Add a synchronous refinement to the schema.
   *
   * @param check - Function that returns true if value is valid
   * @param message - Error message or function returning message
   * @returns New CustomSchema with refinement added
   */
  refine(check: (value: T) => boolean, message: string | ((value: T) => string)): CustomSchema<T> {
    const cloned = this._clone()
    cloned.refinements.push({ check, message })
    return cloned
  }
}

/**
 * Schema that validates a literal value (exact match).
 *
 * @example
 * ```typescript
 * const status = k.literal('active')
 * status.parse('active') // 'active'
 * status.parse('inactive') // throws
 * ```
 */
export class LiteralSchema<T extends string | number | boolean | null | undefined> extends BaseSchema<T> {
  constructor(private value: T) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    if (input === this.value) {
      return this.value
    }
    return [{
      path,
      message: `Expected literal value: ${JSON.stringify(this.value)}`
    }]
  }

  protected _clone(): LiteralSchema<T> {
    const cloned = new LiteralSchema(this.value)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

/**
 * Schema for enum-like union of literal values.
 *
 * @example
 * ```typescript
 * const status = k.enum(['pending', 'active', 'completed'])
 * status.parse('active') // 'active'
 * status.parse('unknown') // throws
 * ```
 */
export class EnumSchema<T extends readonly [string, ...string[]]> extends BaseSchema<T[number]> {
  constructor(private values: T) {
    super()
    if (values.length === 0) {
      throw new Error("Enum schema requires at least one value")
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T[number] {
    if (typeof input === 'string' && this.values.includes(input as T[number])) {
      return input as T[number]
    }
    return [{
      path,
      message: `Expected one of: ${this.values.map(v => JSON.stringify(v)).join(', ')}`
    }]
  }

  protected _clone(): EnumSchema<T> {
    const cloned = new EnumSchema(this.values)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

/**
 * Schema that always passes validation, useful for "any" type scenarios.
 * Be cautious when using this as it bypasses type safety.
 *
 * @example
 * ```typescript
 * const anything = k.any()
 * anything.parse("string") // "string"
 * anything.parse(123) // 123
 * anything.parse({ foo: "bar" }) // { foo: "bar" }
 * ```
 */
export class AnySchema extends BaseSchema<any> {
  _parse(input: unknown, _path: Issue["path"]): Issue[] | any {
    return input
  }

  protected _clone(): AnySchema {
    const cloned = new AnySchema()
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

/**
 * Schema that always passes validation but types as unknown.
 * Safer than AnySchema as it forces type checks on usage.
 *
 * @example
 * ```typescript
 * const data = k.unknown()
 * const result = data.parse(someInput)
 * // result is typed as unknown, must be narrowed before use
 * ```
 */
export class UnknownSchema extends BaseSchema<unknown> {
  _parse(input: unknown, _path: Issue["path"]): Issue[] | unknown {
    return input
  }

  protected _clone(): UnknownSchema {
    const cloned = new UnknownSchema()
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

/**
 * Schema that never passes validation - useful for discriminated unions
 * or marking impossible branches.
 */
export class NeverSchema extends BaseSchema<never> {
  _parse(_input: unknown, path: Issue["path"]): Issue[] | never {
    return [{
      path,
      message: "Value is not allowed (never type)"
    }]
  }

  protected _clone(): NeverSchema {
    const cloned = new NeverSchema()
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

/**
 * Schema for validating tuple types (fixed-length arrays with specific types).
 *
 * @example
 * ```typescript
 * const point = k.tuple([k.number(), k.number()])
 * point.parse([1, 2]) // [1, 2]
 * point.parse([1, 2, 3]) // throws - too many elements
 * ```
 */
export class TupleSchema<T extends [BaseSchema<any>, ...BaseSchema<any>[]]> extends BaseSchema<{
  [K in keyof T]: T[K] extends BaseSchema<infer U> ? U : never
}> {
  constructor(private schemas: T) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | { [K in keyof T]: T[K] extends BaseSchema<infer U> ? U : never } {
    if (!Array.isArray(input)) {
      return [{ path, message: `Expected array (tuple), received ${describeReceived(input)}` }]
    }

    if (input.length !== this.schemas.length) {
      return [{
        path,
        message: `Expected tuple of length ${this.schemas.length}, got ${input.length}`
      }]
    }

    const issues: Issue[] = []
    const result: unknown[] = []

    for (let i = 0; i < this.schemas.length; i++) {
      const schema = this.schemas[i]
      const itemPath = [...path, i]
      const itemResult = schema._parse(input[i], itemPath)

      if (isIssueArray(itemResult)) {
        issues.push(...itemResult)
      } else {
        result.push(itemResult)
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return result as { [K in keyof T]: T[K] extends BaseSchema<infer U> ? U : never }
  }

  protected _clone(): TupleSchema<T> {
    const cloned = new TupleSchema([...this.schemas] as T)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: { [K in keyof T]: T[K] extends BaseSchema<infer U> ? U : never }, path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []

    for (let i = 0; i < this.schemas.length; i++) {
      const schema = this.schemas[i]
      const itemValue = (value as unknown[])[i]
      const itemPath = [...path, i]

      if (schema._asyncValidators.length > 0 ||
          typeof (schema as any)._parseAsyncNested === 'function') {
        const result = await schema.safeParseAsync(itemValue)
        if (!result.success) {
          for (const issue of result.issues || []) {
            allIssues.push({
              path: [...itemPath, ...issue.path],
              message: issue.message
            })
          }
        }
      }
    }

    return allIssues
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.schemas.some((schema) => schema.hasAsyncValidation())
  }
}

/**
 * Schema for record types (object with dynamic keys of a specific type).
 *
 * @example
 * ```typescript
 * const scores = k.record(k.number())
 * scores.parse({ alice: 100, bob: 85 }) // { alice: 100, bob: 85 }
 * scores.parse({ alice: "100" }) // throws - value not a number
 * ```
 */
export class RecordSchema<V extends BaseSchema<any>> extends BaseSchema<Record<string, V extends BaseSchema<infer U> ? U : never>> {
  constructor(private valueSchema: V) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | Record<string, V extends BaseSchema<infer U> ? U : never> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return [{ path, message: `Expected object (record), received ${describeReceived(input)}` }]
    }

    const issues: Issue[] = []
    const result: Record<string, unknown> = {}

    for (const key in input) {
      const value = (input as Record<string, unknown>)[key]
      const itemPath = [...path, key]
      const itemResult = this.valueSchema._parse(value, itemPath)

      if (isIssueArray(itemResult)) {
        issues.push(...itemResult)
      } else {
        result[key] = itemResult
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return result as Record<string, V extends BaseSchema<infer U> ? U : never>
  }

  protected _clone(): RecordSchema<V> {
    const cloned = new RecordSchema(this.valueSchema)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: Record<string, V extends BaseSchema<infer U> ? U : never>, path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []

    if (this.valueSchema._asyncValidators.length > 0 ||
        typeof (this.valueSchema as any)._parseAsyncNested === 'function') {
      for (const key in value) {
        const itemValue = value[key]
        const itemPath = [...path, key]
        const result = await this.valueSchema.safeParseAsync(itemValue)
        if (!result.success) {
          for (const issue of result.issues || []) {
            allIssues.push({
              path: [...itemPath, ...issue.path],
              message: issue.message
            })
          }
        }
      }
    }

    return allIssues
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.valueSchema.hasAsyncValidation()
  }
}
