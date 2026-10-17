import { describe, it, expect } from "vitest";
import { k } from "../src/k";

/**
 * toJsonSchema() must describe exactly what _parse() accepts.
 * Each block checks both the runtime behavior and the emitted JSON Schema.
 */

describe("optional / nullable / nullish / default", () => {
  it("optional(): undefined only (not null); key not required", () => {
    const s = k.object({ a: k.string().optional() });
    expect(s.safeParse({}).success).toBe(true);
    expect(s.safeParse({ a: null }).success).toBe(false);
    expect(s.toJsonSchema()).toEqual({
      type: "object",
      properties: { a: { type: "string" } },
    });
  });

  it("nullable(): null allowed but key still required", () => {
    const s = k.object({ a: k.string().nullable() });
    expect(s.safeParse({ a: null }).success).toBe(true);
    expect(s.safeParse({}).success).toBe(false);
    expect(s.toJsonSchema()).toEqual({
      type: "object",
      required: ["a"],
      properties: { a: { type: ["string", "null"] } },
    });
  });

  it("nullish(): null or missing", () => {
    const s = k.object({ a: k.number().min(1).nullish() });
    expect(s.safeParse({}).success).toBe(true);
    expect(s.safeParse({ a: null }).success).toBe(true);
    expect(s.toJsonSchema()).toEqual({
      type: "object",
      properties: { a: { type: ["number", "null"], minimum: 1 } },
    });
  });

  it("optional().nullable() and nullable().optional() are equivalent", () => {
    for (const field of [k.string().optional().nullable(), k.string().nullable().optional()]) {
      const s = k.object({ a: field });
      expect(s.toJsonSchema()).toEqual({
        type: "object",
        properties: { a: { type: ["string", "null"] } },
      });
    }
  });

  it("default(): key can be omitted, so it is not required", () => {
    const s = k.object({ a: k.string().default("x"), b: k.string() });
    expect(s.parse({ b: "y" })).toEqual({ a: "x", b: "y" });
    expect(s.toJsonSchema().required).toEqual(["b"]);
  });

  it("transform()/brand() keep the inner optionality", () => {
    const s = k.object({
      a: k.string().optional().transform((v) => v ?? ""),
      b: k.string().optional().brand("Id"),
    });
    expect(s.toJsonSchema().required).toBeUndefined();
  });

  it("nullable on enum/literal/union uses anyOf (type array would still reject null)", () => {
    expect(k.enum(["a", "b"]).nullable().toJsonSchema()).toEqual({
      anyOf: [{ type: "string", enum: ["a", "b"] }, { type: "null" }],
    });
    expect(k.literal("x").nullable().toJsonSchema()).toEqual({
      anyOf: [{ type: "string", const: "x" }, { type: "null" }],
    });
    expect(k.union([k.string(), k.number()]).nullable().toJsonSchema()).toEqual({
      anyOf: [{ anyOf: [{ type: "string" }, { type: "number" }] }, { type: "null" }],
    });
  });

  it("nullable keeps description at the top level and is idempotent", () => {
    expect(k.string().nullable().describe("name").toJsonSchema()).toEqual({
      type: ["string", "null"],
      description: "name",
    });
    expect(k.string().nullable().nullable().toJsonSchema()).toEqual({
      type: ["string", "null"],
    });
    expect(k.null().nullable().toJsonSchema()).toEqual({ type: "null" });
  });

  it("undefined / void fields", () => {
    const s = k.object({ gone: k.undefined(), v: k.void(), u: k.union([k.string(), k.undefined()]) });
    expect(s.safeParse({}).success).toBe(true);
    expect(s.toJsonSchema().required).toBeUndefined();
    expect(s.toJsonSchema().properties!.gone).toEqual({ not: {} });
  });
});

describe("number", () => {
  it("integer, positive, nonnegative, equals, oneOf, notEqual", () => {
    expect(k.number().integer().positive().toJsonSchema()).toEqual({ type: "integer", exclusiveMinimum: 0 });
    expect(k.number().nonnegative().nonpositive().toJsonSchema()).toEqual({ type: "number", minimum: 0, maximum: 0 });
    expect(k.number().equals(3).toJsonSchema()).toEqual({ type: "number", const: 3 });
    expect(k.number().oneOf([1, 2, 3]).oneOf([2, 3, 4]).toJsonSchema()).toEqual({ type: "number", enum: [2, 3] });
    expect(k.number().notEqual(0).notOneOf([5]).toJsonSchema()).toEqual({
      type: "number",
      not: { const: 0 },
      allOf: [{ not: { enum: [5] } }],
    });
  });

  it("chained bounds keep the strictest one (like the runtime)", () => {
    const s = k.number().min(10).min(5).max(3).max(8);
    expect(s.safeParse(7).success).toBe(false);
    expect(s.toJsonSchema()).toEqual({ type: "number", minimum: 10, maximum: 3 });
    expect(k.number().between(0, 100).between(10, 200).toJsonSchema()).toEqual({
      type: "number",
      minimum: 10,
      maximum: 100,
    });
  });
});

describe("string", () => {
  it("several pattern rules are all kept (allOf), not overwritten", () => {
    const s = k.string().startsWith("a").endsWith("z");
    expect(s.safeParse("abz").success).toBe(true);
    expect(s.toJsonSchema()).toEqual({ type: "string", pattern: "^a", allOf: [{ pattern: "z$" }] });
  });

  it("startsWith / endsWith / includes escape regex characters", () => {
    expect(k.string().startsWith("v1.").toJsonSchema().pattern).toBe("^v1\\.");
    expect(k.string().endsWith("(x)").toJsonSchema().pattern).toBe("\\(x\\)$");
    expect(k.string().includes("a+b").toJsonSchema().pattern).toBe("a\\+b");
    const re = new RegExp(k.string().startsWith("a.b").toJsonSchema().pattern!, "u");
    expect(re.test("a.bc")).toBe(true);
    expect(re.test("axbc")).toBe(false);
  });

  it("lowercase()/uppercase() patterns match what the runtime accepts", () => {
    const lower = k.string().lowercase();
    for (const v of ["", "hello world 1", "abc-def"]) {
      expect(lower.safeParse(v).success).toBe(true);
      expect(new RegExp(lower.toJsonSchema().pattern!).test(v)).toBe(true);
    }
    expect(new RegExp(lower.toJsonSchema().pattern!).test("Hello")).toBe(false);
    const upper = k.string().uppercase();
    expect(new RegExp(upper.toJsonSchema().pattern!).test("ABC 1")).toBe(true);
  });

  it("all emitted patterns compile in unicode mode", () => {
    const schemas = [
      k.string().jwt(), k.string().uuid(), k.string().cuid2(), k.string().ulid(),
      k.string().emoji(), k.string().cidr(), k.string().trim(), k.string().ascii(),
      k.string().noWhitespace(), k.string().lowercase(), k.string().uppercase(),
    ];
    for (const s of schemas) {
      expect(() => new RegExp(s.toJsonSchema().pattern!, "u")).not.toThrow();
    }
  });

  it("length bounds keep the strictest value", () => {
    expect(k.string().minLength(5).nonempty().maxLength(10).length(8).toJsonSchema()).toEqual({
      type: "string",
      minLength: 8,
      maxLength: 8,
    });
  });
});

describe("object", () => {
  it("strict() forbids extra keys in the schema too", () => {
    const s = k.object({ a: k.string() }).strict();
    expect(s.safeParse({ a: "x", b: 1 }).success).toBe(false);
    expect(s.toJsonSchema()).toEqual({
      type: "object",
      required: ["a"],
      properties: { a: { type: "string" } },
      additionalProperties: false,
    });
    expect(s.describe("d").toJsonSchema()).toMatchObject({ additionalProperties: false, description: "d" });
  });

  it("passthrough() / default objects allow extra keys (no additionalProperties)", () => {
    expect(k.object({ a: k.string() }).passthrough().toJsonSchema().additionalProperties).toBeUndefined();
    expect(k.object({ a: k.string() }).toJsonSchema().additionalProperties).toBeUndefined();
  });
});

describe("union / intersection", () => {
  it("union is first-match, so anyOf (not oneOf)", () => {
    const s = k.union([k.string(), k.string().minLength(3)]);
    expect(s.safeParse("abcd").success).toBe(true);
    expect(s.toJsonSchema()).toEqual({ anyOf: [{ type: "string" }, { type: "string", minLength: 3 }] });
  });

  it("intersection uses allOf", () => {
    expect(k.intersection([k.object({ a: k.string() }), k.object({ b: k.number() })]).toJsonSchema()).toEqual({
      allOf: [
        { type: "object", required: ["a"], properties: { a: { type: "string" } } },
        { type: "object", required: ["b"], properties: { b: { type: "number" } } },
      ],
    });
  });
});

describe("discriminatedUnion", () => {
  it("each oneOf branch pins the discriminator (const + required)", () => {
    // Branches that don't declare the key would otherwise overlap and break oneOf.
    const s = k.discriminatedUnion("kind", {
      a: k.object({ x: k.string().optional() }),
      b: k.object({ x: k.string().optional() }),
    });
    expect(s.toJsonSchema()).toEqual({
      oneOf: [
        { type: "object", properties: { x: { type: "string" }, kind: { const: "a" } }, required: ["kind"] },
        { type: "object", properties: { x: { type: "string" }, kind: { const: "b" } }, required: ["kind"] },
      ],
    });
  });

  it("keeps the branch's own literal (types included)", () => {
    const s = k.discriminatedUnion("type", {
      a: k.object({ type: k.literal("a"), v: k.string() }),
    });
    expect(s.toJsonSchema().oneOf![0]).toEqual({
      type: "object",
      required: ["type", "v"],
      properties: { type: { type: "string", const: "a" }, v: { type: "string" } },
    });
  });

  it("does not crash on discriminator values that are Object.prototype keys", () => {
    const s = k.discriminatedUnion("type", { a: k.object({ type: k.literal("a") }) });
    for (const v of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
      const r = s.safeParse({ type: v });
      expect(r.success).toBe(false);
    }
  });
});

describe("lazy (recursive)", () => {
  it("recursive schema emits $anchor + $ref instead of an empty schema", () => {
    const tree: any = k.lazy(
      () => k.object({ value: k.string(), children: k.array(tree) }),
      "TreeNode",
    );
    expect(tree.toJsonSchema()).toEqual({
      $anchor: "TreeNode",
      type: "object",
      required: ["value", "children"],
      properties: {
        value: { type: "string" },
        children: { type: "array", items: { $ref: "#TreeNode" } },
      },
    });
  });

  it("non-recursive lazy schemas don't get an $anchor", () => {
    expect(k.lazy(() => k.string()).toJsonSchema()).toEqual({ type: "string" });
  });

  it("auto-generates a valid anchor name and is stable across calls", () => {
    const node: any = k.lazy(() => k.object({ next: node.optional() }));
    const first = node.toJsonSchema();
    expect(first.$anchor).toMatch(/^[A-Za-z_][-A-Za-z0-9._]*$/);
    expect(first.properties.next).toEqual({ $ref: `#${first.$anchor}` });
    expect(node.toJsonSchema()).toEqual(first);
  });

  it("recursion through record / tuple works (used to throw on parse)", () => {
    const viaRecord: any = k.lazy(() => k.object({ kids: k.record(viaRecord) }), "R");
    expect(viaRecord.safeParse({ kids: { a: { kids: {} } } }).success).toBe(true);
    expect(viaRecord.toJsonSchema().properties.kids).toEqual({
      type: "object",
      additionalProperties: { $ref: "#R" },
    });

    const viaTuple: any = k.lazy(() => k.object({ pair: k.tuple([k.string(), viaTuple.nullable()]) }), "T");
    expect(viaTuple.safeParse({ pair: ["a", null] }).success).toBe(true);
    expect(viaTuple.toJsonSchema().properties.pair.prefixItems[1]).toEqual({
      anyOf: [{ $ref: "#T" }, { type: "null" }],
    });
  });

  it("a nullable recursive object still gets type array + anchor", () => {
    const n: any = k.lazy(() => k.object({ child: n.nullable() }), "N");
    expect(n.nullable().toJsonSchema()).toEqual({
      $anchor: "N",
      type: ["object", "null"],
      required: ["child"],
      properties: { child: { anyOf: [{ $ref: "#N" }, { type: "null" }] } },
    });
  });
});

describe("other schemas", () => {
  it("boolean isTrue/isFalse/equals -> const", () => {
    expect(k.boolean().isTrue().toJsonSchema()).toEqual({ type: "boolean", const: true });
    expect(k.boolean().equals(false).toJsonSchema()).toEqual({ type: "boolean", const: false });
  });

  it("array contains / bounds", () => {
    expect(k.array(k.string()).contains("admin").minLength(2).minLength(1).toJsonSchema()).toEqual({
      type: "array",
      items: { type: "string" },
      contains: { const: "admin" },
      minItems: 2,
    });
  });

  it("set / map sizes", () => {
    expect(k.set(k.number()).minSize(1).maxSize(3).toJsonSchema()).toEqual({
      type: "array",
      uniqueItems: true,
      items: { type: "number" },
      minItems: 1,
      maxItems: 3,
    });
    expect(k.map(k.string(), k.number()).nonempty().toJsonSchema()).toMatchObject({ minProperties: 1 });
  });

  it("date isDateOnly() -> format date", () => {
    expect(k.date().toJsonSchema()).toEqual({ type: "string", format: "date-time" });
    expect(k.date().isDateOnly().toJsonSchema()).toEqual({ type: "string", format: "date" });
  });

  it("literal types", () => {
    expect(k.literal(1.5).toJsonSchema()).toEqual({ type: "number", const: 1.5 });
    expect(k.literal(null).toJsonSchema()).toEqual({ type: "null", const: null });
  });
});
