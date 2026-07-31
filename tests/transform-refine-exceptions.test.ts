import { describe, it, expect } from "vitest"
import { k } from "../src/k"

describe("transform/refine exception handling (audit regression)", () => {
  it("still converts a deliberate refine() failure into a validation issue", () => {
    const schema = k.number().refine((n) => n > 0, "must be positive")
    const result = schema.safeParse(-5)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues[0].message).toBe("must be positive")
    }
  })

  it("propagates a real bug thrown inside .transform() instead of hiding it as a validation issue", () => {
    const buggy = k.object({ name: k.string() }).transform((value) => {
      // Simulates a real programming bug (e.g. accessing an undefined property).
      return (value as any).name.nonExistentMethod()
    })

    expect(() => buggy.safeParse({ name: "hi" })).toThrow(TypeError)
  })

  it("propagates a real bug thrown inside .refine()'s validator function itself", () => {
    const buggy = k.object({ name: k.string() }).refine((value: any) => {
      return value.nonExistentField.length > 0
    })

    expect(() => buggy.safeParse({ name: "hi" })).toThrow(TypeError)
  })
})
