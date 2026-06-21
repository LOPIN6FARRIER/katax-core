import { DiscriminatedUnionSchema } from "./DiscriminatedUnionSchema"

export const discriminatedUnion = <K extends string, R extends Record<string, import("../../core/BaseSchema").BaseSchema<any>>>(
  key: K,
  schemasMap: R
): DiscriminatedUnionSchema<K, R> => new DiscriminatedUnionSchema(key, schemasMap)
