import { FileSchema } from "./FileSchema"

/**
 * Creates a new file validation schema.
 * 
 * Validates File objects in browser environments with support for
 * size, type, and name validations.
 * 
 * @returns A FileSchema instance with chainable validation methods
 * @example
 * ```typescript
 * const imageSchema = file()
 *   .maxSize(5 * 1024 * 1024) // 5MB
 *   .type(['image/jpeg', 'image/png'])
 *   .extension(['.jpg', '.png'])
 * 
 * // In browser with file input
 * const fileInput = document.getElementById('upload') as HTMLInputElement
 * imageSchema.parse(fileInput.files[0]) // File object
 * ```
 */
export const file = () => new FileSchema()