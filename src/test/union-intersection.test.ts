import { k } from '../k';
import type { kataxInfer } from '../index';

console.log('=== Union Schema Tests ===\n');

// Basic union of primitives
const stringOrNumber = k.union([k.string(), k.number()]);

console.log('--- Basic Union (string | number) ---');
console.log('String "hello":', stringOrNumber.safeParse('hello'));
console.log('Number 42:', stringOrNumber.safeParse(42));
console.log('Boolean true (invalid):', stringOrNumber.safeParse(true));
console.log('Null (invalid):', stringOrNumber.safeParse(null));

// Union with objects (discriminated union pattern)
const catSchema = k.object({
  type: k.literal('cat'),
  meow: k.boolean()
});

const dogSchema = k.object({
  type: k.literal('dog'),
  bark: k.boolean()
});

const animalSchema = k.union([catSchema, dogSchema]);

console.log('\n--- Discriminated Union (cat | dog) ---');
console.log('Cat:', animalSchema.safeParse({ type: 'cat', meow: true }));
console.log('Dog:', animalSchema.safeParse({ type: 'dog', bark: true }));
console.log('Invalid (bird):', animalSchema.safeParse({ type: 'bird', chirp: true }));

// Type inference check
type Animal = kataxInfer<typeof animalSchema>;

// Union of 3+ types
const multiUnion = k.union([k.string(), k.number(), k.boolean()]);

console.log('\n--- Multi-type Union (string | number | boolean) ---');
console.log('String:', multiUnion.safeParse('test'));
console.log('Number:', multiUnion.safeParse(123));
console.log('Boolean:', multiUnion.safeParse(false));
console.log('Array (invalid):', multiUnion.safeParse([]));

console.log('\n=== Intersection Schema Tests ===\n');

// Basic object intersection
const withId = k.object({ id: k.number() });
const withName = k.object({ name: k.string() });
const withEmail = k.object({ email: k.string().email() });

const combinedSchema = k.intersection([withId, withName, withEmail]);

console.log('--- Object Intersection ---');
console.log('Valid combined:', combinedSchema.safeParse({
  id: 1,
  name: 'John',
  email: 'john@example.com'
}));

console.log('Missing id:', combinedSchema.safeParse({
  name: 'John',
  email: 'john@example.com'
}));

console.log('Invalid email:', combinedSchema.safeParse({
  id: 1,
  name: 'John',
  email: 'not-an-email'
}));

// Type inference check
type Combined = kataxInfer<typeof combinedSchema>;

console.log('\n=== Extend Method Tests ===\n');

const baseSchema = k.object({
  id: k.number(),
  createdAt: k.string()
});

const userSchema = baseSchema.extend({
  name: k.string(),
  email: k.string().email()
});

console.log('--- Extend Object Schema ---');
console.log('Valid extended:', userSchema.safeParse({
  id: 1,
  createdAt: '2024-01-01',
  name: 'Alice',
  email: 'alice@example.com'
}));

console.log('Missing base field:', userSchema.safeParse({
  name: 'Alice',
  email: 'alice@example.com'
}));

// Override field with extend
const overrideSchema = baseSchema.extend({
  id: k.string() // Override number with string
});

console.log('\n--- Override Field with Extend ---');
console.log('ID as string:', overrideSchema.safeParse({
  id: 'uuid-123',
  createdAt: '2024-01-01'
}));

console.log('ID as number (invalid now):', overrideSchema.safeParse({
  id: 123,
  createdAt: '2024-01-01'
}));

// Type inference
type User = kataxInfer<typeof userSchema>;
type Override = kataxInfer<typeof overrideSchema>;

console.log('\n=== Merge Method Tests ===\n');

const schemaA = k.object({
  a: k.string(),
  shared: k.number()
});

const schemaB = k.object({
  b: k.boolean(),
  shared: k.string() // Override shared field
});

const mergedSchema = schemaA.merge(schemaB);

console.log('--- Merge Object Schemas ---');
console.log('Valid merged:', mergedSchema.safeParse({
  a: 'hello',
  b: true,
  shared: 'now a string'
}));

console.log('Invalid shared type (number instead of string):', mergedSchema.safeParse({
  a: 'hello',
  b: true,
  shared: 123
}));

console.log('\n=== getShape Method Tests ===\n');

const originalSchema = k.object({
  name: k.string(),
  age: k.number()
});

// Use spread operator with getShape
const extendedWithSpread = k.object({
  ...originalSchema.getShape(),
  email: k.string().email()
});

console.log('--- Using getShape with spread ---');
console.log('Valid spread extended:', extendedWithSpread.safeParse({
  name: 'Bob',
  age: 30,
  email: 'bob@example.com'
}));

console.log('\n=== Chaining extend and merge ===\n');

const step1 = k.object({ a: k.number() });
const step2 = step1.extend({ b: k.string() });
const step3 = step2.extend({ c: k.boolean() });

console.log('--- Chained extend ---');
console.log('Valid chained:', step3.safeParse({ a: 1, b: 'two', c: true }));

// Complex example: API response
const baseResponse = k.object({
  success: k.boolean(),
  timestamp: k.string()
});

const userResponse = baseResponse.extend({
  data: k.object({
    id: k.number(),
    name: k.string()
  })
});

const errorResponse = baseResponse.extend({
  error: k.object({
    code: k.number(),
    message: k.string()
  })
});

console.log('\n--- API Response Pattern ---');
console.log('User response:', userResponse.safeParse({
  success: true,
  timestamp: '2024-01-01T00:00:00Z',
  data: { id: 1, name: 'Alice' }
}));

console.log('Error response:', errorResponse.safeParse({
  success: false,
  timestamp: '2024-01-01T00:00:00Z',
  error: { code: 404, message: 'Not found' }
}));

console.log('\n=== All Union/Intersection/Extend tests completed! ===');
