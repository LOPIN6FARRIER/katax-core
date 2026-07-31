import { describe, it, expect } from "vitest"
import { k } from "../src/k"

describe("lazy schema recursion (audit regression)", () => {
  it("parses a recursive tree schema without stack overflow", () => {
    const treeSchema: any = k.lazy(() =>
      k.object({
        value: k.string(),
        children: k.array(treeSchema),
      }),
    )

    const result = treeSchema.safeParse({
      value: "root",
      children: [{ value: "child1", children: [] }],
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      value: "root",
      children: [{ value: "child1", children: [] }],
    })
  })

  it("rejects invalid nested data in a recursive schema", () => {
    const treeSchema: any = k.lazy(() =>
      k.object({
        value: k.string(),
        children: k.array(treeSchema),
      }),
    )

    const result = treeSchema.safeParse({
      value: "root",
      children: [{ value: 123, children: [] }],
    })

    expect(result.success).toBe(false)
  })

  it("toJsonSchema() on a recursive schema terminates instead of looping forever", () => {
    const treeSchema: any = k.lazy(() =>
      k.object({
        value: k.string(),
        children: k.array(treeSchema),
      }),
    )

    expect(() => treeSchema.toJsonSchema()).not.toThrow()
  })

  it("still supports non-recursive lazy schemas as before", () => {
    const base = k.lazy(() => k.string())
    expect(base.safeParse(123).success).toBe(false)
    expect(base.safeParse("hello").success).toBe(true)
  })

  it("k.set/k.map with a nested schema still compute toJsonSchema correctly", () => {
    const setSchema = k.set(k.number())
    expect(setSchema.toJsonSchema()).toMatchObject({
      type: "array",
      uniqueItems: true,
      items: { type: "number" },
    })

    const mapSchema = k.map(k.string(), k.number())
    expect(mapSchema.toJsonSchema()).toMatchObject({
      type: "object",
      additionalProperties: { type: "number" },
    })
  })
})
