import { k } from '../k';

console.log('=== Coercion Tests ===\n');

// Number coercion
console.log('--- k.coerce.number() ---');
const coercedNumber = k.coerce.number();
console.log('"123":', coercedNumber.safeParse("123"));
console.log('"45.67":', coercedNumber.safeParse("45.67"));
console.log('true:', coercedNumber.safeParse(true));
console.log('false:', coercedNumber.safeParse(false));
console.log('"abc" (invalid):', coercedNumber.safeParse("abc"));
console.log('"" (empty):', coercedNumber.safeParse(""));

// Coerced number with validation rules
const coercedPositiveInt = k.coerce.number().positive().integer();
console.log('\n--- k.coerce.number().positive().integer() ---');
console.log('"42":', coercedPositiveInt.safeParse("42"));
console.log('"-5" (negative):', coercedPositiveInt.safeParse("-5"));
console.log('"3.14" (not integer):', coercedPositiveInt.safeParse("3.14"));

// Boolean coercion
console.log('\n--- k.coerce.boolean() ---');
const coercedBoolean = k.coerce.boolean();
console.log('"true":', coercedBoolean.safeParse("true"));
console.log('"false":', coercedBoolean.safeParse("false"));
console.log('"TRUE":', coercedBoolean.safeParse("TRUE"));
console.log('"1":', coercedBoolean.safeParse("1"));
console.log('"0":', coercedBoolean.safeParse("0"));
console.log('"yes":', coercedBoolean.safeParse("yes"));
console.log('"no":', coercedBoolean.safeParse("no"));
console.log('1 (number):', coercedBoolean.safeParse(1));
console.log('0 (number):', coercedBoolean.safeParse(0));
console.log('"invalid" (invalid):', coercedBoolean.safeParse("invalid"));

// String coercion
console.log('\n--- k.coerce.string() ---');
const coercedString = k.coerce.string();
console.log('123:', coercedString.safeParse(123));
console.log('true:', coercedString.safeParse(true));
console.log('null:', coercedString.safeParse(null));
console.log('undefined:', coercedString.safeParse(undefined));

// Date coercion
console.log('\n--- k.coerce.date() ---');
const coercedDate = k.coerce.date();
console.log('"2024-01-15":', coercedDate.safeParse("2024-01-15"));
console.log('timestamp:', coercedDate.safeParse(1705276800000));
console.log('"invalid-date" (invalid):', coercedDate.safeParse("invalid-date"));

console.log('\n=== Passthrough and Strip Tests ===\n');

// Passthrough
console.log('--- passthrough() ---');
const passthroughSchema = k.object({ name: k.string() }).passthrough();
console.log('With extra keys:', passthroughSchema.safeParse({
  name: 'John',
  extra: 'allowed',
  another: 123
}));

// Strip (default behavior, explicit)
console.log('\n--- strip() ---');
const stripSchema = k.object({ name: k.string() }).strip();
console.log('With extra keys (stripped):', stripSchema.safeParse({
  name: 'John',
  extra: 'removed',
  another: 123
}));

// Strict (errors on extra keys)
console.log('\n--- strict() ---');
const strictSchema = k.object({ name: k.string() }).strict();
console.log('With extra keys (error):', strictSchema.safeParse({
  name: 'John',
  extra: 'not allowed'
}));

console.log('\n=== Catch/Fallback Tests ===\n');

// Basic catch
console.log('--- .catch() ---');
const stringWithCatch = k.string().catch("default value");
console.log('"hello":', stringWithCatch.safeParse("hello"));
console.log('123 (invalid, returns catch):', stringWithCatch.safeParse(123));
console.log('null (invalid, returns catch):', stringWithCatch.safeParse(null));

// Catch with number
const numberWithCatch = k.number().positive().catch(0);
console.log('\n--- k.number().positive().catch(0) ---');
console.log('42:', numberWithCatch.safeParse(42));
console.log('-5 (invalid, returns 0):', numberWithCatch.safeParse(-5));
console.log('"abc" (invalid, returns 0):', numberWithCatch.safeParse("abc"));

// Catch with object
const userWithCatch = k.object({
  name: k.string(),
  age: k.number()
}).catch({ name: "Anonymous", age: 0 });

console.log('\n--- Object with catch ---');
console.log('Valid:', userWithCatch.safeParse({ name: "John", age: 30 }));
console.log('Invalid (returns default):', userWithCatch.safeParse({ name: 123 }));

console.log('\n=== Preprocess Tests ===\n');

// Basic preprocess - trim and lowercase
console.log('--- k.preprocess() ---');
const trimLowercase = k.preprocess(
  (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
  k.string()
);
console.log('"  HELLO  ":', trimLowercase.safeParse("  HELLO  "));

// Preprocess with number conversion
const stringToNumber = k.preprocess(
  (val) => typeof val === 'string' ? Number(val) : val,
  k.number().positive()
);
console.log('\n--- String to number preprocess ---');
console.log('"42":', stringToNumber.safeParse("42"));
console.log('"-5" (fails positive check):', stringToNumber.safeParse("-5"));

// Preprocess for email normalization
const normalizedEmail = k.preprocess(
  (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
  k.string().email()
);
console.log('\n--- Email normalization ---');
console.log('"  JOHN@EXAMPLE.COM  ":', normalizedEmail.safeParse("  JOHN@EXAMPLE.COM  "));

// Complex preprocess
const parseJSON = k.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  },
  k.object({
    name: k.string(),
    age: k.number()
  })
);
console.log('\n--- JSON string preprocess ---');
console.log('JSON string:', parseJSON.safeParse('{"name":"John","age":30}'));
console.log('Already object:', parseJSON.safeParse({ name: "Jane", age: 25 }));

console.log('\n=== Combined Features ===\n');

// Coerce + catch
const safePriceSchema = k.coerce.number().positive().catch(0);
console.log('--- Coerce + catch ---');
console.log('"99.99":', safePriceSchema.safeParse("99.99"));
console.log('"invalid":', safePriceSchema.safeParse("invalid"));
console.log('-50:', safePriceSchema.safeParse(-50));

// Preprocess + coerce pattern
const flexibleNumber = k.preprocess(
  (val) => {
    if (typeof val === 'string') {
      // Remove currency symbols and commas
      return val.replace(/[$,]/g, '').trim();
    }
    return val;
  },
  k.coerce.number()
);
console.log('\n--- Currency string to number ---');
console.log('"$1,234.56":', flexibleNumber.safeParse("$1,234.56"));
console.log('"$99":', flexibleNumber.safeParse("$99"));

console.log('\n=== All Coerce/Preprocess tests completed! ===');
