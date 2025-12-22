// src/examples/async-validators.ts

import { k } from "../k"
import type { AsyncValidator } from "../core/AsyncResult"

/**
 * Example: Email uniqueness validator (simulates database check)
 */
export const emailUniqueValidator: AsyncValidator<string> = async (email, path) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Simulate checking database for existing email
  const existingEmails = ["admin@example.com", "user@test.com"]
  
  if (existingEmails.includes(email.toLowerCase())) {
    return [{
      path,
      message: "This email is already registered"
    }]
  }
  
  return []
}

/**
 * Example: Username availability validator
 */
export const usernameAvailableValidator: AsyncValidator<string> = async (username, path) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 150))
  
  const reservedUsernames = ["admin", "root", "system", "api"]
  
  if (reservedUsernames.includes(username.toLowerCase())) {
    return [{
      path,
      message: "This username is reserved and cannot be used"
    }]
  }
  
  return []
}

/**
 * Example: Phone number validation with external service
 */
export const phoneNumberValidator: AsyncValidator<string> = async (phone, path) => {
  // Simulate API call to phone validation service
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Simple validation - in real world you'd call Twilio, etc.
  const isValidFormat = /^\+?[1-9]\d{1,14}$/.test(phone)
  
  if (!isValidFormat) {
    return [{
      path,
      message: "Invalid phone number format"
    }]
  }
  
  return []
}

/**
 * Example: Domain validation for email
 */
export const domainValidator: AsyncValidator<string> = async (email, path) => {
  const domain = email.split('@')[1]
  if (!domain) return []
  
  // Simulate DNS lookup
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Simulate blacklisted domains
  const blacklistedDomains = ["tempmail.com", "10minutemail.com", "throwaway.email"]
  
  if (blacklistedDomains.includes(domain.toLowerCase())) {
    return [{
      path,
      message: "Temporary email domains are not allowed"
    }]
  }
  
  return []
}

/**
 * Example: File virus scanning validator
 */
export const antivirusValidator: AsyncValidator<File> = async (file, path) => {
  // Simulate virus scanning
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simulate dangerous file patterns
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr']
  const fileName = file.name.toLowerCase()
  
  const isDangerous = dangerousExtensions.some(ext => fileName.endsWith(ext))
  
  if (isDangerous) {
    return [{
      path,
      message: "File type is potentially dangerous and has been blocked"
    }]
  }
  
  return []
}

/**
 * Example usage of async validators
 */
export async function asyncValidationExamples() {
  // Email with uniqueness check
  const emailSchema = k.email()
    .asyncRefine(emailUniqueValidator)
    .asyncRefine(domainValidator)
  
  // Username schema
  const usernameSchema = k.string()
    .minLength(3)
    .maxLength(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .asyncRefine(usernameAvailableValidator)
  
  // Phone schema
  const phoneSchema = k.string()
    .asyncRefine(phoneNumberValidator)
  
  // File upload schema
  const fileSchema = k.file()
    .maxSize(5 * 1024 * 1024) // 5MB
    .asyncRefine(antivirusValidator)
  
  try {
    // Test email validation
    const emailResult = await emailSchema.parseAsync("user@example.com")
    console.log("Valid email:", emailResult)
    
    // Test username validation  
    const usernameResult = await usernameSchema.parseAsync("john_doe")
    console.log("Valid username:", usernameResult)
    
    // Test phone validation
    const phoneResult = await phoneSchema.parseAsync("+1234567890")
    console.log("Valid phone:", phoneResult)
    
  } catch (error) {
    console.error("Validation failed:", error)
  }
}