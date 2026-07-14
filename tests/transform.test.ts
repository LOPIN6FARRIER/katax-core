import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('basic transforms', () => {
  it('uppercases a string', () => {
    const s = k.string().transform(v => v.toUpperCase())
    const r = s.safeParse('hello')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('HELLO')
  })

  it('rounds a number', () => {
    const s = k.number().transform(v => Math.round(v))
    const r = s.safeParse(3.7)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(4)
  })

  it('formats currency string', () => {
    const s = k.number().transform(v => `$${v.toFixed(2)}`)
    const r = s.safeParse(99.9)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('$99.90')
  })
})

describe('transform with validations', () => {
  it('fails validation before reaching transform', () => {
    const s = k.number().positive().transform(v => v * 2)
    expect(s.safeParse(-5).success).toBe(false)
    expect(s.safeParse('abc').success).toBe(false)
  })

  it('transforms only after validation passes', () => {
    const s = k.number().min(0).max(100).transform(v => v / 100)
    const r = s.safeParse(75)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(0.75)
  })
})

describe('transform in objects', () => {
  it('transforms fields inside an object', () => {
    const s = k.object({
      name: k.string().transform(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()),
      email: k.string().email().transform(v => v.toLowerCase()),
    })
    const r = s.safeParse({ name: 'john', email: 'John@Example.COM' })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.name).toBe('John')
      expect(r.data.email).toBe('john@example.com')
    }
  })
})

describe('chained transforms', () => {
  it('chains multiple transforms', () => {
    const s = k.string()
      .transform(v => v.trim())
      .transform(v => v.toUpperCase())
    const r = s.safeParse('  hello  ')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('HELLO')
  })

  it('applies transforms sequentially', () => {
    const s = k.number()
      .positive()
      .transform(v => v.toFixed(2))
      .transform(v => `$${v}`)
    const r = s.safeParse(99.9)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('$99.90')
  })
})

describe('complex transforms', () => {
  it('parses a JSON string', () => {
    const s = k.string().transform(v => JSON.parse(v))
    const r = s.safeParse('{"name":"John"}')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ name: 'John' })
  })

  it('extracts domain from email', () => {
    const s = k.string().email().transform(v => v.split('@')[1])
    const r = s.safeParse('user@example.com')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('example.com')
  })

  it('slugifies a string', () => {
    const s = k.string().minLength(1).transform(v =>
      v.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    )
    const r = s.safeParse('Hello World!')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('hello-world')
  })
})

describe('toJsonSchema()', () => {
  it('transform schema delegates to inner schema', () => {
    const schema = k.string().transform(v => v.toUpperCase())
    expect(schema.toJsonSchema()).toEqual({ type: 'string' })
  })
  it('preserves inner schema constraints', () => {
    const schema = k.string().minLength(3).email().transform(v => v.trim())
    expect(schema.toJsonSchema()).toEqual({ type: 'string', minLength: 3, format: 'email' })
  })
  it('includes description through transform', () => {
    const schema = k.number().describe('rounded').transform(v => Math.round(v))
    expect(schema.toJsonSchema().description).toBe('rounded')
  })
})
