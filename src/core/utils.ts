import { Issue, SafeParseResult } from "./result"
import type { Schema } from "./Schema"

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
 * Validate `data` against `schema`, automatically choosing the sync or async
 * API depending on whether the schema actually has async validation
 * (via .asyncRefine() or a nested schema with one).
 *
 * This exists so callers building request-validation middleware (e.g.
 * katax-cli's generated projects, or any Express/Fastify handler) don't need
 * to duck-type `hasAsyncValidation()`/`_asyncValidators` themselves - that
 * was previously re-implemented ad hoc in every katax-cli-scaffolded project.
 *
 * @example
 * ```typescript
 * const schema = k.object({ email: k.email() })
 * const result = await validateSchema(schema, req.body)
 * if (!result.success) return res.status(400).json({ issues: result.issues })
 * ```
 */
export async function validateSchema<T>(
  schema: Schema<T>,
  data: unknown,
): Promise<SafeParseResult<T>> {
  return schema.hasAsyncValidation() ? schema.safeParseAsync(data) : schema.safeParse(data)
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
