# Task 1: Primitive Schema Immutability - Report

## What was implemented

Refactored all ~80 builder methods across 8 schema source files from mutating `this.rules.push(...); return this` to a clone-and-push pattern using `this._clone() as this`.

### Files changed

| File | Methods changed |
|------|----------------|
| `src/schemas/string/StringSchema.ts` | 27 builder methods (lowercase, uppercase, alpha, alphanumeric, ascii, uuid, ip, noWhitespace, nonempty, minLength, maxLength, length, email, url, regex, startsWith, endsWith, includes, datetime, jwt, cuid2, ulid, emoji, cidr, oneOf, notOneOf, trim) |
| `src/schemas/number/NumberSchema.ts` | 14 builder methods (min, max, equals, positive, negative, finite, integer, multipleOf, notEqual, between, greaterThan, lessThan, oneOf, notOneOf) |
| `src/schemas/bigint/BigIntSchema.ts` | 14 builder methods (min, max, positive, negative, nonnegative, nonpositive, between, multipleOf, equals, oneOf, notOneOf, notEqual, greaterThan, lessThan) |
| `src/schemas/boolean/BooleanSchema.ts` | 3 builder methods (isTrue, isFalse, equals) |
| `src/schemas/date/DateSchema.ts` | 9 builder methods (min, max, between, isFuture, isPast, format, isDateOnly, hasTime — NOT formatOutput) |
| `src/schemas/array/ArraySchema.ts` | 6 builder methods (minLength, maxLength, length, notEmpty, unique, contains) |
| `src/schemas/collection/CollectionSchema.ts` | Added `rules` array, updated `_parse` and `_clone`, added 6 builder methods (SetSchema: minSize, maxSize, nonempty; MapSchema: minSize, maxSize, nonempty) |
| `src/schemas/object/ObjectSchema.ts` | 1 method (caseInsensitive) |
| `src/schemas/coerce/CoerceSchemas.ts` | Updated all proxy methods to capture return values from inner schema; updated CoercedDateSchema builder methods to clone-and-push |
| `tests/immutability.test.ts` | New test file with 10 tests |

### Additional fixes

- `CoercedNumberSchema`, `CoercedBooleanSchema`, `CoercedStringSchema`: proxy methods now reassign `this.innerSchema` to the cloned return value so rules propagate correctly
- `CoercedDateSchema`: all 8 builder methods changed from `this.rules.push` to clone-and-push
- `StringSchema.notEmpty()` (alias for `nonempty`) and `ArraySchema.nonempty()` (alias for `notEmpty`) unchanged — they safely return the clone from the aliased method
- `DateSchema.formatOutput()` unchanged — it already returns a new instance via `this.transform()`

### Test results

```
npm run build: ✓ ESM + CJS + DTS (pass)
npm test:      ✓ 24 files, 318 tests (pass)
```

### Notable decisions

- The immutability test map case used 6 entries instead of 3 (as originally in the brief) to actually trigger a maxSize(5) rejection
- StringSchema uses `minLength`/`maxLength` not `min`/`max` (matching actual API)
- Coerced schema `_clone` copies `innerSchema` by reference (not cloning it) which is safe since inner schema methods are now immutable
