---
name: katax-core
description: 'Lightweight and extensible schema validation library for TypeScript/JavaScript. Use when: validating request bodies, parsing environment variables, runtime type-checking, building type-safe APIs, defining complex validation schemas with async refinements.'
argument-hint: 'What kind of validation are you working on? (body/query/params/env/file/async)'
---

# katax-core — Schema Validation

Zod-inspired validation library for TypeScript with zero runtime dependencies (except `date-fns`). Part of the [Katax ecosystem](https://github.com/LOPIN6FARRIER/katax-core).

**Version: 1.5.4**

## Quick Start

```ts
import { k, type kataxInfer } from 'katax-core';

const UserSchema = k.object({
  email: k.email(),
  name: k.string().minLength(2).maxLength(100),
  age: k.number().min(18).optional(),
});

type User = kataxInfer<typeof UserSchema>;

const result = UserSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.issues });
}
```

## Core Interface

```ts
Schema<T> {
  parse(input: unknown): T
  safeParse(input: unknown): SafeParseResult<T>
  validate(input: unknown): ValidationResult
  parseAsync(input: unknown): Promise<T>
  safeParseAsync(input: unknown): Promise<AsyncSafeParseResult<T>>
  isValidAsync(input: unknown): Promise<AsyncValidationResult>
  hasAsyncValidation(): boolean
  readonly kataxInfer: T
}
```

### Result Types

| Type | Shape |
|------|-------|
| `SafeParseResult<T>` | `{ success: true; data: T } \| { success: false; issues: Issue[] }` |
| `ValidationResult` | `{ valid: boolean; issues: Issue[] }` |
| `Issue` | `{ path: (string \| number)[]; message: string }` |
| `KataxError` | Custom error with `issues: Issue[]` property |

## The `k()` API

```ts
const k = {
  string, number, boolean, date, twoDates,
  object, array, tuple, record,
  union, intersection, lazy,
  email, file, base64,
  custom, literal, enum, any, unknown, never,
  coerce, preprocess,
};
```

## String — `k.string()`

```ts
.minLength(n) .maxLength(n) .length(n) .email() .url()
.regex(p) .uuid() .ip() .startsWith(s) .endsWith(s)
.includes(s) .oneOf([...]) .notOneOf([...]) .lowercase()
.uppercase() .alpha() .alphanumeric() .ascii()
.noWhitespace() .nonempty() .trim()
```

## Number — `k.number()`

```ts
.min(n) .max(n) .length(n) .positive() .negative()
.integer() .finite() .multipleOf(n) .between(a, b)
.greaterThan(n) .lessThan(n) .notEqual(n)
.oneOf([...]) .notOneOf([...])
```

## Boolean — `k.boolean()`

```ts
.isTrue() .isFalse() .equals(v)
```

## Object — `k.object(shape)`

```ts
.extend(ext) .merge(other) .pick([k]) .omit([k])
.partial() .strict() .passthrough() .strip() .caseInsensitive()
```

## Array — `k.array(element?)`

```ts
.minLength(n) .maxLength(n) .length(n) .notEmpty() .unique() .contains(e)
```

## Email — `k.email()`

```ts
.domain(d) .domains([d]) .domainPattern(p) .notDomains([d])
.localMinLength(n) .localMaxLength(n) .localPattern(r)
.corporate() .noPlus() .noDots()
```

## Date — `k.date()`

```ts
.min(d) .max(d) .between(a, b) .isFuture() .isPast()
.format(f) .isDateOnly() .hasTime() .formatOutput(f)
```

## TwoDates — `k.twoDates(sep?)`

```ts
.maxDifference(d) .minDifference(d)
.maxDifferenceHours(h) .minDifferenceHours(h) .order(asc?)
```

## File — `k.file()`

```ts
.maxSize(b) .minSize(b) .type(m) .types([m]) .typePattern(p)
.extension(e) .extensions([e]) .namePattern(r)
.image() .video() .audio() .document()
```

## Base64 — `k.base64()`

```ts
.minDecodedSize(n) .maxDecodedSize(n) .mimeType(t)
.mimeTypePattern(p) .dataUrl() .json() .image() .pdf()
```

## Composition

```ts
k.union([k.string(), k.number()]);
k.intersection([k.object({ id: k.number() }), k.object({ name: k.string() })]);
const cat = k.lazy(() => k.object({ name: k.string(), sub: k.array(cat) }));
```

## Advanced

```ts
k.literal('active')        // Exact match
k.enum(['a', 'b'])         // String union
k.tuple([k.number(), k.string()])
k.record(k.number())
k.any()                    // Accept all
k.unknown()                // Accept all (forces narrowing)
k.never()                  // Never matches
```

## Custom — `k.custom<T>(validator)`

```ts
const s = k.custom<number>((val, path) => {
  if (typeof val !== 'number') return [{ path, message: 'Must be number' }];
  return val;
}).refine((v) => v < 1000, 'Too large');
```

## Universal Modifiers

```ts
.optional() .nullable() .default(v) .transform(fn) .catch(v)
```

## Coercion — `k.coerce`

```ts
k.coerce.number()    // "42" → 42
k.coerce.boolean()   // "true"/"1"/"yes" → true
k.coerce.string()    // 42 → "42"
k.coerce.date()      // ISO string → Date
```

## Preprocess

```ts
k.preprocess((v) => typeof v === 'string' ? v.trim() : v, k.string())
```

## Async Validation

```ts
k.string().asyncRefine(async (val) => {
  const exists = await db.exists(val);
  return exists ? [{ path: [], message: 'Taken' }] : [];
});
await schema.safeParseAsync(input);
```

## Error Utilities

```ts
createIssue(['field'], 'msg')  // → Issue
issues([...])                    // → Issue[]
mergeIssues(a, b)                // → Issue[]
isIssueArray(v)                  // → boolean
```

## Common Gotchas

- `safeParse()` > `parse()` — avoids thrown KataxError
- Object default: `strip()` — use `.strict()` or `.passthrough()` to change
- `coerce` transforms before validation
- Async schemas need `safeParseAsync()` — `safeParse()` skips async refinements
- `k.email()` is more configurable than `k.string().email()`
- File validation works in browser (FormData) and Node.js (Multer)
- `catch()` provides fallback on parse failure; `default()` only applies to undefined/null
