import { BaseSchema } from "../../core/BaseSchema"
import { Issue, isIssueArray, describeReceived } from "../../core/result"
import {
  isValid,
  parseISO,
  isAfter,
  isBefore,
  isEqual,
  format as formatDate,
  parse,
} from "date-fns"


type ValidationRule = {
  check: (value: Date, input: unknown) => boolean
  message: string
}

export class DateSchema extends BaseSchema<Date> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | Date {
    let date: Date

    if (input instanceof Date) {
      if (!isValid(input)) {
        return [{ path, message: "Invalid Date object" }]
      }
      date = input
    } else if (typeof input === "string") {
      date = parseISO(input)
      if (!isValid(date)) {
        return [{ path, message: "Invalid date format. Expected ISO 8601 format (e.g., '2024-01-15' or '2024-01-15T10:30:00Z')" }]
      }
    } else {
      return [{ path, message: `Expected a Date object or ISO 8601 date string, received ${describeReceived(input)}` }]
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

  protected _clone(): DateSchema {
    const cloned = new DateSchema()
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  min(minDate: string, message?: string): this {
    const min = parseISO(minDate)
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => isAfter(value, min) || isEqual(value, min),
      message: message ?? `Date must be on or after ${formatDate(min, 'yyyy-MM-dd')}`,
    })
    return clone
  }

  max(maxDate: string, message?: string): this {
    const max = parseISO(maxDate)
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => isBefore(value, max) || isEqual(value, max),
      message: message ?? `Date must be on or before ${formatDate(max, 'yyyy-MM-dd')}`,
    })
    return clone
  }

  between(start: string, end: string, message?: string): this {
    const s = parseISO(start)
    const e = parseISO(end)
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => (isAfter(value, s) || isEqual(value, s)) && (isBefore(value, e) || isEqual(value, e)),
      message: message ?? `Date must be between ${formatDate(s, 'yyyy-MM-dd')} and ${formatDate(e, 'yyyy-MM-dd')}`,
    })
    return clone
  }

  isFuture(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => isAfter(value, new Date()),
      message: message ?? "Date must be in the future",
    })
    return clone
  }

  isPast(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => isBefore(value, new Date()),
      message: message ?? "Date must be in the past",
    })
    return clone
  }

  format(format: string, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value, input) => {
        const strInput = typeof input === 'string' ? input : (input as Date).toISOString()
        try {
          const parsedWithFormat = parse(strInput, format, new Date())
          if (!isValid(parsedWithFormat)) {
            return false
          }
          return formatDate(value, format) === strInput
        } catch {
          return false
        }
      },
      message: message ?? `Date must match format '${format}'`,
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

  formatOutput(format: string): BaseSchema<string> {
    return this.transform((date) => formatDate(date, format))
  }
}
