import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import {
  isValid,
  parseISO,
  isAfter,
  isBefore,
  isEqual,
  format as formatDate,
  parse,
  isMatch
} from "date-fns"


type ValidationRule = {
  check: (value: Date, input: string) => boolean
  message: string
}

export class DateSchema extends BaseSchema<Date> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | Date {
    if (typeof input !== "string") {
      return [{ path, message: "Expected a valid date string in ISO 8601 format" }]
    }

    const date = parseISO(input)
    if (!isValid(date)) {
      return [{ path, message: "Invalid date format. Expected ISO 8601 format (e.g., '2024-01-15' or '2024-01-15T10:30:00Z')" }]
    }

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

  min(minDate: string, message?: string): this {
    const min = parseISO(minDate)
    this.rules.push({
      check: (value) => isAfter(value, min) || isEqual(value, min),
      message: message ?? `Date must be on or after ${formatDate(min, 'yyyy-MM-dd')}`,
    })
    return this
  }

  max(maxDate: string, message?: string): this {
    const max = parseISO(maxDate)
    this.rules.push({
      check: (value) => isBefore(value, max) || isEqual(value, max),
      message: message ?? `Date must be on or before ${formatDate(max, 'yyyy-MM-dd')}`,
    })
    return this
  }

  between(start: string, end: string, message?: string): this {
    const s = parseISO(start)
    const e = parseISO(end)
    this.rules.push({
      check: (value) => (isAfter(value, s) || isEqual(value, s)) && (isBefore(value, e) || isEqual(value, e)),
      message: message ?? `Date must be between ${formatDate(s, 'yyyy-MM-dd')} and ${formatDate(e, 'yyyy-MM-dd')}`,
    })
    return this
  }

  isFuture(message?: string): this {
    this.rules.push({
      check: (value) => isAfter(value, new Date()),
      message: message ?? "Date must be in the future",
    })
    return this
  }

  isPast(message?: string): this {
    this.rules.push({
      check: (value) => isBefore(value, new Date()),
      message: message ?? "Date must be in the past",
    })
    return this
  }

  format(format: string, message?: string): this {
    this.rules.push({
      check: (value, input) => {
        try {
          // Try to parse the input with the specific format
          const parsedWithFormat = parse(input, format, new Date())
          // Check if it's valid and matches the original parsed date
          if (!isValid(parsedWithFormat)) {
            return false
          }
          // Verify the formatted output matches the input (strict format check)
          return formatDate(value, format) === input
        } catch {
          return false
        }
      },
      message: message ?? `Date must match format '${format}'`,
    })
    return this
  }

  isDateOnly(message?: string): this {
    this.rules.push({
      check: (value, input) => {
        // Check if input is date-only (no time component)
        // Valid: 2024-01-15
        // Invalid: 2024-01-15T10:30:00Z
        return /^\d{4}-\d{2}-\d{2}$/.test(input) &&
               value.getHours() === 0 &&
               value.getMinutes() === 0 &&
               value.getSeconds() === 0
      },
      message: message ?? "Date must be date-only (no time component)",
    })
    return this
  }

  hasTime(message?: string): this {
    this.rules.push({
      check: (_value, input) => {
        // Check if input includes time component
        return input.includes('T') || input.includes(' ')
      },
      message: message ?? "Date must include time component",
    })
    return this
  }

  formatOutput(format: string): BaseSchema<string> {
    return this.transform((date) => formatDate(date, format))
  }
}
