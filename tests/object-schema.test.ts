import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('ObjectSchema', () => {
  it('validates basic objects', () => {
    const schema = k.object({ name: k.string(), age: k.number() })
    const result = schema.safeParse({ name: 'John', age: 30 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
    }
  })

  it('fails for non-object input', () => {
    const schema = k.object({ name: k.string() })
    expect(schema.safeParse('string').success).toBe(false)
    expect(schema.safeParse(123).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
    expect(schema.safeParse(undefined).success).toBe(false)
    expect(schema.safeParse([1, 2]).success).toBe(false)
  })

  it('required fields must be present', () => {
    const schema = k.object({ name: k.string(), age: k.number() })
    expect(schema.safeParse({ name: 'John' }).success).toBe(false)
  })

  it('extra keys are silently stripped', () => {
    const schema = k.object({ name: k.string() })
    const result = schema.safeParse({ name: 'John', extra: 'should be stripped' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'John' })
      expect((result.data as any).extra).toBeUndefined()
    }
  })

  it('strict() rejects extra keys', () => {
    const schema = k.object({ name: k.string() }).strict()
    expect(schema.safeParse({ name: 'John', extra: 'bad' }).success).toBe(false)
    expect(schema.safeParse({ name: 'John' }).success).toBe(true)
  })

  it('passthrough() allows extra keys', () => {
    const schema = k.object({ name: k.string() }).passthrough()
    const result = schema.safeParse({ name: 'John', extra: 'ok' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'John', extra: 'ok' })
    }
  })

  it('partial() makes all fields optional', () => {
    const schema = k.object({ name: k.string(), age: k.number() }).partial()
    expect(schema.safeParse({}).success).toBe(true)
    expect(schema.safeParse({ name: 'John' }).success).toBe(true)
    expect(schema.safeParse({ name: 'John', age: 30 }).success).toBe(true)
    expect(schema.safeParse({ name: 123 }).success).toBe(false)
  })

  it('pick() selects specific keys', () => {
    const schema = k.object({ name: k.string(), age: k.number(), email: k.string() }).pick(['name', 'email'])
    const result = schema.safeParse({ name: 'John', email: 'john@test.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'John', email: 'john@test.com' })
    }
    expect(schema.safeParse({ name: 'John', age: 30 }).success).toBe(false)
  })

  it('omit() removes specific keys', () => {
    const schema = k.object({ name: k.string(), age: k.number(), email: k.string() }).omit(['email'])
    const result = schema.safeParse({ name: 'John', age: 30 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect('email' in result.data).toBe(false)
    }
  })

  it('extend() adds new fields', () => {
    const base = k.object({ id: k.number() })
    const extended = base.extend({ name: k.string() })
    const result = extended.safeParse({ id: 1, name: 'John' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 1, name: 'John' })
    }
  })

  it('extend() overrides existing fields', () => {
    const base = k.object({ id: k.number(), name: k.string() })
    const extended = base.extend({ name: k.string().minLength(5) })
    expect(extended.safeParse({ id: 1, name: 'John' }).success).toBe(false)
    expect(extended.safeParse({ id: 1, name: 'Jonathan' }).success).toBe(true)
  })

  it('merge() combines two schemas', () => {
    const schemaA = k.object({ id: k.number(), name: k.string() })
    const schemaB = k.object({ email: k.string() })
    const merged = schemaA.merge(schemaB)
    const result = merged.safeParse({ id: 1, name: 'John', email: 'john@test.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 1, name: 'John', email: 'john@test.com' })
    }
  })

  it('caseInsensitive() matches keys regardless of case', () => {
    const schema = k.object({ name: k.string(), age: k.number() }).caseInsensitive()
    expect(schema.safeParse({ NAME: 'John', Age: 30 }).success).toBe(true)
    expect(schema.safeParse({ name: 'John', AGE: 30 }).success).toBe(true)
  })

  it('getShape() returns the raw shape', () => {
    const shape = { name: k.string(), age: k.number() }
    const schema = k.object(shape)
    expect(schema.getShape()).toStrictEqual(shape)
  })

  it('validates nested objects', () => {
    const schema = k.object({
      user: k.object({
        name: k.string(),
        address: k.object({
          city: k.string(),
          zip: k.string()
        })
      })
    })
    expect(schema.safeParse({ user: { name: 'John', address: { city: 'NYC', zip: '10001' } } }).success).toBe(true)
    expect(schema.safeParse({ user: { name: 'John', address: { city: 'NYC' } } }).success).toBe(false)
  })

  it('optional fields pass when undefined', () => {
    const schema = k.object({ name: k.string(), age: k.number().optional() })
    expect(schema.safeParse({ name: 'John' }).success).toBe(true)
    expect(schema.safeParse({ name: 'John', age: 25 }).success).toBe(true)
  })

  it('nullable fields accept null', () => {
    const schema = k.object({ name: k.string(), bio: k.string().nullable() })
    expect(schema.safeParse({ name: 'John', bio: null }).success).toBe(true)
    expect(schema.safeParse({ name: 'John', bio: 'Hello' }).success).toBe(true)
    expect(schema.safeParse({ name: 'John', bio: 123 }).success).toBe(false)
  })

  it('custom error messages via field validation', () => {
    const schema = k.object({
      name: k.string().minLength(2, 'Name too short'),
      age: k.number().min(18, 'Must be adult')
    })
    const result = schema.safeParse({ name: 'J', age: 15 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.some(i => i.message === 'Name too short')).toBe(true)
      expect(result.issues.some(i => i.message === 'Must be adult')).toBe(true)
    }
  })

  it('reports field-level issues with correct paths', () => {
    const schema = k.object({ name: k.string(), age: k.number() })
    const result = schema.safeParse({ name: 123, age: 'not a number' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.some(i => i.path.includes('name'))).toBe(true)
      expect(result.issues.some(i => i.path.includes('age'))).toBe(true)
    }
  })
})

describe('toJsonSchema()', () => {
  it('returns json schema for simple object', () => {
    const schema = k.object({ name: k.string(), age: k.number() })
    expect(schema.toJsonSchema()).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      },
      required: ['name', 'age']
    })
  })
  it('optional fields omitted from required', () => {
    const schema = k.object({ name: k.string(), age: k.number().optional() })
    expect(schema.toJsonSchema()).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      },
      required: ['name']
    })
  })
  it('preserves description through partial()', () => {
    const schema = k.object({ name: k.string() }).describe('user object').partial()
    expect(schema.toJsonSchema().description).toBe('user object')
  })
  it('preserves description through pick()', () => {
    const schema = k.object({ name: k.string(), age: k.number() }).describe('picked').pick(['name'])
    expect(schema.toJsonSchema().description).toBe('picked')
  })
  it('preserves description through omit()', () => {
    const schema = k.object({ name: k.string(), age: k.number() }).describe('omitted').omit(['age'])
    expect(schema.toJsonSchema().description).toBe('omitted')
  })
  it('preserves description through passthrough()', () => {
    const schema = k.object({ name: k.string() }).describe('passthrough obj').passthrough()
    expect(schema.toJsonSchema().description).toBe('passthrough obj')
  })
})
