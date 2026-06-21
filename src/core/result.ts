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

export function isIssueArray(result: unknown): result is Issue[] {
  return Array.isArray(result) && result.length > 0 &&
    typeof result[0] === 'object' && result[0] !== null &&
    'path' in result[0] && 'message' in result[0]
}

export function describeReceived(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (Array.isArray(value)) return "array"
  return typeof value
}
