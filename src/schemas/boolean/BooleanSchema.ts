import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

type ValidationRule = {
  check: (value: boolean) => boolean
  message: string
}

export class BooleanSchema extends BaseSchema<boolean> {
  private rules: ValidationRule[] = []

  constructor() {
    super()
    this._jsonSchema = {
      type: "boolean",
    }
  }

   _parse(input: unknown, path: Issue["path"]): Issue[] | boolean {
    if (typeof input !== "boolean") {
      return [{ path, message: `Expected boolean, received ${describeReceived(input)}` }]
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

  protected _clone(): BooleanSchema {
    const cloned = new BooleanSchema()
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  isTrue(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === true,
      message: message ?? "Boolean must be true",
    })
    return clone
  }

    isFalse(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === false,
      message: message ?? "Boolean must be false",
    })
    return clone
  }

  equals(expected: boolean, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === expected,
      message: message ?? `Boolean must be ${expected}`,
    })
    return clone
  }

  toJsonSchema(): JsonSchema {
    return {
      ...this._jsonSchema,
    } as JsonSchema
  }
}