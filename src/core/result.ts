// src/core/result.ts

export type Path = (string | number)[]

export interface Issue {
  path: Path
  message: string
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; issues: Issue[] }

export interface ValidationResult {
  valid: boolean
  issues: Issue[]
}
