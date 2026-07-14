// src/core/BaseSchema.ts

import type { Issue, SafeParseResult, ValidationResult } from "./result";
import { isIssueArray } from "./result";
import type {
  AsyncSafeParseResult,
  AsyncValidationResult,
  AsyncValidator,
} from "./AsyncResult";
import { KataxError } from "./errors";
import type { Schema } from "./Schema";
import { JsonSchema } from "./schema.types";

/**
 * Abstract base class for all schema types in Katax.
 *
 * Provides core validation methods including safe parsing,
 * throwing parsers, and validation result checking.
 *
 * @template T The TypeScript type this schema validates to
 */
export abstract class BaseSchema<T> implements Schema<T> {
  public _asyncValidators: AsyncValidator<T>[] = [];
  protected _jsonSchema?: JsonSchema = {};

  describe(description: string): this {
    const cloned = this._clone() as this;

    cloned._jsonSchema = {
      ...cloned._jsonSchema,
      description,
    };

    return cloned;
  }

  abstract toJsonSchema(): JsonSchema;

  /**
   * Internal parsing method that must be implemented by each schema type.
   *
   * @param input - The input value to validate
   * @param path - The current path in the validation tree
   * @returns Either an array of validation issues or the parsed value
   */
  abstract _parse(input: unknown, path: Issue["path"]): Issue[] | T;

  /**
   * Parse input and return the result or throw on validation failure.
   *
   * @param input - The value to validate
   * @returns The validated and transformed value
   * @throws {KataxError} When validation fails
   */
  parse(input: unknown): T {
    const result = this.safeParse(input);
    if (!result.success) {
      throw new KataxError(result.issues);
    }
    return result.data;
  }

  /**
   * Safely parse input without throwing errors.
   *
   * @param input - The value to validate
   * @returns Success result with data, or failure result with issues
   */
  safeParse(input: unknown): SafeParseResult<T> {
    const output = this._parse(input, []);
    if (isIssueArray(output)) {
      return { success: false, issues: output as Issue[] };
    }
    return { success: true, data: output as T };
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
    const result = this.safeParse(input);
    return {
      valid: result.success,
      issues: result.success ? [] : result.issues,
    };
  }

  /**
   * Returns true when this schema or any nested schema needs async validation.
   */
  hasAsyncValidation(): boolean {
    return this._asyncValidators.length > 0 || this._hasAsyncValidationNested();
  }

  optional(): OptionalSchema<T> {
    return new OptionalSchema(this);
  }

  /**
   * Add an async validator to this schema.
   *
   * @param validator - An async function that validates the input
   * @returns A new schema with the async validator added
   */
  asyncRefine(validator: AsyncValidator<T>): BaseSchema<T> {
    const cloned = this._clone();
    cloned._asyncValidators.push(validator);
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }

  refine(
    validator: (value: T) => boolean,
    message?: string | ((value: T) => string),
  ): BaseSchema<T> {
    return this.transform((value) => {
      if (!validator(value)) {
        const msg = typeof message === "function" ? message(value) : message;
        throw new Error(msg ?? "Refinement failed");
      }
      return value;
    });
  }

  /**
   * Parse input asynchronously with safe error handling.
   *
   * @param input - The value to validate
   * @returns Promise resolving to a safe parse result
   */
  async safeParseAsync(input: unknown): Promise<AsyncSafeParseResult<T>> {
    const path: Issue["path"] = [];

    // Run synchronous validation first
    const syncResult = this._parse(input, path);
    if (isIssueArray(syncResult)) {
      return { success: false, issues: syncResult as Issue[] };
    }

    // At this point, syncResult is T (not Issue[])
    const validData = syncResult as T;

    // Run async validators if sync validation passed
    let allIssues: Issue[] = [];
    for (const validator of this._asyncValidators) {
      const issues = await validator(validData, path);
      allIssues = allIssues.concat(issues);
    }

    // For composed schemas, also check for nested async validations
    const nestedAsyncIssues = await this._parseAsyncNested(validData, path);
    allIssues = allIssues.concat(nestedAsyncIssues);

    if (allIssues.length > 0) {
      return { success: false, issues: allIssues };
    }

    return { success: true, data: validData };
  }

  /**
   * Parse input asynchronously and throw on validation failure.
   *
   * @param input - The value to validate
   * @returns Promise resolving to the validated value
   * @throws {KataxError} When validation fails
   */
  async parseAsync(input: unknown): Promise<T> {
    const result = await this.safeParseAsync(input);
    if (!result.success) {
      throw new KataxError(result.issues);
    }
    return result.data;
  }

  /**
   * Validate input asynchronously and return a validation result.
   *
   * @param input - The value to validate
   * @returns Promise resolving to validation result with success status
   */
  async isValidAsync(input: unknown): Promise<AsyncValidationResult> {
    const result = await this.safeParseAsync(input);
    return {
      valid: result.success,
      issues: result.success ? [] : result.issues,
    };
  }

  /**
   * Handle nested async validation for composed schemas.
   * Override in schemas that contain other schemas (like ObjectSchema, ArraySchema).
   *
   * @param value - The parsed value from sync validation
   * @param path - Current path in validation
   * @returns Promise of issues from nested async validations
   */
  protected async _parseAsyncNested(
    value: T,
    path: Issue["path"],
  ): Promise<Issue[]> {
    // Base implementation - no nested async validation
    return [];
  }

  /**
   * Reports whether nested schemas require async validation.
   * Override in composed schemas that wrap other schemas.
   */
  protected _hasAsyncValidationNested(): boolean {
    return false;
  }

  /**
   * Create a clone of this schema (used for adding async validators).
   * Must be implemented by each schema type.
   */
  protected abstract _clone(): BaseSchema<T>;

  nullable(): NullableSchema<T> {
    return new NullableSchema(this);
  }

  nullish(): NullishSchema<T> {
    return new NullishSchema(this);
  }

  default(defaultValue: T): DefaultSchema<T> {
    return new DefaultSchema(this, defaultValue);
  }

  transform<U>(transformer: (value: T) => U): TransformSchema<T, U> {
    return new TransformSchema(this, transformer);
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
    return new CatchSchema(this, catchValue);
  }

  brand<B extends string>(brand: B): BrandedSchema<T, B> {
    return new BrandedSchema(this, brand);
  }

  isOptional(): boolean {
    return false;
  }

  // Type inference only
  declare readonly kataxInfer: T;
}

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    const cloned: any = {};
    for (const key of Object.keys(value)) {
      cloned[key] = deepClone((value as any)[key]);
    }
    return cloned as T;
  }
  return value;
}

abstract class WrapperSchema<T, U = T> extends BaseSchema<U> {
  constructor(protected inner: BaseSchema<T>) {
    super();
  }

  protected _clone(): BaseSchema<U> {
    const cloned = Object.create(Object.getPrototypeOf(this)) as this;
    cloned.inner = this.inner;
    cloned._asyncValidators = [...this._asyncValidators];
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }

  override isOptional(): boolean {
    return this.inner.isOptional();
  }

  protected async _parseAsyncNested(
    value: U,
    path: Issue["path"],
  ): Promise<Issue[]> {
    if (value === null || value === undefined) {
      return [];
    }
    if (
      this.inner._asyncValidators.length > 0 ||
      typeof (this.inner as any)._parseAsyncNested === "function"
    ) {
      const result = await this.inner.safeParseAsync(value as any);
      if (!result.success) {
        return result.issues || [];
      }
    }
    return [];
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.inner.hasAsyncValidation();
  }
}

export class OptionalSchema<T> extends WrapperSchema<T, T | undefined> {
  _parse(input: unknown, path: Issue["path"]): Issue[] | T | undefined {
    if (input === undefined) return undefined;
    return this.inner._parse(input, path);
  }
  toJsonSchema(): JsonSchema {
    return this.inner.toJsonSchema();
  }

  override isOptional(): boolean {
    return true;
  }
}

export class NullableSchema<T> extends WrapperSchema<T, T | null> {
  _parse(input: unknown, path: Issue["path"]): Issue[] | T | null {
    if (input === null) return null;
    return this.inner._parse(input, path);
  }
  toJsonSchema(): JsonSchema {
    return this.inner.toJsonSchema();
  }
}

export class NullishSchema<T> extends WrapperSchema<T, T | null | undefined> {
  _parse(input: unknown, path: Issue["path"]): Issue[] | T | null | undefined {
    if (input === null || input === undefined) return input;
    return this.inner._parse(input, path);
  }
  toJsonSchema(): JsonSchema {
    return this.inner.toJsonSchema();
  }
}

export class DefaultSchema<T> extends WrapperSchema<T, T> {
  constructor(
    inner: BaseSchema<T>,
    private defaultValue: T,
  ) {
    super(inner);
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    if (input === undefined) {
      return deepClone(this.defaultValue);
    }
    return this.inner._parse(input, path);
  }

  protected _clone(): BaseSchema<T> {
    const cloned = new DefaultSchema(this.inner, this.defaultValue);
    cloned._asyncValidators = [...this._asyncValidators];
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }
  toJsonSchema(): JsonSchema {
    return {
      ...this.inner.toJsonSchema(),
      ...this._jsonSchema,
      default: this.defaultValue,
    } as JsonSchema;
  }
}

export class TransformSchema<T, U> extends BaseSchema<U> {
  constructor(
    private inner: BaseSchema<T>,
    private transformer: (value: T) => U,
  ) {
    super();
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | U {
    const result = this.inner._parse(input, path);

    if (isIssueArray(result)) {
      return result;
    }

    try {
      return this.transformer(result as T);
    } catch (error) {
      return [
        {
          path,
          message: `Transform error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ];
    }
  }

  protected _clone(): BaseSchema<U> {
    const cloned = new TransformSchema(this.inner, this.transformer);
    cloned._asyncValidators = [...this._asyncValidators];
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }

  protected async _parseAsyncNested(
    value: U,
    path: Issue["path"],
  ): Promise<Issue[]> {
    return [];
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.inner.hasAsyncValidation();
  }

  toJsonSchema(): JsonSchema {
    return this.inner.toJsonSchema();
  }
}

/**
 * Schema that returns a fallback value on validation failure.
 */
export class CatchSchema<T> extends WrapperSchema<T, T> {
  constructor(
    inner: BaseSchema<T>,
    private _catchValue: T,
  ) {
    super(inner);
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    const result = this.inner._parse(input, path);

    if (isIssueArray(result)) {
      return deepClone(this._catchValue);
    }

    return result;
  }

  protected _clone(): CatchSchema<T> {
    const cloned = new CatchSchema(this.inner, this._catchValue);
    cloned._asyncValidators = [...this._asyncValidators];
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }

  toJsonSchema(): JsonSchema {
    return this.inner.toJsonSchema();
  }
}

export class BrandedSchema<T, B extends string> extends BaseSchema<
  T & { __brand: B }
> {
  constructor(
    private inner: BaseSchema<T>,
    private _brand: B,
  ) {
    super();
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | (T & { __brand: B }) {
    const result = this.inner._parse(input, path);
    if (isIssueArray(result)) {
      return result;
    }
    if (result !== null && typeof result === "object") {
      return { ...(result as object), __brand: this._brand } as T & {
        __brand: B;
      };
    }
    return result as T & { __brand: B };
  }

  protected _clone(): BrandedSchema<T, B> {
    const cloned = new BrandedSchema(this.inner, this._brand);
    cloned._asyncValidators = [...this._asyncValidators];
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }

  protected async _parseAsyncNested(
    value: T & { __brand: B },
    path: Issue["path"],
  ): Promise<Issue[]> {
    if (
      this.inner._asyncValidators.length > 0 ||
      typeof (this.inner as any)._parseAsyncNested === "function"
    ) {
      const result = await this.inner.safeParseAsync(value);
      if (!result.success) {
        return result.issues || [];
      }
    }
    return [];
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.inner.hasAsyncValidation();
  }

  toJsonSchema(): JsonSchema {
    return this.inner.toJsonSchema();
  }
}
