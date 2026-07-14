import { describe, it, expect } from "vitest"
import { k } from "../src/k"

describe("k.set()", () => {
  it("accepts a Set", () => {
    const schema = k.set()
    const result = schema.parse(new Set([1, 2, 3]))
    expect(result).toBeInstanceOf(Set)
    expect(result.size).toBe(3)
  })

  it("rejects non-Set values", () => {
    const schema = k.set()
    expect(schema.safeParse([]).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
  })

  it("validates set values when schema is provided", () => {
    const schema = k.set(k.number().positive())
    const result = schema.parse(new Set([1, 2, 3]))
    expect(result.size).toBe(3)
  })

  it("rejects invalid set values", () => {
    const schema = k.set(k.number().positive())
    const result = schema.safeParse(new Set([1, -2, 3]))
    expect(result.success).toBe(false)
  })

  it("works with string sets", () => {
    const schema = k.set(k.string())
    const result = schema.parse(new Set(["ab", "cd"]))
    expect(result.size).toBe(2)
  })

  it("error message includes received type", () => {
    const schema = k.set()
    const result = schema.safeParse("hello")
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("string")
    }
  })
})

describe("k.map()", () => {
  it("accepts a Map", () => {
    const schema = k.map()
    const result = schema.parse(new Map([["a", 1], ["b", 2]]))
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(2)
  })

  it("rejects non-Map values", () => {
    const schema = k.map()
    expect(schema.safeParse({}).success).toBe(false)
    expect(schema.safeParse([]).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
  })

  it("validates map keys and values when schemas are provided", () => {
    const schema = k.map(k.string(), k.number())
    const result = schema.parse(new Map([["a", 1], ["b", 2]]))
    expect(result.get("a")).toBe(1)
  })

  it("rejects invalid map keys", () => {
    const schema = k.map(k.number(), k.string())
    const result = schema.safeParse(new Map([[1, "one"], [2, "two"]]))
    expect(result.success).toBe(true)
  })

  it("rejects invalid map values", () => {
    const schema = k.map(k.string(), k.number())
    const result = schema.safeParse(new Map([["a", "not-a-number"]]))
    expect(result.success).toBe(false)
  })

  it("error message includes received type", () => {
    const schema = k.map()
    const result = schema.safeParse(42)
    expect(result.success).toBe(false)
    if (!result.success && result.issues) {
      expect(result.issues[0].message).toContain("number")
    }
  })
})

describe("toJsonSchema()", () => {
  describe("k.set()", () => {
    it("returns array with uniqueItems", () => {
      const schema = k.set(k.number())
      expect(schema.toJsonSchema()).toEqual({ type: "array", uniqueItems: true, items: { type: "number" } })
    })
    it("includes description", () => {
      const schema = k.set(k.string()).describe("tag set")
      expect(schema.toJsonSchema().description).toBe("tag set")
    })
  })
  describe("k.map()", () => {
    it("returns object with additionalProperties", () => {
      const schema = k.map(k.string(), k.number())
      expect(schema.toJsonSchema()).toEqual({ type: "object", additionalProperties: { type: "number" } })
    })
  })
})
