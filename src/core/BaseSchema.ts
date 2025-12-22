// src/core/BaseSchema.ts

import type { Issue, SafeParseResult, ValidationResult } from "./result"
import { KataxError } from "./errors"
import type { Schema } from "./Schema"

/**
 * Abstract base class for all schema types in Katax.
 * 
 * Provides core validation methods including safe parsing,
 * throwing parsers, and validation result checking.
 * 
 * @template T The TypeScript type this schema validates to
 */
export abstract class BaseSchema<T> implements Schema<T> {
  /**
   * Internal parsing method that must be implemented by each schema type.
   * 
   * @param input - The input value to validate
   * @param path - The current path in the validation tree
   * @returns Either an array of validation issues or the parsed value
   */
  abstract _parse(input: unknown, path: Issue["path"]): Issue[] | T

  /**
   * Parse input and return the result or throw on validation failure.
   * 
   * @param input - The value to validate
   * @returns The validated and transformed value
   * @throws {KataxError} When validation fails
   */
  parse(input: unknown): T {
    const result = this.safeParse(input)
    if (!result.success) {
      throw new KataxError(result.issues)
    }
    return result.data
  }

  /**
   * Safely parse input without throwing errors.
   * 
   * @param input - The value to validate
   * @returns Success result with data, or failure result with issues
   */
  safeParse(input: unknown): SafeParseResult<T> {
    const output = this._parse(input, [])
    // Check if output is an array of Issues (has path and message properties)
    if (Array.isArray(output) && output.length > 0 &&
        typeof output[0] === 'object' && output[0] !== null &&
        'path' in output[0] && 'message' in output[0]) {
      return { success: false, issues: output as Issue[] }
    }
    return { success: true, data: output as T }
  }

  /**
   * Validate input and return validation status with issues.
   * 
   * Unlike safeParse, this doesn't return the parsed data,
   * only whether validation succeeded and any issues found.
   * 
   * @param input - The value to validate
   * @returns Validation result with valid flag and issues array
   */
  validate(input: unknown): ValidationResult {
    const result = this.safeParse(input)
    return {
      valid: result.success,
      issues: result.success ? [] : result.issues,
    }
  }

  optional(): OptionalSchema<T> {
    return new OptionalSchema(this)
  }

  nullable(): NullableSchema<T> {
    return new NullableSchema(this)
  }

  default(defaultValue: T): DefaultSchema<T> {
    return new DefaultSchema(this, defaultValue)
  }

  transform<U>(transformer: (value: T) => U): TransformSchema<T, U> {
    return new TransformSchema(this, transformer)
  }

  // Type inference only
  declare readonly kataxInfer: T
}

class OptionalSchema<T> extends BaseSchema<T | undefined> {
  constructor(private schema: BaseSchema<T>) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T | undefined {
    if (input === undefined) {
      return undefined
    }
    return this.schema._parse(input, path)
  }
}

class NullableSchema<T> extends BaseSchema<T | null> {
  constructor(private schema: BaseSchema<T>) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T | null {
    if (input === null) {
      return null
    }
    return this.schema._parse(input, path)
  }
}

class DefaultSchema<T> extends BaseSchema<T> {
  constructor(private schema: BaseSchema<T>, private defaultValue: T) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    if (input === undefined) {
      // Clone the default value to prevent mutation
      return this.cloneValue(this.defaultValue)
    }
    return this.schema._parse(input, path)
  }

  private cloneValue(value: T): T {
    // Deep clone for arrays and objects, shallow clone for primitives
    if (Array.isArray(value)) {
      return [...value.map(item => this.cloneValue(item))] as T
    }
    if (value !== null && typeof value === 'object') {
      const cloned: any = {}
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          cloned[key] = this.cloneValue((value as any)[key])
        }
      }
      return cloned as T
    }
    return value // Primitives are immutable
  }
}

class TransformSchema<T, U> extends BaseSchema<U> {
  constructor(private schema: BaseSchema<T>, private transformer: (value: T) => U) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | U {
    const result = this.schema._parse(input, path)

    // Check if result is an array of Issues
    if (Array.isArray(result) && result.length > 0 &&
        typeof result[0] === 'object' && result[0] !== null &&
        'path' in result[0] && 'message' in result[0]) {
      return result
    }

    try {
      return this.transformer(result as T)
    } catch (error) {
      return [{ path, message: `Transform error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
    }
  }
}
