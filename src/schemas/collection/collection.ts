import { SetSchema, MapSchema } from "./CollectionSchema"

export const set = <T>(schema?: import("../../core/BaseSchema").BaseSchema<T>) => new SetSchema(schema)
export const map = <K, V>(keySchema?: import("../../core/BaseSchema").BaseSchema<K>, valueSchema?: import("../../core/BaseSchema").BaseSchema<V>) => new MapSchema(keySchema, valueSchema)
