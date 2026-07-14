import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('k.bigint()', () => {
  it('parses a bigint value', () => {
    const r = k.bigint().safeParse(42n)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(42n)
  })

  it('rejects non-bigint values', () => {
    expect(k.bigint().safeParse('not-bigint').success).toBe(false)
    expect(k.bigint().safeParse(42).success).toBe(false)
    expect(k.bigint().safeParse(null).success).toBe(false)
  })
})

describe('k.bigint().positive()', () => {
  it('accepts positive bigint', () => {
    expect(k.bigint().positive().safeParse(5n).success).toBe(true)
  })

  it('rejects zero', () => {
    expect(k.bigint().positive().safeParse(0n).success).toBe(false)
  })

  it('rejects negative bigint', () => {
    expect(k.bigint().positive().safeParse(-5n).success).toBe(false)
  })
})

describe('k.bigint().negative()', () => {
  it('accepts negative bigint', () => {
    expect(k.bigint().negative().safeParse(-5n).success).toBe(true)
  })

  it('rejects zero', () => {
    expect(k.bigint().negative().safeParse(0n).success).toBe(false)
  })

  it('rejects positive bigint', () => {
    expect(k.bigint().negative().safeParse(5n).success).toBe(false)
  })
})

describe('k.bigint().nonnegative()', () => {
  it('accepts zero', () => {
    expect(k.bigint().nonnegative().safeParse(0n).success).toBe(true)
  })

  it('accepts positive', () => {
    expect(k.bigint().nonnegative().safeParse(5n).success).toBe(true)
  })

  it('rejects negative', () => {
    expect(k.bigint().nonnegative().safeParse(-5n).success).toBe(false)
  })
})

describe('k.bigint().nonpositive()', () => {
  it('accepts zero', () => {
    expect(k.bigint().nonpositive().safeParse(0n).success).toBe(true)
  })

  it('accepts negative', () => {
    expect(k.bigint().nonpositive().safeParse(-5n).success).toBe(true)
  })

  it('rejects positive', () => {
    expect(k.bigint().nonpositive().safeParse(5n).success).toBe(false)
  })
})

describe('k.bigint().min() / .max()', () => {
  it('min accepts values at or above threshold', () => {
    const s = k.bigint().min(10n)
    expect(s.safeParse(10n).success).toBe(true)
    expect(s.safeParse(20n).success).toBe(true)
    expect(s.safeParse(9n).success).toBe(false)
  })

  it('max accepts values at or below threshold', () => {
    const s = k.bigint().max(10n)
    expect(s.safeParse(10n).success).toBe(true)
    expect(s.safeParse(5n).success).toBe(true)
    expect(s.safeParse(11n).success).toBe(false)
  })
})

describe('k.bigint().notEqual()', () => {
  it('rejects the forbidden value', () => {
    expect(k.bigint().notEqual(3n).safeParse(3n).success).toBe(false)
  })

  it('accepts other values', () => {
    expect(k.bigint().notEqual(3n).safeParse(1n).success).toBe(true)
    expect(k.bigint().notEqual(3n).safeParse(5n).success).toBe(true)
  })
})

describe('k.bigint().greaterThan()', () => {
  it('accepts values greater than threshold', () => {
    expect(k.bigint().greaterThan(5n).safeParse(10n).success).toBe(true)
  })

  it('rejects values equal to threshold', () => {
    expect(k.bigint().greaterThan(5n).safeParse(5n).success).toBe(false)
  })

  it('rejects values less than threshold', () => {
    expect(k.bigint().greaterThan(5n).safeParse(3n).success).toBe(false)
  })
})

describe('k.bigint().lessThan()', () => {
  it('accepts values less than threshold', () => {
    expect(k.bigint().lessThan(5n).safeParse(3n).success).toBe(true)
  })

  it('rejects values equal to threshold', () => {
    expect(k.bigint().lessThan(5n).safeParse(5n).success).toBe(false)
  })

  it('rejects values greater than threshold', () => {
    expect(k.bigint().lessThan(5n).safeParse(10n).success).toBe(false)
  })
})

describe('k.bigint().between()', () => {
  it('accepts values within range', () => {
    expect(k.bigint().between(10n, 20n).safeParse(15n).success).toBe(true)
  })

  it('rejects values below range', () => {
    expect(k.bigint().between(10n, 20n).safeParse(9n).success).toBe(false)
  })

  it('rejects values above range', () => {
    expect(k.bigint().between(10n, 20n).safeParse(21n).success).toBe(false)
  })
})

describe('k.bigint().multipleOf()', () => {
  it('accepts multiples', () => {
    expect(k.bigint().multipleOf(3n).safeParse(9n).success).toBe(true)
    expect(k.bigint().multipleOf(3n).safeParse(0n).success).toBe(true)
    expect(k.bigint().multipleOf(3n).safeParse(-6n).success).toBe(true)
  })

  it('rejects non-multiples', () => {
    expect(k.bigint().multipleOf(3n).safeParse(10n).success).toBe(false)
  })
})

describe('k.bigint().equals()', () => {
  it('accepts exact match', () => {
    expect(k.bigint().equals(42n).safeParse(42n).success).toBe(true)
  })

  it('rejects different value', () => {
    expect(k.bigint().equals(42n).safeParse(43n).success).toBe(false)
  })
})

describe('k.bigint().oneOf() / .notOneOf()', () => {
  it('accepts values in the list', () => {
    expect(k.bigint().oneOf([1n, 2n, 3n]).safeParse(2n).success).toBe(true)
  })

  it('rejects values not in the list', () => {
    expect(k.bigint().oneOf([1n, 2n, 3n]).safeParse(4n).success).toBe(false)
  })

  it('notOneOf rejects values in the list', () => {
    expect(k.bigint().notOneOf([1n, 2n, 3n]).safeParse(2n).success).toBe(false)
  })
})

describe('k.bigint() chained constraints', () => {
  it('applies multiple constraints correctly', () => {
    const s = k.bigint().positive().min(10n).max(100n).multipleOf(5n)
    expect(s.safeParse(50n).success).toBe(true)
    expect(s.safeParse(25n).success).toBe(true)
    expect(s.safeParse(9n).success).toBe(false)
    expect(s.safeParse(101n).success).toBe(false)
    expect(s.safeParse(12n).success).toBe(false)
    expect(s.safeParse(-5n).success).toBe(false)
  })
})

describe('k.bigint().toJsonSchema()', () => {
  it('returns { type: "integer" }', () => {
    expect(k.bigint().toJsonSchema()).toEqual({ type: 'integer' })
  })

  it('positive() sets exclusiveMinimum: 0', () => {
    expect(k.bigint().positive().toJsonSchema()).toEqual({ type: 'integer', exclusiveMinimum: 0 })
  })

  it('negative() sets exclusiveMaximum: 0', () => {
    expect(k.bigint().negative().toJsonSchema()).toEqual({ type: 'integer', exclusiveMaximum: 0 })
  })

  it('min().max() translates to minimum/maximum', () => {
    expect(k.bigint().min(10n).max(100n).toJsonSchema()).toEqual({ type: 'integer', minimum: 10, maximum: 100 })
  })

  it('greaterThan().lessThan() translates to exclusiveMinimum/exclusiveMaximum', () => {
    expect(k.bigint().greaterThan(5n).lessThan(10n).toJsonSchema()).toEqual({ type: 'integer', exclusiveMinimum: 5, exclusiveMaximum: 10 })
  })

  it('multipleOf() translates to multipleOf', () => {
    expect(k.bigint().multipleOf(3n).toJsonSchema()).toEqual({ type: 'integer', multipleOf: 3 })
  })

  it('includes description from describe()', () => {
    expect(k.bigint().describe('big').toJsonSchema()).toEqual({ type: 'integer', description: 'big' })
  })
})
