import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('NumberSchema', () => {
  describe('equals()', () => {
    it('passes when value equals the expected number', () => {
      const schema = k.number().equals(5)
      const result = schema.safeParse(5)
      expect(result.success).toBe(true)
      if (result.success) expect(result.data).toBe(5)
    })

    it('fails when value does not equal the expected number', () => {
      const schema = k.number().equals(5)
      const result = schema.safeParse(10)
      expect(result.success).toBe(false)
    })
  })

  describe('no string-specific methods', () => {
    it('should NOT have nonempty()', () => {
      const schema = k.number()
      expect((schema as any).nonempty).toBeUndefined()
    })

    it('should NOT have length() (misleading name) - use equals() instead', () => {
      const schema = k.number()
      expect((schema as any).length).toBeUndefined()
    })
  })



  describe('existing validators', () => {
    it('min()', () => {
      const schema = k.number().min(10)
      expect(schema.safeParse(5).success).toBe(false)
      expect(schema.safeParse(10).success).toBe(true)
      expect(schema.safeParse(15).success).toBe(true)
    })

    it('max()', () => {
      const schema = k.number().max(10)
      expect(schema.safeParse(15).success).toBe(false)
      expect(schema.safeParse(10).success).toBe(true)
      expect(schema.safeParse(5).success).toBe(true)
    })

    it('positive()', () => {
      const schema = k.number().positive()
      expect(schema.safeParse(-1).success).toBe(false)
      expect(schema.safeParse(0).success).toBe(false)
      expect(schema.safeParse(1).success).toBe(true)
    })

    it('negative()', () => {
      const schema = k.number().negative()
      expect(schema.safeParse(1).success).toBe(false)
      expect(schema.safeParse(0).success).toBe(false)
      expect(schema.safeParse(-1).success).toBe(true)
    })

    it('integer()', () => {
      const schema = k.number().integer()
      expect(schema.safeParse(1.5).success).toBe(false)
      expect(schema.safeParse(42).success).toBe(true)
    })

    it('finite()', () => {
      const schema = k.number().finite()
      expect(schema.safeParse(Infinity).success).toBe(false)
      expect(schema.safeParse(NaN).success).toBe(false)
      expect(schema.safeParse(42).success).toBe(true)
    })

    it('between()', () => {
      const schema = k.number().between(5, 10)
      expect(schema.safeParse(4).success).toBe(false)
      expect(schema.safeParse(5).success).toBe(true)
      expect(schema.safeParse(7).success).toBe(true)
      expect(schema.safeParse(10).success).toBe(true)
      expect(schema.safeParse(11).success).toBe(false)
    })

    it('greaterThan()', () => {
      const schema = k.number().greaterThan(5)
      expect(schema.safeParse(5).success).toBe(false)
      expect(schema.safeParse(6).success).toBe(true)
    })

    it('lessThan()', () => {
      const schema = k.number().lessThan(5)
      expect(schema.safeParse(5).success).toBe(false)
      expect(schema.safeParse(4).success).toBe(true)
    })

    it('multipleOf()', () => {
      const schema = k.number().multipleOf(3)
      expect(schema.safeParse(5).success).toBe(false)
      expect(schema.safeParse(6).success).toBe(true)
      expect(schema.safeParse(9).success).toBe(true)
    })

    it('oneOf()', () => {
      const schema = k.number().oneOf([1, 2, 3])
      expect(schema.safeParse(0).success).toBe(false)
      expect(schema.safeParse(1).success).toBe(true)
      expect(schema.safeParse(4).success).toBe(false)
    })

    it('notOneOf()', () => {
      const schema = k.number().notOneOf([1, 2, 3])
      expect(schema.safeParse(0).success).toBe(true)
      expect(schema.safeParse(1).success).toBe(false)
    })

    it('notEqual()', () => {
      const schema = k.number().notEqual(5)
      expect(schema.safeParse(5).success).toBe(false)
      expect(schema.safeParse(4).success).toBe(true)
    })
  })

  describe('nonnegative()', () => {
    it('accepts zero', () => {
      expect(k.number().nonnegative().safeParse(0).success).toBe(true)
    })
    it('accepts positive', () => {
      expect(k.number().nonnegative().safeParse(5).success).toBe(true)
    })
    it('rejects negative', () => {
      expect(k.number().nonnegative().safeParse(-5).success).toBe(false)
    })
  })

  describe('nonpositive()', () => {
    it('accepts zero', () => {
      expect(k.number().nonpositive().safeParse(0).success).toBe(true)
    })
    it('accepts negative', () => {
      expect(k.number().nonpositive().safeParse(-5).success).toBe(true)
    })
    it('rejects positive', () => {
      expect(k.number().nonpositive().safeParse(5).success).toBe(false)
    })
  })
})
