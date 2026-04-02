// src/core/AsyncResult.ts

import type { Issue } from "./result"

export type AsyncSafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; issues: Issue[] }

export interface AsyncValidationResult {
  valid: boolean
  issues: Issue[]
}

export type AsyncValidator<T> = (value: T, path: Issue["path"]) => Promise<Issue[]>