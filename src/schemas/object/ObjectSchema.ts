import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type ObjectShape = Record<string, BaseSchema<any>>

type InferObjectShape<T extends ObjectShape> = {
  [K in keyof T]: T[K] extends BaseSchema<infer U> ? U : never
}

export class ObjectSchema<T extends ObjectShape> extends BaseSchema<InferObjectShape<T>> {
  protected caseSensitive: boolean = true

  constructor(protected shape: T) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | InferObjectShape<T> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return [{ path, message: "Expected object" }]
    }

    const issues: Issue[] = []
    const result: Record<string, unknown> = {}
    const inputRecord = input as Record<string, unknown>

    // Create a map for case-insensitive lookup if needed
    const inputKeysMap = new Map<string, string>()
    if (!this.caseSensitive) {
      for (const key in inputRecord) {
        inputKeysMap.set(key.toLowerCase(), key)
      }
    }

    // Validate each field in the shape
    for (const key in this.shape) {
      const fieldSchema = this.shape[key]
      let fieldValue: unknown

      if (this.caseSensitive) {
        fieldValue = inputRecord[key]
      } else {
        // Case-insensitive: find the key regardless of case
        const lowerKey = key.toLowerCase()
        const foundKey = inputKeysMap.get(lowerKey)
        if (foundKey) {
          fieldValue = inputRecord[foundKey]
        } else {
          fieldValue = undefined
        }
      }

      const fieldPath = [...path, key]
      const fieldResult = fieldSchema._parse(fieldValue, fieldPath)

      // Check if result is an array of Issues (not data array)
      if (Array.isArray(fieldResult) && fieldResult.length > 0 &&
          typeof fieldResult[0] === 'object' && fieldResult[0] !== null &&
          'path' in fieldResult[0] && 'message' in fieldResult[0]) {
        issues.push(...fieldResult)
      } else {
        result[key] = fieldResult
      }
    }

    // Check for unknown keys (strict mode could be added later)
    // For now, we ignore extra keys

    if (issues.length > 0) {
      return issues
    }

    return result as InferObjectShape<T>
  }

  protected _clone(): ObjectSchema<T> {
    const cloned = new ObjectSchema(this.shape)
    cloned.caseSensitive = this.caseSensitive
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: InferObjectShape<T>, path: Issue["path"]): Promise<Issue[]> {
    const allIssues: Issue[] = []
    
    // Run async validation on each field that has async validators
    for (const key in this.shape) {
      const fieldSchema = this.shape[key]
      const fieldValue = (value as any)[key]
      const fieldPath = [...path, key]
      
      // Check if this field schema has async validators or nested async validation
      if (fieldSchema._asyncValidators.length > 0 || 
          typeof (fieldSchema as any)._parseAsyncNested === 'function') {
        
        const fieldResult = await fieldSchema.safeParseAsync(fieldValue)
        if (!fieldResult.success) {
          // Adjust the path in the issues
          for (const issue of fieldResult.issues || []) {
            allIssues.push({
              path: [...fieldPath, ...issue.path],
              message: issue.message
            })
          }
        }
      }
    }
    
    return allIssues
  }

  protected _hasAsyncValidationNested(): boolean {
    for (const key in this.shape) {
      if (this.shape[key].hasAsyncValidation()) {
        return true
      }
    }
    return false
  }

  // Method to set case sensitivity
  caseInsensitive(): this {
    this.caseSensitive = false
    return this
  }

  // Method to make object strict (no extra keys allowed)
  strict(): StrictObjectSchema<T> {
    return new StrictObjectSchema(this.shape)
  }

  // Method to make specific fields optional
  partial(): ObjectSchema<ObjectShape> {
    const partialShape: ObjectShape = {}
    for (const key in this.shape) {
      partialShape[key] = this.shape[key].optional()
    }
    return new ObjectSchema(partialShape)
  }

  // Pick specific keys
  pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
    const pickedShape: Partial<T> = {}
    for (const key of keys) {
      pickedShape[key] = this.shape[key]
    }
    return new ObjectSchema(pickedShape as Pick<T, K>)
  }

  // Omit specific keys
  omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
    const omittedShape: Partial<T> = {}
    for (const key in this.shape) {
      if (!keys.includes(key as unknown as K)) {
        omittedShape[key] = this.shape[key]
      }
    }
    return new ObjectSchema(omittedShape as Omit<T, K>)
  }

  /**
   * Extend this schema with additional fields.
   * New fields override existing fields with the same key.
   *
   * @param extension - Object shape to add to this schema
   * @returns New ObjectSchema with combined fields
   *
   * @example
   * ```typescript
   * const baseSchema = k.object({ id: k.number() })
   * const extendedSchema = baseSchema.extend({ name: k.string() })
   * // Result: { id: number, name: string }
   * ```
   */
  extend<E extends ObjectShape>(extension: E): ObjectSchema<Omit<T, keyof E> & E> {
    const newShape = { ...this.shape, ...extension } as Omit<T, keyof E> & E
    const newSchema = new ObjectSchema(newShape)
    newSchema.caseSensitive = this.caseSensitive
    return newSchema
  }

  /**
   * Merge this schema with another ObjectSchema.
   * Fields from the other schema override fields with the same key.
   *
   * @param other - Another ObjectSchema to merge with
   * @returns New ObjectSchema with combined fields
   *
   * @example
   * ```typescript
   * const schemaA = k.object({ id: k.number(), name: k.string() })
   * const schemaB = k.object({ email: k.email(), name: k.string().minLength(2) })
   * const merged = schemaA.merge(schemaB)
   * // Result: { id: number, name: string (with minLength), email: string }
   * ```
   */
  merge<U extends ObjectShape>(other: ObjectSchema<U>): ObjectSchema<Omit<T, keyof U> & U> {
    return this.extend(other.shape)
  }

  /**
   * Get the raw shape of this schema (useful for spreading into new schemas).
   *
   * @example
   * ```typescript
   * const baseSchema = k.object({ id: k.number() })
   * const newSchema = k.object({
   *   ...baseSchema.getShape(),
   *   name: k.string()
   * })
   * ```
   */
  getShape(): T {
    return this.shape
  }

  /**
   * Allow extra keys to pass through without validation.
   * Extra keys will be included in the output.
   *
   * @returns A PassthroughObjectSchema that allows extra keys
   *
   * @example
   * ```typescript
   * const schema = k.object({ name: k.string() }).passthrough()
   * schema.parse({ name: 'John', extra: 'allowed' })
   * // Result: { name: 'John', extra: 'allowed' }
   * ```
   */
  passthrough(): PassthroughObjectSchema<T> {
    return new PassthroughObjectSchema(this.shape, this.caseSensitive)
  }

  /**
   * Remove extra keys from the output (keys not in the schema).
   * This is the default behavior, but can be used to override passthrough.
   *
   * @returns A StripObjectSchema that removes extra keys
   *
   * @example
   * ```typescript
   * const schema = k.object({ name: k.string() }).strip()
   * schema.parse({ name: 'John', extra: 'removed' })
   * // Result: { name: 'John' }
   * ```
   */
  strip(): StripObjectSchema<T> {
    return new StripObjectSchema(this.shape, this.caseSensitive)
  }
}

/**
 * ObjectSchema that allows extra keys to pass through.
 */
class PassthroughObjectSchema<T extends ObjectShape> extends ObjectSchema<T> {
  constructor(shape: T, caseSensitive: boolean = true) {
    super(shape)
    this.caseSensitive = caseSensitive
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | InferObjectShape<T> & Record<string, unknown> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return [{ path, message: "Expected object" }]
    }

    const issues: Issue[] = []
    const result: Record<string, unknown> = {}
    const inputRecord = input as Record<string, unknown>

    // Create a map for case-insensitive lookup if needed
    const inputKeysMap = new Map<string, string>()
    if (!this.caseSensitive) {
      for (const key in inputRecord) {
        inputKeysMap.set(key.toLowerCase(), key)
      }
    }

    // Track which keys from input have been processed
    const processedKeys = new Set<string>()

    // Validate each field in the shape
    for (const key in this.shape) {
      const fieldSchema = this.shape[key]
      let fieldValue: unknown
      let originalKey: string = key

      if (this.caseSensitive) {
        fieldValue = inputRecord[key]
        processedKeys.add(key)
      } else {
        const lowerKey = key.toLowerCase()
        const foundKey = inputKeysMap.get(lowerKey)
        if (foundKey) {
          fieldValue = inputRecord[foundKey]
          originalKey = foundKey
          processedKeys.add(foundKey)
        } else {
          fieldValue = undefined
        }
      }

      const fieldPath = [...path, key]
      const fieldResult = fieldSchema._parse(fieldValue, fieldPath)

      if (Array.isArray(fieldResult) && fieldResult.length > 0 &&
          typeof fieldResult[0] === 'object' && fieldResult[0] !== null &&
          'path' in fieldResult[0] && 'message' in fieldResult[0]) {
        issues.push(...fieldResult)
      } else {
        result[key] = fieldResult
      }
    }

    // Add extra keys that weren't in the schema (passthrough)
    for (const key in inputRecord) {
      if (!processedKeys.has(key)) {
        result[key] = inputRecord[key]
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return result as InferObjectShape<T> & Record<string, unknown>
  }

  protected _clone(): PassthroughObjectSchema<T> {
    const cloned = new PassthroughObjectSchema(this.shape, this.caseSensitive)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

/**
 * ObjectSchema that explicitly strips extra keys (same as default behavior).
 */
class StripObjectSchema<T extends ObjectShape> extends ObjectSchema<T> {
  constructor(shape: T, caseSensitive: boolean = true) {
    super(shape)
    this.caseSensitive = caseSensitive
  }

  protected _clone(): StripObjectSchema<T> {
    const cloned = new StripObjectSchema(this.shape, this.caseSensitive)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }
}

class StrictObjectSchema<T extends ObjectShape> extends ObjectSchema<T> {
  _parse(input: unknown, path: Issue["path"]): Issue[] | InferObjectShape<T> {
    const result = super._parse(input, path)

    if (Array.isArray(result)) {
      return result
    }

    // Check for extra keys
    if (typeof input === "object" && input !== null) {
      const inputKeys = Object.keys(input)
      const shapeKeys = Object.keys(this["shape"])
      const extraKeys = inputKeys.filter(key => !shapeKeys.includes(key))

      if (extraKeys.length > 0) {
        return [{
          path,
          message: `Unknown keys: ${extraKeys.join(", ")}`
        }]
      }
    }

    return result
  }

  protected _clone(): StrictObjectSchema<T> {
    const cloned = new StrictObjectSchema(this.shape)
    cloned.caseSensitive = this.caseSensitive
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: InferObjectShape<T>, path: Issue["path"]): Promise<Issue[]> {
    // Reuse the parent implementation
    return super._parseAsyncNested(value, path)
  }
}
