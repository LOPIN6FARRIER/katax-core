# Changelog - Katax Core

All notable changes to this project will be documented in this file.

> Historical entries before 1.6.5 were not tracked in a changelog file; this file starts tracking from the current release forward. See README.md for the full current API surface.

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
