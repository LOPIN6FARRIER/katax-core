import { describe, it, expect } from "vitest";
import { k } from "../src/k";

describe("ArraySchema", () => {
  it("validates basic arrays", () => {
    const schema = k.array().describe("An array of any values");
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    expect(schema.safeParse("not array").success).toBe(false);
    expect(schema.safeParse(null).success).toBe(false);
  });

  it("validates typed arrays with element schema", () => {
    const schema = k.array(k.number());
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    expect(schema.safeParse([1, "two", 3]).success).toBe(false);
  });

  it("minLength", () => {
    const schema = k.array().minLength(2);
    expect(schema.safeParse([1]).success).toBe(false);
    expect(schema.safeParse([1, 2]).success).toBe(true);
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
  });

  it("maxLength", () => {
    const schema = k.array().maxLength(2);
    expect(schema.safeParse([1, 2, 3]).success).toBe(false);
    expect(schema.safeParse([1, 2]).success).toBe(true);
    expect(schema.safeParse([1]).success).toBe(true);
  });

  it("length", () => {
    const schema = k.array().length(3);
    expect(schema.safeParse([1, 2]).success).toBe(false);
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    expect(schema.safeParse([1, 2, 3, 4]).success).toBe(false);
  });

  it("notEmpty", () => {
    const schema = k.array().notEmpty();
    expect(schema.safeParse([]).success).toBe(false);
    expect(schema.safeParse([1]).success).toBe(true);
  });

  it("nonempty (alias for notEmpty)", () => {
    const schema = k.array().nonempty();
    expect(schema.safeParse([]).success).toBe(false);
    expect(schema.safeParse([1]).success).toBe(true);
  });

  it("unique with primitives", () => {
    const schema = k.array(k.number()).unique();
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    expect(schema.safeParse([1, 2, 2]).success).toBe(false);
    expect(schema.safeParse([1, 1, 2]).success).toBe(false);
  });

  it("unique with objects", () => {
    const schema = k.array(k.object({ id: k.number() })).unique();
    expect(schema.safeParse([{ id: 1 }, { id: 2 }]).success).toBe(true);
    expect(schema.safeParse([{ id: 1 }, { id: 1 }]).success).toBe(false);
  });

  it("contains", () => {
    const schema = k.array(k.number()).contains(3);
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    expect(schema.safeParse([1, 2, 4]).success).toBe(false);
  });

  it("nested arrays", () => {
    const schema = k.array(k.array(k.number()));
    expect(
      schema.safeParse([
        [1, 2],
        [3, 4],
      ]).success,
    ).toBe(true);
    expect(schema.safeParse([[1, 2], ["x"]]).success).toBe(false);
    expect(schema.safeParse("not array").success).toBe(false);
  });

  it("typed array with element validation issues reported with paths", () => {
    const schema = k.array(k.number().positive());
    const result = schema.safeParse([1, -2, 3]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.path.includes(1))).toBe(true);
    }
  });

  it("applies element schema validation before array rules", () => {
    const schema = k.array(k.number()).minLength(2);
    expect(schema.safeParse([1, "x"]).success).toBe(false);
  });

  describe("min()/max() aliases", () => {
    it("min() works as minLength alias", () => {
      const s = k.array(k.number()).min(2);
      expect(s.safeParse([1]).success).toBe(false);
      expect(s.safeParse([1, 2]).success).toBe(true);
    });
    it("max() works as maxLength alias", () => {
      const s = k.array(k.number()).max(3);
      expect(s.safeParse([1, 2, 3, 4]).success).toBe(false);
      expect(s.safeParse([1, 2]).success).toBe(true);
    });
  });
});
