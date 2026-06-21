import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('BooleanSchema', () => {
  it('accepts true', () => {
    expect(k.boolean().safeParse(true).success).toBe(true)
  })

  it('accepts false', () => {
    expect(k.boolean().safeParse(false).success).toBe(true)
  })

  it('rejects non-boolean values', () => {
    const schema = k.boolean()
    expect(schema.safeParse('true').success).toBe(false)
    expect(schema.safeParse(1).success).toBe(false)
    expect(schema.safeParse(0).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
    expect(schema.safeParse(undefined).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
    expect(schema.safeParse([]).success).toBe(false)
  })

  it('isTrue()', () => {
    expect(k.boolean().isTrue().safeParse(true).success).toBe(true)
    expect(k.boolean().isTrue().safeParse(false).success).toBe(false)
  })

  it('isFalse()', () => {
    expect(k.boolean().isFalse().safeParse(false).success).toBe(true)
    expect(k.boolean().isFalse().safeParse(true).success).toBe(false)
  })

  it('equals()', () => {
    expect(k.boolean().equals(true).safeParse(true).success).toBe(true)
    expect(k.boolean().equals(true).safeParse(false).success).toBe(false)
    expect(k.boolean().equals(false).safeParse(false).success).toBe(true)
    expect(k.boolean().equals(false).safeParse(true).success).toBe(false)
  })

  it('optional() accepts undefined', () => {
    expect(k.boolean().optional().safeParse(undefined).success).toBe(true)
    expect(k.boolean().optional().safeParse(true).success).toBe(true)
  })

  it('nullable() accepts null', () => {
    expect(k.boolean().nullable().safeParse(null).success).toBe(true)
    expect(k.boolean().nullable().safeParse(true).success).toBe(true)
    expect(k.boolean().nullable().safeParse('x').success).toBe(false)
  })
})
