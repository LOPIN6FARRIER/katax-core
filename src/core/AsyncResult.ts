// src/core/AsyncResult.ts

import type { Issue, SafeParseResult } from "./result"

export type AsyncSafeParseResult<T> = SafeParseResult<T>

export interface AsyncValidationResult {
  valid: boolean
  issues: Issue[]
}

export type AsyncValidator<T> = (value: T, path: Issue["path"]) => Promise<Issue[]>