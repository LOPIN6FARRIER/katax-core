import type { JsonSchema } from "./schema.types";

/**
 * Helpers shared by the schemas' toJsonSchema() implementations, so that
 * chaining several rules produces a JSON Schema that matches what _parse()
 * actually enforces (all rules apply at once), instead of the last rule
 * silently overwriting the previous one.
 */

/**
 * Escape a literal string so it can be embedded in a regex pattern.
 * Only ECMA-262 "syntax characters" are escaped, so the result is also valid
 * in unicode mode (`u` flag), which many JSON Schema validators use.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/**
 * Add a `pattern`. JSON Schema allows a single `pattern` per schema, so when
 * one is already present the new one is added under `allOf` (every pattern
 * must match, exactly like the chained runtime rules).
 */
export function addPattern(schema: JsonSchema, pattern: string): JsonSchema {
  if (schema.pattern === undefined || schema.pattern === pattern) {
    return { ...schema, pattern };
  }
  const existing = schema.allOf ?? [];
  if (existing.some((s) => s.pattern === pattern)) {
    return schema;
  }
  return { ...schema, allOf: [...existing, { pattern }] };
}

/** Lower bound: keep the stricter (largest) of the existing and new value. */
export function withLowerBound(
  schema: JsonSchema,
  key: "minimum" | "exclusiveMinimum" | "minLength" | "minItems" | "minProperties",
  value: number,
): JsonSchema {
  const current = schema[key];
  return { ...schema, [key]: current === undefined ? value : Math.max(current, value) };
}

/** Upper bound: keep the stricter (smallest) of the existing and new value. */
export function withUpperBound(
  schema: JsonSchema,
  key: "maximum" | "exclusiveMaximum" | "maxLength" | "maxItems" | "maxProperties",
  value: number,
): JsonSchema {
  const current = schema[key];
  return { ...schema, [key]: current === undefined ? value : Math.min(current, value) };
}

/** Restrict to a set of values, intersecting with any existing `enum`. */
export function withEnum(schema: JsonSchema, values: unknown[]): JsonSchema {
  const next = schema.enum ? schema.enum.filter((v) => values.includes(v)) : [...values];
  return { ...schema, enum: next };
}

/** Add a `not` constraint, combining with an existing one via `allOf`. */
export function addNot(schema: JsonSchema, not: JsonSchema): JsonSchema {
  if (schema.not === undefined) {
    return { ...schema, not };
  }
  return { ...schema, allOf: [...(schema.allOf ?? []), { not }] };
}

const NULL_SCHEMA: JsonSchema = { type: "null" };

function acceptsNull(schema: JsonSchema): boolean {
  if (schema.type === "null") return true;
  if (Array.isArray(schema.type) && schema.type.includes("null")) return true;
  if ("const" in schema && schema.const === null) return true;
  if (schema.enum?.includes(null)) return true;
  const branches = schema.anyOf ?? schema.oneOf;
  return branches?.some((b) => acceptsNull(b)) ?? false;
}

/** Keys that only apply to a single type, safe to keep when `type` becomes an array. */
const TYPE_ONLY_COMPOSITION_KEYS: Array<keyof JsonSchema> = [
  "allOf", "anyOf", "oneOf", "not", "if", "then", "else", "const", "enum", "$ref",
];

/**
 * Make a JSON Schema also accept `null` (what `.nullable()` / `.nullish()`
 * do at runtime).
 *
 * - `{ type: "string", ... }`      -> `{ type: ["string", "null"], ... }`
 *   (type-specific keywords such as minLength are ignored by JSON Schema for
 *   the null branch, so this is exact)
 * - `enum` / `const` / composition (anyOf, oneOf, $ref...) -> `anyOf: [inner, { type: "null" }]`
 *   because adding "null" to `type` there would still be rejected by the
 *   enum/const/branches.
 * - Schemas without `type` and without constraints (`{}`) already accept null.
 *
 * `annotations` (description, default...) stay at the top level so tools
 * like Swagger UI still show them.
 */
export function withNull(schema: JsonSchema, annotations: JsonSchema = {}): JsonSchema {
  if (acceptsNull(schema) || Object.keys(schema).length === 0) {
    return { ...schema, ...annotations };
  }

  const hasComposition = TYPE_ONLY_COMPOSITION_KEYS.some((key) => key in schema);

  if (!hasComposition && schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    return { ...schema, type: [...types, "null"], ...annotations };
  }

  return { anyOf: [schema, NULL_SCHEMA], ...annotations };
}
