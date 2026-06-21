import { describe, it, expect } from "vitest"
import { k } from "../src/k"
import { BrandedSchema } from "../src/index"

describe("branded types", () => {
  it("brand() returns a BrandedSchema", () => {
    const schema = k.string().brand("UserId")
    expect(schema).toBeInstanceOf(BrandedSchema)
  })

  it("validates and brands valid values", () => {
    const schema = k.string().brand("UserId")
    const result = schema.parse("abc123")
    expect(result).toBe("abc123")
  })

  it("rejects invalid values", () => {
    const schema = k.number().min(0).brand("Positive")
    expect(schema.safeParse(-1).success).toBe(false)
    expect(schema.safeParse(0).success).toBe(true)
    expect(schema.safeParse(5).success).toBe(true)
  })

  it("works with objects", () => {
    const userSchema = k.object({
      id: k.string(),
      name: k.string()
    }).brand("User")

    const user = userSchema.parse({ id: "1", name: "Alice" })
    expect((user as any).__brand).toBe("User")
  })

  it("brand can be chained after optional/nullable", () => {
    const schema = k.string().optional().brand("OptStr")
    const result = schema.parse("hello")
    expect(result).toBe("hello")
    expect(schema.parse(undefined)).toBeUndefined()
  })

  it("safeParse works with branded schemas", () => {
    const schema = k.string().brand("SessionId")
    const result = schema.safeParse("xyz")
    expect(result.success).toBe(true)
  })
})
