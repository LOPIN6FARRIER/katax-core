import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

type ValidationRule = {
  check: (value: bigint) => boolean
  message: string
}

export class BigIntSchema extends BaseSchema<bigint> {
  private rules: ValidationRule[] = []

  constructor() {
    super()
    this._jsonSchema = { type: "integer" }
  }

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
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  min(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v >= value,
      message: message ?? `Value must be at least ${value}n`,
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      minimum: Number(value),
    }
    return clone
  }

  max(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v <= value,
      message: message ?? `Value must be at most ${value}n`,
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      maximum: Number(value),
    }
    return clone
  }

  positive(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v > 0n,
      message: message ?? "Value must be positive",
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      exclusiveMinimum: 0,
    }
    return clone
  }

  negative(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v < 0n,
      message: message ?? "Value must be negative",
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      exclusiveMaximum: 0,
    }
    return clone
  }

  nonnegative(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v >= 0n,
      message: message ?? "Value must be non-negative",
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      minimum: 0,
    }
    return clone
  }

  nonpositive(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v <= 0n,
      message: message ?? "Value must be non-positive",
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      maximum: 0,
    }
    return clone
  }

  between(min: bigint, max: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v >= min && v <= max,
      message: message ?? `Value must be between ${min}n and ${max}n`,
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      minimum: Number(min),
      maximum: Number(max),
    }
    return clone
  }

  multipleOf(factor: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v % factor === 0n,
      message: message ?? `Value must be a multiple of ${factor}n`,
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      multipleOf: Number(factor),
    }
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
    clone._jsonSchema = {
      ...clone._jsonSchema,
      enum: options.map(o => Number(o)),
    }
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
    clone._jsonSchema = {
      ...clone._jsonSchema,
      exclusiveMinimum: Number(value),
    }
    return clone
  }

  lessThan(value: bigint, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (v) => v < value,
      message: message ?? `Value must be less than ${value}n`,
    })
    clone._jsonSchema = {
      ...clone._jsonSchema,
      exclusiveMaximum: Number(value),
    }
    return clone
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }
}
