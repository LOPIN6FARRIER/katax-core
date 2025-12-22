import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type ValidationRule = {
  check: (value: boolean) => boolean
  message: string
}

export class BooleanSchema extends BaseSchema<boolean> {
  private rules: ValidationRule[] = []

   _parse(input: unknown, path: Issue["path"]): Issue[] | boolean {
    if (typeof input !== "boolean") {
      return [{ path, message: "Expected boolean" }]
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
    return cloned
  }

  isTrue(message?: string): this {
    this.rules.push({
      check: (value) => value === true,
      message: message ?? "Boolean must be true",
    })
    return this
  }

    isFalse(message?: string): this {
    this.rules.push({
      check: (value) => value === false,
      message: message ?? "Boolean must be false",
    })
    return this
  }

  equals(expected: boolean, message?: string): this {
    this.rules.push({
      check: (value) => value === expected,
      message: message ?? `Boolean must be ${expected}`,
    })
    return this
  }


}