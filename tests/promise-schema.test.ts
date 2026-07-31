import { describe, it, expect } from "vitest"
import { k } from "../src/k"
import { KataxAsyncValidationRequiredError } from "../src/core/errors"

describe("k.promise()", () => {
  it("accepts a Promise", () => {
    const schema = k.promise()
    const result = schema.parse(Promise.resolve(42))
    expect(result).toBeInstanceOf(Promise)
  })

  it("rejects non-Promise values", () => {
    const schema = k.promise()
    expect(schema.safeParse(42).success).toBe(false)
    expect(schema.safeParse("hello").success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
  })

  it("parse returns the input Promise as-is when there's no inner schema to await", () => {
    const schema = k.promise()
    const promise = Promise.resolve(42)
    const result = schema.parse(promise)
    expect(result).toBe(promise)
  })

  it("parse throws when an inner schema requires awaiting the resolved value", () => {
    const schema = k.promise(k.number())
    const promise = Promise.resolve(42)
    // Validating the resolved value requires awaiting the promise, so this can
    // only be done through parseAsync()/safeParseAsync() - parse() must not
    // silently skip that check.
    expect(() => schema.parse(promise)).toThrow(KataxAsyncValidationRequiredError)
  })

  it("safeParseAsync validates resolved value", async () => {
    const schema = k.promise(k.string())
    const result = await schema.safeParseAsync(Promise.resolve(42))
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("string")
    }
  })

  it("safeParseAsync passes valid resolved values", async () => {
    const schema = k.promise(k.number())
    const result = await schema.safeParseAsync(Promise.resolve(42))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(await result.data).toBe(42)
    }
  })

  it("error message includes received type", () => {
    const schema = k.promise()
    const result = schema.safeParse("not-a-promise")
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("string")
    }
  })

  it("hasAsyncValidation is true when schema is provided", () => {
    const schema = k.promise(k.number())
    expect(schema.hasAsyncValidation()).toBe(true)
  })

  it("hasAsyncValidation is false without schema", () => {
    const schema = k.promise()
    expect(schema.hasAsyncValidation()).toBe(false)
  })
})

describe("toJsonSchema()", () => {
  it("returns json schema", () => {
    expect(k.promise().toJsonSchema()).toEqual({ type: "object" })
  })
  it("includes description", () => {
    expect(k.promise().describe("async result").toJsonSchema().description).toBe("async result")
  })
})
