// src/core/Schema.ts

import { SafeParseResult } from "./result"
import { ValidationResult } from "./result"
import type { AsyncSafeParseResult, AsyncValidationResult } from "./AsyncResult"


export interface Schema<T> {
  parse(input: unknown): T
  safeParse(input: unknown): SafeParseResult<T>
  validate(input: unknown): ValidationResult
  parseAsync(input: unknown): Promise<T>
  safeParseAsync(input: unknown): Promise<AsyncSafeParseResult<T>>
  isValidAsync(input: unknown): Promise<AsyncValidationResult>
  hasAsyncValidation(): boolean

  
  readonly kataxInfer: T
}
