import { describe, it, expect } from "vitest"
import { k } from "../src/k"

describe("k.discriminatedUnion()", () => {
  const schema = k.discriminatedUnion("type", {
    string: k.object({ type: k.literal("string"), value: k.string() }),
    number: k.object({ type: k.literal("number"), value: k.number() }),
    boolean: k.object({ type: k.literal("boolean"), value: k.boolean() })
  })

  it("validates a matched branch", () => {
    const result = schema.parse({ type: "string", value: "hello" })
    expect(result).toEqual({ type: "string", value: "hello" })
  })

  it("validates all branches", () => {
    expect(schema.parse({ type: "number", value: 42 })).toEqual({ type: "number", value: 42 })
    expect(schema.parse({ type: "boolean", value: true })).toEqual({ type: "boolean", value: true })
  })

  it("rejects input with missing discriminator key", () => {
    const result = schema.safeParse({ value: "hello" })
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("discriminator key")
    }
  })

  it("rejects input with invalid discriminator value", () => {
    const result = schema.safeParse({ type: "invalid", value: "hello" })
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("Invalid discriminator value")
    }
  })

  it("rejects non-object input", () => {
    const result = schema.safeParse("hello")
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("object")
    }
  })

  it("rejects null input", () => {
    expect(schema.safeParse(null).success).toBe(false)
  })

  it("validates nested validation within the matched branch", () => {
    const result = schema.safeParse({ type: "string", value: 123 })
    expect(result.success).toBe(false)
  })

  it("throws on empty schemas map", () => {
    expect(() => k.discriminatedUnion("type", {} as any)).toThrow()
  })

  it("works with different discriminator key names", () => {
    const statusSchema = k.discriminatedUnion("status", {
      active: k.object({ status: k.literal("active"), lastLogin: k.date() }),
      inactive: k.object({ status: k.literal("inactive"), reason: k.string().optional() })
    })
    expect(statusSchema.safeParse({ status: "active", lastLogin: new Date() }).success).toBe(true)
  })
})

describe("toJsonSchema()", () => {
  it("returns oneOf", () => {
    const schema = k.discriminatedUnion("type", {
      string: k.object({ type: k.literal("string"), value: k.string() }),
      number: k.object({ type: k.literal("number"), value: k.number() })
    })
    const json = schema.toJsonSchema()
    expect(json).toHaveProperty("oneOf")
    expect(json.oneOf).toHaveLength(2)
  })
  it("includes description", () => {
    const schema = k.discriminatedUnion("type", {
      a: k.object({ type: k.literal("a") })
    }).describe("discriminated")
    expect(schema.toJsonSchema().description).toBe("discriminated")
  })
})
