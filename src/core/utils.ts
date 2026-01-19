import { Issue } from "./result"

/**
 * Fast check if a value is an array of Issues.
 * Uses a Symbol marker for O(1) detection when possible.
 */
const ISSUE_MARKER = Symbol.for('katax.issue')

/**
 * Check if a result is an Issue array.
 * Optimized for performance with early returns.
 */
export function isIssueArray(result: unknown): result is Issue[] {
  // Fast path: empty arrays are not issues
  if (!Array.isArray(result) || result.length === 0) {
    return false
  }

  // Check first element only (all issues should have same shape)
  const first = result[0]
  return typeof first === 'object' &&
    first !== null &&
    'path' in first &&
    'message' in first
}

/**
 * Create an issue with the given path and message.
 * Helper for cleaner code.
 */
export function createIssue(path: Issue["path"], message: string): Issue {
  return { path, message }
}

/**
 * Create an array with a single issue.
 */
export function issues(path: Issue["path"], message: string): Issue[] {
  return [{ path, message }]
}

/**
 * Merge multiple issue arrays efficiently.
 */
export function mergeIssues(...arrays: Issue[][]): Issue[] {
  // Optimize for common cases
  if (arrays.length === 0) return []
  if (arrays.length === 1) return arrays[0]

  // Pre-calculate total length for single allocation
  let totalLength = 0
  for (const arr of arrays) {
    totalLength += arr.length
  }

  if (totalLength === 0) return []

  const result = new Array<Issue>(totalLength)
  let offset = 0
  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) {
      result[offset++] = arr[i]
    }
  }

  return result
}

/**
 * Lazy schema wrapper for deferred validation.
 * Useful for recursive schemas and large object graphs.
 */
export type LazyResolver<T> = () => T

/**
 * Memoize a function with a single argument.
 * Used for caching schema creation.
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>()
  return (arg: T) => {
    if (cache.has(arg)) {
      return cache.get(arg)!
    }
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
