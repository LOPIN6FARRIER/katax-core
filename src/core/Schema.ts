// src/core/Schema.ts

import { SafeParseResult } from "./result"
import { ValidationResult } from "./result"


export interface Schema<T> {
  parse(input: unknown): T
  safeParse(input: unknown): SafeParseResult<T>
  validate(input: unknown): ValidationResult

  
  readonly infer: T
}
