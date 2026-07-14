// src/core/Schema.ts

import { SafeParseResult } from "./result";
import { ValidationResult } from "./result";
import type {
  AsyncSafeParseResult,
  AsyncValidationResult,
  AsyncValidator,
} from "./AsyncResult";
import type {
  BaseSchema,
  OptionalSchema,
  NullableSchema,
  NullishSchema,
  DefaultSchema,
  CatchSchema,
  BrandedSchema,
} from "./BaseSchema";
import type { JsonSchema } from "./schema.types";

export interface Schema<T> {
  parse(input: unknown): T;
  safeParse(input: unknown): SafeParseResult<T>;
  validate(input: unknown): ValidationResult;
  parseAsync(input: unknown): Promise<T>;
  safeParseAsync(input: unknown): Promise<AsyncSafeParseResult<T>>;
  isValidAsync(input: unknown): Promise<AsyncValidationResult>;
  hasAsyncValidation(): boolean;
  optional(): OptionalSchema<T>;
  nullable(): NullableSchema<T>;
  nullish(): NullishSchema<T>;
  default(defaultValue: T): DefaultSchema<T>;
  catch(catchValue: T): CatchSchema<T>;
  transform<U>(transformer: (value: T) => U): BaseSchema<U>;
  brand<B extends string>(brand: B): BrandedSchema<T, B>;
  refine(
    validator: (value: T) => boolean,
    message?: string | ((value: T) => string),
  ): BaseSchema<T>;
  asyncRefine(validator: AsyncValidator<T>): BaseSchema<T>;

  describe(description: string): this;
  toJsonSchema(): JsonSchema;

  readonly kataxInfer: T;
}
