# Katax Core

[![npm version](https://img.shields.io/npm/v/katax-core.svg)](https://www.npmjs.com/package/katax-core)
[![npm downloads](https://img.shields.io/npm/dm/katax-core.svg)](https://www.npmjs.com/package/katax-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight and extensible schema validation library for TypeScript/JavaScript.

## 🚀 Features

- **Type-safe validation** with full TypeScript support
- **Comprehensive schemas**: String, Number, Object, Array, Date, Email, Base64, File
- **Chaining API** for clean and readable validation rules
- **Multiple error reporting** - get all validation errors at once
- **Transform support** - validate and transform data in one step
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
.strict() // No extra properties allowed
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

### File Schema (Browser)
```typescript
k.file()
  .image()
  .maxSize(1024 * 1024 * 5) // 5MB
  .extensions(['.jpg', '.png'])
```

## 🔄 Transforms

```typescript
const schema = k.string()
  .transform(s => s.toUpperCase())
  .transform(s => s.trim());

const result = schema.safeParse('  hello  ');
// result.data === 'HELLO'
```

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

- `.parse(input)` - Parse and validate input, throws on error
- `.safeParse(input)` - Safe parsing, returns `{ success: boolean, data?: T, issues?: Issue[] }`
- `.validate(input)` - Validation only, returns `{ valid: boolean, issues: Issue[] }`
- `.optional()` - Make schema optional (allows undefined)
- `.nullable()` - Make schema nullable (allows null)
- `.transform(fn)` - Transform validated data

## 🔄 Changelog

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

- [ ] Union and intersection schemas
- [ ] Async validation support
- [ ] Custom schema creation helpers
- [ ] Performance optimizations
- [ ] Plugin system

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