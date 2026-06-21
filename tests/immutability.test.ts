import { describe, it, expect } from 'vitest'
import { k, kataxInfer } from '../src/k'

describe('immutability', () => {
  it('string builders return new instances', () => {
    const base = k.string().minLength(5)
    const upper = base.uppercase()
    expect(base.safeParse('hello').success).toBe(true)
    expect(upper.safeParse('hello').success).toBe(false)
  })

  it('number builders are immutable', () => {
    const base = k.number().positive()
    const chained = base.min(10)
    expect(base.safeParse(5).success).toBe(true)
    expect(chained.safeParse(5).success).toBe(false)
  })

  it('bigint builders are immutable', () => {
    const base = k.bigint().positive()
    const chained = base.min(10n)
    expect(base.safeParse(5n).success).toBe(true)
    expect(chained.safeParse(5n).success).toBe(false)
  })

  it('boolean builders are immutable', () => {
    const base = k.boolean().isTrue()
    const chained = base.equals(true)
    expect(base.safeParse(true).success).toBe(true)
    expect(base.safeParse(false).success).toBe(false)
  })

  it('date builders are immutable', () => {
    const base = k.date().isDateOnly()
    const chained = base.min('2024-06-01')
    expect(base.safeParse('2023-01-01').success).toBe(true)
    expect(chained.safeParse('2023-01-01').success).toBe(false)
  })

  it('array builders are immutable', () => {
    const base = k.array(k.number()).minLength(2)
    const chained = base.maxLength(5)
    expect(base.safeParse([1, 2, 3, 4, 5, 6]).success).toBe(true)
    expect(chained.safeParse([1, 2, 3, 4, 5, 6]).success).toBe(false)
  })

  it('set builders are immutable', () => {
    const base = k.set(k.number()).minSize(2)
    const chained = base.maxSize(5)
    expect(base.safeParse(new Set([1,2,3,4,5,6])).success).toBe(true)
    expect(chained.safeParse(new Set([1,2,3,4,5,6])).success).toBe(false)
  })

  it('map builders are immutable', () => {
    const base = k.map(k.string(), k.number()).minSize(2)
    const chained = base.maxSize(5)
    expect(base.safeParse(new Map([['a',1],['b',2],['c',3],['d',4],['e',5],['f',6]])).success).toBe(true)
    expect(chained.safeParse(new Map([['a',1],['b',2],['c',3],['d',4],['e',5],['f',6]])).success).toBe(false)
  })

  it('object caseInsensitive returns new instance', () => {
    const base = k.object({ name: k.string() })
    const ci = base.caseInsensitive()
    expect(base.safeParse({ Name: 'John' }).success).toBe(false)
    expect(ci.safeParse({ Name: 'John' }).success).toBe(true)
  })

  it('chaining still works correctly', () => {
    const s = k.string().minLength(3).maxLength(10).email()
    expect(s.safeParse('a@b.co').success).toBe(true)
    expect(s.safeParse('ab').success).toBe(false)
    expect(s.safeParse('a@b.co').success).toBe(true)
  })

  it('email schema parses correctly', () => {
    const s = k.email().domain('example.com')
    expect(s.safeParse('a@example.com').success).toBe(true)
    expect(s.safeParse('a@other.com').success).toBe(false)
  })

  it('base64 schema parses correctly', () => {
    const s = k.base64().minDecodedSize(3)
    expect(s.safeParse('aGVsbG8=').success).toBe(true)
    expect(s.safeParse('AA==').success).toBe(false)
  })

  it('file schema parses correctly', () => {
    const s = k.file().minSize(1024).maxSize(8192)
    const small = { size: 512, originalname: 'x.txt', mimetype: 'text/plain', buffer: Buffer.alloc(512) }
    const good = { size: 2048, originalname: 'x.txt', mimetype: 'text/plain', buffer: Buffer.alloc(2048) }
    expect(s.safeParse(small).success).toBe(false)
    expect(s.safeParse(good).success).toBe(true)
  })

  it('twoDates schema parses correctly', () => {
    const s = k.twoDates()
    expect(s.safeParse('2024-01-01|2024-12-31').success).toBe(true)
    expect(s.safeParse('invalid').success).toBe(false)
  })

  it('object pick returns new instance', () => {
    const base = k.object({ a: k.string(), b: k.number() })
    const picked = base.pick(['a'])
    expect(base.strict().safeParse({ a: 'x', b: 1 }).success).toBe(true)
    expect(picked.strict().safeParse({ a: 'x', b: 1 }).success).toBe(false)
  })

  it('object omit returns new instance', () => {
    const base = k.object({ a: k.string(), b: k.number() })
    const omitted = base.omit(['b'])
    expect(base.strict().safeParse({ a: 'x', b: 1 }).success).toBe(true)
    expect(omitted.strict().safeParse({ a: 'x', b: 1 }).success).toBe(false)
  })

  it('object extend returns new instance', () => {
    const base = k.object({ a: k.string() })
    const extended = base.extend({ b: k.number() })
    expect(base.strict().safeParse({ a: 'x', b: 1 }).success).toBe(false)
    expect(extended.strict().safeParse({ a: 'x', b: 1 }).success).toBe(true)
  })

  it('object merge returns new instance', () => {
    const base = k.object({ a: k.string() })
    const other = k.object({ b: k.number() })
    const merged = base.merge(other)
    expect(base.strict().safeParse({ a: 'x', b: 1 }).success).toBe(false)
    expect(merged.strict().safeParse({ a: 'x', b: 1 }).success).toBe(true)
  })

  it('object partial returns new instance', () => {
    const base = k.object({ a: k.string(), b: k.number() })
    const partial = base.partial()
    expect(base.safeParse({}).success).toBe(false)
    expect(partial.safeParse({}).success).toBe(true)
  })

  it('object strict returns new instance', () => {
    const base = k.object({ a: k.string() })
    const strict = base.strict()
    expect(base.safeParse({ a: 'x', extra: 1 }).success).toBe(true)
    expect(strict.safeParse({ a: 'x', extra: 1 }).success).toBe(false)
  })

  it('object passthrough returns new instance', () => {
    const base = k.object({ a: k.string() }).strict()
    const pt = base.passthrough()
    expect(base.safeParse({ a: 'x', extra: 1 }).success).toBe(false)
    expect(pt.safeParse({ a: 'x', extra: 1 }).success).toBe(true)
  })

  it('object strip returns new instance', () => {
    const base = k.object({ a: k.string() }).passthrough()
    const stripped = base.strip()
    const data = { a: 'x', extra: 1 }
    expect(base.parse(data)).toHaveProperty('extra')
    expect(stripped.parse(data)).not.toHaveProperty('extra')
  })

  it('optional modifier returns new instance', () => {
    const base = k.string()
    const opt = base.optional()
    expect(base.safeParse(undefined).success).toBe(false)
    expect(opt.safeParse(undefined).success).toBe(true)
  })

  it('nullable modifier returns new instance', () => {
    const base = k.string()
    const nullable = base.nullable()
    expect(base.safeParse(null).success).toBe(false)
    expect(nullable.safeParse(null).success).toBe(true)
  })

  it('nullish modifier returns new instance', () => {
    const base = k.string()
    const nullish = base.nullish()
    expect(base.safeParse(null).success).toBe(false)
    expect(nullish.safeParse(null).success).toBe(true)
  })

  it('default modifier returns new instance', () => {
    const base = k.string()
    const dflt = base.default('hello')
    expect(base.safeParse(undefined).success).toBe(false)
    expect(dflt.parse(undefined)).toBe('hello')
  })

  it('catch modifier returns new instance', () => {
    const base = k.string().email()
    const caught = base.catch('fallback@x.com')
    expect(base.safeParse('not-email').success).toBe(false)
    expect(caught.parse('not-email')).toBe('fallback@x.com')
  })

  it('transform modifier returns new instance', () => {
    const base = k.number()
    const transformed = base.transform(x => x.toString())
    expect(base.safeParse(42).success).toBe(true)
    expect(typeof base.parse(42)).toBe('number')
    expect(typeof transformed.parse(42)).toBe('string')
  })

  it('brand modifier returns new instance', () => {
    const base = k.string()
    const branded = base.brand('UserId')
    expect(base.safeParse('abc').success).toBe(true)
    expect(branded.safeParse('abc').success).toBe(true)
  })

  it('refine modifier returns new instance', () => {
    const base = k.number().positive()
    const refined = base.refine(x => x % 2 === 0, 'must be even')
    expect(refined.safeParse(3).success).toBe(false)
    expect(base.safeParse(3).success).toBe(true)
  })

  it('union returns new instance', () => {
    const base = k.union([k.string(), k.number()])
    expect(base.safeParse(true).success).toBe(false)
    expect(base.safeParse('hello').success).toBe(true)
  })

  it('intersection returns new instance', () => {
    const a = k.object({ name: k.string() })
    const b = k.object({ age: k.number() })
    const base = k.intersection([a, b])
    expect(base.safeParse({ name: 'x' }).success).toBe(false)
    expect(base.safeParse({ name: 'x', age: 30 }).success).toBe(true)
  })

  it('discriminatedUnion returns new instance', () => {
    const base = k.discriminatedUnion('type', {
      a: k.object({ type: k.literal('a'), val: k.string() }),
      b: k.object({ type: k.literal('b'), val: k.number() }),
    })
    expect(base.safeParse({ type: 'a', val: 'x' }).success).toBe(true)
    expect(base.safeParse({ type: 'c', val: 'x' }).success).toBe(false)
  })

  it('promise returns new instance', () => {
    const base = k.promise(k.string())
    expect(base.safeParse('hello').success).toBe(false)
    expect(base.safeParse(Promise.resolve('hello')).success).toBe(true)
  })

  it('preprocess returns new instance', () => {
    const fn = (x: unknown) => Number(x)
    const base = k.number()
    const pre = k.preprocess(fn, k.number().positive())
    expect(pre.safeParse('-5').success).toBe(false)
    expect(pre.safeParse('5').success).toBe(true)
  })

  it('custom schema returns new instance', () => {
    const base = k.custom<number>((val, path) =>
      typeof val === 'number' && val > 0 ? val : [{ path, message: 'must be positive' }]
    )
    expect(base.safeParse(5).success).toBe(true)
    expect(base.safeParse(-1).success).toBe(false)
  })

  it('lazy schema returns new instance', () => {
    const base = k.lazy(() => k.string())
    expect(base.safeParse(123).success).toBe(false)
    expect(base.safeParse('hello').success).toBe(true)
  })

  it('modifiers compose immutably', () => {
    const base = k.string().minLength(3)
    const a = base.optional()
    const b = base.nullable()
    const c = base.nullish()
    expect(a.safeParse(undefined).success).toBe(true)
    expect(b.safeParse(undefined).success).toBe(false)
    expect(c.safeParse(undefined).success).toBe(true)
    expect(base.safeParse(undefined).success).toBe(false)
  })
})
