import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"
import type { Schema } from "../../core/Schema"

type ValidationRule<T> = {
  check: (value: T[]) => boolean
  message: string
}

export class ArraySchema<T> extends BaseSchema<T[]> {
  private rules: ValidationRule<T>[] = []
  private elementSchema?: Schema<T>

  constructor(elementSchema?: Schema<T>) {
    super()
    this.elementSchema = elementSchema
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T[] {
    if (!Array.isArray(input)) {
      return [{ path, message: "Expected an array" }]
    }

    const issues: Issue[] = []

    // Validate each element if elementSchema is provided
    if (this.elementSchema) {
      const validatedArray: T[] = []
      for (let i = 0; i < input.length; i++) {
        const result = this.elementSchema.safeParse(input[i])
        if (!result.success) {
          // Add path information for each element
          for (const issue of result.issues) {
            issues.push({
              path: [...path, i, ...issue.path],
              message: issue.message,
            })
          }
        } else {
          validatedArray.push(result.data)
        }
      }

      // If there are validation errors, return them
      if (issues.length > 0) {
        return issues
      }

      // Check array-level rules
      for (const rule of this.rules) {
        if (!rule.check(validatedArray)) {
          issues.push({ path, message: rule.message })
        }
      }

      if (issues.length > 0) {
        return issues
      }

      return validatedArray
    }

    // No element schema, just validate array-level rules
    for (const rule of this.rules) {
      if (!rule.check(input as T[])) {
        issues.push({ path, message: rule.message })
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return input as T[]
  }

  minLength(min: number, message?: string): this {
    this.rules.push({
      check: (value) => value.length >= min,
      message: message ?? `Array must have at least ${min} elements`,
    })
    return this
  }

  maxLength(max: number, message?: string): this {
    this.rules.push({
      check: (value) => value.length <= max,
      message: message ?? `Array must have at most ${max} elements`,
    })
    return this
  }

  length(exact: number, message?: string): this {
    this.rules.push({
      check: (value) => value.length === exact,
      message: message ?? `Array must have exactly ${exact} elements`,
    })
    return this
  }

  notEmpty(message?: string): this {
    this.rules.push({
      check: (value) => value.length > 0,
      message: message ?? "Array must not be empty",
    })
    return this
  }

  unique(message?: string): this {
    this.rules.push({
      check: (value) => {
        // Use custom equality for complex objects
        for (let i = 0; i < value.length; i++) {
          for (let j = i + 1; j < value.length; j++) {
            if (this.deepEqual(value[i], value[j])) {
              return false
            }
          }
        }
        return true
      },
      message: message ?? "Array must contain unique values",
    })
    return this
  }

  contains(element: T, message?: string): this {
    this.rules.push({
      check: (value) => {
        // Use deep equality for complex objects
        return value.some(item => this.deepEqual(item, element))
      },
      message: message ?? `Array must contain ${element}`,
    })
    return this
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true
    
    // Handle NaN case
    if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
      return true
    }
    
    // Handle null/undefined
    if (a == null || b == null) return a === b
    
    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => this.deepEqual(item, b[index]))
    }
    
    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false
      return keysA.every(key => this.deepEqual(a[key], b[key]))
    }
    
    return false
  }
}
