import { k } from '../k';

console.log('=== MULTIPLE ERRORS TEST ===\n');

// TEST: Object with multiple field errors
console.log('🔍 TEST: Object with Multiple Field Errors');
console.log('─────────────────────────────────────────');

const userSchema = k.object({
  name: k.string().minLength(3, 'Name must be at least 3 characters'),
  email: k.string().email('Invalid email format'),
  age: k.number().min(18, 'Must be at least 18').max(100, 'Must be at most 100'),
  phone: k.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Phone format: XXX-XXX-XXXX'),
  website: k.string().url('Invalid URL format').optional()
});

console.log('Multiple errors in different fields:');
const multipleErrors = userSchema.safeParse({
  name: 'Jo', // Too short
  email: 'invalid-email', // Invalid format
  age: 150, // Too high
  phone: '123456', // Wrong format
  website: 'not-a-url' // Invalid URL
});

console.log(JSON.stringify(multipleErrors, null, 2));
console.log(`Total errors found: ${multipleErrors.success ? 0 : multipleErrors.issues.length}`);

// TEST: Single field with multiple validation errors
console.log('\n🔍 TEST: Single Field with Multiple Validation Errors');
console.log('─────────────────────────────────────────────────');

const passwordSchema = k.object({
  password: k.string()
    .minLength(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character')
});

console.log('Password with multiple validation errors:');
const passwordErrors = passwordSchema.safeParse({
  password: 'abc' // Fails all validations
});

console.log(JSON.stringify(passwordErrors, null, 2));
console.log(`Total password errors: ${passwordErrors.success ? 0 : passwordErrors.issues.length}`);

// TEST: Array with multiple element errors
console.log('\n🔍 TEST: Array with Multiple Element Errors');
console.log('─────────────────────────────────────────');

const emailArraySchema = k.object({
  emails: k.array(k.string().email('Invalid email in array')).minLength(1, 'At least one email required')
});

console.log('Array with multiple invalid emails:');
const arrayErrors = emailArraySchema.safeParse({
  emails: ['invalid1', 'invalid2', 'valid@example.com', 'invalid3']
});

console.log(JSON.stringify(arrayErrors, null, 2));
console.log(`Total array errors: ${arrayErrors.success ? 0 : arrayErrors.issues.length}`);

// TEST: Nested object with multiple errors
console.log('\n🔍 TEST: Nested Object with Multiple Errors');
console.log('─────────────────────────────────────────');

const nestedSchema = k.object({
  user: k.object({
    name: k.string().minLength(3),
    age: k.number().min(18)
  }),
  address: k.object({
    street: k.string().minLength(5),
    city: k.string().minLength(2),
    zipCode: k.string().regex(/^\d{5}$/, 'ZIP must be 5 digits')
  })
});

console.log('Nested object with errors in multiple levels:');
const nestedErrors = nestedSchema.safeParse({
  user: {
    name: 'Jo', // Too short
    age: 15 // Too young
  },
  address: {
    street: 'St', // Too short
    city: 'A', // Too short
    zipCode: '123' // Wrong format
  }
});

console.log(JSON.stringify(nestedErrors, null, 2));
console.log(`Total nested errors: ${nestedErrors.success ? 0 : nestedErrors.issues.length}`);

// TEST: Complex combination - all types of errors
console.log('\n🔍 TEST: Complex Combination - All Types of Errors');
console.log('─────────────────────────────────────────────────');

const complexSchema = k.object({
  id: k.number().positive('ID must be positive').integer('ID must be integer'),
  details: k.object({
    title: k.string().minLength(5, 'Title too short'),
    tags: k.array(k.string().minLength(2, 'Tag too short')).unique('Tags must be unique'),
    meta: k.object({
      version: k.string().regex(/^\d+\.\d+\.\d+$/, 'Version format: X.Y.Z')
    })
  })
});

console.log('Complex object with errors at all levels:');
const complexErrors = complexSchema.safeParse({
  id: -1.5, // Negative and not integer
  details: {
    title: 'Hi', // Too short
    tags: ['a', 'b', 'a'], // Short tags + duplicate
    meta: {
      version: 'invalid' // Wrong format
    }
  }
});

console.log(JSON.stringify(complexErrors, null, 2));
console.log(`Total complex errors: ${complexErrors.success ? 0 : complexErrors.issues.length}`);

console.log('\n=== Multiple Errors Test Complete ===');