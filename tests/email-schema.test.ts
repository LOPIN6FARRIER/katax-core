import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('EmailSchema', () => {
  it('accepts valid emails', () => {
    const schema = k.email()
    expect(schema.safeParse('user@example.com').success).toBe(true)
    expect(schema.safeParse('user.name@example.com').success).toBe(true)
    expect(schema.safeParse('user+tag@example.com').success).toBe(true)
    expect(schema.safeParse('user@subdomain.example.com').success).toBe(true)
  })

  it('rejects invalid emails', () => {
    const schema = k.email()
    expect(schema.safeParse('not-an-email').success).toBe(false)
    expect(schema.safeParse('@example.com').success).toBe(false)
    expect(schema.safeParse('user@').success).toBe(false)
    expect(schema.safeParse('user@.com').success).toBe(false)
  })

  it('rejects non-string input', () => {
    const schema = k.email()
    expect(schema.safeParse(123).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it('domain() restricts to a specific domain', () => {
    const schema = k.email().domain('company.com')
    expect(schema.safeParse('user@company.com').success).toBe(true)
    expect(schema.safeParse('user@gmail.com').success).toBe(false)
  })

  it('domain() is case insensitive', () => {
    const schema = k.email().domain('Company.COM')
    expect(schema.safeParse('user@company.com').success).toBe(true)
    expect(schema.safeParse('user@COMPANY.COM').success).toBe(true)
  })

  it('domains() allows multiple domains', () => {
    const schema = k.email().domains(['company.com', 'org.com'])
    expect(schema.safeParse('user@company.com').success).toBe(true)
    expect(schema.safeParse('user@org.com').success).toBe(true)
    expect(schema.safeParse('user@gmail.com').success).toBe(false)
  })

  it('domainPattern() matches wildcard patterns', () => {
    const schema = k.email().domainPattern('*.company.com')
    expect(schema.safeParse('user@company.com').success).toBe(true)
    expect(schema.safeParse('user@sub.company.com').success).toBe(true)
    expect(schema.safeParse('user@gmail.com').success).toBe(false)
  })

  it('corporate() blocks free email providers', () => {
    const schema = k.email().corporate()
    expect(schema.safeParse('user@company.com').success).toBe(true)
    expect(schema.safeParse('user@gmail.com').success).toBe(false)
    expect(schema.safeParse('user@yahoo.com').success).toBe(false)
    expect(schema.safeParse('user@hotmail.com').success).toBe(false)
  })

  it('notDomains() blocks specific domains', () => {
    const schema = k.email().notDomains(['spam.com', 'temp-mail.org'])
    expect(schema.safeParse('user@good.com').success).toBe(true)
    expect(schema.safeParse('user@spam.com').success).toBe(false)
    expect(schema.safeParse('user@temp-mail.org').success).toBe(false)
  })

  it('localMinLength()', () => {
    const schema = k.email().localMinLength(5)
    expect(schema.safeParse('abcde@example.com').success).toBe(true)
    expect(schema.safeParse('ab@example.com').success).toBe(false)
  })

  it('localMaxLength()', () => {
    const schema = k.email().localMaxLength(5)
    expect(schema.safeParse('ab@example.com').success).toBe(true)
    expect(schema.safeParse('abcdef@example.com').success).toBe(false)
  })

  it('localPattern()', () => {
    const schema = k.email().localPattern(/^[a-z]+$/)
    expect(schema.safeParse('john@example.com').success).toBe(true)
    expect(schema.safeParse('john123@example.com').success).toBe(false)
  })

  it('noPlus() rejects plus addressing', () => {
    const schema = k.email().noPlus()
    expect(schema.safeParse('user@example.com').success).toBe(true)
    expect(schema.safeParse('user+spam@example.com').success).toBe(false)
  })

  it('noDots() rejects dots in username', () => {
    const schema = k.email().noDots()
    expect(schema.safeParse('user@example.com').success).toBe(true)
    expect(schema.safeParse('user.name@example.com').success).toBe(false)
  })

  it('chaining multiple rules', () => {
    const schema = k.email().domain('company.com').localMinLength(3).noPlus()
    expect(schema.safeParse('user@company.com').success).toBe(true)
    expect(schema.safeParse('ab@company.com').success).toBe(false)
    expect(schema.safeParse('user+tag@company.com').success).toBe(false)
    expect(schema.safeParse('user@gmail.com').success).toBe(false)
  })

  it('optional() accepts undefined', () => {
    expect(k.email().optional().safeParse(undefined).success).toBe(true)
  })

  it('nullable() accepts null', () => {
    expect(k.email().nullable().safeParse(null).success).toBe(true)
  })

  it('toJsonSchema() returns string with email format', () => {
    const result = k.email().toJsonSchema()
    expect(result).toEqual({ type: 'string', format: 'email' })
  })

  it('toJsonSchema() with describe() includes description', () => {
    const result = k.email().describe('user email').toJsonSchema()
    expect(result).toEqual({ type: 'string', format: 'email', description: 'user email' })
  })

  it('toJsonSchema() domain() chain does not affect format', () => {
    const result = k.email().domain('company.com').toJsonSchema()
    expect(result).toEqual({ type: 'string', format: 'email' })
  })
})
