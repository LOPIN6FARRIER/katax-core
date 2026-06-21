import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('CustomSchema', () => {
  it('validates with a custom validator function', () => {
    const positiveEven = k.custom<number>((value, path) => {
      if (typeof value !== 'number') return [{ path, message: 'Expected number' }]
      if (value <= 0) return [{ path, message: 'Must be positive' }]
      if (value % 2 !== 0) return [{ path, message: 'Must be even' }]
      return value
    })
    expect(positiveEven.safeParse(4).success).toBe(true)
    expect(positiveEven.safeParse(3).success).toBe(false)
    expect(positiveEven.safeParse(-2).success).toBe(false)
    expect(positiveEven.safeParse('hello').success).toBe(false)
  })

  it('supports refine() after custom validation', () => {
    const s = k.custom<string>((v, p) => (typeof v === 'string' ? v : [{ path: p, message: 'Not string' }]))
      .refine(v => v.length >= 3, 'Too short')
      .refine(v => v.startsWith('K'), v => `Must start with K, got ${v}`)
    expect(s.safeParse('Katax').success).toBe(true)
    expect(s.safeParse('Ka').success).toBe(false)
    expect(s.safeParse('Hello').success).toBe(false)
  })

  it('passes parsed value through refine chain', () => {
    const s = k.custom<number>((v, p) => (typeof v === 'number' ? v : [{ path: p, message: 'Not number' }]))
      .refine(v => v > 0, 'Not positive')
    const r = s.safeParse(42)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(42)
  })
})

describe('LiteralSchema', () => {
  it('accepts matching string literal', () => {
    expect(k.literal('active').safeParse('active').success).toBe(true)
    expect(k.literal('active').safeParse('inactive').success).toBe(false)
  })

  it('accepts matching number literal', () => {
    expect(k.literal(42).safeParse(42).success).toBe(true)
    expect(k.literal(42).safeParse(43).success).toBe(false)
  })

  it('accepts matching boolean literal', () => {
    expect(k.literal(true).safeParse(true).success).toBe(true)
    expect(k.literal(true).safeParse(false).success).toBe(false)
  })

  it('accepts matching null literal', () => {
    expect(k.literal(null).safeParse(null).success).toBe(true)
    expect(k.literal(null).safeParse(undefined).success).toBe(false)
  })
})

describe('EnumSchema', () => {
  it('accepts valid enum values', () => {
    const s = k.enum(['pending', 'active', 'completed'])
    expect(s.safeParse('pending').success).toBe(true)
    expect(s.safeParse('active').success).toBe(true)
    expect(s.safeParse('completed').success).toBe(true)
  })

  it('rejects invalid enum values', () => {
    const s = k.enum(['pending', 'active'])
    expect(s.safeParse('unknown').success).toBe(false)
    expect(s.safeParse(123).success).toBe(false)
  })
})

describe('Any / Unknown / Never', () => {
  it('k.any() accepts everything', () => {
    const s = k.any()
    expect(s.safeParse('hello').success).toBe(true)
    expect(s.safeParse(42).success).toBe(true)
    expect(s.safeParse(null).success).toBe(true)
    expect(s.safeParse({ foo: 1 }).success).toBe(true)
  })

  it('k.unknown() accepts everything', () => {
    const s = k.unknown()
    expect(s.safeParse('hello').success).toBe(true)
    expect(s.safeParse([1, 2, 3]).success).toBe(true)
  })

  it('k.never() rejects everything', () => {
    const s = k.never()
    expect(s.safeParse('hello').success).toBe(false)
    expect(s.safeParse(undefined).success).toBe(false)
    expect(s.safeParse(null).success).toBe(false)
  })
})

describe('TupleSchema', () => {
  it('validates fixed-length arrays', () => {
    const s = k.tuple([k.string(), k.number()])
    expect(s.safeParse(['a', 1]).success).toBe(true)
    expect(s.safeParse(['a']).success).toBe(false)
    expect(s.safeParse(['a', 1, true]).success).toBe(false)
  })

  it('validates mixed types at positions', () => {
    const s = k.tuple([k.string(), k.number(), k.boolean()])
    expect(s.safeParse(['a', 1, true]).success).toBe(true)
    expect(s.safeParse([1, 'a', true]).success).toBe(false)
  })

  it('rejects non-array input', () => {
    const s = k.tuple([k.number()])
    expect(s.safeParse('not-array').success).toBe(false)
    expect(s.safeParse(123).success).toBe(false)
  })
})

describe('RecordSchema', () => {
  it('validates record with value schema', () => {
    const s = k.record(k.number())
    expect(s.safeParse({ a: 1, b: 2 }).success).toBe(true)
    expect(s.safeParse({ a: '1' }).success).toBe(false)
    expect(s.safeParse({}).success).toBe(true)
  })

  it('rejects non-object input', () => {
    const s = k.record(k.string())
    expect(s.safeParse([1, 2, 3]).success).toBe(false)
    expect(s.safeParse(null).success).toBe(false)
  })
})
