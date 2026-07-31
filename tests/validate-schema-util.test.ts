import { describe, it, expect } from "vitest"
import { k } from "../src/k"
import { validateSchema } from "../src/core/utils"
import { validateSchema as validateSchemaFromPublicEntry } from "../src/index"

describe("validateSchema() is exported from the package's public entry point", () => {
  it("is importable from src/index (not just src/core/utils)", () => {
    expect(typeof validateSchemaFromPublicEntry).toBe("function")
  })
})

describe("validateSchema() helper", () => {
  it("uses the sync API for schemas without async validation", async () => {
    const schema = k.string().minLength(3)
    const result = await validateSchema(schema, "hello")
    expect(result.success).toBe(true)
  })

  it("automatically uses the async API for schemas with asyncRefine", async () => {
    const schema = k.string().asyncRefine(async () => [{ path: [], message: "always fails" }])
    const result = await validateSchema(schema, "hello")
    expect(result.success).toBe(false)
  })

  it("automatically uses the async API for a nested asyncRefine inside an object", async () => {
    const schema = k.object({
      email: k.string().asyncRefine(async (value) =>
        value === "taken@example.com" ? [{ path: [], message: "already taken" }] : [],
      ),
    })

    const ok = await validateSchema(schema, { email: "free@example.com" })
    expect(ok.success).toBe(true)

    const taken = await validateSchema(schema, { email: "taken@example.com" })
    expect(taken.success).toBe(false)
  })

  it("propagates sync validation failures", async () => {
    const schema = k.object({ name: k.string().minLength(3) })
    const result = await validateSchema(schema, { name: "ab" })
    expect(result.success).toBe(false)
  })
})
