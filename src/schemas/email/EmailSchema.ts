import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type ValidationRule = {
  check: (email: string) => boolean
  message: string
}

export class EmailSchema extends BaseSchema<string> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | string {
    if (typeof input !== "string") {
      return [{ path, message: "Expected string" }]
    }

    // Basic email validation
    if (!this.isValidEmail(input)) {
      return [{ path, message: "Invalid email format" }]
    }

    const issues: Issue[] = []
    for (const rule of this.rules) {
      if (!rule.check(input)) {
        issues.push({ path, message: rule.message })
      }
    }

    if (issues.length > 0) {
      return issues
    }

    return input
  }

  // Domain validation
  domain(allowedDomain: string, message?: string): this {
    this.rules.push({
      check: (email) => {
        const domain = email.split('@')[1]?.toLowerCase()
        return domain === allowedDomain.toLowerCase()
      },
      message: message ?? `Email must be from domain ${allowedDomain}`,
    })
    return this
  }

  // Multiple domains
  domains(allowedDomains: string[], message?: string): this {
    const lowerDomains = allowedDomains.map(d => d.toLowerCase())
    this.rules.push({
      check: (email) => {
        const domain = email.split('@')[1]?.toLowerCase()
        return domain ? lowerDomains.includes(domain) : false
      },
      message: message ?? `Email must be from one of these domains: ${allowedDomains.join(", ")}`,
    })
    return this
  }

  // Domain pattern (e.g., "*.company.com")
  domainPattern(pattern: string, message?: string): this {
    // Convert pattern to regex - handle wildcard at beginning correctly
    let regexPattern = pattern.replace(/\./g, '\\.')
    if (pattern.startsWith('*.')) {
      // For *.domain.com, allow both domain.com and anything.domain.com
      const domain = pattern.substring(2) // Remove "*."
      regexPattern = `(.*\\.)?${domain.replace(/\./g, '\\.')}`
    } else {
      regexPattern = regexPattern.replace(/\*/g, '.*')
    }
    
    const regex = new RegExp(`^${regexPattern}$`, 'i')
    
    this.rules.push({
      check: (email) => {
        const domain = email.split('@')[1]
        return domain ? regex.test(domain) : false
      },
      message: message ?? `Email domain must match pattern ${pattern}`,
    })
    return this
  }

  // Blacklist domains
  notDomains(blacklistedDomains: string[], message?: string): this {
    const lowerDomains = blacklistedDomains.map(d => d.toLowerCase())
    this.rules.push({
      check: (email) => {
        const domain = email.split('@')[1]?.toLowerCase()
        return domain ? !lowerDomains.includes(domain) : true
      },
      message: message ?? `Email cannot be from these domains: ${blacklistedDomains.join(", ")}`,
    })
    return this
  }

  // Local part (username) validation
  localMinLength(min: number, message?: string): this {
    this.rules.push({
      check: (email) => {
        const local = email.split('@')[0]
        return local ? local.length >= min : false
      },
      message: message ?? `Email username must be at least ${min} characters`,
    })
    return this
  }

  localMaxLength(max: number, message?: string): this {
    this.rules.push({
      check: (email) => {
        const local = email.split('@')[0]
        return local ? local.length <= max : false
      },
      message: message ?? `Email username must be at most ${max} characters`,
    })
    return this
  }

  // Local part pattern
  localPattern(pattern: RegExp, message?: string): this {
    this.rules.push({
      check: (email) => {
        const local = email.split('@')[0]
        return local ? pattern.test(local) : false
      },
      message: message ?? `Email username must match the required pattern`,
    })
    return this
  }

  // Predefined validations
  corporate(message?: string): this {
    // Block common free email providers
    const freeProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'protonmail.com', 'yandex.com',
      'mail.com', 'gmx.com'
    ]
    return this.notDomains(freeProviders, message ?? 'Corporate email required (no free email providers)')
  }

  noPlus(message?: string): this {
    this.rules.push({
      check: (email) => !email.includes('+'),
      message: message ?? 'Plus addressing not allowed',
    })
    return this
  }

  noDots(message?: string): this {
    this.rules.push({
      check: (email) => {
        const local = email.split('@')[0]
        return local ? !local.includes('.') : false
      },
      message: message ?? 'Dots in username not allowed',
    })
    return this
  }

  // Email validation using comprehensive regex
  private isValidEmail(email: string): boolean {
    // Comprehensive email regex based on RFC 5322 (simplified but practical)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    // Basic format check
    if (!emailRegex.test(email)) {
      return false
    }

    // Additional checks
    if (email.length > 254) return false // RFC 5321 limit
    
    const parts = email.split('@')
    if (parts.length !== 2) return false
    
    const [local, domain] = parts
    
    // Local part checks
    if (local.length === 0 || local.length > 64) return false // RFC 5321 limit
    if (local.startsWith('.') || local.endsWith('.')) return false
    if (local.includes('..')) return false
    
    // Domain part checks
    if (domain.length === 0 || domain.length > 253) return false // RFC 1035 limit
    if (domain.startsWith('.') || domain.endsWith('.')) return false
    if (domain.startsWith('-') || domain.endsWith('-')) return false
    if (domain.includes('..')) return false
    
    return true
  }
}