import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

export class NanSchema extends BaseSchema<number> {
  constructor() {
    super()
    this._jsonSchema = { type: "number" }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | number {
    if (typeof input !== "number" || !Number.isNaN(input)) {
      return [{ path, message: `Expected NaN, received ${describeReceived(input)}` }]
    }
    return input
  }

  protected _clone(): NanSchema {
    const cloned = new NanSchema()
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }
}

export class UndefinedSchema extends BaseSchema<undefined> {
  constructor() {
    super()
    // undefined has no JSON representation: no value is valid. Inside an object
    // (where isOptional() keeps it out of `required`) this means "key must be absent".
    this._jsonSchema = { not: {} }
  }

  override isOptional(): boolean {
    return true
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | undefined {
    if (input !== undefined) {
      return [{ path, message: `Expected undefined, received ${describeReceived(input)}` }]
    }
    return undefined
  }

  protected _clone(): UndefinedSchema {
    const cloned = new UndefinedSchema()
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }
}

export class NullSchema extends BaseSchema<null> {
  constructor() {
    super()
    this._jsonSchema = { type: "null" }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | null {
    if (input !== null) {
      return [{ path, message: `Expected null, received ${describeReceived(input)}` }]
    }
    return null
  }

  protected _clone(): NullSchema {
    const cloned = new NullSchema()
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }
}

export class VoidSchema extends BaseSchema<void> {
  constructor() {
    super()
    this._jsonSchema = { type: "null" }
  }

  /** Accepts undefined, so the key is not required inside an object. */
  override isOptional(): boolean {
    return true
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | void {
    if (input !== undefined && input !== null) {
      return [{ path, message: `Expected void (null/undefined), received ${describeReceived(input)}` }]
    }
    return input as void
  }

  protected _clone(): VoidSchema {
    const cloned = new VoidSchema()
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }
}
