import { BaseSchema } from "../../core/BaseSchema"
import { LazySchema } from "./LazySchema"

/**
 * Create a lazy schema for recursive or self-referencing types.
 * The schema is resolved only when validation is performed.
 *
 * @param resolver - Function that returns the schema to use
 * @returns A LazySchema instance
 *
 * @example
 * ```typescript
 * // Recursive category structure
 * interface Category {
 *   name: string
 *   subcategories: Category[]
 * }
 *
 * const categorySchema: BaseSchema<Category> = k.lazy(() =>
 *   k.object({
 *     name: k.string(),
 *     subcategories: k.array(categorySchema)
 *   })
 * )
 *
 * // Works with deeply nested structures
 * categorySchema.parse({
 *   name: "Electronics",
 *   subcategories: [
 *     { name: "Phones", subcategories: [] },
 *     { name: "Laptops", subcategories: [
 *       { name: "Gaming", subcategories: [] }
 *     ]}
 *   ]
 * })
 * ```
 */
export const lazy = <T>(resolver: () => BaseSchema<T>) => new LazySchema(resolver)
