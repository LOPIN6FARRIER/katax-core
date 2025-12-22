import { k } from '../k';

console.log('=== Basic array validation ===');
const basicArray = k.array();
console.log('Valid array:', basicArray.safeParse([1, 2, 3]));
console.log('Valid empty array:', basicArray.safeParse([]));
console.log('Invalid (not array):', basicArray.safeParse('not an array'));
console.log('Invalid (object):', basicArray.safeParse({ 0: 'a', 1: 'b' }));

console.log('\n=== Array with element schema ===');
const numberArray = k.array(k.number());
console.log('Valid number array:', numberArray.safeParse([1, 2, 3, 4, 5]));
console.log('Invalid (contains string):', numberArray.safeParse([1, 2, 'three', 4]));
console.log('Invalid (multiple errors):', numberArray.safeParse([1, 'two', 'three', 4]));

const stringArray = k.array(k.string());
console.log('Valid string array:', stringArray.safeParse(['hello', 'world']));
console.log('Invalid (contains number):', stringArray.safeParse(['hello', 123]));

console.log('\n=== Array length validations ===');
const minArray = k.array().minLength(3);
console.log('Valid min length:', minArray.safeParse([1, 2, 3]));
console.log('Invalid too short:', minArray.safeParse([1, 2]));

const maxArray = k.array().maxLength(5);
console.log('Valid max length:', maxArray.safeParse([1, 2, 3]));
console.log('Invalid too long:', maxArray.safeParse([1, 2, 3, 4, 5, 6]));

const exactArray = k.array().length(3);
console.log('Valid exact length:', exactArray.safeParse([1, 2, 3]));
console.log('Invalid not exact:', exactArray.safeParse([1, 2]));

console.log('\n=== Not empty validation ===');
const notEmptyArray = k.array().notEmpty();
console.log('Valid not empty:', notEmptyArray.safeParse([1]));
console.log('Invalid empty:', notEmptyArray.safeParse([]));

console.log('\n=== Unique values validation ===');
const uniqueArray = k.array().unique();
console.log('Valid unique:', uniqueArray.safeParse([1, 2, 3, 4]));
console.log('Invalid duplicates:', uniqueArray.safeParse([1, 2, 3, 2, 4]));

const uniqueStrings = k.array(k.string()).unique();
console.log('Valid unique strings:', uniqueStrings.safeParse(['a', 'b', 'c']));
console.log('Invalid duplicate strings:', uniqueStrings.safeParse(['a', 'b', 'a']));

console.log('\n=== Contains validation ===');
const containsArray = k.array().contains(5);
console.log('Valid contains 5:', containsArray.safeParse([1, 2, 5, 7]));
console.log('Invalid missing 5:', containsArray.safeParse([1, 2, 3, 4]));

console.log('\n=== Chaining validations ===');
const chainedArray = k.array(k.number())
  .minLength(2)
  .maxLength(10)
  .notEmpty();

console.log('Valid chained:', chainedArray.safeParse([1, 2, 3]));
console.log('Invalid too short:', chainedArray.safeParse([1]));
console.log('Invalid empty:', chainedArray.safeParse([]));

console.log('\n=== Array with element validations ===');
const validatedNumbers = k.array(
  k.number().min(0).max(100)
);

console.log('Valid validated array:', validatedNumbers.safeParse([10, 50, 75]));
console.log('Invalid (negative):', validatedNumbers.safeParse([10, -5, 75]));
console.log('Invalid (too large):', validatedNumbers.safeParse([10, 150, 75]));

const validatedEmails = k.array(
  k.string().email()
).minLength(1);

console.log('Valid emails:', validatedEmails.safeParse(['user@example.com', 'admin@test.com']));
console.log('Invalid email format:', validatedEmails.safeParse(['user@example.com', 'not-an-email']));

console.log('\n=== Array with complex element schema ===');
const userArray = k.array(
  k.object({
    name: k.string().minLength(2),
    age: k.number().min(0).max(150),
    email: k.string().email()
  })
);

console.log('Valid user array:', userArray.safeParse([
  { name: 'John', age: 30, email: 'john@example.com' },
  { name: 'Jane', age: 25, email: 'jane@example.com' }
]));

console.log('Invalid user (bad email):', userArray.safeParse([
  { name: 'John', age: 30, email: 'john@example.com' },
  { name: 'Jane', age: 25, email: 'not-an-email' }
]));

console.log('\n=== Custom error messages ===');
const customArray = k.array(k.string())
  .minLength(2, 'Debe haber al menos 2 elementos')
  .unique('No se permiten duplicados');

console.log('Valid custom:', customArray.safeParse(['a', 'b', 'c']));
console.log('Invalid too short:', customArray.safeParse(['a']));
console.log('Invalid duplicates:', customArray.safeParse(['a', 'b', 'a']));

console.log('\n=== Real world examples ===');

// Tags array
const tagsSchema = k.array(k.string())
  .minLength(1, 'Al menos un tag es requerido')
  .maxLength(10, 'Máximo 10 tags')
  .unique('Los tags deben ser únicos');

console.log('Valid tags:', tagsSchema.safeParse(['javascript', 'typescript', 'node']));
console.log('Invalid duplicate tags:', tagsSchema.safeParse(['javascript', 'typescript', 'javascript']));

// Scores array
const scoresSchema = k.array(k.number().min(0).max(100))
  .minLength(3)
  .maxLength(10);

console.log('Valid scores:', scoresSchema.safeParse([85, 90, 78, 92]));
console.log('Invalid score out of range:', scoresSchema.safeParse([85, 105, 78]));

// Items with stock
const itemsSchema = k.array(
  k.object({
    id: k.string(),
    name: k.string().minLength(1),
    price: k.number().positive(),
    stock: k.number().min(0).integer()
  })
).notEmpty('Debe haber al menos un item');

console.log('Valid items:', itemsSchema.safeParse([
  { id: '1', name: 'Product A', price: 99.99, stock: 10 },
  { id: '2', name: 'Product B', price: 149.99, stock: 5 }
]));

console.log('Invalid empty items:', itemsSchema.safeParse([]));

// Phone numbers
const phoneArray = k.array(
  k.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Formato: XXX-XXX-XXXX')
).minLength(1).maxLength(3);

console.log('Valid phones:', phoneArray.safeParse(['555-123-4567', '555-987-6543']));
console.log('Invalid phone format:', phoneArray.safeParse(['555-123-4567', '12345']));

console.log('\n=== Array with dates ===');
const datesArray = k.array(k.date().isPast())
  .minLength(1)
  .maxLength(10);

console.log('Valid dates array:', datesArray.safeParse(['2020-01-01', '2021-06-15', '2022-12-31']));
console.log('Invalid future date:', datesArray.safeParse(['2020-01-01', '2030-01-01']));

console.log('\n=== Nested arrays ===');
const matrixSchema = k.array(
  k.array(k.number())
    .length(3)
);

console.log('Valid matrix:', matrixSchema.safeParse([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]));

console.log('Invalid matrix (wrong inner length):', matrixSchema.safeParse([
  [1, 2, 3],
  [4, 5],
  [7, 8, 9]
]));

console.log('\n=== Optional and nullable arrays ===');
const optionalArray = k.array(k.string()).minLength(1).optional();
console.log('Optional with value:', optionalArray.safeParse(['a', 'b']));
console.log('Optional with undefined:', optionalArray.safeParse(undefined));

const nullableArray = k.array(k.number()).nullable();
console.log('Nullable with value:', nullableArray.safeParse([1, 2, 3]));
console.log('Nullable with null:', nullableArray.safeParse(null));
