// src/core/errors.ts

import type { Issue } from "./result"

export class KataxError extends Error {
  public issues: Issue[]

  constructor(issues: Issue[], options?: { cause?: Error }) {
    const message = issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    super(message, options)
    this.name = 'KataxError'
    this.issues = issues
  }
}
