import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import { NumberSchema } from "../number/NumberSchema"
import { BooleanSchema } from "../boolean/BooleanSchema"
import { StringSchema } from "../string/StringSchema"

/**
 * Coerced Number Schema - converts strings and other types to numbers before validation.
 *
 * @example
 * ```typescript
 * const schema = k.coerce.number()
 * schema.parse("123")   // 123
 * schema.parse("45.67") // 45.67
 * schema.parse(true)    // 1
 * schema.parse(false)   // 0
 * ```
 */
export class CoercedNumberSchema extends BaseSchema<number> {
  private innerSchema: NumberSchema

  constructor() {
    super()
    this.innerSchema = new NumberSchema()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | number {
    let coerced: unknown = input

    // Coerce to number
    if (typeof input === 'string') {
      const trimmed = input.trim()
      if (trimmed === '') {
        return [{ path, message: 'Cannot coerce empty string to number' }]
      }
      coerced = Number(trimmed)
    } else if (typeof input === 'boolean') {
      coerced = input ? 1 : 0
    } else if (input === null || input === undefined) {
      return [{ path, message: 'Cannot coerce null/undefined to number' }]
    }

    // Check if coercion resulted in NaN
    if (typeof coerced === 'number' && Number.isNaN(coerced)) {
      return [{ path, message: `Cannot coerce "${input}" to number` }]
    }

    return this.innerSchema._parse(coerced, path)
  }

  protected _clone(): CoercedNumberSchema {
    const cloned = new CoercedNumberSchema()
    cloned.innerSchema = this.innerSchema
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  // Proxy methods to inner schema
  min(value: number, message?: string): this {
    this.innerSchema.min(value, message)
    return this
  }

  max(value: number, message?: string): this {
    this.innerSchema.max(value, message)
    return this
  }

  positive(message?: string): this {
    this.innerSchema.positive(message)
    return this
  }

  negative(message?: string): this {
    this.innerSchema.negative(message)
    return this
  }

  integer(message?: string): this {
    this.innerSchema.integer(message)
    return this
  }

  finite(message?: string): this {
    this.innerSchema.finite(message)
    return this
  }

  multipleOf(factor: number, message?: string): this {
    this.innerSchema.multipleOf(factor, message)
    return this
  }

  between(min: number, max: number, message?: string): this {
    this.innerSchema.between(min, max, message)
    return this
  }

  greaterThan(threshold: number, message?: string): this {
    this.innerSchema.greaterThan(threshold, message)
    return this
  }

  lessThan(threshold: number, message?: string): this {
    this.innerSchema.lessThan(threshold, message)
    return this
  }

  oneOf(options: number[], message?: string): this {
    this.innerSchema.oneOf(options, message)
    return this
  }

  notOneOf(options: number[], message?: string): this {
    this.innerSchema.notOneOf(options, message)
    return this
  }
}

/**
 * Coerced Boolean Schema - converts strings, numbers to booleans before validation.
 *
 * @example
 * ```typescript
 * const schema = k.coerce.boolean()
 * schema.parse("true")  // true
 * schema.parse("false") // false
 * schema.parse("1")     // true
 * schema.parse("0")     // false
 * schema.parse(1)       // true
 * schema.parse(0)       // false
 * ```
 */
export class CoercedBooleanSchema extends BaseSchema<boolean> {
  private innerSchema: BooleanSchema

  constructor() {
    super()
    this.innerSchema = new BooleanSchema()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | boolean {
    let coerced: unknown = input

    // Coerce to boolean
    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim()
      if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on') {
        coerced = true
      } else if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'off' || lower === '') {
        coerced = false
      } else {
        return [{ path, message: `Cannot coerce "${input}" to boolean` }]
      }
    } else if (typeof input === 'number') {
      coerced = input !== 0
    } else if (input === null || input === undefined) {
      coerced = false
    }

    return this.innerSchema._parse(coerced, path)
  }

  protected _clone(): CoercedBooleanSchema {
    const cloned = new CoercedBooleanSchema()
    cloned.innerSchema = this.innerSchema
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  // Proxy methods to inner schema
  isTrue(message?: string): this {
    this.innerSchema.isTrue(message)
    return this
  }

  isFalse(message?: string): this {
    this.innerSchema.isFalse(message)
    return this
  }

  equals(expected: boolean, message?: string): this {
    this.innerSchema.equals(expected, message)
    return this
  }
}

/**
 * Coerced String Schema - converts numbers, booleans to strings before validation.
 *
 * @example
 * ```typescript
 * const schema = k.coerce.string()
 * schema.parse(123)   // "123"
 * schema.parse(true)  // "true"
 * schema.parse(null)  // ""
 * ```
 */
export class CoercedStringSchema extends BaseSchema<string> {
  private innerSchema: StringSchema

  constructor() {
    super()
    this.innerSchema = new StringSchema()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | string {
    let coerced: unknown = input

    // Coerce to string
    if (typeof input === 'number' || typeof input === 'boolean') {
      coerced = String(input)
    } else if (input === null || input === undefined) {
      coerced = ''
    } else if (typeof input === 'object') {
      return [{ path, message: 'Cannot coerce object to string' }]
    }

    return this.innerSchema._parse(coerced, path)
  }

  protected _clone(): CoercedStringSchema {
    const cloned = new CoercedStringSchema()
    cloned.innerSchema = this.innerSchema
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  // Proxy common methods to inner schema
  minLength(length: number, message?: string): this {
    this.innerSchema.minLength(length, message)
    return this
  }

  maxLength(length: number, message?: string): this {
    this.innerSchema.maxLength(length, message)
    return this
  }

  email(message?: string): this {
    this.innerSchema.email(message)
    return this
  }

  url(message?: string): this {
    this.innerSchema.url(message)
    return this
  }

  regex(pattern: RegExp, message?: string): this {
    this.innerSchema.regex(pattern, message)
    return this
  }

  trim(): this {
    this.innerSchema.trim()
    return this
  }

  lowercase(message?: string): this {
    this.innerSchema.lowercase(message)
    return this
  }

  uppercase(message?: string): this {
    this.innerSchema.uppercase(message)
    return this
  }

  oneOf(options: string[], message?: string): this {
    this.innerSchema.oneOf(options, message)
    return this
  }

  startsWith(prefix: string, message?: string): this {
    this.innerSchema.startsWith(prefix, message)
    return this
  }

  endsWith(suffix: string, message?: string): this {
    this.innerSchema.endsWith(suffix, message)
    return this
  }

  uuid(message?: string): this {
    this.innerSchema.uuid(message)
    return this
  }
}

type DateValidationRule = {
  check: (value: Date) => boolean
  message: string
}

/**
 * Coerced Date Schema - converts strings and numbers to Date before validation.
 *
 * @example
 * ```typescript
 * const schema = k.coerce.date()
 * schema.parse("2024-01-15")        // Date object
 * schema.parse(1705276800000)       // Date from timestamp
 * schema.parse(new Date())          // Date object (passthrough)
 * ```
 */
export class CoercedDateSchema extends BaseSchema<Date> {
  private rules: DateValidationRule[] = []

  constructor() {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | Date {
    let date: Date

    // Coerce to Date
    if (input instanceof Date) {
      if (Number.isNaN(input.getTime())) {
        return [{ path, message: 'Invalid Date object' }]
      }
      date = input
    } else if (typeof input === 'string') {
      const parsed = new Date(input)
      if (Number.isNaN(parsed.getTime())) {
        return [{ path, message: `Cannot coerce "${input}" to date` }]
      }
      date = parsed
    } else if (typeof input === 'number') {
      const parsed = new Date(input)
      if (Number.isNaN(parsed.getTime())) {
        return [{ path, message: `Cannot coerce ${input} to date` }]
      }
      date = parsed
    } else if (input === null || input === undefined) {
      return [{ path, message: 'Cannot coerce null/undefined to date' }]
    } else {
      return [{ path, message: 'Expected string, number, or Date' }]
    }

    // Run validation rules
    const issues: Issue[] = []
    for (const rule of this.rules) {
      if (!rule.check(date)) {
        issues.push({ path, message: rule.message })
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return date
  }

  protected _clone(): CoercedDateSchema {
    const cloned = new CoercedDateSchema()
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  min(minDate: string | Date, message?: string): this {
    const min = minDate instanceof Date ? minDate : new Date(minDate)
    this.rules.push({
      check: (value) => value >= min,
      message: message ?? `Date must be on or after ${min.toISOString().split('T')[0]}`,
    })
    return this
  }

  max(maxDate: string | Date, message?: string): this {
    const max = maxDate instanceof Date ? maxDate : new Date(maxDate)
    this.rules.push({
      check: (value) => value <= max,
      message: message ?? `Date must be on or before ${max.toISOString().split('T')[0]}`,
    })
    return this
  }

  between(start: string | Date, end: string | Date, message?: string): this {
    const s = start instanceof Date ? start : new Date(start)
    const e = end instanceof Date ? end : new Date(end)
    this.rules.push({
      check: (value) => value >= s && value <= e,
      message: message ?? `Date must be between ${s.toISOString().split('T')[0]} and ${e.toISOString().split('T')[0]}`,
    })
    return this
  }

  isFuture(message?: string): this {
    this.rules.push({
      check: (value) => value > new Date(),
      message: message ?? 'Date must be in the future',
    })
    return this
  }

  isPast(message?: string): this {
    this.rules.push({
      check: (value) => value < new Date(),
      message: message ?? 'Date must be in the past',
    })
    return this
  }
}

/**
 * Coerce namespace containing factory functions for coerced schemas.
 */
export const coerce = {
  /** Create a coerced number schema */
  number: () => new CoercedNumberSchema(),
  /** Create a coerced boolean schema */
  boolean: () => new CoercedBooleanSchema(),
  /** Create a coerced string schema */
  string: () => new CoercedStringSchema(),
  /** Create a coerced date schema */
  date: () => new CoercedDateSchema(),
}
