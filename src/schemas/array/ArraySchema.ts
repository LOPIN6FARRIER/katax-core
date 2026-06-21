import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived } from "../../core/result"

type ValidationRule<T> = {
  check: (value: T[]) => boolean
  message: string
}

export class ArraySchema<T> extends BaseSchema<T[]> {
  private rules: ValidationRule<T>[] = []
  private elementSchema?: BaseSchema<T>

  constructor(elementSchema?: BaseSchema<T>) {
    super()
    this.elementSchema = elementSchema
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T[] {
    if (!Array.isArray(input)) {
      return [{ path, message: `Expected an array, received ${describeReceived(input)}` }]
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

  protected _clone(): ArraySchema<T> {
    const cloned = new ArraySchema(this.elementSchema)
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: T[], path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []
    
    // If we have an element schema, check for async validation on elements
    if (this.elementSchema && 
        (this.elementSchema._asyncValidators.length > 0 || 
         typeof (this.elementSchema as any)._parseAsyncNested === 'function')) {
      
      for (let i = 0; i < value.length; i++) {
        const elementPath = [...path, i]
        const elementResult = await this.elementSchema.safeParseAsync(value[i])
        
        if (!elementResult.success) {
          for (const issue of elementResult.issues || []) {
            allIssues.push({
              path: [...elementPath, ...issue.path],
              message: issue.message
            })
          }
        }
      }
    }
    
    return allIssues
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.elementSchema?.hasAsyncValidation() ?? false
  }

  minLength(min: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length >= min,
      message: message ?? `Array must have at least ${min} elements`,
    })
    return clone
  }

  maxLength(max: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length <= max,
      message: message ?? `Array must have at most ${max} elements`,
    })
    return clone
  }

  min(min: number, message?: string): this {
    return this.minLength(min, message)
  }

  max(max: number, message?: string): this {
    return this.maxLength(max, message)
  }

  length(exact: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length === exact,
      message: message ?? `Array must have exactly ${exact} elements`,
    })
    return clone
  }

  notEmpty(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length > 0,
      message: message ?? "Array must not be empty",
    })
    return clone
  }

  nonempty(message?: string): this {
    return this.notEmpty(message)
  }

  unique(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
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
    return clone
  }

  contains(element: T, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => {
        // Use deep equality for complex objects
        return value.some(item => this.deepEqual(item, element))
      },
      message: message ?? `Array must contain ${element}`,
    })
    return clone
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
