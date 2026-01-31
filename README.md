# Katax Core

[![npm version](https://img.shields.io/npm/v/katax-core.svg)](https://www.npmjs.com/package/katax-core)
[![npm downloads](https://img.shields.io/npm/dm/katax-core.svg)](https://www.npmjs.com/package/katax-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight and extensible schema validation library for TypeScript/JavaScript.

## 🚀 Features

- **Type-safe validation** with full TypeScript support
- **Comprehensive schemas**: String, Number, Object, Array, Date, Email, Base64, File
- **Union & Intersection schemas** - combine schemas flexibly
- **Extend & Merge** - compose object schemas easily
- **Custom schemas** - create your own validation logic
- **Type coercion** - auto-convert strings to numbers, booleans, dates
- **Preprocess** - transform input before validation
- **Catch/Fallback** - error recovery with default values
- **Passthrough/Strip** - control extra object properties
- **Async validation support** - validate against databases, APIs, and external services
- **Chaining API** for clean and readable validation rules
- **Multiple error reporting** - get all validation errors at once
- **Transform support** - validate and transform data in one step
- **Recursive schemas** - support for self-referencing types
- **Zero dependencies** (except date-fns for date operations)
- **Browser and Node.js** compatible

## 📦 Installation

```bash
npm install katax-core
```

## 🔥 Quick Start

```typescript
import { k } from 'katax-core';

// Basic validation
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

## 📚 Schema Types

### String Schema
```typescript
k.string()
  .minLength(3)
  .maxLength(50)
  .email()
  .url()
  .regex(/^[a-zA-Z]+$/)
  .oneOf(['admin', 'user'])
  .notOneOf(['banned'])
```

### Number Schema
```typescript
k.number()
  .min(0)
  .max(100)
  .positive()
  .integer()
  .multipleOf(5)
  .finite()
```

### Object Schema
```typescript
k.object({
  required: k.string(),
  optional: k.number().optional(),
  withDefault: k.boolean().default(true)
})
.strict()   // No extra properties allowed
.partial()  // Make all fields optional
.pick(['required'])  // Pick specific fields
.omit(['optional'])  // Omit specific fields
```

#### Extend and Merge
```typescript
// Extend: add new fields to an existing schema
const baseSchema = k.object({ id: k.number(), createdAt: k.string() });
const userSchema = baseSchema.extend({
  name: k.string(),
  email: k.email()
});
// Result: { id: number, createdAt: string, name: string, email: string }

// Merge: combine two object schemas
const schemaA = k.object({ a: k.string() });
const schemaB = k.object({ b: k.number() });
const merged = schemaA.merge(schemaB);
// Result: { a: string, b: number }

// Using spread with getShape()
const newSchema = k.object({
  ...baseSchema.getShape(),
  extra: k.boolean()
});
```

### Array Schema
```typescript
k.array(k.string())
  .minLength(1)
  .maxLength(10)
  .unique()
  .contains('required-item')
```

### Date Schema
```typescript
k.date()
  .min('2024-01-01')
  .max('2024-12-31')
  .isFuture()
  .isPast()
  .format('yyyy-MM-dd')
```

### Email Schema
```typescript
k.email()
  .domain('company.com')
  .domainPattern('*.company.com')
  .corporate() // No free email providers
  .noPlus() // No plus addressing
```

### Base64 Schema
```typescript
k.base64()
  .dataUrl()
  .image()
  .maxDecodedSize(1024 * 1024) // 1MB
  .mimeType('image/png')
```

### File Schema (Browser & Node.js)
```typescript
// Works in both browser (File API) and Node.js (Multer)
k.file()
  .image()
  .maxSize(1024 * 1024 * 5) // 5MB
  .extensions(['.jpg', '.png'])

// Node.js with Multer (Express)
import { k } from 'katax-core';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
  const schema = k.object({
    title: k.string(),
    file: k.file()
      .maxSize(10 * 1024 * 1024)
      .image()
      .extensions(['jpg', 'png', 'webp'])
  });
  
  const result = schema.safeParse({ 
    ...req.body, 
    file: req.file  // Multer file works directly!
  });
  
  if (result.success) {
    // result.data.file has: buffer, originalname, mimetype, size, etc.
    res.json({ message: 'Valid file', data: result.data });
  } else {
    res.status(400).json({ errors: result.issues });
  }
});

// Available validators work in both environments:
k.file()
  .maxSize(bytes)                    // Max file size
  .minSize(bytes)                    // Min file size
  .type('image/jpeg')                // Exact MIME type
  .types(['image/jpeg', 'image/png']) // Multiple types
  .typePattern('image/*')            // Pattern matching
  .extension('.jpg')                 // Single extension
  .extensions(['.jpg', '.png'])      // Multiple extensions
  .namePattern(/^[a-z0-9-]+$/)      // Filename regex
  .image()                           // Shortcut for image/*
  .video()                           // Shortcut for video/*
  .audio()                           // Shortcut for audio/*
  .document()                        // PDF, Word, Excel, etc.
```

### Union Schema
```typescript
// Value must match ONE of the schemas
const stringOrNumber = k.union([k.string(), k.number()]);
stringOrNumber.parse("hello"); // OK
stringOrNumber.parse(42);      // OK
stringOrNumber.parse(true);    // Error

// Discriminated unions (great for APIs)
const catSchema = k.object({
  type: k.literal('cat'),
  meow: k.boolean()
});
const dogSchema = k.object({
  type: k.literal('dog'),
  bark: k.boolean()
});
const animalSchema = k.union([catSchema, dogSchema]);
```

### Intersection Schema
```typescript
// Value must match ALL schemas
const withId = k.object({ id: k.number() });
const withName = k.object({ name: k.string() });
const withEmail = k.object({ email: k.email() });

const combined = k.intersection([withId, withName, withEmail]);
// Must have: id, name, AND email
```

### Literal and Enum
```typescript
// Exact value matching
const active = k.literal('active');
active.parse('active');    // OK
active.parse('inactive');  // Error

// String enum (union of literals)
const status = k.enum(['pending', 'active', 'completed']);
type Status = kataxInfer<typeof status>; // 'pending' | 'active' | 'completed'
```

### Tuple Schema
```typescript
// Fixed-length array with specific types per position
const point2d = k.tuple([k.number(), k.number()]);
point2d.parse([1, 2]);     // OK: [number, number]
point2d.parse([1, 2, 3]);  // Error: wrong length

const mixed = k.tuple([k.string(), k.number(), k.boolean()]);
mixed.parse(['hello', 42, true]); // OK
```

### Record Schema
```typescript
// Object with dynamic keys and uniform value type
const scores = k.record(k.number());
scores.parse({ alice: 100, bob: 85 }); // OK

const userMap = k.record(k.object({
  name: k.string(),
  age: k.number()
}));
```

### Custom Schema
```typescript
// Create your own validation logic
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

### Lazy Schema (Recursive Types)
```typescript
// For self-referencing/recursive types
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
// Accept any value (use with caution)
const anything = k.any();

// Accept any value but type as unknown (safer)
const data = k.unknown();

// Never matches - useful for exhaustive checks
const impossible = k.never();
```

## 🔄 Type Coercion

Automatically convert input types before validation:

```typescript
// String to number
const coercedNumber = k.coerce.number();
coercedNumber.parse("123");    // 123
coercedNumber.parse("45.67");  // 45.67
coercedNumber.parse(true);     // 1
coercedNumber.parse(false);    // 0

// With validation rules
const positiveInt = k.coerce.number().positive().integer();
positiveInt.parse("42");       // 42
positiveInt.parse("-5");       // Error: must be positive

// String to boolean
const coercedBoolean = k.coerce.boolean();
coercedBoolean.parse("true");  // true
coercedBoolean.parse("false"); // false
coercedBoolean.parse("1");     // true
coercedBoolean.parse("0");     // false
coercedBoolean.parse("yes");   // true
coercedBoolean.parse("no");    // false
coercedBoolean.parse(1);       // true
coercedBoolean.parse(0);       // false

// Any to string
const coercedString = k.coerce.string();
coercedString.parse(123);      // "123"
coercedString.parse(true);     // "true"
coercedString.parse(null);     // ""

// String/number to date
const coercedDate = k.coerce.date();
coercedDate.parse("2024-01-15");      // Date object
coercedDate.parse(1705276800000);     // Date from timestamp
coercedDate.parse(new Date());        // Passthrough

// With date validation
const futureDate = k.coerce.date().isFuture();
const pastDate = k.coerce.date().isPast();
const rangeDate = k.coerce.date().between('2024-01-01', '2024-12-31');
```

## ⚙️ Preprocess

Transform input before validation:

```typescript
// Trim and lowercase before validating
const normalizedEmail = k.preprocess(
  (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
  k.string().email()
);
normalizedEmail.parse("  JOHN@EXAMPLE.COM  ");  // "john@example.com"

// Parse JSON string to object
const parseJSON = k.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); }
      catch { return val; }
    }
    return val;
  },
  k.object({
    name: k.string(),
    age: k.number()
  })
);
parseJSON.parse('{"name":"John","age":30}');  // { name: "John", age: 30 }

// Remove currency symbols before coercing
const price = k.preprocess(
  (val) => typeof val === 'string' ? val.replace(/[$,]/g, '').trim() : val,
  k.coerce.number()
);
price.parse("$1,234.56");  // 1234.56
```

## 🔒 Catch/Fallback

Provide default values on validation failure:

```typescript
// Basic catch - return default on error
const stringWithDefault = k.string().catch("default value");
stringWithDefault.parse("hello");     // "hello"
stringWithDefault.parse(123);         // "default value" (number fails string validation)
stringWithDefault.parse(null);        // "default value"

// Number with catch
const safeNumber = k.number().positive().catch(0);
safeNumber.parse(42);                 // 42
safeNumber.parse(-5);                 // 0 (negative fails positive check)
safeNumber.parse("abc");              // 0 (not a number)

// Object with catch
const userWithDefault = k.object({
  name: k.string(),
  age: k.number()
}).catch({ name: "Anonymous", age: 0 });

userWithDefault.parse({ name: "John", age: 30 });  // { name: "John", age: 30 }
userWithDefault.parse({ invalid: true });          // { name: "Anonymous", age: 0 }

// Combine with coercion
const safePrice = k.coerce.number().positive().catch(0);
safePrice.parse("99.99");   // 99.99
safePrice.parse("invalid"); // 0
safePrice.parse(-50);       // 0
```

## 📦 Passthrough, Strip, and Strict

Control how object schemas handle extra properties:

```typescript
const userSchema = k.object({ name: k.string() });

// Default behavior: strip extra keys
userSchema.parse({ name: 'John', extra: 'removed' });
// { name: 'John' }

// Passthrough: keep extra keys
const passthroughSchema = userSchema.passthrough();
passthroughSchema.parse({ name: 'John', extra: 'kept', another: 123 });
// { name: 'John', extra: 'kept', another: 123 }

// Explicit strip (same as default)
const stripSchema = userSchema.strip();
stripSchema.parse({ name: 'John', extra: 'removed' });
// { name: 'John' }

// Strict: error on extra keys
const strictSchema = userSchema.strict();
strictSchema.parse({ name: 'John', extra: 'not allowed' });
// Error: Unknown keys: extra
```

## 🔄 Transforms

```typescript
const schema = k.string()
  .transform(s => s.toUpperCase())
  .transform(s => s.trim());

const result = schema.safeParse('  hello  ');
// result.data === 'HELLO'
```

## ⚡ Async Validation

Validate against external services, databases, or APIs:

```typescript
import { k } from 'katax-core';

// Check if email is already registered
const emailUniqueValidator = async (email, path) => {
  const exists = await db.users.findOne({ email });
  if (exists) {
    return [{ path, message: 'Email already registered' }];
  }
  return [];
};

// Check if password is compromised
const passwordSecureValidator = async (password, path) => {
  const isCompromised = await checkHaveIBeenPwned(password);
  if (isCompromised) {
    return [{ path, message: 'Password has been compromised' }];
  }
  return [];
};

// Create schema with async validators
const registrationSchema = k.object({
  email: k.email().asyncRefine(emailUniqueValidator),
  password: k.string()
    .minLength(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .asyncRefine(passwordSecureValidator)
});

// Use async validation
const result = await registrationSchema.safeParseAsync({
  email: 'user@example.com',
  password: 'SecurePass123'
});

if (result.success) {
  console.log('Registration data valid:', result.data);
} else {
  console.log('Validation errors:', result.issues);
}
```

### Async Methods

- `.asyncRefine(validator)` - Add async validator
- `.safeParseAsync(input)` - Async validation with safe result
- `.parseAsync(input)` - Async validation that throws on error
- `.isValidAsync(input)` - Check if valid asynchronously

### Features

- ✅ Runs sync validations first, then async (fail-fast)
- ✅ Works with nested objects and arrays
- ✅ Compatible with `optional()`, `nullable()`, `default()`
- ✅ Multiple async validators can be chained

## 🎯 Advanced Usage

### Optional and Nullable
```typescript
const schema = k.object({
  optional: k.string().optional(),
  nullable: k.string().nullable(),
  both: k.string().optional().nullable()
});
```

### Complex Nested Objects
```typescript
const blogSchema = k.object({
  title: k.string().minLength(5),
  author: k.object({
    name: k.string(),
    email: k.email()
  }),
  tags: k.array(k.string()).unique(),
  publishedAt: k.date().isPast()
});
```

### Multiple Validation Methods
```typescript
// Get validated data
const result = schema.safeParse(data);
if (result.success) {
  // Use result.data
}

// Just check if valid
const validation = schema.validate(data);
if (validation.valid) {
  // Data is valid, but no transformed data returned
}
```

## 🎯 Real-World Examples

### API Schema Composition
```typescript
import { k, kataxInfer } from 'katax-core';

// Base schemas for reuse
const timestampFields = k.object({
  createdAt: k.string(),
  updatedAt: k.string()
});

const idField = k.object({
  id: k.number()
});

// Compose user schema
const userSchema = idField
  .extend(timestampFields.getShape())
  .extend({
    name: k.string().minLength(2),
    email: k.email(),
    role: k.enum(['admin', 'user', 'guest'])
  });

type User = kataxInfer<typeof userSchema>;
// { id: number, createdAt: string, updatedAt: string, name: string, email: string, role: 'admin' | 'user' | 'guest' }

// Create post schema that extends base
const postSchema = idField
  .extend(timestampFields.getShape())
  .extend({
    title: k.string().minLength(5),
    content: k.string(),
    author: userSchema,
    tags: k.array(k.string()),
    status: k.enum(['draft', 'published', 'archived'])
  });

type Post = kataxInfer<typeof postSchema>;
```

### Form Validation with Dynamic Fields
```typescript
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

formSchema.parse({
  id: 'contact-form',
  fields: {
    name: { type: 'text', label: 'Name', required: true, value: 'John' },
    age: { type: 'number', label: 'Age', value: 25 },
    email: { type: 'email', label: 'Email', value: null }
  }
});
```

### Discriminated Union for API Responses
```typescript
const successResponse = k.object({
  success: k.literal(true),
  data: k.object({
    id: k.number(),
    name: k.string()
  })
});

const errorResponse = k.object({
  success: k.literal(false),
  error: k.object({
    code: k.number(),
    message: k.string()
  })
});

const apiResponse = k.union([successResponse, errorResponse]);

// Type-safe handling
const result = apiResponse.parse(response);
if (result.success) {
  console.log(result.data.name); // TypeScript knows data exists
} else {
  console.log(result.error.message); // TypeScript knows error exists
}
```

## 📋 Error Handling

Katax returns all validation errors at once:

```typescript
const result = schema.safeParse(invalidData);
if (!result.success) {
  result.issues.forEach(issue => {
    console.log(`${issue.path.join('.')}: ${issue.message}`);
  });
}
```

## 🏗️ TypeScript Integration

Full type inference and safety:

```typescript
import { k, kataxInfer } from 'katax-core';

const schema = k.object({
  name: k.string(),
  age: k.number()
});

type User = kataxInfer<typeof schema>;
// User = { name: string; age: number }
```

**Example with descriptive type alias:**

```typescript
import { k, kataxInfer } from 'katax-core';

const createProjectSchema = k.object({
  title: k.string().min(3),
  description: k.string().optional(),
  tags: k.array(k.string())
});

export type CreateProjectData = kataxInfer<typeof createProjectSchema>;
// CreateProjectData = { title: string; description?: string; tags: string[] }
```

## 📋 API Reference

### Core Methods

**Synchronous:**
- `.parse(input)` - Parse and validate input, throws on error
- `.safeParse(input)` - Safe parsing, returns `{ success: boolean, data?: T, issues?: Issue[] }`
- `.validate(input)` - Validation only, returns `{ valid: boolean, issues: Issue[] }`

**Asynchronous:**
- `.asyncRefine(validator)` - Add async validator function
- `.parseAsync(input)` - Async parse and validate, throws on error
- `.safeParseAsync(input)` - Async safe parsing with result object
- `.isValidAsync(input)` - Async validation check, returns `{ valid: boolean, issues: Issue[] }`

**Modifiers:**
- `.optional()` - Make schema optional (allows undefined)
- `.nullable()` - Make schema nullable (allows null)
- `.default(value)` - Provide default value
- `.transform(fn)` - Transform validated data

## 🔄 Changelog

### v1.3.0
- ✨ **NEW**: Type coercion with `k.coerce.number()`, `k.coerce.boolean()`, `k.coerce.string()`, `k.coerce.date()` - auto-convert types before validation
- ✨ **NEW**: Preprocess with `k.preprocess()` - transform input before validation
- ✨ **NEW**: Catch/Fallback with `.catch()` - return default values on validation errors
- ✨ **NEW**: Passthrough with `.passthrough()` - keep extra object properties
- ✨ **NEW**: Strip with `.strip()` - explicitly remove extra object properties
- 🔧 Improved date coercion with validation rules (min, max, between, isFuture, isPast)
- 📚 Comprehensive documentation for all new features

### v1.2.0
- ✨ **NEW**: Union schemas with `k.union()` - validate against multiple possible types
- ✨ **NEW**: Intersection schemas with `k.intersection()` - combine schemas that must all match
- ✨ **NEW**: Object schema methods: `.extend()`, `.merge()`, `.getShape()`
- ✨ **NEW**: Literal schema with `k.literal()` - exact value matching
- ✨ **NEW**: Enum schema with `k.enum()` - string literal unions
- ✨ **NEW**: Tuple schema with `k.tuple()` - fixed-length typed arrays
- ✨ **NEW**: Record schema with `k.record()` - objects with uniform value types
- ✨ **NEW**: Custom schema with `k.custom()` - create your own validation logic
- ✨ **NEW**: Lazy schema with `k.lazy()` - recursive/self-referencing types
- ✨ **NEW**: Utility types: `k.any()`, `k.unknown()`, `k.never()`
- ⚡ Performance optimizations with helper utilities
- 📚 Comprehensive documentation and examples

### v1.1.0
- ✨ **NEW**: Async validation support with `.asyncRefine()`
- ✨ **NEW**: Async methods: `.safeParseAsync()`, `.parseAsync()`, `.isValidAsync()`
- ✨ **NEW**: Async validation works with nested objects and arrays
- 🐛 Fixed: Array schema async validation compatibility
- 📚 Updated documentation with async examples

### v1.0.0
- Initial release
- Core validation schemas: string, number, boolean, object, array, date
- Extended schemas: email, base64, file
- TypeScript support with full type inference
- Transform and chaining API
- Multiple error reporting

## ❓ FAQ

**Q: How does this compare to Zod?**  
A: Katax Core is lighter with fewer dependencies and focuses on simplicity while providing similar type-safety.

**Q: Can I use this in React/Vue/Angular?**  
A: Yes! Katax Core works in any JavaScript environment.

**Q: Does it support custom error messages?**  
A: Yes, most validation methods accept an optional custom error message parameter.

## 🏗️ Roadmap

- [x] Async validation support
- [x] Union and intersection schemas
- [x] Custom schema creation helpers
- [x] Performance optimizations
- [x] Extend and merge for object schemas
- [x] Recursive schemas with lazy evaluation
- [x] Coercion (auto-convert types)
- [x] Preprocess (transform before validation)
- [x] Catch/Fallback (error recovery)
- [x] Passthrough/Strip (extra properties control)
- [ ] Plugin system
- [ ] i18n support for error messages

## 🐛 Issues & Support

If you find a bug or need help, please:
1. Check [existing issues](https://github.com/LOPIN6FARRIER/katax-core/issues)
2. Create a [new issue](https://github.com/LOPIN6FARRIER/katax-core/issues/new) with details
3. Include code examples and error messages

## 🌐 Browser Support

Works in all modern browsers and Node.js environments. Some schemas like `File` require browser APIs.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/LOPIN6FARRIER/katax-core.git
cd katax-core

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Guidelines
- Write tests for new features
- Follow existing code style
- Update documentation
- Ensure all tests pass

---

Made with ❤️ by Vinicio Esparza