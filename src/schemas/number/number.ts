import { NumberSchema } from "./NumberSchema"

/**
 * Creates a new number validation schema.
 * 
 * @returns A NumberSchema instance with chainable validation methods
 * @example
 * ```typescript
 * const schema = number()
 *   .min(0)
 *   .max(100)
 *   .integer()
 * 
 * schema.parse(42) // 42
 * schema.safeParse(-5) // { success: false, issues: [...] }
 * ```
 */
export const number = () => new NumberSchema()
