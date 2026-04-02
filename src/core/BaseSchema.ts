// src/core/BaseSchema.ts

import type { Issue, SafeParseResult, ValidationResult } from "./result"
import type { AsyncSafeParseResult, AsyncValidationResult, AsyncValidator } from "./AsyncResult"
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
  public _asyncValidators: AsyncValidator<T>[] = []

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

  /**
   * Returns true when this schema or any nested schema needs async validation.
   */
  hasAsyncValidation(): boolean {
    return this._asyncValidators.length > 0 || this._hasAsyncValidationNested()
  }

  optional(): OptionalSchema<T> {
    return new OptionalSchema(this)
  }

  /**
   * Add an async validator to this schema.
   * 
   * @param validator - An async function that validates the input
   * @returns A new schema with the async validator added
   */
  asyncRefine(validator: AsyncValidator<T>): BaseSchema<T> {
    const cloned = this._clone()
    cloned._asyncValidators.push(validator)
    return cloned
  }

  /**
   * Parse input asynchronously with safe error handling.
   * 
   * @param input - The value to validate
   * @returns Promise resolving to a safe parse result
   */
  async safeParseAsync(input: unknown): Promise<AsyncSafeParseResult<T>> {
    const path: Issue["path"] = []

    // Run synchronous validation first
    const syncResult = this._parse(input, path)
    // Check if syncResult is an array of Issues (has path and message properties)
    if (Array.isArray(syncResult) && syncResult.length > 0 &&
        typeof syncResult[0] === 'object' && syncResult[0] !== null &&
        'path' in syncResult[0] && 'message' in syncResult[0]) {
      return { success: false, issues: syncResult as Issue[] }
    }

    // At this point, syncResult is T (not Issue[])
    const validData = syncResult as T

    // Run async validators if sync validation passed
    let allIssues: Issue[] = []
    for (const validator of this._asyncValidators) {
      const issues = await validator(validData, path)
      allIssues = allIssues.concat(issues)
    }

    // For composed schemas, also check for nested async validations
    const nestedAsyncIssues = await this._parseAsyncNested(validData, path)
    allIssues = allIssues.concat(nestedAsyncIssues)

    if (allIssues.length > 0) {
      return { success: false, issues: allIssues }
    }

    return { success: true, data: validData }
  }

  /**
   * Parse input asynchronously and throw on validation failure.
   * 
   * @param input - The value to validate
   * @returns Promise resolving to the validated value
   * @throws {KataxError} When validation fails
   */
  async parseAsync(input: unknown): Promise<T> {
    const result = await this.safeParseAsync(input)
    if (!result.success) {
      throw new KataxError(result.issues)
    }
    return result.data
  }

  /**
   * Validate input asynchronously and return a validation result.
   * 
   * @param input - The value to validate
   * @returns Promise resolving to validation result with success status
   */
  async isValidAsync(input: unknown): Promise<AsyncValidationResult> {
    const result = await this.safeParseAsync(input)
    return { valid: result.success, issues: result.success ? [] : result.issues }
  }

  /**
   * Handle nested async validation for composed schemas.
   * Override in schemas that contain other schemas (like ObjectSchema, ArraySchema).
   * 
   * @param value - The parsed value from sync validation
   * @param path - Current path in validation
   * @returns Promise of issues from nested async validations
   */
  protected async _parseAsyncNested(value: T, path: Issue["path"]): Promise<Issue[]> {
    // Base implementation - no nested async validation
    return []
  }

  /**
   * Reports whether nested schemas require async validation.
   * Override in composed schemas that wrap other schemas.
   */
  protected _hasAsyncValidationNested(): boolean {
    return false
  }

  /**
   * Create a clone of this schema (used for adding async validators).
   * Must be implemented by each schema type.
   */
  protected abstract _clone(): BaseSchema<T>

  nullable(): NullableSchema<T> {
    return new NullableSchema(this)
  }

  default(defaultValue: T): DefaultSchema<T> {
    return new DefaultSchema(this, defaultValue)
  }

  transform<U>(transformer: (value: T) => U): TransformSchema<T, U> {
    return new TransformSchema(this, transformer)
  }

  /**
   * Provide a fallback value if validation fails.
   * Instead of returning errors, the schema will return the catch value.
   *
   * @param catchValue - The value to return if validation fails
   * @returns A CatchSchema that returns catchValue on failure
   *
   * @example
   * ```typescript
   * const schema = k.string().catch("default")
   * schema.parse("hello")  // "hello"
   * schema.parse(123)      // "default" (instead of error)
   * ```
   */
  catch(catchValue: T): CatchSchema<T> {
    return new CatchSchema(this, catchValue)
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

  protected _clone(): BaseSchema<T | undefined> {
    const cloned = new OptionalSchema(this.schema)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: T | undefined, path: Issue["path"]): Promise<Issue[]> {
    // If undefined, no nested validation needed
    if (value === undefined) {
      return []
    }
    
    // Otherwise, delegate to the wrapped schema
    if (this.schema._asyncValidators.length > 0 || 
        typeof (this.schema as any)._parseAsyncNested === 'function') {
      const result = await this.schema.safeParseAsync(value)
      if (!result.success) {
        return result.issues || []
      }
    }
    
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.schema.hasAsyncValidation()
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

  protected _clone(): BaseSchema<T | null> {
    const cloned = new NullableSchema(this.schema)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: T | null, path: Issue["path"]): Promise<Issue[]> {
    // If null, no nested validation needed
    if (value === null) {
      return []
    }
    
    // Otherwise, delegate to the wrapped schema
    if (this.schema._asyncValidators.length > 0 || 
        typeof (this.schema as any)._parseAsyncNested === 'function') {
      const result = await this.schema.safeParseAsync(value)
      if (!result.success) {
        return result.issues || []
      }
    }
    
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.schema.hasAsyncValidation()
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

  protected _clone(): BaseSchema<T> {
    const cloned = new DefaultSchema(this.schema, this.defaultValue)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: T, path: Issue["path"]): Promise<Issue[]> {
    // Delegate to the wrapped schema for async validation
    if (this.schema._asyncValidators.length > 0 || 
        typeof (this.schema as any)._parseAsyncNested === 'function') {
      const result = await this.schema.safeParseAsync(value)
      if (!result.success) {
        return result.issues || []
      }
    }
    
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.schema.hasAsyncValidation()
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

  protected _clone(): BaseSchema<U> {
    const cloned = new TransformSchema(this.schema, this.transformer)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: U, path: Issue["path"]): Promise<Issue[]> {
    // For transform schemas, we need to validate the original value before transformation
    // But since we only have the transformed value here, we can't do much
    // The original schema's async validation should have been run during sync parsing
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.schema.hasAsyncValidation()
  }
}

/**
 * Schema that returns a fallback value on validation failure.
 */
export class CatchSchema<T> extends BaseSchema<T> {
  constructor(private _innerSchema: BaseSchema<T>, private _catchValue: T) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    const result = this._innerSchema._parse(input, path)

    // Check if result is an array of Issues
    if (Array.isArray(result) && result.length > 0 &&
        typeof result[0] === 'object' && result[0] !== null &&
        'path' in result[0] && 'message' in result[0]) {
      // Return catch value instead of errors
      return this._cloneValue(this._catchValue)
    }

    return result
  }

  protected _clone(): CatchSchema<T> {
    const cloned = new CatchSchema(this._innerSchema, this._catchValue)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: T, path: Issue["path"]): Promise<Issue[]> {
    // For catch schemas, async errors are also caught
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this._innerSchema.hasAsyncValidation()
  }

  private _cloneValue(value: T): T {
    if (Array.isArray(value)) {
      return [...value.map(item => this._cloneValue(item))] as T
    }
    if (value !== null && typeof value === 'object') {
      const cloned: any = {}
      for (const key in value) {
        if ((value as object).hasOwnProperty(key)) {
          cloned[key] = this._cloneValue((value as any)[key])
        }
      }
      return cloned as T
    }
    return value
  }
}
