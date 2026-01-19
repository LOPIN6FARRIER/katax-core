import { k } from '../k';
import type { kataxInfer } from '../index';

console.log('=== Custom Schema Tests ===\n');

// Custom validation logic
const positiveEven = k.custom<number>((value, path) => {
  if (typeof value !== 'number') {
    return [{ path, message: 'Expected number' }];
  }
  if (value <= 0) {
    return [{ path, message: 'Must be positive' }];
  }
  if (value % 2 !== 0) {
    return [{ path, message: 'Must be even' }];
  }
  return value;
});

console.log('--- Custom: Positive Even Number ---');
console.log('4 (valid):', positiveEven.safeParse(4));
console.log('3 (odd):', positiveEven.safeParse(3));
console.log('-2 (negative):', positiveEven.safeParse(-2));
console.log('"hello" (not number):', positiveEven.safeParse('hello'));

// Custom with refine
const customWithRefine = k.custom<string>((value, path) => {
  if (typeof value !== 'string') {
    return [{ path, message: 'Expected string' }];
  }
  return value;
}).refine(
  (val) => val.length >= 3,
  'Must be at least 3 characters'
).refine(
  (val) => val.startsWith('K'),
  (val) => `Expected to start with K, got: ${val}`
);

console.log('\n--- Custom with Refine ---');
console.log('"Katax" (valid):', customWithRefine.safeParse('Katax'));
console.log('"Ka" (too short):', customWithRefine.safeParse('Ka'));
console.log('"Hello" (no K):', customWithRefine.safeParse('Hello'));

console.log('\n=== Literal Schema Tests ===\n');

const activeStatus = k.literal('active');
const numberLiteral = k.literal(42);
const trueLiteral = k.literal(true);
const nullLiteral = k.literal(null);

console.log('--- Literal Values ---');
console.log('"active" for literal("active"):', activeStatus.safeParse('active'));
console.log('"inactive" for literal("active"):', activeStatus.safeParse('inactive'));
console.log('42 for literal(42):', numberLiteral.safeParse(42));
console.log('43 for literal(42):', numberLiteral.safeParse(43));
console.log('true for literal(true):', trueLiteral.safeParse(true));
console.log('false for literal(true):', trueLiteral.safeParse(false));
console.log('null for literal(null):', nullLiteral.safeParse(null));
console.log('undefined for literal(null):', nullLiteral.safeParse(undefined));

console.log('\n=== Enum Schema Tests ===\n');

const status = k.enum(['pending', 'active', 'completed', 'cancelled']);

console.log('--- String Enum ---');
console.log('"pending":', status.safeParse('pending'));
console.log('"active":', status.safeParse('active'));
console.log('"invalid":', status.safeParse('invalid'));
console.log('123 (not string):', status.safeParse(123));

// Type inference
type Status = kataxInfer<typeof status>;

console.log('\n=== Any/Unknown/Never Schema Tests ===\n');

const anySchema = k.any();
const unknownSchema = k.unknown();
const neverSchema = k.never();

console.log('--- Any Schema ---');
console.log('String:', anySchema.safeParse('hello'));
console.log('Number:', anySchema.safeParse(42));
console.log('Object:', anySchema.safeParse({ foo: 'bar' }));
console.log('Null:', anySchema.safeParse(null));

console.log('\n--- Unknown Schema ---');
console.log('String:', unknownSchema.safeParse('hello'));
console.log('Array:', unknownSchema.safeParse([1, 2, 3]));

console.log('\n--- Never Schema ---');
console.log('String (always fails):', neverSchema.safeParse('hello'));
console.log('Undefined (always fails):', neverSchema.safeParse(undefined));

console.log('\n=== Tuple Schema Tests ===\n');

const point2d = k.tuple([k.number(), k.number()]);
const point3d = k.tuple([k.number(), k.number(), k.number()]);
const mixedTuple = k.tuple([k.string(), k.number(), k.boolean()]);

console.log('--- Tuple Schemas ---');
console.log('[1, 2] for 2D point:', point2d.safeParse([1, 2]));
console.log('[1, 2, 3] for 2D point (wrong length):', point2d.safeParse([1, 2, 3]));
console.log('[1] for 2D point (too short):', point2d.safeParse([1]));
console.log('[1, 2, 3] for 3D point:', point3d.safeParse([1, 2, 3]));
console.log('["a", 1, true] for mixed tuple:', mixedTuple.safeParse(['a', 1, true]));
console.log('[1, "a", true] for mixed tuple (wrong types):', mixedTuple.safeParse([1, 'a', true]));
console.log('Not an array:', point2d.safeParse('not array'));

// Type inference
type Point2D = kataxInfer<typeof point2d>;
type MixedTuple = kataxInfer<typeof mixedTuple>;

console.log('\n=== Record Schema Tests ===\n');

const scores = k.record(k.number());
const stringMap = k.record(k.string());
const userMap = k.record(k.object({
  name: k.string(),
  age: k.number()
}));

console.log('--- Record Schemas ---');
console.log('Scores { alice: 100, bob: 85 }:', scores.safeParse({ alice: 100, bob: 85 }));
console.log('Scores with string value:', scores.safeParse({ alice: '100', bob: 85 }));
console.log('Empty record:', scores.safeParse({}));
console.log('String map:', stringMap.safeParse({ key1: 'value1', key2: 'value2' }));
console.log('User map:', userMap.safeParse({
  user1: { name: 'Alice', age: 30 },
  user2: { name: 'Bob', age: 25 }
}));
console.log('Invalid user map:', userMap.safeParse({
  user1: { name: 'Alice' }, // missing age
  user2: { name: 'Bob', age: 25 }
}));
console.log('Not an object:', scores.safeParse([1, 2, 3]));

// Type inference
type Scores = kataxInfer<typeof scores>;
type UserMap = kataxInfer<typeof userMap>;

console.log('\n=== Lazy Schema Tests ===\n');

// Recursive type definition
interface TreeNode {
  value: string;
  children: TreeNode[];
}

// Must declare type explicitly for recursive schemas
const treeSchema: ReturnType<typeof k.lazy<TreeNode>> = k.lazy(() =>
  k.object({
    value: k.string(),
    children: k.array(treeSchema)
  })
);

console.log('--- Lazy/Recursive Schema ---');
console.log('Simple tree:', treeSchema.safeParse({
  value: 'root',
  children: []
}));

console.log('Nested tree:', treeSchema.safeParse({
  value: 'root',
  children: [
    { value: 'child1', children: [] },
    {
      value: 'child2',
      children: [
        { value: 'grandchild', children: [] }
      ]
    }
  ]
}));

console.log('Invalid tree (missing children):', treeSchema.safeParse({
  value: 'root'
}));

console.log('Invalid tree (wrong child type):', treeSchema.safeParse({
  value: 'root',
  children: ['not an object']
}));

console.log('\n=== Complex Example: Form Validation ===\n');

// Using all new features together
const formFieldSchema = k.object({
  type: k.enum(['text', 'number', 'email', 'select']),
  label: k.string(),
  required: k.boolean().optional(),
  value: k.union([k.string(), k.number(), k.boolean()]).nullable()
});

const formSchema = k.object({
  id: k.string(),
  fields: k.record(formFieldSchema)
});

console.log('--- Form Schema ---');
console.log('Valid form:', formSchema.safeParse({
  id: 'contact-form',
  fields: {
    name: { type: 'text', label: 'Name', required: true, value: 'John' },
    age: { type: 'number', label: 'Age', value: 25 },
    email: { type: 'email', label: 'Email', value: null }
  }
}));

console.log('\nInvalid form (bad field type):', formSchema.safeParse({
  id: 'contact-form',
  fields: {
    name: { type: 'invalid', label: 'Name', value: 'John' }
  }
}));

console.log('\n=== All Custom Schema tests completed! ===');
