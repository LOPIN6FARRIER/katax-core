import { BaseSchema } from "../../core/BaseSchema"
import { Issue, describeReceived, isIssueArray } from "../../core/result"
import type { JsonSchema } from "../../core/schema.types"

type SetValidationRule<T> = {
  check: (value: Set<T>) => boolean
  message: string
}

export class SetSchema<T> extends BaseSchema<Set<T>> {
  private rules: SetValidationRule<T>[] = []
  constructor(private valueSchema?: BaseSchema<T>) {
    super()
    this._jsonSchema = {
      type: "array",
      uniqueItems: true,
      items: valueSchema?.toJsonSchema(),
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | Set<T> {
    if (!(input instanceof Set)) {
      return [{ path, message: `Expected a Set, received ${describeReceived(input)}` }]
    }
    let validated: Set<T>
    if (this.valueSchema) {
      const issues: Issue[] = []
      validated = new Set<T>()
      let i = 0
      for (const item of input) {
        const itemPath = [...path, i]
        const result = this.valueSchema._parse(item, itemPath)
        if (isIssueArray(result)) {
          issues.push(...result)
        } else {
          validated.add(result)
        }
        i++
      }
      if (issues.length > 0) return issues
    } else {
      validated = input as Set<T>
    }
    const issues: Issue[] = []
    for (const rule of this.rules) {
      if (!rule.check(validated)) {
        issues.push({ path, message: rule.message })
      }
    }
    if (issues.length > 0) return issues
    return validated
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }

  protected _clone(): SetSchema<T> {
    const cloned = new SetSchema(this.valueSchema)
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  minSize(min: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.size >= min,
      message: message ?? `Set must have at least ${min} elements`,
    })
    return clone
  }

  maxSize(max: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.size <= max,
      message: message ?? `Set must have at most ${max} elements`,
    })
    return clone
  }

  nonempty(message?: string): this {
    return this.minSize(1, message ?? "Set must not be empty")
  }

  protected async _parseAsyncNested(value: Set<T>, path: Issue["path"]): Promise<Issue[]> {
    if (!this.valueSchema) return []
    const allIssues: Issue[] = []
    let i = 0
    for (const item of value) {
      const itemPath = [...path, i]
      if (this.valueSchema._asyncValidators.length > 0 ||
          typeof (this.valueSchema as any)._parseAsyncNested === 'function') {
        const result = await this.valueSchema.safeParseAsync(item)
        if (!result.success) {
          for (const issue of result.issues || []) {
            allIssues.push({ path: [...itemPath, ...issue.path], message: issue.message })
          }
        }
      }
      i++
    }
    return allIssues
  }

  protected _hasAsyncValidationNested(): boolean {
    return this.valueSchema?.hasAsyncValidation() ?? false
  }
}

type MapValidationRule<K, V> = {
  check: (value: Map<K, V>) => boolean
  message: string
}

export class MapSchema<K, V> extends BaseSchema<Map<K, V>> {
  private rules: MapValidationRule<K, V>[] = []
  constructor(private keySchema?: BaseSchema<K>, private valueSchema?: BaseSchema<V>) {
    super()
    this._jsonSchema = {
      type: "object",
      additionalProperties: valueSchema?.toJsonSchema(),
    }
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | Map<K, V> {
    if (!(input instanceof Map)) {
      return [{ path, message: `Expected a Map, received ${describeReceived(input)}` }]
    }
    let validated: Map<K, V>
    if (this.keySchema || this.valueSchema) {
      const issues: Issue[] = []
      validated = new Map<K, V>()
      let i = 0
      for (const [key, value] of input) {
        const keyPath = [...path, i, "key"]
        const valuePath = [...path, i, "value"]
        let validatedKey = key as K
        let validatedValue = value as V
        if (this.keySchema) {
          const keyResult = this.keySchema._parse(key, keyPath)
          if (isIssueArray(keyResult)) {
            issues.push(...keyResult)
          } else {
            validatedKey = keyResult
          }
        }
        if (this.valueSchema) {
          const valResult = this.valueSchema._parse(value, valuePath)
          if (isIssueArray(valResult)) {
            issues.push(...valResult)
          } else {
            validatedValue = valResult
          }
        }
        validated.set(validatedKey, validatedValue)
        i++
      }
      if (issues.length > 0) return issues
    } else {
      validated = input as Map<K, V>
    }
    const issues: Issue[] = []
    for (const rule of this.rules) {
      if (!rule.check(validated)) {
        issues.push({ path, message: rule.message })
      }
    }
    if (issues.length > 0) return issues
    return validated
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }

  protected _clone(): MapSchema<K, V> {
    const cloned = new MapSchema(this.keySchema, this.valueSchema)
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    cloned._jsonSchema = { ...this._jsonSchema }
    return cloned
  }

  minSize(min: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.size >= min,
      message: message ?? `Map must have at least ${min} elements`,
    })
    return clone
  }

  maxSize(max: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.size <= max,
      message: message ?? `Map must have at most ${max} elements`,
    })
    return clone
  }

  nonempty(message?: string): this {
    return this.minSize(1, message ?? "Map must not be empty")
  }

  protected async _parseAsyncNested(value: Map<K, V>, path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []
    let i = 0
    for (const [key, val] of value) {
      const keyPath = [...path, i, "key"]
      const valuePath = [...path, i, "value"]
      if (this.keySchema) {
        if (this.keySchema._asyncValidators.length > 0 ||
            typeof (this.keySchema as any)._parseAsyncNested === 'function') {
          const result = await this.keySchema.safeParseAsync(key)
          if (!result.success) {
            for (const issue of result.issues || []) {
              allIssues.push({ path: [...keyPath, ...issue.path], message: issue.message })
            }
          }
        }
      }
      if (this.valueSchema) {
        if (this.valueSchema._asyncValidators.length > 0 ||
            typeof (this.valueSchema as any)._parseAsyncNested === 'function') {
          const result = await this.valueSchema.safeParseAsync(val)
          if (!result.success) {
            for (const issue of result.issues || []) {
              allIssues.push({ path: [...valuePath, ...issue.path], message: issue.message })
            }
          }
        }
      }
      i++
    }
    return allIssues
  }

  protected _hasAsyncValidationNested(): boolean {
    return (this.keySchema?.hasAsyncValidation() ?? false) ||
           (this.valueSchema?.hasAsyncValidation() ?? false)
  }
}
