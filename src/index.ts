export * from "./k"
export * from "./core/Schema"
export * from "./core/result"
export * from "./core/errors"

// Type inference utility
export type infer<T> = T extends { safeParse(input: unknown): infer R }
  ? R extends { success: true; data: infer D }
    ? D
    : never
  : never

