import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived, isIssueArray } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"
import type { AsyncSafeParseResult } from "../../core/AsyncResult"

export class PromiseSchema<T> extends BaseSchema<Promise<T>> {
  constructor(private schema?: BaseSchema<T>) {
    super()
    this._jsonSchema = { type: "object" }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | Promise<T> {
    if (!(input instanceof Promise)) {
      return [{ path, message: `Expected a Promise, received ${describeReceived(input)}` }]
    }
    return input as Promise<T>
  }

  async safeParseAsync(input: unknown): Promise<AsyncSafeParseResult<Promise<T>>> {
    const syncResult = this._parse(input, [])
    if (isIssueArray(syncResult)) {
      return { success: false as const, issues: syncResult }
    }

    if (this.schema) {
      try {
        const resolved = await (input as Promise<unknown>)
        const innerResult = await this.schema.safeParseAsync(resolved)
        if (!innerResult.success) {
          return { success: false as const, issues: innerResult.issues! }
        }
        return { success: true as const, data: Promise.resolve(innerResult.data) as Promise<T> }
      } catch {
        return { success: false as const, issues: [{ path: [], message: "Promise rejected during validation" }] }
      }
    }

    return { success: true as const, data: input as Promise<T> }
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }

  protected _clone(): PromiseSchema<T> {
    const cloned = new PromiseSchema(this.schema)
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  protected async _parseAsyncNested(value: Promise<T>, path: Issue["path"]): Promise<Issue[]> {
    if (this.schema) {
      try {
        const resolved = await value
        const result = await this.schema.safeParseAsync(resolved)
        if (!result.success) return result.issues || []
      } catch {
        return [{ path, message: "Promise rejected during validation" }]
      }
    }
    return []
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.schema !== undefined
  }
}
