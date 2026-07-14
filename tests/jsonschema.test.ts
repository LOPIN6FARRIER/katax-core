import { describe, it, expect } from "vitest";
import { k } from "../src/k";

describe("should return valid json number schema", () => {
  it("should return valid json schema for a simple object", () => {
    const number = k.number().describe("A number schema");
    const jsonSchema = number.toJsonSchema();
    console.log("este es el schema", jsonSchema);
    expect(jsonSchema).toEqual({
      type: "number",
      description: "A number schema",
    });
  });

  it("should return valid json schema for a number schema with rules", () => {
    const number = k
      .number()
      .greaterThan(5)
      .lessThan(10)
      .multipleOf(2)
      .describe("A number schema with rules");
    const jsonSchema = number.toJsonSchema();
    console.log("este es el schema", jsonSchema);
    expect(jsonSchema).toEqual({
      type: "number",
      exclusiveMinimum: 5,
      exclusiveMaximum: 10,
      multipleOf: 2,
      description: "A number schema with rules",
    });
  });
});

describe("should return valid json string schema", () => {
  it("should return valid json schema for a simple string", () => {
    const string = k.string().describe("A string schema");
    const jsonSchema = string.toJsonSchema();
    console.log("este es el schema", jsonSchema);
    expect(jsonSchema).toEqual({
      type: "string",
      description: "A string schema",
    });
  });

  it("should return valid json schema for a string schema with rules", () => {
    const string = k
      .string()
      .email()
      .minLength(5)
      .maxLength(10)
      .describe("A string schema with rules");
    const jsonSchema = string.toJsonSchema();
    console.log("este es el schema string", jsonSchema);
    expect(jsonSchema).toEqual({
      type: "string",
      format: "email",
      minLength: 5,
      maxLength: 10,
      description: "A string schema with rules",
    });
  });
});

describe("should return valid json array schema", () => {
  it("should return valid json schema for a simple array", () => {
    const array = k.array(k.number()).describe("An array schema");
    const jsonSchema = array.toJsonSchema();
    console.log("este es el schema array", jsonSchema);
    expect(jsonSchema).toEqual({
      type: "array",
      items: { type: "number" },
      description: "An array schema",
    });
  });

  it("should return valid json schema for an array schema with rules", () => {
    const array = k
      .array(k.string().minLength(3))
      .minLength(2)
      .maxLength(5)
      .unique()
      .describe("An array schema with rules");
    const jsonSchema = array.toJsonSchema();
    console.log("este es el schema array con reglas", jsonSchema);
    expect(jsonSchema).toEqual({
      type: "array",
      items: { type: "string", minLength: 3 },
      minItems: 2,
      maxItems: 5,
      uniqueItems: true,
      description: "An array schema with rules",
    });
  });
});
