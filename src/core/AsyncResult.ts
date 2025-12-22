// src/core/AsyncResult.ts

export interface AsyncSafeParseResult<T> {
  success: boolean
  data?: T
  issues?: Issue[]
}

export interface Issue {
  path: (string | number)[]
  message: string
}

export interface AsyncValidationResult {
  valid: boolean
  issues: Issue[]
}

export type AsyncValidator<T> = (value: T, path: Issue["path"]) => Promise<Issue[]>