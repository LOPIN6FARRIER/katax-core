// example-async.ts - Simple async validation example

import { k } from "./src/k"
import type { AsyncValidator } from "./src/core/AsyncResult"

console.log('🔷 ASYNC VALIDATIONS - PRACTICAL EXAMPLE');
console.log('═══════════════════════════════════════════════════════════════\n');

// Simulate a function that checks if an email already exists in the database
const emailExistsValidator: AsyncValidator<string> = async (email, path) => {
  console.log(`🔍 Checking if email ${email} already exists...`);

  // Simulate a database query
  await new Promise(resolve => setTimeout(resolve, 200));

  // Simulate existing emails
  const existingEmails = ['admin@test.com', 'user@test.com'];

  if (existingEmails.includes(email.toLowerCase())) {
    return [{
      path,
      message: `Email ${email} is already registered in the system`
    }];
  }

  console.log(`✅ Email ${email} available`);
  return [];
};

// Simulate username validation
const usernameAvailableValidator: AsyncValidator<string> = async (username, path) => {
  console.log(`🔍 Checking username ${username} availability...`);

  await new Promise(resolve => setTimeout(resolve, 150));

  const reservedUsernames = ['admin', 'root', 'system'];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return [{
      path,
      message: `Username '${username}' is reserved and cannot be used`
    }];
  }

  console.log(`✅ Username ${username} available`);
  return [];
};

async function asyncValidationExample() {
  // Schema for user registration with async validations
  const registroSchema = k.object({
    email: k.email()
      .asyncRefine(emailExistsValidator),
    username: k.string()
      .minLength(3)
      .maxLength(20)
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores")
      .asyncRefine(usernameAvailableValidator),
    password: k.string()
      .minLength(8)
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
  });

  console.log('📝 EXAMPLE 1: Valid user');
  console.log('─────────────────────────────');

  const validUser = {
    email: 'nuevo@example.com',
    username: 'juan_perez',
    password: 'MiPassword123'
  };

  const result1 = await registroSchema.safeParseAsync(validUser);
  console.log('Result:', result1.success ? '✅ VALID' : '❌ INVALID');
  if (result1.success) {
    console.log('Processed data:', result1.data);
  } else {
    console.log('Errors:', result1.issues);
  }

  console.log('\n📝 EXAMPLE 2: Email already exists');
  console.log('─────────────────────────────');
  
  const existingEmailUser = {
    email: 'admin@test.com', // This email already exists
    username: 'new_user',
    password: 'MyPassword123'
  };

  const result2 = await registroSchema.safeParseAsync(existingEmailUser);
  console.log('Result:', result2.success ? '✅ VALID' : '❌ INVALID');
  if (!result2.success) {
    console.log('Errors:', result2.issues);
  }

  console.log('\n📝 EXAMPLE 3: Reserved username');
  console.log('─────────────────────────────');
  
  const reservedUser = {
    email: 'test@example.com',
    username: 'admin', // Reserved username
    password: 'MyPassword123'
  };

  const result3 = await registroSchema.safeParseAsync(reservedUser);
  console.log('Result:', result3.success ? '✅ VALID' : '❌ INVALID');
  if (!result3.success) {
    console.log('Errors:', result3.issues);
  }

  console.log('\n📝 EXAMPLE 4: Multiple errors');
  console.log('─────────────────────────────');
  
  const invalidUser = {
    email: 'user@test.com', // Existing email
    username: 'root', // Reserved username
    password: 'short' // Password too short
  };

  const result4 = await registroSchema.safeParseAsync(invalidUser);
  console.log('Result:', result4.success ? '✅ VALID' : '❌ INVALID');
  if (!result4.success) {
    console.log('Errors found:');
    result4.issues?.forEach((issue, index) => {
      console.log(`  ${index + 1}. At ${issue.path.join('.')}: ${issue.message}`);
    });
  }

  console.log('\n🚀 EXAMPLE 5: Using parseAsync (with exception)');
  console.log('─────────────────────────────────────────────');
  
  try {
    const result5 = await registroSchema.parseAsync({
      email: 'admin@test.com',
      username: 'valid',
      password: 'ValidPassword123'
    });
    console.log('✅ Validation successful:', result5);
  } catch (error) {
    console.log('❌ Validation error caught:', (error as Error).message);
    if (error instanceof Error && 'issues' in error) {
      console.log('Issues:', (error as any).issues);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ASYNC VALIDATION EXAMPLES COMPLETED');
  console.log('═══════════════════════════════════════════════════════════════');
}

// Run the example
asyncValidationExample().catch(console.error);