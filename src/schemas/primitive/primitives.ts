import { NanSchema, UndefinedSchema, NullSchema, VoidSchema } from "./PrimitiveSchema"

export const nan = () => new NanSchema()
export const undef = () => new UndefinedSchema()
export const nil = () => new NullSchema()
export const voidSchema = () => new VoidSchema()
