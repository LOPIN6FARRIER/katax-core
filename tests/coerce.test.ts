import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('k.coerce.number()', () => {
  it('coerces string to number', () => {
    const s = k.coerce.number()
    const r = s.safeParse('123')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(123)
  })

  it('coerces boolean to number', () => {
    const s = k.coerce.number()
    expect(s.safeParse(true).success).toBe(true)
    expect(s.safeParse(false).success).toBe(true)
  })

  it('rejects empty string', () => {
    expect(k.coerce.number().safeParse('').success).toBe(false)
  })

  it('rejects non-numeric string', () => {
    expect(k.coerce.number().safeParse('abc').success).toBe(false)
  })
})

describe('k.coerce.number().positive().integer() chained', () => {
  it('coerces then validates', () => {
    const s = k.coerce.number().positive().integer()
    expect(s.safeParse('42').success).toBe(true)
    expect(s.safeParse('-5').success).toBe(false)
    expect(s.safeParse('3.14').success).toBe(false)
  })
})

describe('k.coerce.boolean()', () => {
  it('coerces truthy strings to true', () => {
    const s = k.coerce.boolean()
    expect(s.safeParse('true').success).toBe(true)
    expect(s.safeParse('1').success).toBe(true)
    expect(s.safeParse('yes').success).toBe(true)
    expect(s.safeParse('on').success).toBe(true)
  })

  it('coerces falsy strings to false', () => {
    const s = k.coerce.boolean()
    expect(s.safeParse('false').success).toBe(true)
    expect(s.safeParse('0').success).toBe(true)
    expect(s.safeParse('no').success).toBe(true)
    expect(s.safeParse('off').success).toBe(true)
  })

  it('coerces numbers to boolean', () => {
    const s = k.coerce.boolean()
    expect(s.safeParse(1).success).toBe(true)
    expect(s.safeParse(0).success).toBe(true)
  })

  it('rejects invalid boolean string', () => {
    expect(k.coerce.boolean().safeParse('invalid').success).toBe(false)
  })
})

describe('k.coerce.string()', () => {
  it('coerces number to string', () => {
    const s = k.coerce.string()
    const r = s.safeParse(123)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('123')
  })

  it('coerces boolean to string', () => {
    const s = k.coerce.string()
    expect(s.safeParse(true).success).toBe(true)
    expect(s.safeParse(false).success).toBe(true)
  })

  it('coerces null to empty string', () => {
    const s = k.coerce.string()
    const r = s.safeParse(null)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('')
  })

  it('coerces undefined to empty string', () => {
    const s = k.coerce.string()
    const r = s.safeParse(undefined)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('')
  })
})

describe('k.coerce.date()', () => {
  it('coerces ISO string to Date', () => {
    const s = k.coerce.date()
    const r = s.safeParse('2024-01-15')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeInstanceOf(Date)
  })

  it('coerces timestamp number to Date', () => {
    const s = k.coerce.date()
    const r = s.safeParse(1705276800000)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeInstanceOf(Date)
  })

  it('rejects invalid date string', () => {
    expect(k.coerce.date().safeParse('not-a-date').success).toBe(false)
  })
})

describe('proxy methods on coerced schemas', () => {
  it('number proxy methods work (min, max, positive, integer)', () => {
    const s = k.coerce.number().positive().integer()
    expect(s.safeParse('10').success).toBe(true)
    expect(s.safeParse('-1').success).toBe(false)
    expect(s.safeParse('3.5').success).toBe(false)
  })

  it('string proxy methods work (minLength, email)', () => {
    const s = k.coerce.string().minLength(3)
    expect(s.safeParse('ab').success).toBe(false)
    expect(s.safeParse('abc').success).toBe(true)
  })
})

describe('k.preprocess()', () => {
  it('transforms input before validation', () => {
    const s = k.preprocess(
      (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
      k.string()
    )
    const r = s.safeParse('  HELLO  ')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('hello')
  })
})

describe('coerce + catch combined', () => {
  it('catches failed coercion with fallback', () => {
    const s = k.coerce.number().positive().catch(0)
    expect(s.safeParse('invalid').success).toBe(true)
    expect(s.safeParse('-5').success).toBe(true)
    expect(s.safeParse('42').success).toBe(true)
  })
})

describe('k.coerce.date() proxy methods', () => {
  it('.format() is chainable and validates format', () => {
    const s = k.coerce.date().format('yyyy-MM-dd')
    expect(s.safeParse('2024-01-15').success).toBe(true)
    expect(s.safeParse('01/15/2024').success).toBe(false)
  })

  it('.isDateOnly() rejects datetime strings', () => {
    const s = k.coerce.date().isDateOnly()
    expect(s.safeParse('2024-01-15').success).toBe(true)
    expect(s.safeParse('2024-01-15T10:00:00').success).toBe(false)
  })

  it('.hasTime() requires time component', () => {
    const s = k.coerce.date().hasTime()
    expect(s.safeParse('2024-01-15T10:00:00').success).toBe(true)
    expect(s.safeParse('2024-01-15').success).toBe(false)
  })

  it('.formatOutput() transforms Date to formatted string', () => {
    const s = k.coerce.date().formatOutput('yyyy-MM-dd')
    const r = s.safeParse('2024-01-15')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('2024-01-15')
  })

  it('chaining isDateOnly().format() works', () => {
    const s = k.coerce.date().isDateOnly().format('yyyy-MM-dd')
    expect(s.safeParse('2024-01-15').success).toBe(true)
    expect(s.safeParse('2024-01-15T10:00:00').success).toBe(false)
    expect(s.safeParse('01/15/2024').success).toBe(false)
  })

  it('proxy methods do not break normal coercion', () => {
    const s = k.coerce.date()
    expect(s.safeParse(1705276800000).success).toBe(true)
    expect(s.safeParse(new Date('2024-01-15')).success).toBe(true)
    expect(s.safeParse('not-a-date').success).toBe(false)
  })
})
