import { ObjectSchema } from "./ObjectSchema"
import type { BaseSchema } from "../../core/BaseSchema"

type ObjectShape = Record<string, BaseSchema<any>>

/**
 * Creates a new object validation schema.
 * 
 * @param shape Object defining the structure with property schemas
 * @returns An ObjectSchema instance with chainable validation methods
 * @example
 * ```typescript
 * const userSchema = object({
 *   name: string().min(2),
 *   age: number().min(0).max(120),
 *   email: email()
 * })
 * 
 * userSchema.parse({
 *   name: "John",
 *   age: 30,
 *   email: "john@example.com"
 * }) // { name: "John", age: 30, email: "john@example.com" }
 * 
 * // With additional validations
 * const strictSchema = object({ id: number() }).strict()
 * ```
 */
export const object = <T extends ObjectShape>(shape: T) => new ObjectSchema(shape)
