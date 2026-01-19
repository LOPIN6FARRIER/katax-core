import { BaseSchema } from "../../core/BaseSchema"
import { Issue } from "../../core/result"

/**
 * Schema that preprocesses input before passing to the inner schema.
 * Useful for normalizing, trimming, or transforming input before validation.
 */
export class PreprocessSchema<T> extends BaseSchema<T> {
  constructor(
    private _preprocessor: (input: unknown) => unknown,
    private _schema: BaseSchema<T>
  ) {
    super()
  }

  _parse(input: unknown, path: Issue["path"]): Issue[] | T {
    let processed: unknown
    try {
      processed = this._preprocessor(input)
    } catch (error) {
      return [{
        path,
        message: `Preprocess error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    }
    return this._schema._parse(processed, path)
  }

  protected _clone(): PreprocessSchema<T> {
    const cloned = new PreprocessSchema(this._preprocessor, this._schema)
    cloned._asyncValidators = [...this._asyncValidators]
    return cloned
  }

  protected async _parseAsyncNested(value: T, path: Issue["path"]): Promise<Issue[]> {
    if (this._schema._asyncValidators.length > 0 ||
        typeof (this._schema as any)._parseAsyncNested === 'function') {
      const result = await this._schema.safeParseAsync(value)
      if (!result.success) {
        return result.issues || []
      }
    }
    return []
  }
}

/**
 * Create a schema that preprocesses input before validation.
 * The preprocessor function runs BEFORE the schema validates.
 *
 * @param preprocessor - Function to transform the input before validation
 * @param schema - The schema to validate the preprocessed input
 * @returns A PreprocessSchema instance
 *
 * @example
 * ```typescript
 * // Trim and lowercase strings before validation
 * const schema = k.preprocess(
 *   (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
 *   k.string().email()
 * )
 * schema.parse("  JOHN@EXAMPLE.COM  ") // "john@example.com"
 *
 * // Convert string to number before validation
 * const numSchema = k.preprocess(
 *   (val) => typeof val === 'string' ? Number(val) : val,
 *   k.number().positive()
 * )
 * numSchema.parse("42") // 42
 * ```
 */
export const preprocess = <T>(
  preprocessor: (input: unknown) => unknown,
  schema: BaseSchema<T>
): PreprocessSchema<T> => new PreprocessSchema(preprocessor, schema)
