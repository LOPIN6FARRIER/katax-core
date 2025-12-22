import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

type ValidationRule = {
  check: (value: string) => boolean
  message: string
}

export class Base64Schema extends BaseSchema<string> {
  private rules: ValidationRule[] = []

  _parse(input: unknown, path: Issue["path"]): Issue[] | string {
    if (typeof input !== "string") {
      return [{ path, message: "Expected string" }]
    }

    // Basic base64 validation
    if (!this.isValidBase64(input)) {
      return [{ path, message: "Invalid base64 format" }]
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

  protected _clone(): Base64Schema {
    const cloned = new Base64Schema()
    cloned.rules = [...this.rules]
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  // Validate minimum decoded size
  minDecodedSize(bytes: number, message?: string): this {
    this.rules.push({
      check: (value) => {
        try {
          const decoded = this.getDecodedSize(value)
          return decoded >= bytes
        } catch {
          return false
        }
      },
      message: message ?? `Decoded content must be at least ${this.formatBytes(bytes)}`,
    })
    return this
  }

  // Validate maximum decoded size
  maxDecodedSize(bytes: number, message?: string): this {
    this.rules.push({
      check: (value) => {
        try {
          const decoded = this.getDecodedSize(value)
          return decoded <= bytes
        } catch {
          return false
        }
      },
      message: message ?? `Decoded content must be at most ${this.formatBytes(bytes)}`,
    })
    return this
  }

  // Validate MIME type from data URL
  mimeType(expectedType: string, message?: string): this {
    this.rules.push({
      check: (value) => {
        if (value.startsWith('data:')) {
          const mimeMatch = value.match(/^data:([^;]+)/)
          return mimeMatch ? mimeMatch[1] === expectedType : false
        }
        return true // If not a data URL, skip MIME type check
      },
      message: message ?? `Base64 data must have MIME type ${expectedType}`,
    })
    return this
  }

  // Validate MIME type pattern
  mimeTypePattern(pattern: string, message?: string): this {
    const regex = new RegExp(pattern.replace('*', '.*'))
    this.rules.push({
      check: (value) => {
        if (value.startsWith('data:')) {
          const mimeMatch = value.match(/^data:([^;]+)/)
          return mimeMatch ? regex.test(mimeMatch[1]) : false
        }
        return true // If not a data URL, skip MIME type check
      },
      message: message ?? `Base64 data MIME type must match pattern ${pattern}`,
    })
    return this
  }

  // Predefined type helpers
  image(message?: string): this {
    return this.mimeTypePattern('image/*', message ?? 'Base64 must be an image')
  }

  pdf(message?: string): this {
    return this.mimeType('application/pdf', message ?? 'Base64 must be a PDF')
  }

  json(message?: string): this {
    this.rules.push({
      check: (value) => {
        try {
          const decoded = this.decodeBase64(value)
          JSON.parse(decoded)
          return true
        } catch {
          return false
        }
      },
      message: message ?? 'Decoded base64 must be valid JSON',
    })
    return this
  }

  // Validate that it's a data URL
  dataUrl(message?: string): this {
    this.rules.push({
      check: (value) => value.startsWith('data:'),
      message: message ?? 'Must be a data URL (data:...)',
    })
    return this
  }

  // Private helper methods
  private isValidBase64(str: string): boolean {
    // Remove data URL prefix if present
    let base64String = str
    if (str.startsWith('data:')) {
      const commaIndex = str.indexOf(',')
      if (commaIndex === -1) return false
      base64String = str.slice(commaIndex + 1)
    }

    // Remove whitespace
    base64String = base64String.replace(/\s/g, '')

    // Check if empty
    if (base64String.length === 0) return false

    // Check base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Regex.test(base64String)) return false

    // Check padding
    const paddingCount = (base64String.match(/=/g) || []).length
    if (paddingCount > 2) return false

    // Check if length is multiple of 4 (after padding)
    if (base64String.length % 4 !== 0) return false

    return true
  }

  private getDecodedSize(base64String: string): number {
    // Remove data URL prefix if present
    let cleanBase64 = base64String
    if (base64String.startsWith('data:')) {
      const commaIndex = base64String.indexOf(',')
      if (commaIndex === -1) throw new Error('Invalid data URL')
      cleanBase64 = base64String.slice(commaIndex + 1)
    }

    // Remove whitespace
    cleanBase64 = cleanBase64.replace(/\s/g, '')

    // Calculate decoded size
    const paddingCount = (cleanBase64.match(/=/g) || []).length
    return Math.floor((cleanBase64.length * 3) / 4) - paddingCount
  }

  private decodeBase64(base64String: string): string {
    // Remove data URL prefix if present
    let cleanBase64 = base64String
    if (base64String.startsWith('data:')) {
      const commaIndex = base64String.indexOf(',')
      if (commaIndex === -1) throw new Error('Invalid data URL')
      cleanBase64 = base64String.slice(commaIndex + 1)
    }

    // In Node.js environment
    try {
      // Try to use Buffer if available (Node.js)
      const BufferConstructor = (globalThis as any).Buffer
      if (BufferConstructor) {
        return BufferConstructor.from(cleanBase64, 'base64').toString()
      }
    } catch {
      // Fall through to browser method
    }
    
    // In browser environment
    try {
      const atobFunction = (globalThis as any).atob
      if (atobFunction) {
        return atobFunction(cleanBase64)
      }
    } catch {
      // No atob available
    }

    throw new Error('No base64 decoding method available')
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}