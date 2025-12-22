// src/core/errors.ts

import type { Issue } from "./result"

export class KataxError extends Error {
  readonly issues: Issue[]

  constructor(issues: Issue[]) {
    super("Katax validation error")
    this.issues = issues
  }
}
