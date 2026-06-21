import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import { NumberSchema } from "../number/NumberSchema"
import { BooleanSchema } from "../boolean/BooleanSchema"
import { StringSchema } from "../string/StringSchema"
import { format as formatDate, parse, parseISO, isValid } from "date-fns"

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
    this.innerSchema = this.innerSchema.min(value, message)
    return this
  }

  max(value: number, message?: string): this {
    this.innerSchema = this.innerSchema.max(value, message)
    return this
  }

  equals(exact: number, message?: string): this {
    this.innerSchema = this.innerSchema.equals(exact, message)
    return this
  }

  positive(message?: string): this {
    this.innerSchema = this.innerSchema.positive(message)
    return this
  }

  negative(message?: string): this {
    this.innerSchema = this.innerSchema.negative(message)
    return this
  }

  integer(message?: string): this {
    this.innerSchema = this.innerSchema.integer(message)
    return this
  }

  finite(message?: string): this {
    this.innerSchema = this.innerSchema.finite(message)
    return this
  }

  multipleOf(factor: number, message?: string): this {
    this.innerSchema = this.innerSchema.multipleOf(factor, message)
    return this
  }

  between(min: number, max: number, message?: string): this {
    this.innerSchema = this.innerSchema.between(min, max, message)
    return this
  }

  greaterThan(threshold: number, message?: string): this {
    this.innerSchema = this.innerSchema.greaterThan(threshold, message)
    return this
  }

  lessThan(threshold: number, message?: string): this {
    this.innerSchema = this.innerSchema.lessThan(threshold, message)
    return this
  }

  notEqual(forbidden: number, message?: string): this {
    this.innerSchema = this.innerSchema.notEqual(forbidden, message)
    return this
  }

  oneOf(options: number[], message?: string): this {
    this.innerSchema = this.innerSchema.oneOf(options, message)
    return this
  }

  notOneOf(options: number[], message?: string): this {
    this.innerSchema = this.innerSchema.notOneOf(options, message)
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
    this.innerSchema = this.innerSchema.isTrue(message)
    return this
  }

  isFalse(message?: string): this {
    this.innerSchema = this.innerSchema.isFalse(message)
    return this
  }

  equals(expected: boolean, message?: string): this {
    this.innerSchema = this.innerSchema.equals(expected, message)
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
    this.innerSchema = this.innerSchema.minLength(length, message)
    return this
  }

  maxLength(length: number, message?: string): this {
    this.innerSchema = this.innerSchema.maxLength(length, message)
    return this
  }

  length(exact: number, message?: string): this {
    this.innerSchema = this.innerSchema.length(exact, message)
    return this
  }

  email(message?: string): this {
    this.innerSchema = this.innerSchema.email(message)
    return this
  }

  url(message?: string): this {
    this.innerSchema = this.innerSchema.url(message)
    return this
  }

  regex(pattern: RegExp, message?: string): this {
    this.innerSchema = this.innerSchema.regex(pattern, message)
    return this
  }

  trim(): this {
    this.innerSchema = this.innerSchema.trim()
    return this
  }

  lowercase(message?: string): this {
    this.innerSchema = this.innerSchema.lowercase(message)
    return this
  }

  uppercase(message?: string): this {
    this.innerSchema = this.innerSchema.uppercase(message)
    return this
  }

  alpha(message?: string): this {
    this.innerSchema = this.innerSchema.alpha(message)
    return this
  }

  alphanumeric(message?: string): this {
    this.innerSchema = this.innerSchema.alphanumeric(message)
    return this
  }

  ascii(message?: string): this {
    this.innerSchema = this.innerSchema.ascii(message)
    return this
  }

  ip(message?: string): this {
    this.innerSchema = this.innerSchema.ip(message)
    return this
  }

  nonempty(message?: string): this {
    this.innerSchema = this.innerSchema.nonempty(message)
    return this
  }

  notEmpty(message?: string): this {
    this.innerSchema = this.innerSchema.notEmpty(message)
    return this
  }

  noWhitespace(message?: string): this {
    this.innerSchema = this.innerSchema.noWhitespace(message)
    return this
  }

  includes(substring: string, message?: string): this {
    this.innerSchema = this.innerSchema.includes(substring, message)
    return this
  }

  oneOf(options: string[], message?: string): this {
    this.innerSchema = this.innerSchema.oneOf(options, message)
    return this
  }

  notOneOf(options: string[], message?: string): this {
    this.innerSchema = this.innerSchema.notOneOf(options, message)
    return this
  }

  startsWith(prefix: string, message?: string): this {
    this.innerSchema = this.innerSchema.startsWith(prefix, message)
    return this
  }

  endsWith(suffix: string, message?: string): this {
    this.innerSchema = this.innerSchema.endsWith(suffix, message)
    return this
  }

  uuid(message?: string): this {
    this.innerSchema = this.innerSchema.uuid(message)
    return this
  }

  datetime(message?: string): this {
    this.innerSchema = this.innerSchema.datetime(message)
    return this
  }

  jwt(message?: string): this {
    this.innerSchema = this.innerSchema.jwt(message)
    return this
  }

  cuid2(message?: string): this {
    this.innerSchema = this.innerSchema.cuid2(message)
    return this
  }

  ulid(message?: string): this {
    this.innerSchema = this.innerSchema.ulid(message)
    return this
  }

  emoji(message?: string): this {
    this.innerSchema = this.innerSchema.emoji(message)
    return this
  }

  cidr(message?: string): this {
    this.innerSchema = this.innerSchema.cidr(message)
    return this
  }
}

type DateValidationRule = {
  check: (value: Date, input?: unknown) => boolean
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
      const parsed = parseISO(input)
      if (!isValid(parsed)) {
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
      if (!rule.check(date, input)) {
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
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value >= min,
      message: message ?? `Date must be on or after ${min.toISOString().split('T')[0]}`,
    })
    return clone
  }

  max(maxDate: string | Date, message?: string): this {
    const max = maxDate instanceof Date ? maxDate : new Date(maxDate)
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value <= max,
      message: message ?? `Date must be on or before ${max.toISOString().split('T')[0]}`,
    })
    return clone
  }

  between(start: string | Date, end: string | Date, message?: string): this {
    const s = start instanceof Date ? start : new Date(start)
    const e = end instanceof Date ? end : new Date(end)
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value >= s && value <= e,
      message: message ?? `Date must be between ${s.toISOString().split('T')[0]} and ${e.toISOString().split('T')[0]}`,
    })
    return clone
  }

  isFuture(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value > new Date(),
      message: message ?? 'Date must be in the future',
    })
    return clone
  }

  isPast(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value < new Date(),
      message: message ?? 'Date must be in the past',
    })
    return clone
  }

  format(formatStr: string, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (_value, input) => {
        const strInput = typeof input === 'string' ? input : ''
        if (!strInput) return false
        try {
          const parsed = parse(strInput, formatStr, new Date())
          const formatted = formatDate(parsed, formatStr)
          return formatted === strInput
        } catch {
          return false
        }
      },
      message: message ?? `Date must match format '${formatStr}'`,
    })
    return clone
  }

  isDateOnly(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value, input) => {
        const strInput = typeof input === 'string' ? input : ''
        return /^\d{4}-\d{2}-\d{2}$/.test(strInput) &&
               value.getHours() === 0 &&
               value.getMinutes() === 0 &&
               value.getSeconds() === 0
      },
      message: message ?? "Date must be date-only (no time component)",
    })
    return clone
  }

  hasTime(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (_value, input) => {
        const strInput = typeof input === 'string' ? input : ''
        return strInput.includes('T') || strInput.includes(' ')
      },
      message: message ?? "Date must include time component",
    })
    return clone
  }

  formatOutput(formatStr: string): BaseSchema<string> {
    return this.transform((date) => formatDate(date, formatStr))
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
