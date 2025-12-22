import { k } from '../k';

console.log('=== VALIDATE vs SAFE_PARSE COMPARISON ===\n');

// TEST 1: Valid data - compare outputs
console.log('🔍 TEST 1: Valid Data Comparison');
console.log('─────────────────────────────');

const stringSchema = k.string().minLength(3);
const validData = 'hello';

const safeParseResult = stringSchema.safeParse(validData);
const validateResult = stringSchema.validate(validData);

console.log('safeParse result:', JSON.stringify(safeParseResult, null, 2));
console.log('validate result:', JSON.stringify(validateResult, null, 2));

// TEST 2: Invalid data - compare outputs
console.log('\n🔍 TEST 2: Invalid Data Comparison');
console.log('─────────────────────────────');

const invalidData = 'hi'; // Too short

const safeParseInvalid = stringSchema.safeParse(invalidData);
const validateInvalid = stringSchema.validate(invalidData);

console.log('safeParse invalid:', JSON.stringify(safeParseInvalid, null, 2));
console.log('validate invalid:', JSON.stringify(validateInvalid, null, 2));

// TEST 3: Complex object - compare outputs
console.log('\n🔍 TEST 3: Complex Object Comparison');
console.log('─────────────────────────────');

const userSchema = k.object({
  name: k.string().minLength(3),
  email: k.string().email(),
  age: k.number().min(18)
});

const complexInvalid = {
  name: 'Jo', // Too short
  email: 'invalid-email', // Wrong format
  age: 15 // Too young
};

const safeParseComplex = userSchema.safeParse(complexInvalid);
const validateComplex = userSchema.validate(complexInvalid);

console.log('safeParse complex:', JSON.stringify(safeParseComplex, null, 2));
console.log('validate complex:', JSON.stringify(validateComplex, null, 2));

// TEST 4: Access patterns
console.log('\n🔍 TEST 4: Access Patterns Comparison');
console.log('─────────────────────────────');

console.log('=== safeParse access patterns ===');
if (safeParseResult.success) {
  console.log('✅ Data from safeParse:', safeParseResult.data);
} else {
  console.log('❌ Errors from safeParse:', safeParseResult.issues);
}

console.log('\n=== validate access patterns ===');
if (validateResult.valid) {
  console.log('✅ Data from validate: NOT AVAILABLE - validate doesn\'t return data');
} else {
  console.log('❌ Errors from validate:', validateResult.issues);
}

// TEST 5: Key differences summary
console.log('\n🔍 TEST 5: Key Differences Summary');
console.log('─────────────────────────────');

console.log('📊 DIFFERENCES:');
console.log('1. Return format:');
console.log('   - safeParse: { success: boolean, data?: T, issues?: Issue[] }');
console.log('   - validate:  { valid: boolean, issues: Issue[] }');

console.log('\n2. Data access:');
console.log('   - safeParse: Returns validated data on success');
console.log('   - validate:  Only validation status, no data returned');

console.log('\n3. Error handling:');
console.log('   - safeParse: issues only present on failure');
console.log('   - validate:  issues always present (empty array on success)');

console.log('\n4. Use cases:');
console.log('   - safeParse: When you need both validation AND the parsed data');
console.log('   - validate:  When you only need to check if data is valid');

console.log('\n=== Comparison Complete ===');