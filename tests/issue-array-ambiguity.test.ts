import { describe, it, expect } from "vitest"
import { k } from "../src/k"
import { isIssueArray } from "../src/core/result"

describe("isIssueArray ambiguity (audit regression)", () => {
  it("does not misdetect valid parsed data shaped like {path, message} as validation issues", () => {
    const schema = k.array(k.object({ path: k.string(), message: k.string() }))
    const input = [
      { path: "a.b", message: "hello" },
      { path: "c.d", message: "world" },
    ]
    const result = schema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(input)
    }
  })

  it("still correctly detects real Issue arrays with a mixed-shape element", () => {
    const realIssues = [{ path: ["a"], message: "bad" }]
    expect(isIssueArray(realIssues)).toBe(true)
  })

  it("rejects data whose path is not an array of string/number as an issue array", () => {
    const notIssues = [{ path: "a.b", message: "hello" }]
    expect(isIssueArray(notIssues)).toBe(false)
  })

  it("an object schema field that legitimately fails validation still surfaces real issues", () => {
    const schema = k.object({ items: k.array(k.object({ path: k.string(), message: k.string() })) })
    const result = schema.safeParse({ items: [{ path: "x", message: 123 as any }] })
    expect(result.success).toBe(false)
  })
})
