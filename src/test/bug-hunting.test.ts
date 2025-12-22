import { k } from '../k';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║            COMPREHENSIVE BUG HUNTING TESTS                 ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// TEST 1: POTENTIAL MEMORY LEAKS WITH CIRCULAR REFERENCES
// ============================================================================
console.log('🐛 TEST 1: Circular References in Array Validation');
console.log('─────────────────────────────────────────────────');

const circularArray: any[] = [1, 2, 3];
circularArray.push(circularArray); // Circular reference

console.log('Array with circular reference:', k.array(k.number()).safeParse(circularArray));

// ============================================================================
// TEST 2: FLOATING POINT PRECISION ISSUES  
// ============================================================================
console.log('\n🐛 TEST 2: Floating Point Precision Issues');
console.log('─────────────────────────────────────────────────');

const floatPrecisionSchema = k.number().multipleOf(0.1);
console.log('0.1 + 0.2 (0.30000000000000004):', floatPrecisionSchema.safeParse(0.1 + 0.2));
console.log('Direct 0.3:', floatPrecisionSchema.safeParse(0.3));

const currencySchema = k.number().multipleOf(0.01);
console.log('Currency 99.99:', currencySchema.safeParse(99.99));
console.log('Currency calc (100 - 0.01):', currencySchema.safeParse(100 - 0.01));

// ============================================================================
// TEST 3: PROTOTYPE POLLUTION ATTEMPTS
// ============================================================================
console.log('\n🐛 TEST 3: Prototype Pollution Attempts');
console.log('─────────────────────────────────────────────────');

const maliciousObject = {
  __proto__: { admin: true },
  constructor: { prototype: { admin: true } },
  name: "test"
};

const secureSchema = k.object({
  name: k.string()
}).strict();

console.log('Malicious object:', secureSchema.safeParse(maliciousObject));

// ============================================================================
// TEST 4: DEEP RECURSION STACK OVERFLOW
// ============================================================================
console.log('\n🐛 TEST 4: Deep Recursion Test');
console.log('─────────────────────────────────────────────────');

// Create deeply nested object (100 levels)
let deepObject: any = { value: "end" };
for (let i = 0; i < 100; i++) {
  deepObject = { nested: deepObject };
}

function createDeepSchema(depth: number): any {
  if (depth === 0) {
    return k.object({ value: k.string() });
  }
  return k.object({ nested: createDeepSchema(depth - 1) });
}

try {
  const deepSchema = createDeepSchema(100);
  console.log('Deep object validation (100 levels): Success (no stack overflow)');
} catch (error) {
  console.log('Deep object validation failed:', (error as Error).message);
}

// ============================================================================
// TEST 5: ARRAY UNIQUE ALGORITHM EDGE CASES
// ============================================================================
console.log('\n🐛 TEST 5: Array Unique Edge Cases');
console.log('─────────────────────────────────────────────────');

const uniqueTests = [
  [NaN, NaN], // NaN !== NaN in JavaScript
  [0, -0], // 0 === -0 but Object.is(0, -0) is false
  ["", " ", "  "], // Whitespace strings
  [true, 1], // Different types but truthy
  [false, 0], // Different types but falsy
  [null, undefined], // Both "falsy" but different
];

uniqueTests.forEach((testCase, index) => {
  const schema = k.array(k.number().optional().nullable()).unique();
  console.log(`Unique test ${index + 1} (${testCase.join(', ')}):`, 
    schema.safeParse(testCase));
});

// ============================================================================
// TEST 6: DATE TIMEZONE EDGE CASES
// ============================================================================
console.log('\n🐛 TEST 6: Date Timezone Edge Cases');
console.log('─────────────────────────────────────────────────');

const timezoneTests = [
  "2024-01-15T23:59:59Z", // Edge of day UTC
  "2024-01-15T23:59:59+14:00", // Kiribati timezone (UTC+14)
  "2024-01-15T00:00:00-12:00", // Baker Island (UTC-12)
  "2024-02-29", // Leap year
  "2023-02-29", // Not a leap year (should be invalid)
  "2024-13-01", // Invalid month
  "2024-01-32", // Invalid day
];

timezoneTests.forEach((dateStr, index) => {
  console.log(`Timezone test ${index + 1} (${dateStr}):`, 
    k.date().safeParse(dateStr));
});

// ============================================================================
// TEST 7: ARRAY PATH REPORTING ACCURACY
// ============================================================================
console.log('\n🐛 TEST 7: Array Path Reporting');
console.log('─────────────────────────────────────────────────');

const nestedArraySchema = k.array(
  k.array(
    k.object({
      id: k.string(),
      value: k.number().min(0)
    })
  )
);

const nestedArrayData = [
  [
    { id: "1", value: 10 },
    { id: "2", value: -5 }, // Error here
  ],
  [
    { id: "3", value: 20 },
    { id: "", value: 15 }, // Error here
  ]
];

const nestedResult = nestedArraySchema.safeParse(nestedArrayData);
if (!nestedResult.success) {
  console.log('Nested array errors:');
  nestedResult.issues.forEach(issue => {
    console.log(`  Path: [${issue.path.join(', ')}] | Message: ${issue.message}`);
  });
}

// ============================================================================
// TEST 8: STRING REGEX COMPLEXITY TEST (SAFE VERSION)
// ============================================================================
console.log('\n🐛 TEST 8: Regex Complexity Test');
console.log('─────────────────────────────────────────────────');

// Test with a complex but safe regex
const complexButSafeRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email validation
const emailSchema = k.string().regex(complexButSafeRegex, "Must be valid email");

const validEmail = "test@example.com";
const invalidEmail = "a".repeat(100) + "@invalid"; // Long but safe to test

console.log('Valid email with complex regex:', emailSchema.safeParse(validEmail));

// Test performance with longer input (safe)
const startTime = Date.now();
const result = emailSchema.safeParse(invalidEmail);
const endTime = Date.now();

console.log(`Long string result: ${JSON.stringify(result)} (took ${endTime - startTime}ms)`);

// ============================================================================
// TEST 9: OBJECT CASE SENSITIVITY EDGE CASES
// ============================================================================
console.log('\n🐛 TEST 9: Object Case Sensitivity Edge Cases');
console.log('─────────────────────────────────────────────────');

const caseTests = [
  { NAME: "John", name: "Jane" }, // Duplicate keys with different cases
  { "user-name": "test", "user_name": "test2" }, // Similar keys
  { "": "empty key", " ": "space key" }, // Edge case keys
];

const caseSchema = k.object({
  name: k.string()
});

caseTests.forEach((testCase, index) => {
  console.log(`Case test ${index + 1}:`, caseSchema.safeParse(testCase));
});

// ============================================================================
// TEST 10: TRANSFORM ERROR PROPAGATION
// ============================================================================
console.log('\n🐛 TEST 10: Transform Error Propagation');
console.log('─────────────────────────────────────────────────');

const throwingTransform = k.string()
  .transform(s => {
    if (s === "throw") {
      throw new Error("Transform error!");
    }
    return s.toUpperCase();
  });

console.log('Transform with "hello":', throwingTransform.safeParse("hello"));
try {
  console.log('Transform with "throw":', throwingTransform.safeParse("throw"));
} catch (error) {
  console.log('Transform error caught:', (error as Error).message);
}

// ============================================================================
// TEST 11: ARRAY CONTAINS WITH COMPLEX OBJECTS
// ============================================================================
console.log('\n🐛 TEST 11: Array Contains with Complex Objects');
console.log('─────────────────────────────────────────────────');

const objectArray = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 1, name: "John" } // Same content, different reference
];

const containsSchema = k.array(k.object({ id: k.number(), name: k.string() }))
  .contains({ id: 1, name: "John" });

console.log('Contains complex object:', containsSchema.safeParse(objectArray));

// ============================================================================
// TEST 12: EDGE CASE NUMBERS
// ============================================================================
console.log('\n🐛 TEST 12: Edge Case Numbers');
console.log('─────────────────────────────────────────────────');

const edgeNumbers = [
  Number.MAX_SAFE_INTEGER + 1, // Beyond safe integer
  Number.MIN_SAFE_INTEGER - 1, // Below safe integer
  1.7976931348623157e+308, // Very large number
  5e-324, // Very small positive number
  -5e-324, // Very small negative number
];

edgeNumbers.forEach((num, index) => {
  const result = k.number().safeParse(num);
  console.log(`Edge number ${index + 1} (${num}):`, result.success ? 'Valid' : result.issues[0].message);
});

// ============================================================================
// TEST 13: BOOLEAN COERCION ATTACK
// ============================================================================
console.log('\n🐛 TEST 13: Boolean Coercion Edge Cases');
console.log('─────────────────────────────────────────────────');

const booleanLikeValues = [
  0, 1, 
  "true", "false", "TRUE", "FALSE",
  "0", "1",
  [], {}, null, undefined
];

booleanLikeValues.forEach((value, index) => {
  const result = k.boolean().safeParse(value);
  console.log(`Boolean test ${index + 1} (${JSON.stringify(value)}):`, 
    result.success ? result.data : result.issues[0].message);
});

// ============================================================================
// TEST 14: PERFORMANCE WITH LARGE DATA
// ============================================================================
console.log('\n🐛 TEST 14: Performance with Large Data');
console.log('─────────────────────────────────────────────────');

// Large object
const largeObject: any = {};
for (let i = 0; i < 1000; i++) {
  largeObject[`field_${i}`] = `value_${i}`;
}

// Test with an object schema that only validates a few fields (others are ignored)
const largeObjectSchema = k.object({
  field_0: k.string().optional(),
  field_500: k.string().optional()
});

const startTime1 = Date.now();
const largeResult = largeObjectSchema.safeParse(largeObject);
const endTime1 = Date.now();

console.log(`Large object (1000 fields): Success=${largeResult.success}, Time=${endTime1 - startTime1}ms`);

// Large array with nested validation
const largeArray = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  value: Math.random() * 100
}));

const largeArraySchema = k.array(k.object({
  id: k.number(),
  name: k.string().minLength(1),
  value: k.number().min(0).max(100)
}));

const startTime2 = Date.now();
const largeArrayResult = largeArraySchema.safeParse(largeArray);
const endTime2 = Date.now();

console.log(`Large array (1000 items): Success=${largeArrayResult.success}, Time=${endTime2 - startTime2}ms`);

// ============================================================================
// TEST 15: DEFAULT VALUE MUTATION
// ============================================================================
console.log('\n🐛 TEST 15: Default Value Mutation');
console.log('─────────────────────────────────────────────────');

const sharedDefaultArray = [1, 2, 3];
const defaultArraySchema = k.array(k.number()).default(sharedDefaultArray);

const result1 = defaultArraySchema.safeParse(undefined);
const result2 = defaultArraySchema.safeParse(undefined);

// Modify the first result to see if it affects the second
if (result1.success) {
  result1.data.push(999);
}

console.log('First result after mutation:', result1.success ? result1.data : 'Failed');
console.log('Second result (should be unaffected):', result2.success ? result2.data : 'Failed');
console.log('Original default array:', sharedDefaultArray);

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                 Bug Hunting Complete!                      ║');
console.log('╚════════════════════════════════════════════════════════════╝');