import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('refine()', () => {
  it('passes valid values', () => {
    const even = k.number().refine((n) => n % 2 === 0)
    expect(even.safeParse(4).success).toBe(true)
  })

  it('rejects values that fail refinement', () => {
    const even = k.number().refine((n) => n % 2 === 0)
    expect(even.safeParse(3).success).toBe(false)
  })

  it('works with strings', () => {
    const noBob = k.string().refine((s) => s !== 'bob')
    expect(noBob.safeParse('alice').success).toBe(true)
    expect(noBob.safeParse('bob').success).toBe(false)
  })
})
