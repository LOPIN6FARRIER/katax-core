import { Base64Schema } from "./Base64Schema"

/**
 * Creates a new base64 validation schema.
 * 
 * Validates base64 encoded strings with support for data URLs,
 * content type validation, and size constraints.
 * 
 * @returns A Base64Schema instance with chainable validation methods
 * @example
 * ```typescript
 * const schema = base64()
 *   .dataURL()
 *   .image()
 *   .minSize(100)
 * 
 * schema.parse('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')
 * // 'data:image/png;base64,...'
 * ```
 */
export const base64 = () => new Base64Schema()