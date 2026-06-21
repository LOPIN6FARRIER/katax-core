import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('edge cases', () => {
  it('NaN is rejected with finite()', () => {
    const s = k.number().finite()
    expect(s.safeParse(NaN).success).toBe(false)
    expect(s.safeParse(42).success).toBe(true)
  })

  it('Infinity is rejected with finite()', () => {
    const s = k.number().finite()
    expect(s.safeParse(Infinity).success).toBe(false)
    expect(s.safeParse(-Infinity).success).toBe(false)
    expect(s.safeParse(42).success).toBe(true)
  })

  it('empty string is rejected by nonempty', () => {
    expect(k.string().nonempty().safeParse('').success).toBe(false)
    expect(k.string().nonempty().safeParse('a').success).toBe(true)
  })

  it('null vs undefined: nullable accepts null, optional accepts undefined', () => {
    const nullable = k.string().nullable()
    expect(nullable.safeParse(null).success).toBe(true)
    expect(nullable.safeParse(undefined).success).toBe(false)

    const optional = k.string().optional()
    expect(optional.safeParse(undefined).success).toBe(true)
    expect(optional.safeParse(null).success).toBe(false)
  })

  it('handles circular reference in objects gracefully', () => {
    const schema = k.object({ name: k.string() })
    const obj: any = { name: 'test' }
    obj.self = obj
    expect(() => schema.safeParse(obj)).not.toThrow()
  })

  it('default value is cloned, not mutated', () => {
    const schema = k.object({ items: k.array(k.string()) }).default({ items: ['a', 'b'] })
    const r1 = schema.safeParse(undefined)
    const r2 = schema.safeParse(undefined)
    if (r1.success && r2.success) {
      r1.data.items.push('c')
      expect(r2.data.items).toEqual(['a', 'b'])
    }
  })

  it('multipleOf with floating point precision', () => {
    const s = k.number().multipleOf(0.1)
    expect(s.safeParse(0.3).success).toBe(true)
    expect(s.safeParse(0.33).success).toBe(false)
  })

  it('very long strings are validated', () => {
    const long = 'a'.repeat(10000)
    expect(k.string().safeParse(long).success).toBe(true)
    expect(k.string().minLength(9999).safeParse(long).success).toBe(true)
    expect(k.string().maxLength(5000).safeParse(long).success).toBe(false)
  })

  it('deeply nested objects', () => {
    const schema = k.object({
      a: k.object({
        b: k.object({
          c: k.object({
            d: k.string()
          })
        })
      })
    })
    expect(schema.safeParse({ a: { b: { c: { d: 'deep' } } } }).success).toBe(true)
    expect(schema.safeParse({ a: { b: { c: { d: 123 } } } }).success).toBe(false)
  })

    it('email with unicode in local part is rejected', () => {
    const s = k.email()
    expect(s.safeParse('üser@example.com').success).toBe(false)
    expect(s.safeParse('user@example.com').success).toBe(true)
  })

  it('bigint rejects string and number (no coercion)', () => {
    const s = k.bigint()
    expect(s.safeParse('42').success).toBe(false)
    expect(s.safeParse(42).success).toBe(false)
    expect(s.safeParse(BigInt('90071992547409910')).success).toBe(true)
  })

  it('bigint zero boundary for positive/negative', () => {
    expect(k.bigint().positive().safeParse(0n).success).toBe(false)
    expect(k.bigint().negative().safeParse(0n).success).toBe(false)
    expect(k.bigint().nonnegative().safeParse(0n).success).toBe(true)
    expect(k.bigint().nonpositive().safeParse(0n).success).toBe(true)
  })

  it('union with single schema', () => {
    const s = k.union([k.string()])
    expect(s.safeParse('hello').success).toBe(true)
    expect(s.safeParse(42).success).toBe(false)
  })

  it('intersection with single schema', () => {
    const s = k.intersection([k.object({ a: k.string() })])
    expect(s.safeParse({ a: 'x' }).success).toBe(true)
    expect(s.safeParse({ a: 1 }).success).toBe(false)
  })

  it('coerce.number with NaN rejects', () => {
    expect(k.coerce.number().safeParse(NaN).success).toBe(false)
    expect(k.coerce.number().safeParse('NaN').success).toBe(false)
  })

  it('coerce.number with extreme values', () => {
    expect(k.coerce.number().safeParse(1e308).success).toBe(true)
    expect(k.coerce.number().safeParse(-1e308).success).toBe(true)
  })

  it('coerce.boolean with non-standard values', () => {
    const s = k.coerce.boolean()
    expect(s.safeParse({}).success).toBe(false)
    expect(s.safeParse([]).success).toBe(false)
  })

  it('deeply nested arrays with element schemas', () => {
    const schema = k.array(k.array(k.object({ id: k.number(), tags: k.array(k.string()) })))
    const valid = [[{ id: 1, tags: ['a'] }], [{ id: 2, tags: ['b', 'c'] }]]
    const invalid = [[{ id: 1, tags: ['a'] }], [{ id: 'x', tags: ['b'] }]]
    expect(schema.safeParse(valid).success).toBe(true)
    expect(schema.safeParse(invalid).success).toBe(false)
  })

  it('promise with rejected promise', async () => {
    const s = k.promise(k.string())
    const promise = Promise.reject(new Error('fail'))
    const result = await s.safeParseAsync(promise)
    expect(result.success).toBe(false)
  })

  it('file rejects null/undefined/number', () => {
    const s = k.file()
    expect(s.safeParse(null).success).toBe(false)
    expect(s.safeParse(undefined).success).toBe(false)
    expect(s.safeParse(42).success).toBe(false)
  })

  it('object with all optional fields accepts empty object', () => {
    const schema = k.object({ a: k.string().optional(), b: k.number().optional() })
    expect(schema.safeParse({}).success).toBe(true)
  })

  it('object with default on every field', () => {
    const schema = k.object({ a: k.string().default('x'), b: k.number().default(0) })
    const r = schema.safeParse({})
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.a).toBe('x')
      expect(r.data.b).toBe(0)
    }
  })

  it('branded types with modifiers compose', () => {
    const schema = k.string().email().brand('Email').optional().default('a@b.co').nullable()
    expect(schema.safeParse('test@x.com').success).toBe(true)
    expect(schema.safeParse(null).success).toBe(true)
    expect(schema.safeParse(undefined).success).toBe(true)
    expect(schema.safeParse(123).success).toBe(false)
  })

  it('twoDates with invalid separator string', () => {
    expect(k.twoDates().safeParse('2024-01-01').success).toBe(false)
    expect(k.twoDates().safeParse('2024-01-01X2024-12-31').success).toBe(false)
    expect(k.twoDates('__').safeParse('2024-01-01__2024-12-31').success).toBe(true)
  })

  it('base64 rejects non-base64 strings', () => {
    const s = k.base64()
    expect(s.safeParse('not-base64!!!').success).toBe(false)
    expect(s.safeParse(123).success).toBe(false)
    expect(s.safeParse(null).success).toBe(false)
  })

  it('email without domain should fail', () => {
    expect(k.email().safeParse('no-at-sign').success).toBe(false)
    expect(k.email().safeParse('@example.com').success).toBe(false)
    expect(k.email().safeParse('user@').success).toBe(false)
  })

  it('record schema edge cases', () => {
    const schema = k.record(k.number())
    expect(schema.safeParse({ a: 1, b: 2 }).success).toBe(true)
    expect(schema.safeParse({ a: 'x' }).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
    expect(schema.safeParse([]).success).toBe(false)
  })

  it('tuple edge cases', () => {
    const schema = k.tuple([k.string(), k.number()])
    expect(schema.safeParse(['hello', 42]).success).toBe(true)
    expect(schema.safeParse(['hello']).success).toBe(false)
    expect(schema.safeParse(['hello', 42, 'extra']).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
  })

  it('enum rejects values outside defined list', () => {
    const schema = k.enum(['a', 'b', 'c'])
    expect(schema.safeParse('a').success).toBe(true)
    expect(schema.safeParse('d').success).toBe(false)
    expect(schema.safeParse(0).success).toBe(false)
  })

  it('optional chain on string with refinements', () => {
    const s = k.string().minLength(3).optional()
    expect(s.safeParse(undefined).success).toBe(true)
    expect(s.safeParse('ab').success).toBe(false)
    expect(s.safeParse('abc').success).toBe(true)
  })

  it('nullish chain with default fallback', () => {
    const s = k.string().nullish().default('fallback')
    expect(s.parse(undefined)).toBe('fallback')
    expect(s.parse('custom')).toBe('custom')
  })

  it('catch modifier on chained validators', () => {
    const s = k.string().email().minLength(10).catch('fallback@x.com')
    expect(s.parse('short')).toBe('fallback@x.com')
    expect(typeof s.parse('a@b.co')).toBe('string')
  })

  it('transform after chain changes output type', () => {
    const s = k.number().positive().transform(x => x.toString())
    const r = s.safeParse(42)
    expect(r.success).toBe(true)
    if (r.success) expect(typeof r.data).toBe('string')
  })

  it('refine catches custom validation errors', () => {
    const s = k.number().refine(x => x % 2 === 0, 'must be even')
    expect(s.safeParse(2).success).toBe(true)
    expect(s.safeParse(3).success).toBe(false)
    const r = s.safeParse(3)
    if (!r.success) expect(r.issues[0].message).toContain('must be even')
  })

  it('asyncRefine works on safeParseAsync', async () => {
    const s = k.string().asyncRefine(async (val) => {
      if (val.length < 3) return [{ path: [], message: 'too short' }]
      return []
    })
    const r1 = await s.safeParseAsync('ab')
    expect(r1.success).toBe(false)
    const r2 = await s.safeParseAsync('abcd')
    expect(r2.success).toBe(true)
  })

  it('multiple async validators compose', async () => {
    const s = k.number().asyncRefine(async (val) => {
      if (val <= 0) return [{ path: [], message: 'must be positive' }]
      return []
    }).asyncRefine(async (val) => {
      if (val > 100) return [{ path: [], message: 'must be under 100' }]
      return []
    })
    const r1 = await s.safeParseAsync(-1)
    expect(r1.success).toBe(false)
    const r2 = await s.safeParseAsync(150)
    expect(r2.success).toBe(false)
    const r3 = await s.safeParseAsync(50)
    expect(r3.success).toBe(true)
  })
})
