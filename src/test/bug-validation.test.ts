import { k } from '../k';

console.log('=== BUG VALIDATION & FIXES ===\n');

// POTENTIAL BUG 1: Infinite and NaN numbers should be rejected by finite()
console.log('🔍 TEST 1: Number Finite Validation');
console.log('─────────────────────────────');
const finiteSchema = k.number().finite();
console.log('Infinity should fail:', finiteSchema.safeParse(Number.POSITIVE_INFINITY));
console.log('NaN should fail:', finiteSchema.safeParse(Number.NaN));
console.log('Normal number should pass:', finiteSchema.safeParse(42));

// POTENTIAL BUG 2: Object circular references detection
console.log('\n🔍 TEST 2: Circular Reference Handling');
console.log('─────────────────────────────');
const objSchema = k.object({
  name: k.string(),
  value: k.number()
});

const circularObj: any = { name: 'test', value: 42 };
circularObj.self = circularObj;

console.log('Circular reference handling:', objSchema.safeParse(circularObj));

// POTENTIAL BUG 3: Default value mutation
console.log('\n🔍 TEST 3: Default Value Mutation');
console.log('─────────────────────────────');
const defaultObj = { items: [] };
const defaultSchema = k.object({
  name: k.string(),
  items: k.array(k.string()).default(defaultObj.items)
});

const result1 = defaultSchema.safeParse({ name: 'test1' });
const result2 = defaultSchema.safeParse({ name: 'test2' });

if (result1.success && result2.success) {
  // Modify the first result
  result1.data.items.push('modified');
  
  console.log('First result items after modification:', result1.data.items);
  console.log('Second result items (should be empty):', result2.data.items);
  console.log('Default mutation bug exists:', result1.data.items === result2.data.items);
}

// POTENTIAL BUG 4: Array unique with complex objects
console.log('\n🔍 TEST 4: Array Unique with Objects');
console.log('─────────────────────────────');
const uniqueObjSchema = k.array(k.object({
  id: k.number(),
  name: k.string()
})).unique();

console.log('Different objects (should pass):', uniqueObjSchema.safeParse([
  { id: 1, name: 'A' },
  { id: 2, name: 'B' }
]));

console.log('Same content objects (should fail):', uniqueObjSchema.safeParse([
  { id: 1, name: 'A' },
  { id: 1, name: 'A' }
]));

// POTENTIAL BUG 5: Transform error handling
console.log('\n🔍 TEST 5: Transform Error Handling');
console.log('─────────────────────────────');
const errorTransform = k.string().transform((s) => {
  if (s === 'throw') throw new Error('Custom error');
  if (s === 'undefined') return undefined;
  if (s === 'null') return null;
  return s.toUpperCase();
});

console.log('Normal transform:', errorTransform.safeParse('hello'));
console.log('Transform that throws:', errorTransform.safeParse('throw'));
console.log('Transform that returns undefined:', errorTransform.safeParse('undefined'));
console.log('Transform that returns null:', errorTransform.safeParse('null'));

// POTENTIAL BUG 6: Email domain pattern edge cases
console.log('\n🔍 TEST 6: Email Domain Pattern Edge Cases');
console.log('─────────────────────────────');
const domainPatternSchema = k.email().domainPattern('*.example.com');
console.log('Root domain (example.com):', domainPatternSchema.safeParse('user@example.com'));
console.log('Subdomain (mail.example.com):', domainPatternSchema.safeParse('user@mail.example.com'));
console.log('Deep subdomain (a.b.example.com):', domainPatternSchema.safeParse('user@a.b.example.com'));
console.log('Similar domain (notexample.com):', domainPatternSchema.safeParse('user@notexample.com'));
console.log('Partial match (example.com.evil.com):', domainPatternSchema.safeParse('user@example.com.evil.com'));

// POTENTIAL BUG 7: Floating point precision in multipleOf
console.log('\n🔍 TEST 7: Floating Point Precision');
console.log('─────────────────────────────');
const decimalSchema = k.number().multipleOf(0.01);
console.log('0.1 should be multiple of 0.01:', decimalSchema.safeParse(0.1));
console.log('0.12 should be multiple of 0.01:', decimalSchema.safeParse(0.12));
console.log('0.123 should NOT be multiple of 0.01:', decimalSchema.safeParse(0.123));

const thirdSchema = k.number().multipleOf(1/3);
console.log('1 should be multiple of 1/3:', thirdSchema.safeParse(1));
console.log('2/3 should be multiple of 1/3:', thirdSchema.safeParse(2/3));

console.log('\n=== Bug Validation Complete ===');