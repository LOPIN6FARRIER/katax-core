import { k } from '../k';

console.log('=== Basic string validation ===');
const name = k.string().parse('hello');
console.log('Valid string:', name);

const invalidType = k.string().safeParse(123);
console.log('Invalid type:', invalidType);

console.log('\n=== Length validations ===');
const minLengthLength = k.string().minLength(5).safeParse('hi');
console.log('Too short:', minLengthLength);

const validminLength = k.string().minLength(5).safeParse('hello');
console.log('Valid minLength:', validminLength);

const maxLengthLength = k.string().maxLength(10).safeParse('this is too long');
console.log('Too long:', maxLengthLength);

const exactLength = k.string().length(5).safeParse('hello');
console.log('Exact length:', exactLength);

console.log('\n=== Email validation ===');
const validEmail = k.string().email().safeParse('test@example.com');
console.log('Valid email:', validEmail);

const invalidEmail = k.string().email().safeParse('not-an-email');
console.log('Invalid email:', invalidEmail);

console.log('\n=== URL validation ===');
const validUrl = k.string().url().safeParse('https://example.com');
console.log('Valid URL:', validUrl);

const invalidUrl = k.string().url().safeParse('not a url');
console.log('Invalid URL:', invalidUrl);

console.log('\n=== Chaining validations ===');
const chainedValid = k.string()
  .minLength(3)
  .maxLength(50)
  .includes('@')
  .email()
  .safeParse('user@example.com');
console.log('Chained valid:', chainedValid);

const chainedInvalid = k.string()
  .minLength(10)
  .email()
  .safeParse('hi@x.co');
console.log('Chained invalid (multiple errors):', chainedInvalid);

console.log('\n=== Custom regex ===');
const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
const validPhone = k.string().regex(phoneRegex).safeParse('123-456-7890');
console.log('Valid phone:', validPhone);

const invalidPhone = k.string().regex(phoneRegex).safeParse('123456');
console.log('Invalid phone:', invalidPhone);

console.log('\n=== Prefix/Suffix ===');
const withPrefix = k.string().startsWith('https://').safeParse('https://example.com');
console.log('Valid prefix:', withPrefix);

const withSuffix = k.string().endsWith('.com').safeParse('example.org');
console.log('Invalid suffix:', withSuffix);

console.log('\n=== Custom error messages ===');
const customError = k.string()
  .minLength(8, 'La contraseña debe tener al menos 8 caracteres')
  .safeParse('short');
console.log('Custom error:', customError);
