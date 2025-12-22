import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import {
  differenceInDays,
  differenceInHours,
  isAfter,
  isBefore,
  isEqual
} from "date-fns"
import { DateSchema } from "./DateSchema"


type ValidationRule = {
  check: (date1: Date, date2: Date) => boolean
  message: string
}

export class TwoDatesSchema extends BaseSchema<[Date, Date]> {
  private rules: ValidationRule[] = []
  private separator: string
  private dateSchema: DateSchema

  constructor(separator: string = '|') {
    super()
    this.separator = separator
    this.dateSchema = new DateSchema()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | [Date, Date] {
    if (typeof input !== "string") {
      return [{ path, message: "Expected a string with two dates" }]
    }
    const parts = input.split(this.separator)
    if (parts.length !== 2) {
      return [{ path, message: `Expected two dates separated by '${this.separator}'` }]
    }

    // Validate each date using DateSchema
    const result1 = this.dateSchema._parse(parts[0].trim(), [...path, 0])
    if (Array.isArray(result1)) {
      return result1
    }

    const result2 = this.dateSchema._parse(parts[1].trim(), [...path, 1])
    if (Array.isArray(result2)) {
      return result2
    }

    const date1 = result1
    const date2 = result2

    const issues: Issue[] = []
    for (const rule of this.rules) {
      if (!rule.check(date1, date2)) {
        issues.push({ path, message: rule.message })
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return [date1, date2]
  }

  protected _clone(): TwoDatesSchema {
    const cloned = new TwoDatesSchema(this.separator)
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  maxDifference(days: number, message?: string): this {
    this.rules.push({
      check: (d1, d2) => Math.abs(differenceInDays(d1, d2)) <= days,
      message: message ?? `Dates must be at most ${days} days apart`,
    })
    return this
  }

  minDifference(days: number, message?: string): this {
    this.rules.push({
      check: (d1, d2) => Math.abs(differenceInDays(d1, d2)) >= days,
      message: message ?? `Dates must be at least ${days} days apart`,
    })
    return this
  }

  maxDifferenceHours(hours: number, message?: string): this {
    this.rules.push({
      check: (d1, d2) => Math.abs(differenceInHours(d1, d2)) <= hours,
      message: message ?? `Dates must be at most ${hours} hours apart`,
    })
    return this
  }

  minDifferenceHours(hours: number, message?: string): this {
    this.rules.push({
      check: (d1, d2) => Math.abs(differenceInHours(d1, d2)) >= hours,
      message: message ?? `Dates must be at least ${hours} hours apart`,
    })
    return this
  }

  order(ascending: boolean = true, message?: string): this {
    this.rules.push({
      check: (d1, d2) => ascending ? isBefore(d1, d2) || isEqual(d1, d2) : isAfter(d1, d2) || isEqual(d1, d2),
      message: message ?? (ascending ? "First date must be before or equal to second" : "First date must be after or equal to second"),
    })
    return this
  }
}
