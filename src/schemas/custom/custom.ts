import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import {
  CustomSchema,
  LiteralSchema,
  EnumSchema,
  AnySchema,
  UnknownSchema,
  NeverSchema,
  TupleSchema,
  RecordSchema
} from "./CustomSchema"

/**
 * Create a custom schema with your own validation logic.
 *
 * @param validator - Function that validates input and returns either issues or the parsed value
 * @returns A CustomSchema instance
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
export const custom = <T>(validator: (value: unknown, path: Issue["path"]) => Issue[] | T) =>
  new CustomSchema(validator)

/**
 * Create a schema that validates an exact literal value.
 *
 * @param value - The exact value to match
 * @returns A LiteralSchema instance
 *
 * @example
 * ```typescript
 * const active = k.literal('active')
 * active.parse('active') // 'active'
 * active.parse('inactive') // throws
 * ```
 */
export const literal = <T extends string | number | boolean | null | undefined>(value: T) =>
  new LiteralSchema(value)

/**
 * Create a schema that validates against a set of string literal values.
 * Similar to TypeScript enums but uses an array of strings.
 *
 * @param values - Array of allowed string values
 * @returns An EnumSchema instance
 *
 * @example
 * ```typescript
 * const status = k.enum(['pending', 'active', 'completed'])
 * type Status = kataxInfer<typeof status> // 'pending' | 'active' | 'completed'
 * ```
 */
const enumFn = <T extends readonly [string, ...string[]]>(values: T) =>
  new EnumSchema(values)

// Export with name 'enum' would conflict with reserved word, so use enumFn internally
export { enumFn as enum }

/**
 * Create a schema that accepts any value.
 * Use with caution as it bypasses type safety.
 *
 * @returns An AnySchema instance
 */
export const any = () => new AnySchema()

/**
 * Create a schema that accepts any value but types it as unknown.
 * Safer than any() as it forces type narrowing on usage.
 *
 * @returns An UnknownSchema instance
 */
export const unknown = () => new UnknownSchema()

/**
 * Create a schema that never matches - useful for exhaustive checks
 * and discriminated unions.
 *
 * @returns A NeverSchema instance
 */
export const never = () => new NeverSchema()

/**
 * Create a tuple schema for fixed-length arrays with specific types per position.
 *
 * @param schemas - Array of schemas for each position
 * @returns A TupleSchema instance
 *
 * @example
 * ```typescript
 * const point = k.tuple([k.number(), k.number()])
 * type Point = kataxInfer<typeof point> // [number, number]
 * ```
 */
export const tuple = <T extends [BaseSchema<any>, ...BaseSchema<any>[]]>(schemas: T) =>
  new TupleSchema(schemas)

/**
 * Create a record schema for objects with string keys and uniform value types.
 *
 * @param valueSchema - Schema for all values in the record
 * @returns A RecordSchema instance
 *
 * @example
 * ```typescript
 * const scores = k.record(k.number())
 * type Scores = kataxInfer<typeof scores> // Record<string, number>
 * ```
 */
export const record = <V extends BaseSchema<any>>(valueSchema: V) =>
  new RecordSchema(valueSchema)
