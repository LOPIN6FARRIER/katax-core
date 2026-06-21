import { PromiseSchema } from "./PromiseSchema"

export const promise = <T>(schema?: import("../../core/BaseSchema").BaseSchema<T>) => new PromiseSchema(schema)
