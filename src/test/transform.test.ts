import { k } from '../k';

console.log('=== Basic string transformations ===');

// Convert to uppercase
const upperCaseSchema = k.string().transform(value => value.toUpperCase());

const upper1 = upperCaseSchema.safeParse('hello');
console.log('Uppercase "hello":', upper1);

const upper2 = upperCaseSchema.safeParse('WoRlD');
console.log('Uppercase "WoRlD":', upper2);

// Capitalize first letter
const capitalizeSchema = k.string().transform(value =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
);

const cap1 = capitalizeSchema.safeParse('perez');
console.log('Capitalize "perez":', cap1);

const cap2 = capitalizeSchema.safeParse('GARCIA');
console.log('Capitalize "GARCIA":', cap2);

console.log('\n=== Number transformations ===');

// Multiply by 1000
const milliToSchema = k.number().transform(value => value * 1000);

const milli1 = milliToSchema.safeParse(5);
console.log('5 * 1000:', milli1);

const milli2 = milliToSchema.safeParse(3.5);
console.log('3.5 * 1000:', milli2);

// Round to integer
const roundSchema = k.number().transform(value => Math.round(value));

const round1 = roundSchema.safeParse(3.14159);
console.log('Round 3.14159:', round1);

const round2 = roundSchema.safeParse(7.89);
console.log('Round 7.89:', round2);

// Convert to formatted string
const currencySchema = k.number().transform(value => `$${value.toFixed(2)}`);

const curr1 = currencySchema.safeParse(99.99);
console.log('Currency 99.99:', curr1);

const curr2 = currencySchema.safeParse(5);
console.log('Currency 5:', curr2);

console.log('\n=== Transform with validations ===');

// Validate email and convert to lowercase
const emailNormalizeSchema = k.string()
  .email()
  .transform(value => value.toLowerCase());

const email1 = emailNormalizeSchema.safeParse('User@Example.COM');
console.log('Normalize email:', email1);

const invalidEmail = emailNormalizeSchema.safeParse('not-an-email');
console.log('Invalid email (fails before transform):', invalidEmail);

// Validate range and multiply
const percentToDecimalSchema = k.number()
  .min(0)
  .max(100)
  .transform(value => value / 100);

const percent1 = percentToDecimalSchema.safeParse(75);
console.log('75% to decimal:', percent1);

const percent2 = percentToDecimalSchema.safeParse(100);
console.log('100% to decimal:', percent2);

const invalidPercent = percentToDecimalSchema.safeParse(150);
console.log('Invalid percent (fails before transform):', invalidPercent);

console.log('\n=== Transform in objects ===');

const userSchema = k.object({
  firstName: k.string().transform(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()),
  lastName: k.string().transform(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()),
  email: k.string().email().transform(v => v.toLowerCase()),
  age: k.number().integer().min(0),
});

const user1 = userSchema.safeParse({
  firstName: 'john',
  lastName: 'DOE',
  email: 'John.Doe@EXAMPLE.com',
  age: 30,
});
console.log('User with transforms:', user1);

console.log('\n=== Chaining transforms ===');

// Trim, luego uppercase
const trimUpperSchema = k.string()
  .transform(v => v.trim())
  .transform(v => v.toUpperCase());

const trim1 = trimUpperSchema.safeParse('  hello  ');
console.log('Trim then uppercase:', trim1);

// Validate, transform to number, then to formatted string
const priceSchema = k.number()
  .positive()
  .transform(v => v.toFixed(2))
  .transform(v => `$${v}`);

const price1 = priceSchema.safeParse(99.9);
console.log('Price formatting:', price1);

console.log('\n=== Complex transformations ===');

// Parse JSON string
const jsonParseSchema = k.string().transform(value => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
});

const json1 = jsonParseSchema.safeParse('{"name":"John","age":30}');
console.log('Parse JSON:', json1);

const json2 = jsonParseSchema.safeParse('invalid json');
console.log('Invalid JSON (returns null):', json2);

// Extract domain from email
const domainSchema = k.string()
  .email()
  .transform(value => value.split('@')[1]);

const domain1 = domainSchema.safeParse('user@example.com');
console.log('Extract domain:', domain1);

// Parse date string to timestamp
const timestampSchema = k.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform(value => new Date(value).getTime());

const date1 = timestampSchema.safeParse('2024-01-15');
console.log('Date to timestamp:', date1);

console.log('\n=== Transform with default ===');

const nameSchema = k.string()
  .default('Guest')
  .transform(v => v.toUpperCase());

const name1 = nameSchema.safeParse('john');
console.log('Name with value:', name1);

const name2 = nameSchema.safeParse(undefined);
console.log('Name with default (transforms default too):', name2);

console.log('\n=== Real world: Phone number formatting ===');

const phoneSchema = k.string()
  .regex(/^\d{10}$/, 'Phone must be 10 digits')
  .transform(value => {
    const area = value.slice(0, 3);
    const prefix = value.slice(3, 6);
    const line = value.slice(6);
    return `(${area}) ${prefix}-${line}`;
  });

const phone1 = phoneSchema.safeParse('5551234567');
console.log('Format phone:', phone1);

const invalidPhone = phoneSchema.safeParse('123');
console.log('Invalid phone:', invalidPhone);

console.log('\n=== Real world: Slugify ===');

const slugSchema = k.string()
  .minLength(1)
  .transform(value =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
  );

const slug1 = slugSchema.safeParse('Hello World!');
console.log('Slugify "Hello World!":', slug1);

const slug2 = slugSchema.safeParse('  TypeScript   is   Awesome!!!  ');
console.log('Slugify with spaces:', slug2);

console.log('\n=== Real world: Unit conversions ===');

const conversionSchema = k.object({
  kilometers: k.number().min(0).transform(v => v * 0.621371), // to miles
  celsius: k.number().transform(v => (v * 9/5) + 32), // to fahrenheit
  kilograms: k.number().min(0).transform(v => v * 2.20462), // to pounds
});

const conversion = conversionSchema.safeParse({
  kilometers: 100,
  celsius: 25,
  kilograms: 70,
});
console.log('Unit conversions:', conversion);

console.log('\n=== Real world: Config normalization ===');

const configSchema = k.object({
  host: k.string().default('localhost').transform(v => v.toLowerCase()),
  port: k.number().integer().min(1).max(65535).default(3000),
  debug: k.number().transform(v => v === 1), // Convert to boolean
  environment: k.string().transform(v => v.toUpperCase()),
});

const config1 = configSchema.safeParse({
  host: 'EXAMPLE.COM',
  port: 8080,
  debug: 1,
  environment: 'production',
});
console.log('Config with transforms:', config1);

const config2 = configSchema.safeParse({
  debug: 0,
  environment: 'dev',
});
console.log('Config with defaults and transforms:', config2);

console.log('\n=== Type transformation ===');

// String to number
const stringToNumberSchema = k.string()
  .regex(/^\d+$/, 'Must be numeric string')
  .transform(v => parseInt(v, 10));

const strNum1 = stringToNumberSchema.safeParse('42');
console.log('String "42" to number:', strNum1);

const strNum2 = stringToNumberSchema.safeParse('abc');
console.log('Invalid numeric string:', strNum2);

// Array transformation
const csvSchema = k.string().transform(v => v.split(',').map(s => s.trim()));

const csv1 = csvSchema.safeParse('apple, banana, orange');
console.log('CSV to array:', csv1);