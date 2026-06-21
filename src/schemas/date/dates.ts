
import { DateSchema } from "./DateSchema";
import { TwoDatesSchema } from "./TwoDatesSchema";

/**
 * Creates a new date validation schema.
 * 
 * Validates ISO 8601 date strings and converts them to Date objects.
 * 
 * @returns A DateSchema instance with chainable validation methods
 * @example
 * ```typescript
 * const schema = date()
 *   .min('2020-01-01')
 *   .max('2030-12-31')
 *   .past()
 * 
 * schema.parse('2024-06-15') // Date object
 * schema.safeParse('invalid-date') // { success: false, issues: [...] }
 * ```
 */
export const date = () => new DateSchema();

/**
 * Creates a new two-dates validation schema for date ranges.
 * 
 * Parses a string with two ISO dates separated by a separator and returns [Date, Date].
 * 
 * @param separator String separator for date range parsing (default: '|')
 * @returns A TwoDatesSchema instance with validation methods
 * @example
 * ```typescript
 * const schema = twoDates('|')
 * 
 * schema.parse('2024-01-01|2024-12-31')
 * // [Date(2024-01-01), Date(2024-12-31)]
 * 
 * schema.maxDifference(365).parse('2024-01-01|2024-12-31')
 * ```
 */
export const twoDates = (separator: string = '|') => new TwoDatesSchema(separator);