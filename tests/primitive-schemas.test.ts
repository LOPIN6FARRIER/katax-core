import { describe, it, expect } from "vitest"
import { k } from "../src/k"

describe("primitive schemas", () => {
  describe("k.nan()", () => {
    const schema = k.nan()

    it("passes for NaN", () => {
      expect(schema.parse(NaN)).toBeNaN()
    })

    it("fails for non-NaN values", () => {
      expect(() => schema.parse(123)).toThrow()
      expect(() => schema.parse("hello")).toThrow()
      expect(() => schema.parse(null)).toThrow()
      expect(() => schema.parse(undefined)).toThrow()
      expect(() => schema.parse({})).toThrow()
    })

    it("safeParse works", () => {
      expect(schema.safeParse(NaN).success).toBe(true)
      expect(schema.safeParse(1).success).toBe(false)
    })

    it("includes received type in error", () => {
      const result = schema.safeParse("test")
      expect(result.success).toBe(false)
      if (!result.success && result.issues) {
        expect(result.issues[0].message).toContain("string")
      }
    })
  })

  describe("k.undefined()", () => {
    const schema = k.undefined()

    it("passes for undefined", () => {
      expect(schema.parse(undefined)).toBeUndefined()
    })

    it("fails for defined values", () => {
      expect(() => schema.parse(null)).toThrow()
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse("")).toThrow()
    })

    it("safeParse works", () => {
      expect(schema.safeParse(undefined).success).toBe(true)
      expect(schema.safeParse(null).success).toBe(false)
    })
  })

  describe("k.null()", () => {
    const schema = k.null()

    it("passes for null", () => {
      expect(schema.parse(null)).toBeNull()
    })

    it("fails for non-null values", () => {
      expect(() => schema.parse(undefined)).toThrow()
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse(false)).toThrow()
    })

    it("safeParse works", () => {
      expect(schema.safeParse(null).success).toBe(true)
      expect(schema.safeParse(undefined).success).toBe(false)
    })
  })

  describe("k.void()", () => {
    const schema = k.void()

    it("passes for null", () => {
      expect(schema.parse(null)).toBeNull()
    })

    it("passes for undefined", () => {
      expect(schema.parse(undefined)).toBeUndefined()
    })

    it("fails for other values", () => {
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse("")).toThrow()
      expect(() => schema.parse(false)).toThrow()
    })
  })
})

describe("toJsonSchema()", () => {
  it("k.nan() returns json schema", () => {
    expect(k.nan().toJsonSchema()).toEqual({ type: "number" })
  })
  it("k.undefined() returns json schema", () => {
    expect(k.undefined().toJsonSchema()).toEqual({})
  })
  it("k.null() returns json schema", () => {
    expect(k.null().toJsonSchema()).toEqual({ type: "null" })
  })
  it("k.void() returns json schema", () => {
    expect(k.void().toJsonSchema()).toEqual({ type: "null" })
  })
  it("describe() adds description to nan schema", () => {
    expect(k.nan().describe("not a number").toJsonSchema()).toEqual({ type: "number", description: "not a number" })
  })
  it("describe() adds description to null schema", () => {
    expect(k.null().describe("null value").toJsonSchema()).toEqual({ type: "null", description: "null value" })
  })
})
