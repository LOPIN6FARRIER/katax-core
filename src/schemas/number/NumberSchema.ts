import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived } from "../../core/result"

type ValidationRule = {
  check: (value: number) => boolean
  message: string
}

export class NumberSchema extends BaseSchema<number> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | number {
    if (typeof input !== "number") {
      return [{ path, message: `Expected number, received ${describeReceived(input)}` }]
    }

    const issues: Issue[] = []
    for (const rule of this.rules) {
      if (!rule.check(input)) {
        issues.push({ path, message: rule.message })
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return input
  }

  protected _clone(): NumberSchema {
    const cloned = new NumberSchema()
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  min(length: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value >= length,
      message: message ?? `Number must be at least ${length}`,
    })
    return clone
  }

  max(length: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value <= length,
      message: message ?? `Number must be at most ${length}`,
    })
    return clone
  }

  equals(exact: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === exact,
      message: message ?? `Number must be exactly ${exact}`,
    })
    return clone
  }

  positive(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value > 0,
      message: message ?? "Number must be positive",
    })
    return clone
  }

  negative(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value < 0,
      message: message ?? "Number must be negative",
    })
    return clone
  }

  finite(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => Number.isFinite(value),
      message: message ?? "Number must be finite",
    })
    return clone
  }

  integer(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => Number.isInteger(value),
      message: message ?? "Number must be an integer",
    })
    return clone
  }

  multipleOf(factor: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => {
        // Handle floating point precision issues
        const remainder = value % factor;
        const epsilon = Math.pow(10, -10); // Very small tolerance
        return Math.abs(remainder) < epsilon || Math.abs(remainder - factor) < epsilon;
      },
      message: message ?? `Number must be a multiple of ${factor}`,
    })
    return clone
  }

  notEqual(forbidden: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value !== forbidden,
      message: message ?? `Number must not be equal to ${forbidden}`,
    })
    return clone
  }

  between(min: number, max: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value >= min && value <= max,
      message: message ?? `Number must be between ${min} and ${max}`,
    })
    return clone
  }

  greaterThan(threshold: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value > threshold,
      message: message ?? `Number must be greater than ${threshold}`,
    })
    return clone
  }

  lessThan(threshold: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value < threshold,
      message: message ?? `Number must be less than ${threshold}`,
    })
    return clone
  }

  oneOf(options: number[], message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => options.includes(value),
      message: message ?? `Number must be one of: ${options.join(", ")}`,
    })
    return clone
  }

  notOneOf(options: number[], message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => !options.includes(value),
      message: message ?? `Number must not be one of: ${options.join(", ")}`,
    })
    return clone
  }


}
