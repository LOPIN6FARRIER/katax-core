import { describe, it, expect } from "vitest"
import { k } from "../src/k"
import { KataxAsyncValidationRequiredError } from "../src/core/errors"

describe("sync parse()/safeParse() guard against skipped async validation (audit regression)", () => {
  it("safeParse throws instead of silently skipping an asyncRefine", () => {
    const schema = k.string().asyncRefine(async () => [{ path: [], message: "always fails" }])
    expect(() => schema.safeParse("hello")).toThrow(KataxAsyncValidationRequiredError)
  })

  it("parse throws instead of silently skipping an asyncRefine", () => {
    const schema = k.string().asyncRefine(async () => [{ path: [], message: "always fails" }])
    expect(() => schema.parse("hello")).toThrow(KataxAsyncValidationRequiredError)
  })

  it("safeParseAsync still runs the async validator correctly", async () => {
    const schema = k.string().asyncRefine(async () => [{ path: [], message: "always fails" }])
    const result = await schema.safeParseAsync("hello")
    expect(result.success).toBe(false)
  })

  it("schemas without async validation are unaffected", () => {
    const schema = k.string().minLength(3)
    expect(schema.safeParse("hello").success).toBe(true)
    expect(schema.safeParse("hi").success).toBe(false)
  })

  it("nested asyncRefine inside an object schema is also caught by the sync guard", () => {
    const schema = k.object({
      email: k.string().asyncRefine(async () => []),
    })
    expect(() => schema.safeParse({ email: "a@b.com" })).toThrow(KataxAsyncValidationRequiredError)
  })

  it("hasAsyncValidation() does not stack-overflow on a self-referential lazy schema", () => {
    const treeSchema: any = k.lazy(() =>
      k.object({
        value: k.string(),
        children: k.array(treeSchema),
      }),
    )
    expect(() => treeSchema.hasAsyncValidation()).not.toThrow()
    expect(treeSchema.hasAsyncValidation()).toBe(false)
  })
})
