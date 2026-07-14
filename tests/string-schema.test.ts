import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('StringSchema', () => {
  it('validates strings', () => {
    const s = k.string()
    expect(s.safeParse('hello').success).toBe(true)
    expect(s.safeParse(123).success).toBe(false)
  })

  it('minLength', () => {
    expect(k.string().minLength(3).safeParse('ab').success).toBe(false)
    expect(k.string().minLength(3).safeParse('abc').success).toBe(true)
  })

  it('maxLength', () => {
    expect(k.string().maxLength(3).safeParse('abcd').success).toBe(false)
    expect(k.string().maxLength(3).safeParse('abc').success).toBe(true)
  })

  it('length', () => {
    expect(k.string().length(3).safeParse('ab').success).toBe(false)
    expect(k.string().length(3).safeParse('abc').success).toBe(true)
  })

  it('nonempty / notEmpty (alias)', () => {
    const s = k.string().nonempty()
    expect(s.safeParse('').success).toBe(false)
    expect(s.safeParse('x').success).toBe(true)

    const s2 = k.string().notEmpty()
    expect(s2.safeParse('').success).toBe(false)
  })

  it('email', () => {
    const s = k.string().email()
    expect(s.safeParse('test@example.com').success).toBe(true)
    expect(s.safeParse('not-an-email').success).toBe(false)
  })

  it('url', () => {
    const s = k.string().url()
    expect(s.safeParse('https://example.com').success).toBe(true)
    expect(s.safeParse('not-a-url').success).toBe(false)
  })

  it('uuid', () => {
    const s = k.string().uuid()
    expect(s.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true)
    expect(s.safeParse('not-a-uuid').success).toBe(false)
  })

  it('regex', () => {
    const s = k.string().regex(/^[A-Z]+$/)
    expect(s.safeParse('HELLO').success).toBe(true)
    expect(s.safeParse('hello').success).toBe(false)
  })

  it('startsWith / endsWith', () => {
    expect(k.string().startsWith('hello').safeParse('hello world').success).toBe(true)
    expect(k.string().startsWith('hello').safeParse('world').success).toBe(false)
    expect(k.string().endsWith('world').safeParse('hello world').success).toBe(true)
  })

  it('includes', () => {
    const s = k.string().includes('test')
    expect(s.safeParse('this is a test').success).toBe(true)
    expect(s.safeParse('no match').success).toBe(false)
  })

  it('lowercase / uppercase', () => {
    expect(k.string().lowercase().safeParse('hello').success).toBe(true)
    expect(k.string().lowercase().safeParse('Hello').success).toBe(false)
    expect(k.string().uppercase().safeParse('HELLO').success).toBe(true)
  })

  it('alpha / alphanumeric', () => {
    expect(k.string().alpha().safeParse('abc').success).toBe(true)
    expect(k.string().alpha().safeParse('abc123').success).toBe(false)
    expect(k.string().alphanumeric().safeParse('abc123').success).toBe(true)
  })

  it('noWhitespace', () => {
    expect(k.string().noWhitespace().safeParse('hello').success).toBe(true)
    expect(k.string().noWhitespace().safeParse('hello world').success).toBe(false)
  })

  it('oneOf / notOneOf', () => {
    expect(k.string().oneOf(['a', 'b']).safeParse('a').success).toBe(true)
    expect(k.string().oneOf(['a', 'b']).safeParse('c').success).toBe(false)
    expect(k.string().notOneOf(['a', 'b']).safeParse('c').success).toBe(true)
  })

  it('ip', () => {
    const s = k.string().ip()
    expect(s.safeParse('192.168.1.1').success).toBe(true)
    expect(s.safeParse('999.999.999.999').success).toBe(false) // out of range
    expect(s.safeParse('0.0.0.0').success).toBe(true)
    expect(s.safeParse('255.255.255.255').success).toBe(true)
    expect(s.safeParse('not-an-ip').success).toBe(false)
  })

  it('trim', () => {
    expect(k.string().trim().safeParse('hello').success).toBe(true)
    expect(k.string().trim().safeParse(' hello ').success).toBe(false)
  })

  it('datetime', () => {
    const s = k.string().datetime()
    expect(s.safeParse('2024-01-15T10:30:00Z').success).toBe(true)
    expect(s.safeParse('2024-01-15T10:30:00.123Z').success).toBe(true)
    expect(s.safeParse('2024-01-15T10:30:00+05:00').success).toBe(true)
    expect(s.safeParse('2024-01-15').success).toBe(false)
    expect(s.safeParse('not-a-date').success).toBe(false)
  })

  it('jwt', () => {
    const s = k.string().jwt()
    expect(s.safeParse('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dB2E3x_jZqJlQqKJfMGLpQ7aPs2ylpymhHMs6QYr4Co').success).toBe(true)
    expect(s.safeParse('not-a-jwt').success).toBe(false)
  })

  it('cuid2', () => {
    const s = k.string().cuid2()
    expect(s.safeParse('clhxq6m8n0000g5hxq6m8n000').success).toBe(true)
    expect(s.safeParse('a1b2c3d4').success).toBe(true)
    expect(s.safeParse('').success).toBe(false)
    expect(s.safeParse('ABC123').success).toBe(false)
  })

  it('ulid', () => {
    const s = k.string().ulid()
    expect(s.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAV').success).toBe(true)
    expect(s.safeParse('not-a-ulid').success).toBe(false)
    expect(s.safeParse('').success).toBe(false)
  })

  it('emoji', () => {
    const s = k.string().emoji()
    expect(s.safeParse('😀').success).toBe(true)
    expect(s.safeParse('🎉🚀').success).toBe(true)
    expect(s.safeParse('hello 😀').success).toBe(false) // mixed content
    expect(s.safeParse('just text').success).toBe(false)
  })

  it('cidr', () => {
    const s = k.string().cidr()
    expect(s.safeParse('192.168.1.0/24').success).toBe(true)
    expect(s.safeParse('10.0.0.0/8').success).toBe(true)
    expect(s.safeParse('not-a-cidr').success).toBe(false)
    expect(s.safeParse('256.1.2.3/24').success).toBe(false)
    expect(s.safeParse('192.168.1.0/33').success).toBe(false)
  })

  describe('toJsonSchema()', () => {
    it('returns { type: "string" }', () => {
      expect(k.string().toJsonSchema()).toEqual({ type: 'string' })
    })

    it('respects minLength().maxLength()', () => {
      expect(k.string().minLength(3).maxLength(10).toJsonSchema()).toEqual({ type: 'string', minLength: 3, maxLength: 10 })
    })

    it('email() sets format: "email"', () => {
      expect(k.string().email().toJsonSchema()).toEqual({ type: 'string', format: 'email' })
    })

    it('length() sets both minLength and maxLength', () => {
      expect(k.string().length(5).toJsonSchema()).toEqual({ type: 'string', minLength: 5, maxLength: 5 })
    })

    it('includes description from describe()', () => {
      expect(k.string().describe('desc').toJsonSchema()).toEqual({ type: 'string', description: 'desc' })
    })
  })
})
