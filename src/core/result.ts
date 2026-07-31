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

function looksLikeIssue(value: unknown): value is Issue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    'message' in value &&
    Array.isArray((value as Issue).path) &&
    (value as Issue).path.every((seg) => typeof seg === 'string' || typeof seg === 'number') &&
    typeof (value as Issue).message === 'string'
  )
}

/**
 * Distinguishes a failed _parse() result (Issue[]) from a successfully parsed
 * value that itself happens to be an array. Every element is checked against
 * the exact Issue shape ({ path: (string|number)[], message: string }) rather
 * than only the first one, which rules out the vast majority of accidental
 * collisions with real parsed data. It is still a structural/duck-typed check,
 * not a branded type - a schema whose valid output is an array of objects that
 * all happen to match this exact shape is still ambiguous by construction.
 */
export function isIssueArray(result: unknown): result is Issue[] {
  return Array.isArray(result) && result.length > 0 && result.every(looksLikeIssue)
}

export function describeReceived(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (Array.isArray(value)) return "array"
  return typeof value
}
