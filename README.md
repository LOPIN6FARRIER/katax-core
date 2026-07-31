# Katax Core

[![npm version](https://img.shields.io/npm/v/katax-core.svg)](https://www.npmjs.com/package/katax-core)
[![npm downloads](https://img.shields.io/npm/dm/katax-core.svg)](https://www.npmjs.com/package/katax-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight and extensible schema validation library for TypeScript/JavaScript.

## Features

- **Type-safe validation** with full TypeScript support
- **Comprehensive schemas**: String, Number, Boolean, BigInt, Object, Array, Date, Email, Base64, File, TwoDates, Promise, Set, Map
- **Primitive schemas**: nan, undefined, null, void
- **Union, Intersection & Discriminated Union schemas** - combine schemas flexibly
- **Branded types** - nominal typing via `.brand()`
- **String format validators**: email, url, uuid, ip, datetime, jwt, cuid2, ulid, emoji, cidr
- **Extend & Merge** - compose object schemas easily
- **Custom schemas** - create your own validation logic
- **Type coercion** - auto-convert strings to numbers, booleans, dates
- **Preprocess** - transform input before validation
- **Catch/Fallback** - error recovery with default values
- **Passthrough/Strip/Strict** - control extra object properties
- **Async validation support** - validate against databases, APIs, and external services
- **Immutable chaining** — all builder methods return clones, safe to reuse base schemas
- **Chaining API** for clean and readable validation rules
- **Multiple error reporting** - get all validation errors at once
- **Transform support** - validate and transform data in one step
- **JSON Schema Draft 2020-12 output** - generate JSON Schema via `.toJsonSchema()`
- **Schema descriptions** - add descriptions via `.describe()` that persist through chaining and composition
- **Recursive schemas** - support for self-referencing types
- **Minimal dependencies** (only `date-fns`)
- **Browser and Node.js** compatible

## Installation

```bash
npm install katax-core
```

### AI Agent Skill

Install the [katax-core AI agent skill](https://skills.sh/LOPIN6FARRIER/katax-core) for enhanced IDE assistance:

[![skills.sh](https://skills.sh/b/LOPIN6FARRIER/katax-core)](https://skills.sh/LOPIN6FARRIER/katax-core)

```bash
npx skills add LOPIN6FARRIER/katax-core
```

Compatible with Claude Code, Cursor, Windsurf, GitHub Copilot, and other AI coding agents.

## Quick Start

```typescript
import { k } from 'katax-core';

const userSchema = k.object({
  name: k.string().minLength(2),
  email: k.string().email(),
  age: k.number().min(18).max(100),
  tags: k.array(k.string()).optional()
});

const result = userSchema.safeParse({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  tags: ['developer', 'typescript']
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', result.issues);
}
```

## Schema Types

All schemas expose the standard `Schema<T>` interface with `parse`, `safeParse`, `validate`, `parseAsync`, `safeParseAsync`, `isValidAsync`, `hasAsyncValidation`, and `refine` methods. All builder methods return new instances (immutable chaining).

### String Schema

```typescript
k.string()
  .minLength(3)         .maxLength(50)
  .length(10)           .lowercase()
  .uppercase()          .alpha()
  .alphanumeric()       .ascii()
  .uuid()               .ip()
  .noWhitespace()       .nonempty()
  .email()              .url()
  .datetime()           .jwt()
  .cuid2()              .ulid()
  .emoji()              .cidr()
  .regex(/^[a-z]+$/)    .startsWith('prefix')
  .endsWith('suffix')   .includes('substring')
  .oneOf(['a', 'b'])    .notOneOf(['c', 'd'])
  .trim()               // no message parameter
```

- `.minLength(n, msg?)`, `.maxLength(n, msg?)`, `.length(n, msg?)`
- `.lowercase(msg?)`, `.uppercase(msg?)`
- `.alpha(msg?)`, `.alphanumeric(msg?)`, `.ascii(msg?)`
- `.uuid(msg?)`, `.ip(msg?)`
- `.noWhitespace(msg?)`, `.nonempty(msg?)`
- `.email(msg?)`, `.url(msg?)`
- `.datetime(msg?)` - ISO 8601 datetime, `.jwt(msg?)` - JSON Web Token
- `.cuid2(msg?)` - CUID2, `.ulid(msg?)` - ULID
- `.emoji(msg?)` - emoji sequences, `.cidr(msg?)` - CIDR notation
- `.regex(pattern, msg?)`
- `.startsWith(s, msg?)`, `.endsWith(s, msg?)`, `.includes(s, msg?)`
- `.oneOf(arr, msg?)`, `.notOneOf(arr, msg?)`
- `.trim()` - does not accept a message parameter

### Number Schema

```typescript
k.number()
  .min(0)               .max(100)
  .equals(3)            .positive()
  .negative()           .nonnegative()
  .nonpositive()        .finite()
  .integer()            .multipleOf(5)
  .notEqual(0)          .between(10, 20)
  .greaterThan(5)       .lessThan(100)
  .oneOf([1, 2, 3])     .notOneOf([-1, -2])
```

- `.min(n, msg?)`, `.max(n, msg?)`, `.equals(n, msg?)`
- `.positive(msg?)`, `.negative(msg?)`
- `.nonnegative(msg?)` (>= 0), `.nonpositive(msg?)` (<= 0)
- `.finite(msg?)`, `.integer(msg?)`
- `.multipleOf(n, msg?)`, `.notEqual(n, msg?)`
- `.between(min, max, msg?)`, `.greaterThan(n, msg?)`, `.lessThan(n, msg?)`
- `.oneOf(arr, msg?)`, `.notOneOf(arr, msg?)`

### Boolean Schema

```typescript
k.boolean()
  .isTrue()      // must be true
  .isFalse()     // must be false
  .equals(true)  // must equal given boolean
```

- `.isTrue(msg?)`, `.isFalse(msg?)`, `.equals(bool, msg?)`

### Primitive Schemas

```typescript
k.nan()        // only NaN
k.null()       // only null
k.undefined()  // only undefined
k.void()       // null or undefined
```

```typescript
k.nan().parse(NaN);           // OK
k.null().parse(null);         // OK
k.undefined().parse(undefined); // OK
k.void().parse(null);         // OK
k.void().parse(undefined);    // OK
```

### BigInt Schema

```typescript
k.bigint()
  .min(0n)              .max(100n)
  .positive()           .negative()
  .nonnegative()        .nonpositive()
  .between(10n, 20n)    .multipleOf(5n)
  .equals(0n)           .oneOf([1n, 2n, 3n])
  .notOneOf([-1n, -2n])
```

- `.min(n, msg?)`, `.max(n, msg?)`, `.equals(n, msg?)`
- `.positive(msg?)`, `.negative(msg?)`
- `.nonnegative(msg?)`, `.nonpositive(msg?)`
- `.between(min, max, msg?)`, `.multipleOf(n, msg?)`
- `.oneOf(arr, msg?)`, `.notOneOf(arr, msg?)`

### Object Schema

```typescript
k.object({
  required: k.string(),
  optional: k.number().optional(),
  withDefault: k.boolean().default(true)
})
  .strict()         // reject extra keys
  .partial()        // make all fields optional
  .pick(['key'])    // keep only specified keys
  .omit(['key'])    // remove specified keys
  .passthrough()    // keep extra keys
  .strip()          // remove extra keys (default)
  .caseInsensitive()
```

**Object behavior:**
- By default, objects **strip** extra keys without error
- `.passthrough()` keeps extra keys in the output
- `.strict()` rejects extra keys with validation errors
- `.strip()` explicitly strips extra keys (same as default)

**Extend and Merge:**
```typescript
const baseSchema = k.object({ id: k.number(), createdAt: k.string() });
const userSchema = baseSchema.extend({
  name: k.string(),
  email: k.email()
});

const schemaA = k.object({ a: k.string() });
const schemaB = k.object({ b: k.number() });
const merged = schemaA.merge(schemaB);

// Use getShape() for spread composition
const newSchema = k.object({
  ...baseSchema.getShape(),
  extra: k.boolean()
});
```

- `.extend(extension)` - add fields to schema
- `.merge(other)` - combine with another object schema
- `.getShape()` - get the shape definition object
- `.caseInsensitive()` - case-insensitive key matching

### Array Schema

```typescript
k.array(k.string())
  .minLength(1)         .maxLength(10)
  .length(5)            .min(1)
  .max(10)              .notEmpty()
  .unique()             .contains('required-item')
```

- `.minLength(n, msg?)`, `.maxLength(n, msg?)`, `.length(n, msg?)`
- `.min(n, msg?)`, `.max(n, msg?)` (aliases for minLength/maxLength)
- `.notEmpty(msg?)`, `.unique(msg?)`
- `.contains(element, msg?)`

### Date Schema

```typescript
k.date()
  .min('2024-01-01')          .max('2024-12-31')
  .between('2024-01', '2024-06')
  .isFuture()                  .isPast()
  .format('yyyy-MM-dd')        .isDateOnly()
  .hasTime()                   .formatOutput('dd/MM/yyyy')
```

- `.min(dateStr, msg?)`, `.max(dateStr, msg?)`, `.between(start, end, msg?)`
- `.isFuture(msg?)`, `.isPast(msg?)`
- `.format(formatStr, msg?)` - validate date format
- `.isDateOnly(msg?)` - no time component
- `.hasTime(msg?)` - must include time
- `.formatOutput(formatStr)` - transforms output type to `string`

### Email Schema

```typescript
k.email()
  .domain('company.com')              .domains(['company.com', 'org.com'])
  .domainPattern('*.company.com')     .notDomains(['spam.com'])
  .localMinLength(3)                  .localMaxLength(64)
  .localPattern(/^[a-z]+/)           .corporate()
  .noPlus()                           .noDots()
```

- `.domain(d, msg?)` - require specific domain
- `.domains(arr, msg?)` - allow only listed domains
- `.domainPattern(pattern, msg?)` - domain regex pattern
- `.notDomains(arr, msg?)` - reject listed domains
- `.localMinLength(n, msg?)`, `.localMaxLength(n, msg?)`
- `.localPattern(regex, msg?)` - local part regex
- `.corporate(msg?)` - no free email providers
- `.noPlus(msg?)` - no plus addressing
- `.noDots(msg?)` - no dots in local part

### File Schema (Browser & Node.js)

```typescript
k.file()
  .maxSize(1024 * 1024 * 5)     // 5MB
  .minSize(1024)                 // 1KB
  .type('image/jpeg')            // exact MIME type
  .types(['image/jpeg', 'image/png'])
  .typePattern('image/*')        // pattern matching
  .extension('.jpg')             // single extension
  .extensions(['.jpg', '.png'])  // multiple extensions
  .namePattern(/^[a-z0-9-]+$/)  // filename regex
  .image()                       // shortcut for image/*
  .video()                       // shortcut for video/*
  .audio()                       // shortcut for audio/*
  .document()                    // PDF, Word, Excel, etc.
```

### Base64 Schema

```typescript
k.base64()
  .minDecodedSize(1024)          .maxDecodedSize(1024 * 1024)
  .mimeType('image/png')         .mimeTypePattern('image/*')
  .image()                       .pdf()
  .json()                        .dataUrl()
```

- `.minDecodedSize(bytes, msg?)`, `.maxDecodedSize(bytes, msg?)`
- `.mimeType(type, msg?)`, `.mimeTypePattern(p, msg?)`
- `.image(msg?)`, `.pdf(msg?)`, `.json(msg?)`, `.dataUrl(msg?)`

### TwoDates Schema

```typescript
k.twoDates('|')
  .maxDifference(30)             .minDifference(7)
  .maxDifferenceHours(48)        .minDifferenceHours(12)
  .order(true)                   // ascending order
```

Parses a string with two dates separated by a separator (default `'|'`), e.g. `"2024-01-01|2024-01-15"`.

- `.maxDifference(days, msg?)` - max days between dates
- `.minDifference(days, msg?)` - min days between dates
- `.maxDifferenceHours(hours, msg?)` - max hours between dates
- `.minDifferenceHours(hours, msg?)` - min hours between dates
- `.order(ascending?, msg?)` - enforce date order (default ascending)

### Union Schema

```typescript
const stringOrNumber = k.union([k.string(), k.number()]);
stringOrNumber.parse("hello"); // OK
stringOrNumber.parse(42);      // OK
stringOrNumber.parse(true);    // Error
```

### Intersection Schema

```typescript
const withId = k.object({ id: k.number() });
const withName = k.object({ name: k.string() });
const combined = k.intersection([withId, withName]);
// Must have: id AND name
```

### Discriminated Union Schema

Validates tagged unions with O(1) dispatch by a discriminator key. Performs better than regular unions on large schemas.

```typescript
const animalSchema = k.discriminatedUnion("type", {
  cat: k.object({ type: k.literal("cat"), meow: k.boolean() }),
  dog: k.object({ type: k.literal("dog"), bark: k.boolean() })
});

animalSchema.parse({ type: "cat", meow: true });     // OK
animalSchema.parse({ type: "dog", bark: false });     // OK
animalSchema.parse({ type: "fish", swim: true });     // Error: invalid discriminator
```

### Literal and Enum

```typescript
const active = k.literal('active');
active.parse('active');    // OK
active.parse('inactive');  // Error

const status = k.enum(['pending', 'active', 'completed']);
type Status = kataxInfer<typeof status>; // 'pending' | 'active' | 'completed'
```

### Tuple Schema

```typescript
const point2d = k.tuple([k.number(), k.number()]);
point2d.parse([1, 2]);     // OK: [number, number]
point2d.parse([1, 2, 3]);  // Error: wrong length

const mixed = k.tuple([k.string(), k.number(), k.boolean()]);
mixed.parse(['hello', 42, true]); // OK
```

### Record Schema

```typescript
const scores = k.record(k.number());
scores.parse({ alice: 100, bob: 85 }); // OK

const userMap = k.record(k.object({
  name: k.string(),
  age: k.number()
}));
```

### Promise Schema

```typescript
k.promise()                // validates input is a Promise
k.promise(k.number())      // also validates resolved value
```

```typescript
const acceptsPromise = k.promise(k.string());
const result = acceptsPromise.parse(Promise.resolve("hello"));
// Returns Promise<string> that resolves to "hello"
```

### Set Schema

```typescript
k.set()                  // validates input is a Set
k.set(k.number())        // validates each element
```

```typescript
const numberSet = k.set(k.number().positive());
numberSet.parse(new Set([1, 2, 3])); // OK
numberSet.parse(new Set([1, -2]));   // Error: invalid element
```

### Map Schema

```typescript
k.map()                        // validates input is a Map
k.map(k.string(), k.number())  // validates keys and values
```

```typescript
const scoreMap = k.map(k.string(), k.number());
scoreMap.parse(new Map([["alice", 100], ["bob", 85]])); // OK
```

### Branded Types

Add nominal typing to existing schemas. The brand is a compile-time type construct stored as `__brand` on objects:

```typescript
const userId = k.string().brand("UserId");
const postId = k.string().brand("PostId");

function getUser(id: kataxInfer<typeof userId>) { /* ... */ }

getUser(userId.parse("abc"));  // OK
getUser(postId.parse("xyz"));  // TypeScript error
```

### Custom Schema

```typescript
const positiveEven = k.custom<number>((value, path) => {
  if (typeof value !== 'number') {
    return [{ path, message: 'Expected number' }];
  }
  if (value <= 0 || value % 2 !== 0) {
    return [{ path, message: 'Expected positive even number' }];
  }
  return value;
});

// Add refinements
const customWithRefine = k.custom<string>((value, path) => {
  if (typeof value !== 'string') {
    return [{ path, message: 'Expected string' }];
  }
  return value;
}).refine(
  val => val.length >= 3,
  'Must be at least 3 characters'
);
```

- `.refine(check: (value: T) => boolean, message: string | ((value: T) => string))`

### Lazy Schema (Recursive Types)

```typescript
interface TreeNode {
  value: string;
  children: TreeNode[];
}

const treeSchema: ReturnType<typeof k.lazy<TreeNode>> = k.lazy(() =>
  k.object({
    value: k.string(),
    children: k.array(treeSchema)
  })
);

treeSchema.parse({
  value: 'root',
  children: [
    { value: 'child1', children: [] },
    { value: 'child2', children: [
      { value: 'grandchild', children: [] }
    ]}
  ]
});
```

### Any, Unknown, Never

```typescript
const anything = k.any();     // accepts any value
const data = k.unknown();     // accepts any value, typed as unknown
const impossible = k.never(); // never matches
```

## Common Modifiers

All schemas support these chainable modifiers:

```typescript
k.string().optional()         // T | undefined
k.string().nullable()         // T | null
k.string().nullish()          // T | null | undefined
k.string().default('fallback') // return default if undefined
k.string().catch('fallback')  // return fallback on validation failure
k.string().transform(s => s.toUpperCase()) // transform output type
k.string().brand('UserId')    // nominal typing (T & { __brand: B })
k.string().refine(v => v.length > 0) // custom refinement
k.string().asyncRefine(async v => []) // async refinement
```

## JSON Schema Output

Generate JSON Schema Draft 2020-12 from any schema using `toJsonSchema()`:

```typescript
import { k } from 'katax-core';

const schema = k.object({
  name: k.string().minLength(2).describe("User's full name"),
  email: k.string().email(),
  age: k.number().min(18).max(120).describe("Age in years"),
  role: k.enum(['admin', 'user']).default('user')
});

const jsonSchema = schema.toJsonSchema();
// {
//   type: "object",
//   properties: {
//     name: { type: "string", minLength: 2, description: "User's full name" },
//     email: { type: "string", format: "email" },
//     age: { type: "number", minimum: 18, maximum: 120, description: "Age in years" },
//     role: { enum: ["admin", "user"], default: "user" }
//   },
//   required: ["name", "email", "age"]
// }
```

### .describe(description)

All schemas support `.describe()` for adding human-readable descriptions that appear in the generated JSON Schema:

```typescript
k.string().describe("A username")
k.number().min(0).describe("Item count")
```

Descriptions persist through chaining, composition, and object schema transformations:

```typescript
const schema = k.object({ id: k.number() })
  .describe("User profile")
  .partial()
  .pick(['id']);

schema.toJsonSchema().description // "User profile"
```

### Supported JSON Schema mappings

| Schema | JSON Schema |
|--------|------------|
| `k.string()` | `{ type: "string" }` |
| `k.string().email()` | `{ type: "string", format: "email" }` |
| `k.number()` | `{ type: "number" }` |
| `k.number().min(5).max(10)` | `{ type: "number", minimum: 5, maximum: 10 }` |
| `k.number().greaterThan(5).lessThan(10)` | `{ type: "number", exclusiveMinimum: 5, exclusiveMaximum: 10 }` |
| `k.boolean()` | `{ type: "boolean" }` |
| `k.bigint()` | `{ type: "integer" }` |
| `k.null()` | `{ type: "null" }` |
| `k.nan()` | `{ type: "number" }` |
| `k.date()` | `{ type: "string", format: "date-time" }` |
| `k.base64()` | `{ type: "string", contentEncoding: "base64" }` |
| `k.array(T)` | `{ type: "array", items: { ... } }` |
| `k.object({...})` | `{ type: "object", properties: {...}, required: [...] }` |
| `k.tuple([A, B])` | `{ type: "array", prefixItems: [{...}, {...}], items: false }` |
| `k.record(T)` | `{ type: "object", additionalProperties: { ... } }` |
| `k.set(T)` | `{ type: "array", uniqueItems: true, items: { ... } }` |
| `k.map(K, V)` | `{ type: "object", additionalProperties: { ... } }` |
| `k.literal(v)` | `{ const: v }` |
| `k.enum([...])` | `{ enum: [...] }` |
| `k.never()` | `{ not: {} }` |
| `k.union([...])` | `{ anyOf: [...] }` |
| `k.intersection([...])` | `{ allOf: [...] }` |
| `k.discriminatedUnion(...)` | `{ oneOf: [...] }` |
| `.default(v)` | adds `default: v` |
| `.describe(s)` | adds `description: s` |

## Type Coercion

Automatically convert input types before validation via `k.coerce.*`:

> **`null`/`undefined` policy differs per type** — this is intentional, not an oversight:
>
> | Coercion | `null`/`undefined` behavior |
> |---|---|
> | `k.coerce.number()` | throws a validation issue (no sensible numeric default) |
> | `k.coerce.date()` | throws a validation issue (no sensible date default) |
> | `k.coerce.boolean()` | coerces to `false` |
> | `k.coerce.string()` | coerces to `""` |
>
> If you need a different default, chain `.default(...)` or `.catch(...)` on the coerced schema.

### Coerced Number

```typescript
k.coerce.number()
k.coerce.number().positive().integer()

// Proxy methods: min, max, positive, negative, integer, finite,
//                multipleOf, between, greaterThan, lessThan, oneOf, notOneOf

k.coerce.number().parse("123");    // 123
k.coerce.number().parse("45.67");  // 45.67
```

### Coerced Boolean

```typescript
k.coerce.boolean()
k.coerce.boolean().isTrue()

// Proxy methods: isTrue, isFalse, equals

k.coerce.boolean().parse("true");   // true
k.coerce.boolean().parse("false");  // false
k.coerce.boolean().parse("1");      // true
k.coerce.boolean().parse("0");      // false
k.coerce.boolean().parse("yes");    // true
k.coerce.boolean().parse("no");     // false
k.coerce.boolean().parse(1);        // true
k.coerce.boolean().parse(0);        // false
```

### Coerced String

```typescript
k.coerce.string()
k.coerce.string().email().minLength(5)

// Proxy methods: minLength, maxLength, email, url, regex, trim,
//                lowercase, uppercase, oneOf, startsWith, endsWith, uuid,
//                datetime, jwt, cuid2, ulid, emoji, cidr

k.coerce.string().parse(123);    // "123"
k.coerce.string().parse(true);   // "true"
k.coerce.string().parse(null);   // ""
```

### Coerced Date

```typescript
k.coerce.date()
k.coerce.date().isFuture()

// Proxy methods: min, max, between, isFuture, isPast

k.coerce.date().parse("2024-01-15");     // Date object
k.coerce.date().parse(1705276800000);    // Date from timestamp
k.coerce.date().parse(new Date());       // passthrough
```

## Preprocess

Transform input before validation:

```typescript
const normalizedEmail = k.preprocess(
  (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
  k.string().email()
);
normalizedEmail.parse("  JOHN@EXAMPLE.COM  "); // "john@example.com"

const parseJSON = k.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); }
      catch { return val; }
    }
    return val;
  },
  k.object({ name: k.string(), age: k.number() })
);
parseJSON.parse('{"name":"John","age":30}'); // { name: "John", age: 30 }
```

## Catch/Fallback

Provide default values on validation failure:

```typescript
const stringWithDefault = k.string().catch("default value");
stringWithDefault.parse("hello");    // "hello"
stringWithDefault.parse(123);        // "default value"
stringWithDefault.parse(null);       // "default value"

const safeNumber = k.number().positive().catch(0);
safeNumber.parse(42);                // 42
safeNumber.parse(-5);                // 0

const userWithDefault = k.object({
  name: k.string(),
  age: k.number()
}).catch({ name: "Anonymous", age: 0 });
userWithDefault.parse({ name: "John", age: 30 });       // { name: "John", age: 30 }
userWithDefault.parse({ invalid: true });               // { name: "Anonymous", age: 0 }
```

## Passthrough, Strip, and Strict

Control how object schemas handle extra properties:

```typescript
const userSchema = k.object({ name: k.string() });

// Default behavior: strip extra keys
userSchema.parse({ name: 'John', extra: 'removed' });
// { name: 'John' }

// Passthrough: keep extra keys
const passthroughSchema = userSchema.passthrough();
passthroughSchema.parse({ name: 'John', extra: 'kept' });
// { name: 'John', extra: 'kept' }

// Explicit strip (same as default)
const stripSchema = userSchema.strip();
stripSchema.parse({ name: 'John', extra: 'removed' });
// { name: 'John' }

// Strict: error on extra keys
const strictSchema = userSchema.strict();
strictSchema.parse({ name: 'John', extra: 'not allowed' });
// Error: Unknown keys: extra
```

## Transforms

```typescript
const schema = k.string()
  .transform(s => s.toUpperCase())
  .transform(s => s.trim());

const result = schema.safeParse('  hello  ');
// result.data === 'HELLO'
```

## Async Validation

Validate against external services, databases, or APIs:

```typescript
import { k } from 'katax-core';

// Define an async validator
const emailUniqueValidator = async (email, path) => {
  const exists = await db.users.findOne({ email });
  if (exists) {
    return [{ path, message: 'Email already registered' }];
  }
  return [];
};

// Schema with async validators
const registrationSchema = k.object({
  email: k.email(),
  password: k.string().minLength(8)
});

// Use async validation
const result = await registrationSchema.safeParseAsync({
  email: 'user@example.com',
  password: 'SecurePass123'
});

if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.issues);
}

// Quick async check
const isValid = await registrationSchema.isValidAsync(data);
// { valid: boolean, issues: Issue[] }

// Throw on failure
const data = await registrationSchema.parseAsync(input);
```

**Schema async methods:**
- `.parseAsync(input)` - returns `Promise<T>`, throws on error
- `.safeParseAsync(input)` - returns `AsyncSafeParseResult<T>`
- `.isValidAsync(input)` - returns `Promise<AsyncValidationResult>`
- `.hasAsyncValidation()` - returns `boolean` (check if any async validators exist)

## Error Handling

Katax returns all validation errors at once:

```typescript
const result = schema.safeParse(invalidData);
if (!result.success) {
  result.issues.forEach(issue => {
    console.log(`${issue.path.join('.')}: ${issue.message}`);
  });
}
```

### KataxError

```typescript
import { KataxError } from 'katax-core';

try {
  schema.parse(invalidData);
} catch (e) {
  if (e instanceof KataxError) {
    e.issues.forEach(issue => {
      console.log(`${issue.path.join('.')}: ${issue.message}`);
    });
  }
}
```

`KataxError` extends `Error` with a `readonly issues: Issue[]` property.

## Error Utilities

```typescript
import { createIssue, issues, mergeIssues, isIssueArray, describeReceived, KataxError } from 'katax-core';

// Create a single issue
const issue = createIssue(['name'], 'Name is required');

// Create issues array
const errs = issues(['name'], 'Name is required');

// Merge multiple issue arrays
const allIssues = mergeIssues(...issueArrays);

// Check if a value is an Issue array
if (isIssueArray(value)) {
  // handle issues
}

// Describe a value's type for error messages
describeReceived(null);       // "null"
describeReceived(undefined);  // "undefined"
describeReceived([]);         // "array"
describeReceived("hi");       // "string"
```

Common pattern — use inside `asyncRefine` or custom validators:

```typescript
const schema = k.string().asyncRefine(async (value, path) => {
  const exists = await db.users.exists({ email: value });
  return exists ? issues(path, 'Email already registered') : [];
});
```

## TypeScript Integration

```typescript
import { k, kataxInfer } from 'katax-core';

const userSchema = k.object({
  name: k.string(),
  age: k.number()
});

type User = kataxInfer<typeof userSchema>;
// User = { name: string; age: number }

// With descriptive type alias
const createProjectSchema = k.object({
  title: k.string().min(3),
  description: k.string().optional(),
  tags: k.array(k.string())
});

type CreateProjectData = kataxInfer<typeof createProjectSchema>;
// CreateProjectData = { title: string; description?: string; tags: string[] }
```

## Core Types

```typescript
type Path = (string | number)[]

interface Issue {
  path: Path
  message: string
}

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; issues: Issue[] }

interface ValidationResult {
  valid: boolean
  issues: Issue[]
}

type AsyncSafeParseResult<T> = SafeParseResult<T>

interface AsyncValidationResult {
  valid: boolean
  issues: Issue[]
}

type AsyncValidator<T> = (value: T, path: Issue["path"]) => Promise<Issue[]>

type kataxInfer<T> = T extends Schema<infer U> ? U : never
```

## The `k` Factory

```typescript
const k = {
  string(): StringSchema
  number(): NumberSchema
  boolean(): BooleanSchema
  bigint(): BigIntSchema
  nan(): NanSchema
  null(): NullSchema
  undefined(): UndefinedSchema
  void(): VoidSchema
  object<T>(shape): ObjectSchema<T>
  date(): DateSchema
  twoDates(separator?): TwoDatesSchema   // default: '|'
  array<T>(elementSchema?): ArraySchema<T>
  file(): FileSchema
  base64(): Base64Schema
  email(): EmailSchema
  promise<T>(schema?): PromiseSchema<T>
  set<T>(valueSchema?): SetSchema<T>
  map<K, V>(keySchema?, valueSchema?): MapSchema<K, V>
  union<T>(schemas): UnionSchema<T>
  discriminatedUnion<K, R>(key, schemasMap): DiscriminatedUnionSchema<K, R>
  intersection<T>(schemas): IntersectionSchema<T>
  lazy<T>(resolver): LazySchema<T>
  custom<T>(validator): CustomSchema<T>
  literal<T>(value): LiteralSchema<T>
  enum<T>(values): EnumSchema<T>
  any(): AnySchema
  unknown(): UnknownSchema
  never(): NeverSchema
  tuple<T>(schemas): TupleSchema<T>
  record<V>(valueSchema): RecordSchema<V>
  coerce: {
    number(): CoercedNumberSchema
    boolean(): CoercedBooleanSchema
    string(): CoercedStringSchema
    date(): CoercedDateSchema
  }
  preprocess<T>(preprocessor, schema): PreprocessSchema<T>
}

// All schemas support:
schema.brand<B>(name): BrandedSchema<T, B>  // nominal typing
```

## License

MIT
