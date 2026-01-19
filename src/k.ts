import { string } from "./schemas/string/string"
import { number } from "./schemas/number/number"
import { object } from "./schemas/object/object"
import { boolean } from "./schemas/boolean/boolean"
import { date, twoDates } from "./schemas/date/dates"
import { array } from "./schemas/array/array"
import { file } from "./schemas/file/file"
import { base64 } from "./schemas/base64/base64"
import { email } from "./schemas/email/email"
import { union } from "./schemas/union/union"
import { intersection } from "./schemas/intersection/intersection"
import { lazy } from "./schemas/lazy/lazy"
import {
  custom,
  literal,
  enum as enumSchema,
  any,
  unknown,
  never,
  tuple,
  record
} from "./schemas/custom/custom"

/**
 * Katax validation library main API
 *
 * Provides factory functions for creating type-safe schema validators.
 * Each function returns a schema instance with chainable validation methods.
 *
 * @example
 * ```typescript
 * import { k } from 'katax-core'
 *
 * // String validation
 * const nameSchema = k.string().min(2).max(50)
 * nameSchema.parse("John") // "John"
 *
 * // Object validation
 * const userSchema = k.object({
 *   name: k.string(),
 *   age: k.number().min(0)
 * })
 * userSchema.parse({ name: "John", age: 30 })
 *
 * // Extend schemas
 * const baseSchema = k.object({ id: k.number() })
 * const extendedSchema = baseSchema.extend({ name: k.string() })
 *
 * // Union types
 * const stringOrNumber = k.union([k.string(), k.number()])
 * ```
 */
export const k = {
  /** Create a string validation schema */
  string,
  /** Create a number validation schema */
  number,
  /** Create an object validation schema */
  object,
  /** Create a boolean validation schema */
  boolean,
  /** Create a date validation schema */
  date,
  /** Create a two-dates validation schema for date ranges */
  twoDates,
  /** Create an array validation schema */
  array,
  /** Create a file validation schema */
  file,
  /** Create a base64 validation schema */
  base64,
  /** Create an email validation schema */
  email,
  /** Create a union schema (value matches one of the schemas) */
  union,
  /** Create an intersection schema (value matches all schemas) */
  intersection,
  /** Create a lazy schema for recursive types */
  lazy,
  /** Create a custom schema with your own validation logic */
  custom,
  /** Create a literal schema for exact value matching */
  literal,
  /** Create an enum schema for string literal unions */
  enum: enumSchema,
  /** Create a schema that accepts any value (use with caution) */
  any,
  /** Create a schema that accepts unknown values (safer than any) */
  unknown,
  /** Create a schema that never matches (for exhaustive checks) */
  never,
  /** Create a tuple schema for fixed-length typed arrays */
  tuple,
  /** Create a record schema for objects with uniform value types */
  record
}

