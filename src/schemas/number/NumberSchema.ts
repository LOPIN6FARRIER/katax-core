import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type ValidationRule = {
  check: (value: number) => boolean
  message: string
}

export class NumberSchema extends BaseSchema<number> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | number {
    if (typeof input !== "number") {
      return [{ path, message: "Expected number" }]
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


  min(length: number, message?: string): this {
    this.rules.push({
      check: (value) => value >= length,
      message: message ?? `Number must be at least ${length}`,
    })
    return this
  }

  max(length: number, message?: string): this {
    this.rules.push({
      check: (value) => value <= length,
      message: message ?? `Number must be at most ${length}`,
    })
    return this
  }

  length(exact: number, message?: string): this {
    this.rules.push({
      check: (value) => value === exact,
      message: message ?? `Number must be exactly ${exact}`,
    })
    return this
  }

  nonempty(message?: string): this {
    return this.min(1, message ?? "Number cannot be empty")
  }

  positive(message?: string): this {
    this.rules.push({
      check: (value) => value > 0,
      message: message ?? "Number must be positive",
    })
    return this
  }

  negative(message?: string): this {
    this.rules.push({
      check: (value) => value < 0,
      message: message ?? "Number must be negative",
    })
    return this
  }

  finite(message?: string): this {
    this.rules.push({
      check: (value) => Number.isFinite(value),
      message: message ?? "Number must be finite",
    })
    return this
  }

  integer(message?: string): this {
    this.rules.push({
      check: (value) => Number.isInteger(value),
      message: message ?? "Number must be an integer",
    })
    return this
  }

  multipleOf(factor: number, message?: string): this {
    this.rules.push({
      check: (value) => {
        // Handle floating point precision issues
        const remainder = value % factor;
        const epsilon = Math.pow(10, -10); // Very small tolerance
        return Math.abs(remainder) < epsilon || Math.abs(remainder - factor) < epsilon;
      },
      message: message ?? `Number must be a multiple of ${factor}`,
    })
    return this
  }

  notEqual(forbidden: number, message?: string): this {
    this.rules.push({
      check: (value) => value !== forbidden,
      message: message ?? `Number must not be equal to ${forbidden}`,
    })
    return this 
  }

  between(min: number, max: number, message?: string): this {
    this.rules.push({
      check: (value) => value >= min && value <= max,
      message: message ?? `Number must be between ${min} and ${max}`,
    })
    return this
  }

  greaterThan(threshold: number, message?: string): this {
    this.rules.push({
      check: (value) => value > threshold,
      message: message ?? `Number must be greater than ${threshold}`,
    })
    return this
  }

  lessThan(threshold: number, message?: string): this {
    this.rules.push({
      check: (value) => value < threshold,
      message: message ?? `Number must be less than ${threshold}`,
    })
    return this
  }

  oneOf(options: number[], message?: string): this {
    this.rules.push({
      check: (value) => options.includes(value),
      message: message ?? `Number must be one of: ${options.join(", ")}`,
    })
    return this
  }

  notOneOf(options: number[], message?: string): this {
    this.rules.push({
      check: (value) => !options.includes(value),
      message: message ?? `Number must not be one of: ${options.join(", ")}`,
    })
    return this
  }


}
