import { StringSchema } from "./StringSchema"

/**
 * Creates a new string validation schema.
 * 
 * @returns A StringSchema instance with chainable validation methods
 * @example
 * ```typescript
 * const schema = string()
 *   .min(3)
 *   .max(20)
 *   .regex(/^[a-z]+$/)
 * 
 * schema.parse("hello") // "hello"
 * schema.safeParse("") // { success: false, issues: [...] }
 * ```
 */
export const string = () => new StringSchema()
