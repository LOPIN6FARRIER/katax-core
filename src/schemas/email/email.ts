import { EmailSchema } from "./EmailSchema"

/**
 * Creates a new email validation schema with full RFC 5322 compliance.
 * 
 * ⚠️ This is MORE STRICT than `k.string().email()`.
 * - `k.email()` uses RFC 5322 regex (comprehensive)
 * - `k.string().email()` uses a simpler regex (permissive)
 * 
 * Use `k.email()` for strict validation with domain rules, corporate checks, etc.
 * Use `k.string().email()` for simple email format checking.
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