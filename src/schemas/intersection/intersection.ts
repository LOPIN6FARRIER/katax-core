import { BaseSchema } from "../../core/BaseSchema"
import { IntersectionSchema } from "./IntersectionSchema"

/**
 * Create an intersection schema that validates against ALL provided schemas.
 * Useful for combining object schemas where the result must match all.
 *
 * @param schemas - Array of schemas that all must validate
 * @returns An IntersectionSchema instance
 *
 * @example
 * ```typescript
 * const withId = k.object({ id: k.number() })
 * const withName = k.object({ name: k.string() })
 * const combined = k.intersection([withId, withName])
 * combined.parse({ id: 1, name: "John" }) // { id: 1, name: "John" }
 * ```
 */
export const intersection = <T extends BaseSchema<any>[]>(schemas: [...T]) => new IntersectionSchema(schemas)
