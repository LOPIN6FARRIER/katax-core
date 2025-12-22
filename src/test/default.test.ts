import { k } from '../k';

console.log('=== Default values for strings ===');

const stringWithDefault = k.string().default('default value');

const validString = stringWithDefault.safeParse('hello');
console.log('String with value:', validString);

const undefinedString = stringWithDefault.safeParse(undefined);
console.log('String with undefined (uses default):', undefinedString);

const nullString = stringWithDefault.safeParse(null);
console.log('String with null (not undefined, fails):', nullString);

console.log('\n=== Default values for numbers ===');

const numberWithDefault = k.number().default(42);

const validNumber = numberWithDefault.safeParse(100);
console.log('Number with value:', validNumber);

const undefinedNumber = numberWithDefault.safeParse(undefined);
console.log('Number with undefined (uses default):', undefinedNumber);

const invalidNumber = numberWithDefault.safeParse('not a number');
console.log('Number with invalid type:', invalidNumber);

console.log('\n=== Default with validations ===');

const ageWithDefault = k.number().min(0).max(120).default(18);

const validAge = ageWithDefault.safeParse(25);
console.log('Age with value:', validAge);

const undefinedAge = ageWithDefault.safeParse(undefined);
console.log('Age with undefined (uses default 18):', undefinedAge);

const invalidAge = ageWithDefault.safeParse(150);
console.log('Age out of range:', invalidAge);

console.log('\n=== Default with strings and validations ===');

const emailWithDefault = k.string().email().default('no-reply@example.com');

const validEmail = emailWithDefault.safeParse('user@example.com');
console.log('Email with value:', validEmail);

const undefinedEmail = emailWithDefault.safeParse(undefined);
console.log('Email with undefined (uses default):', undefinedEmail);

const invalidEmail = emailWithDefault.safeParse('not-an-email');
console.log('Invalid email:', invalidEmail);

console.log('\n=== Default in objects ===');

const userSchema = k.object({
  nombre: k.string(),
  edad: k.number().default(18),
  pais: k.string().default('Unknown'),
  activo: k.number().default(1),
});

const fullUser = userSchema.safeParse({
  nombre: 'Ana',
  edad: 25,
  pais: 'España',
  activo: 1,
});
console.log('User with all values:', fullUser);

const partialUser = userSchema.safeParse({
  nombre: 'Carlos',
});
console.log('User with only nombre (uses defaults):', partialUser);

const partialUser2 = userSchema.safeParse({
  nombre: 'María',
  pais: 'México',
});
console.log('User with nombre and pais (edad uses default):', partialUser2);

console.log('\n=== Default with optional ===');

const optionalWithDefault = k.string().optional().default('fallback');

const valuePresent = optionalWithDefault.safeParse('hello');
console.log('Optional with value:', valuePresent);

const valueUndefined = optionalWithDefault.safeParse(undefined);
console.log('Optional with undefined (uses default):', valueUndefined);

console.log('\n=== Chaining: default after validations ===');

const portWithDefault = k.number()
  .integer()
  .min(1)
  .max(65535)
  .default(3000);

const customPort = portWithDefault.safeParse(8080);
console.log('Custom port:', customPort);

const defaultPort = portWithDefault.safeParse(undefined);
console.log('Default port (3000):', defaultPort);

const invalidPort = portWithDefault.safeParse(70000);
console.log('Invalid port (out of range):', invalidPort);

console.log('\n=== Complex object with nested defaults ===');

const configSchema = k.object({
  host: k.string().default('localhost'),
  port: k.number().default(3000),
  database: k.object({
    name: k.string().default('mydb'),
    user: k.string().default('admin'),
    password: k.string(),
  }),
  debug: k.number().default(0),
});

const fullConfig = configSchema.safeParse({
  host: 'example.com',
  port: 5432,
  database: {
    name: 'production',
    user: 'produser',
    password: 'secret123',
  },
  debug: 1,
});
console.log('Full config:', fullConfig);

const minimalConfig = configSchema.safeParse({
  database: {
    password: 'secret456',
  },
});
console.log('Minimal config (uses many defaults):', minimalConfig);

const partialConfig = configSchema.safeParse({
  port: 8080,
  database: {
    name: 'testdb',
    password: 'test123',
  },
});
console.log('Partial config:', partialConfig);

console.log('\n=== Real world: API request with defaults ===');

const apiRequestSchema = k.object({
  method: k.string().default('GET'),
  timeout: k.number().default(5000),
  retries: k.number().integer().min(0).max(5).default(3),
  headers: k.object({
    contentType: k.string().default('application/json'),
    accept: k.string().default('application/json'),
  }).optional(),
});

const customRequest = apiRequestSchema.safeParse({
  method: 'POST',
  timeout: 10000,
  headers: {
    contentType: 'application/xml',
    accept: 'application/xml',
  },
});
console.log('Custom request:', customRequest);

const minimalRequest = apiRequestSchema.safeParse({});
console.log('Minimal request (all defaults):', minimalRequest);

const partialRequest = apiRequestSchema.safeParse({
  method: 'DELETE',
  retries: 1,
});
console.log('Partial request:', partialRequest);

console.log('\n=== Edge cases ===');

const stringDefaultEmpty = k.string().default('');
console.log('String with empty default:', stringDefaultEmpty.safeParse(undefined));

const numberDefaultZero = k.number().default(0);
console.log('Number with zero default:', numberDefaultZero.safeParse(undefined));

const numberDefaultNegative = k.number().default(-1);
console.log('Number with negative default:', numberDefaultNegative.safeParse(undefined));