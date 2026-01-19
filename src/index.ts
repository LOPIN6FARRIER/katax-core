export * from "./k"
export * from "./core/Schema"
export * from "./core/result"
export { AsyncSafeParseResult, AsyncValidationResult, AsyncValidator } from "./core/AsyncResult"
export * from "./core/errors"
export { isIssueArray, createIssue, issues, mergeIssues } from "./core/utils"

// Export schema classes for advanced usage
export { UnionSchema } from "./schemas/union/UnionSchema"
export { IntersectionSchema } from "./schemas/intersection/IntersectionSchema"
export { LazySchema } from "./schemas/lazy/LazySchema"
export {
  CustomSchema,
  LiteralSchema,
  EnumSchema,
  AnySchema,
  UnknownSchema,
  NeverSchema,
  TupleSchema,
  RecordSchema
} from "./schemas/custom/CustomSchema"

// Coercion schemas
export {
  CoercedNumberSchema,
  CoercedBooleanSchema,
  CoercedStringSchema,
  CoercedDateSchema,
  coerce
} from "./schemas/coerce/CoerceSchemas"

// Preprocess
export { preprocess, PreprocessSchema } from "./schemas/preprocess/preprocess"

// CatchSchema from BaseSchema
export { CatchSchema } from "./core/BaseSchema"

// Type inference utility
export type kataxInfer<T> = T extends { safeParse(input: unknown): infer R }
  ? R extends { success: true; data: infer D }
    ? D
    : never
  : never

