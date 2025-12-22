import { ArraySchema } from "./ArraySchema"
import type { BaseSchema } from "../../core/BaseSchema"

/**
 * Creates a new array validation schema.
 * 
 * @param elementSchema Optional schema to validate each array element
 * @returns An ArraySchema instance with chainable validation methods
 * @example
 * ```typescript
 * // Array of any elements
 * const anyArray = array()
 * anyArray.parse([1, "hello", true]) // [1, "hello", true]
 * 
 * // Array of specific type
 * const numberArray = array(number())
 * numberArray.parse([1, 2, 3]) // [1, 2, 3]
 * 
 * // With additional validations
 * const schema = array(string()).min(2).max(10).unique()
 * schema.parse(["a", "b", "c"]) // ["a", "b", "c"]
 * ```
 */
export const array = <T>(elementSchema?: BaseSchema<T>) => new ArraySchema(elementSchema)
