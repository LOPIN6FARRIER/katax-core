import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('UnionSchema', () => {
  it('accepts string or number', () => {
    const s = k.union([k.string(), k.number()])
    expect(s.safeParse('hello').success).toBe(true)
    expect(s.safeParse(42).success).toBe(true)
    expect(s.safeParse(true).success).toBe(false)
    expect(s.safeParse(null).success).toBe(false)
  })

  it('accepts one of three types', () => {
    const s = k.union([k.string(), k.number(), k.boolean()])
    expect(s.safeParse('x').success).toBe(true)
    expect(s.safeParse(1).success).toBe(true)
    expect(s.safeParse(false).success).toBe(true)
    expect(s.safeParse([]).success).toBe(false)
  })

  it('matches first matching schema and returns its data', () => {
    const s = k.union([k.string(), k.number()])
    const r1 = s.safeParse('hello')
    expect(r1.success).toBe(true)
    if (r1.success) expect(typeof r1.data).toBe('string')
    const r2 = s.safeParse(42)
    if (r2.success) expect(typeof r2.data).toBe('number')
  })

  it('works with discriminated objects', () => {
    const cat = k.object({ type: k.literal('cat'), meow: k.boolean() })
    const dog = k.object({ type: k.literal('dog'), bark: k.boolean() })
    const s = k.union([cat, dog])
    expect(s.safeParse({ type: 'cat', meow: true }).success).toBe(true)
    expect(s.safeParse({ type: 'dog', bark: false }).success).toBe(true)
    expect(s.safeParse({ type: 'bird' }).success).toBe(false)
  })

  it('fails on non-matching types', () => {
    const s = k.union([k.string(), k.number()])
    const r = s.safeParse(undefined)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
  })

  it('handles null/undefined correctly', () => {
    const s = k.union([k.string(), k.literal(null).nullable()])
    expect(s.safeParse(null).success).toBe(true)
    expect(s.safeParse('x').success).toBe(true)
    expect(s.safeParse(undefined).success).toBe(false)
  })

  it('rejects empty union at construction', () => {
    expect(() => k.union([])).toThrow()
  })
})

describe('IntersectionSchema', () => {
  it('merges fields from multiple object schemas', () => {
    const withId = k.object({ id: k.number() })
    const withName = k.object({ name: k.string() })
    const s = k.intersection([withId, withName])
    const r = s.safeParse({ id: 1, name: 'Alice' })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.id).toBe(1)
      expect(r.data.name).toBe('Alice')
    }
  })

  it('fails when any schema fails', () => {
    const withId = k.object({ id: k.number() })
    const withName = k.object({ name: k.string() })
    const s = k.intersection([withId, withName])
    expect(s.safeParse({ id: 1 }).success).toBe(false)
    expect(s.safeParse({ name: 'Alice' }).success).toBe(false)
    expect(s.safeParse({}).success).toBe(false)
  })

  it('validates nested field types in each schema', () => {
    const base = k.object({ id: k.number() })
    const details = k.object({ email: k.string().email() })
    const s = k.intersection([base, details])
    expect(s.safeParse({ id: 1, email: 'bad' }).success).toBe(false)
    expect(s.safeParse({ id: 'not-num', email: 'a@b.com' }).success).toBe(false)
  })

  it('intersects three object schemas', () => {
    const a = k.object({ a: k.string() })
    const b = k.object({ b: k.number() })
    const c = k.object({ c: k.boolean() })
    const s = k.intersection([a, b, c])
    const r = s.safeParse({ a: 'x', b: 1, c: true })
    expect(r.success).toBe(true)
  })

  it('rejects empty intersection at construction', () => {
    expect(() => k.intersection([])).toThrow()
  })
})
