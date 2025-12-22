import { EmailSchema } from "./EmailSchema"

/**
 * Creates a new email validation schema.
 * 
 * Validates email addresses with support for domain restrictions,
 * corporate email validation, and custom patterns.
 * 
 * @returns An EmailSchema instance with chainable validation methods
 * @example
 * ```typescript
 * const schema = email()
 *   .domain('company.com')
 *   .corporate()
 *   .minLocalLength(3)
 * 
 * schema.parse('user@company.com') // 'user@company.com'
 * schema.safeParse('user@gmail.com') // { success: false, issues: [...] }
 * ```
 */
export const email = () => new EmailSchema()