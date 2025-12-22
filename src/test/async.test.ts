// src/test/async.test.ts

import { k } from "../k"
import type { AsyncValidator } from "../core/AsyncResult"

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                ASYNC VALIDATIONS TESTS                    ║');
console.log('╚════════════════════════════════════════════════════════════╝');

// Mock validators for testing
const emailUniqueValidator: AsyncValidator<string> = async (email, path) => {
  await new Promise(resolve => setTimeout(resolve, 10))
  
  if (email === "taken@example.com") {
    return [{
      path,
      message: "Email already exists"
    }]
  }
  
  return []
}

const usernameValidator: AsyncValidator<string> = async (username, path) => {
  await new Promise(resolve => setTimeout(resolve, 10))
  
  if (username === "admin") {
    return [{
      path,
      message: "Username is reserved"
    }]
  }
  
  return []
}

const fileValidator: AsyncValidator<File> = async (file, path) => {
  await new Promise(resolve => setTimeout(resolve, 10))
  
  if (file.name.endsWith('.exe')) {
    return [{
      path,
      message: "Executable files are not allowed"
    }]
  }
  
  return []
}

async function runAsyncTests() {
  console.log('\n🔷 STRING SCHEMA ASYNC VALIDATION');
  console.log('─────────────────────────────────────────────────');

  // Test 1: Should pass async validation
  const schema1 = k.string()
    .minLength(3)
    .asyncRefine(emailUniqueValidator)

  const result1 = await schema1.safeParseAsync("valid@example.com")
  console.log('✅ Valid email async validation:', result1.success ? 'PASSED' : 'FAILED')
  if (result1.success) {
    console.log('   Data:', result1.data)
  } else {
    console.log('   Issues:', result1.issues)
  }

  // Test 2: Should fail async validation
  const result2 = await schema1.safeParseAsync("taken@example.com")
  console.log('❌ Invalid email async validation:', !result2.success ? 'PASSED' : 'FAILED')
  if (!result2.success) {
    console.log('   Issues:', result2.issues)
  }

  // Test 3: Should fail sync validation before async
  const schema3 = k.string()
    .minLength(10)
    .asyncRefine(emailUniqueValidator)

  const result3 = await schema3.safeParseAsync("short")
  console.log('❌ Sync validation failure (before async):', !result3.success ? 'PASSED' : 'FAILED')
  if (!result3.success) {
    console.log('   Issues:', result3.issues)
  }

  // Test 4: Multiple async validators
  const schema4 = k.string()
    .minLength(3)
    .asyncRefine(emailUniqueValidator)
    .asyncRefine(usernameValidator)

  const result4a = await schema4.safeParseAsync("user@example.com")
  console.log('✅ Multiple async validators (valid):', result4a.success ? 'PASSED' : 'FAILED')

  const result4b = await schema4.safeParseAsync("admin")
  console.log('❌ Multiple async validators (second fails):', !result4b.success ? 'PASSED' : 'FAILED')
  if (!result4b.success) {
    console.log('   Issues:', result4b.issues)
  }

  console.log('\n🔷 FILE SCHEMA ASYNC VALIDATION');
  console.log('─────────────────────────────────────────────────');

  // Test 5: File validation pass
  const fileSchema = k.file()
    .maxSize(1000000)
    .asyncRefine(fileValidator)

  const validFile = new File(["content"], "test.txt", { type: "text/plain" })
  const result5 = await fileSchema.safeParseAsync(validFile)
  console.log('✅ Valid file async validation:', result5.success ? 'PASSED' : 'FAILED')

  // Test 6: File validation fail
  const invalidFile = new File(["content"], "virus.exe", { type: "application/octet-stream" })
  const result6 = await fileSchema.safeParseAsync(invalidFile)
  console.log('❌ Invalid file async validation:', !result6.success ? 'PASSED' : 'FAILED')
  if (!result6.success) {
    console.log('   Issues:', result6.issues)
  }

  console.log('\n🔷 ASYNC PARSE METHODS');
  console.log('─────────────────────────────────────────────────');

  // Test 7: parseAsync success
  const schema7 = k.string().asyncRefine(async () => [])
  try {
    const result7 = await schema7.parseAsync("valid")
    console.log('✅ parseAsync success:', result7 === "valid" ? 'PASSED' : 'FAILED')
  } catch (error) {
    console.log('❌ parseAsync success: FAILED -', error)
  }

  // Test 8: parseAsync failure
  const schema8 = k.string().asyncRefine(emailUniqueValidator)
  try {
    await schema8.parseAsync("taken@example.com")
    console.log('❌ parseAsync failure: FAILED - Should have thrown')
  } catch (error) {
    console.log('✅ parseAsync failure:', error instanceof Error ? 'PASSED' : 'FAILED')
    console.log('   Error message:', (error as Error).message)
  }

  // Test 9: isValidAsync
  const result9a = await schema8.isValidAsync("valid@example.com")
  console.log('✅ isValidAsync (valid):', result9a.valid ? 'PASSED' : 'FAILED')

  const result9b = await schema8.isValidAsync("taken@example.com")
  console.log('❌ isValidAsync (invalid):', !result9b.valid ? 'PASSED' : 'FAILED')

  console.log('\n🔷 SCHEMA COMPOSITION ASYNC');
  console.log('─────────────────────────────────────────────────');

  // Test 10: Optional schema with async validation
  const optionalSchema = k.string()
    .asyncRefine(emailUniqueValidator)
    .optional()

  const result10a = await optionalSchema.safeParseAsync(undefined)
  console.log('✅ Optional schema (undefined):', result10a.success ? 'PASSED' : 'FAILED')

  const result10b = await optionalSchema.safeParseAsync("taken@example.com")
  console.log('❌ Optional schema (invalid value):', !result10b.success ? 'PASSED' : 'FAILED')

  // Test 11: Nullable schema with async validation
  const nullableSchema = k.string()
    .asyncRefine(emailUniqueValidator)
    .nullable()

  const result11a = await nullableSchema.safeParseAsync(null)
  console.log('✅ Nullable schema (null):', result11a.success ? 'PASSED' : 'FAILED')

  const result11b = await nullableSchema.safeParseAsync("taken@example.com")
  console.log('❌ Nullable schema (invalid value):', !result11b.success ? 'PASSED' : 'FAILED')

  // Test 12: Default schema with async validation
  const defaultSchema = k.string()
    .asyncRefine(emailUniqueValidator)
    .default("default@example.com")

  const result12a = await defaultSchema.safeParseAsync(undefined)
  console.log('✅ Default schema (uses default):', result12a.success ? 'PASSED' : 'FAILED')
  if (result12a.success) {
    console.log('   Default value used:', result12a.data)
  }

  const result12b = await defaultSchema.safeParseAsync("taken@example.com")
  console.log('❌ Default schema (invalid value):', !result12b.success ? 'PASSED' : 'FAILED')

  console.log('\n🔷 OBJECT SCHEMA ASYNC VALIDATION');
  console.log('─────────────────────────────────────────────────');

  // Test 13: Object with async field validation
  const objectSchema = k.object({
    email: k.string().asyncRefine(emailUniqueValidator),
    username: k.string().asyncRefine(usernameValidator)
  })

  const result13a = await objectSchema.safeParseAsync({
    email: "user@example.com",
    username: "john"
  })
  console.log('✅ Object async validation (valid):', result13a.success ? 'PASSED' : 'FAILED')

  const result13b = await objectSchema.safeParseAsync({
    email: "taken@example.com",
    username: "john"
  })
  console.log('❌ Object async validation (email invalid):', !result13b.success ? 'PASSED' : 'FAILED')

  const result13c = await objectSchema.safeParseAsync({
    email: "user@example.com",
    username: "admin"
  })
  console.log('❌ Object async validation (username invalid):', !result13c.success ? 'PASSED' : 'FAILED')

  console.log('\n🔷 ARRAY SCHEMA ASYNC VALIDATION');
  console.log('─────────────────────────────────────────────────');

  // Test 14: Array with async element validation
  const arraySchema = k.array(
    k.string().asyncRefine(emailUniqueValidator)
  )

  const result14a = await arraySchema.safeParseAsync([
    "user1@example.com",
    "user2@example.com"
  ])
  console.log('✅ Array async validation (valid):', result14a.success ? 'PASSED' : 'FAILED')

  const result14b = await arraySchema.safeParseAsync([
    "user1@example.com",
    "taken@example.com"
  ])
  console.log('❌ Array async validation (element invalid):', !result14b.success ? 'PASSED' : 'FAILED')
  if (!result14b.success) {
    console.log('   Issues:', result14b.issues)
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                  ASYNC TESTS COMPLETE!                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Run the tests
runAsyncTests().catch(console.error)