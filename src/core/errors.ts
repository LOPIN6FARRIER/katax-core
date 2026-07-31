import type { Issue } from "./result"

export class KataxError extends Error {
  public issues: Issue[]

  constructor(issues: Issue[], options?: { cause?: Error }) {
    const message = issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    super(message)
    this.name = 'KataxError'
    this.issues = issues
  }
}

/**
 * Thrown by parse()/safeParse() when the schema has async validation
 * (via .asyncRefine() or a nested schema with one) but was validated
 * through the synchronous API. Async validators never run in that path,
 * so failing loudly here prevents silently-skipped validation.
 */
/**
 * Internal marker thrown by refine()'s validator wrapper to signal a deliberate
 * refinement failure. TransformSchema._parse() catches only this type and turns
 * it into a validation Issue - any other error thrown from inside a user's own
 * .transform()/.refine() callback (i.e. a real bug) propagates instead of being
 * silently swallowed as a generic "Transform error" issue.
 */
export class KataxRefinementFailure extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KataxRefinementFailure'
  }
}

export class KataxAsyncValidationRequiredError extends Error {
  constructor() {
    super(
      "This schema has async validation (via .asyncRefine() or a nested schema " +
        "with one). parse()/safeParse() only run synchronous checks and would " +
        "silently skip the async validator(s). Use parseAsync()/safeParseAsync() instead.",
    )
    this.name = 'KataxAsyncValidationRequiredError'
  }
}
