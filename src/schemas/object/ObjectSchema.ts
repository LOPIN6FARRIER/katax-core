import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type ObjectShape = Record<string, BaseSchema<any>>

type InferObjectShape<T extends ObjectShape> = {
  [K in keyof T]: T[K] extends BaseSchema<infer U> ? U : never
}

export class ObjectSchema<T extends ObjectShape> extends BaseSchema<InferObjectShape<T>> {
  private caseSensitive: boolean = true

  constructor(private shape: T) {
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
}
