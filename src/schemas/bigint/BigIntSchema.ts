import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived } from "../../core/result"

type ValidationRule = {
  check: (value: bigint) => boolean
  message: string
}

export class BigIntSchema extends BaseSchema<bigint> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | bigint {
    if (typeof input !== "bigint") {
      return [{ path, message: `Expected bigint, received ${describeReceived(input)}` }]
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

  protected _clone(): BigIntSchema {
    const cloned = new BigIntSchema()
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  min(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v >= value,
      message: message ?? `Value must be at least ${value}n`,
    })
    return clone
  }

  max(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v <= value,
      message: message ?? `Value must be at most ${value}n`,
    })
    return clone
  }

  positive(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v > 0n,
      message: message ?? "Value must be positive",
    })
    return clone
  }

  negative(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v < 0n,
      message: message ?? "Value must be negative",
    })
    return clone
  }

  nonnegative(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v >= 0n,
      message: message ?? "Value must be non-negative",
    })
    return clone
  }

  nonpositive(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v <= 0n,
      message: message ?? "Value must be non-positive",
    })
    return clone
  }

  between(min: bigint, max: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v >= min && v <= max,
      message: message ?? `Value must be between ${min}n and ${max}n`,
    })
    return clone
  }

  multipleOf(factor: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v % factor === 0n,
      message: message ?? `Value must be a multiple of ${factor}n`,
    })
    return clone
  }

  equals(exact: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v === exact,
      message: message ?? `Value must be exactly ${exact}n`,
    })
    return clone
  }

  oneOf(options: bigint[], message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => options.includes(v),
      message: message ?? `Value must be one of: ${options.map(o => `${o}n`).join(", ")}`,
    })
    return clone
  }

  notOneOf(options: bigint[], message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => !options.includes(v),
      message: message ?? `Value must not be one of: ${options.map(o => `${o}n`).join(", ")}`,
    })
    return clone
  }

  notEqual(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v !== value,
      message: message ?? `Value must not be equal to ${value}n`,
    })
    return clone
  }

  greaterThan(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v > value,
      message: message ?? `Value must be greater than ${value}n`,
    })
    return clone
  }

  lessThan(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v < value,
      message: message ?? `Value must be less than ${value}n`,
    })
    return clone
  }
}
