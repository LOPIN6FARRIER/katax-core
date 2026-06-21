import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

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
})
