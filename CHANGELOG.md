# Changelog - Katax Core

All notable changes to this project will be documented in this file.

> Historical entries before 1.6.5 were not tracked in a changelog file; this file starts tracking from the current release forward. See README.md for the full current API surface.

## [Unreleased]

### Fixed
- `toJsonSchema()` now matches what `parse()` accepts:
  - `.nullable()` / `.nullish()` emit `null` (`type: ["T", "null"]`, or `anyOf` for enum/const/union).
  - `.nullish()`, `.default()`, `k.undefined()`, `k.void()` and unions containing `undefined` are no longer listed in `required`; `.transform()` / `.brand()` keep the inner optionality.
  - Number: `.integer()` → `type: "integer"`; `.positive()`, `.negative()`, `.nonnegative()`, `.nonpositive()`, `.between()`, `.equals()`, `.oneOf()`, `.notEqual()`, `.notOneOf()` are now emitted.
  - Chained bounds keep the strictest value (`min(10).min(5)` → `minimum: 10`).
  - String: several pattern rules are combined with `allOf` instead of overwriting each other; `startsWith` / `endsWith` / `includes` escape regex characters; `lowercase()` / `uppercase()` patterns now match the runtime check; all patterns are valid in unicode mode.
  - `.strict()` emits `additionalProperties: false`.
  - `discriminatedUnion` branches pin the discriminator (`const` + `required`), so `oneOf` no longer rejects valid data when branches overlap.
  - Recursive `k.lazy()` emits `$anchor` + `$ref` instead of an empty schema.
  - `k.literal()` / `k.enum()` include `type`; `boolean.isTrue()/isFalse()/equals()` → `const`; `array.contains()` → `contains`; set/map sizes; `date().isDateOnly()` → `format: "date"`.
- `k.record()` / `k.tuple()` inside a recursive `k.lazy()` no longer throw "circular reference detected" on parse.
- `discriminatedUnion` no longer crashes (`schema._parse is not a function`) when the discriminator value is an `Object.prototype` key such as `"toString"` or `"__proto__"`.

### Added
- `k.lazy(resolver, name?)`: optional name used as the JSON Schema `$anchor`.

## [1.6.5] - 2026-08-06

Current published version. Full API surface (see README.md for details):

- Primitives: `string`, `number`, `boolean`, `bigint`, `date`, `twoDates`, `nan`, `null`, `undefined`, `void`
- Composites: `object`, `array`, `tuple`, `record`
- Composition: `union`, `intersection`, `lazy`, `discriminatedUnion`
- Wrappers: `promise`, `set`, `map`
- Special: `email`, `file`, `base64`
- Custom/Advanced: `custom`, `literal`, `enum`, `any`, `unknown`, `never`
- Transformation: `coerce`, `preprocess`
- Universal modifiers: `.optional()`, `.nullable()`, `.nullish()`, `.default()`, `.catch()`, `.transform()`, `.brand()`, `.refine()`
- Async validation via `.asyncRefine()`, `safeParseAsync()`, `parseAsync()`, `isValidAsync()`
- Error utilities: `createIssue`, `issues`, `mergeIssues`, `isIssueArray`, `describeReceived`
