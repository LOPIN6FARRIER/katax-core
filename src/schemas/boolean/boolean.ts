import { BooleanSchema } from "./BooleanSchema";
/**
 * Creates a new boolean validation schema.
 * 
 * @returns A BooleanSchema instance with validation methods
 * @example
 * ```typescript
 * const schema = boolean()
 * 
 * schema.parse(true) // true
 * schema.parse("true") // { success: false, issues: [...] }
 * schema.safeParse(false) // { success: true, data: false }
 * ```
 */export const boolean = () => new BooleanSchema();