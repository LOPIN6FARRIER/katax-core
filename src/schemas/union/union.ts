import { BaseSchema } from "../../core/BaseSchema"
import { UnionSchema } from "./UnionSchema"

/**
 * Create a union schema that validates against multiple possible schemas.
 * The input must match at least one of the provided schemas.
 *
 * @param schemas - Array of schemas to validate against
 * @returns A UnionSchema instance
 *
 * @example
 * ```typescript
 * const stringOrNumber = k.union([k.string(), k.number()])
 * stringOrNumber.parse("hello") // "hello"
 * stringOrNumber.parse(42) // 42
 * ```
 */
export const union = <T extends BaseSchema<any>[]>(schemas: [...T]) => new UnionSchema(schemas)
