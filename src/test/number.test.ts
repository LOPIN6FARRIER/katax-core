import { k } from '../k';

console.log('=== Basic number validation ===');
const age = k.number().parse(25);
console.log('Valid number:', age);

const invalidType = k.number().safeParse('123');
console.log('Invalid type (string):', invalidType);

const invalidTypeBoolean = k.number().safeParse(true);
console.log('Invalid type (boolean):', invalidTypeBoolean);

console.log('\n=== Min/Max validations ===');
const minValue = k.number().min(18).safeParse(16);
console.log('Too small:', minValue);

const validMin = k.number().min(18).safeParse(21);
console.log('Valid min:', validMin);

const maxValue = k.number().max(100).safeParse(150);
console.log('Too large:', maxValue);

const validMax = k.number().max(100).safeParse(50);
console.log('Valid max:', validMax);

console.log('\n=== Exact value ===');
const exactValue = k.number().length(42).safeParse(42);
console.log('Exact match:', exactValue);

const notExact = k.number().length(42).safeParse(41);
console.log('Not exact:', notExact);

console.log('\n=== Positive/Negative ===');
const validPositive = k.number().positive().safeParse(10);
console.log('Valid positive:', validPositive);

const invalidPositive = k.number().positive().safeParse(-5);
console.log('Invalid positive:', invalidPositive);

const validNegative = k.number().negative().safeParse(-10);
console.log('Valid negative:', validNegative);

const invalidNegative = k.number().negative().safeParse(5);
console.log('Invalid negative:', invalidNegative);

console.log('\n=== Integer validation ===');
const validInteger = k.number().integer().safeParse(42);
console.log('Valid integer:', validInteger);

const invalidInteger = k.number().integer().safeParse(3.14);
console.log('Invalid integer (float):', invalidInteger);

console.log('\n=== Finite validation ===');
const validFinite = k.number().finite().safeParse(100);
console.log('Valid finite:', validFinite);

const invalidFinite = k.number().finite().safeParse(Infinity);
console.log('Invalid finite (Infinity):', invalidFinite);

const invalidFiniteNaN = k.number().finite().safeParse(NaN);
console.log('Invalid finite (NaN):', invalidFiniteNaN);

console.log('\n=== Multiple of ===');
const validMultiple = k.number().multipleOf(5).safeParse(15);
console.log('Valid multiple of 5:', validMultiple);

const invalidMultiple = k.number().multipleOf(5).safeParse(17);
console.log('Invalid multiple of 5:', invalidMultiple);

console.log('\n=== Between range ===');
const validBetween = k.number().between(10, 20).safeParse(15);
console.log('Valid between 10-20:', validBetween);

const invalidBetweenLow = k.number().between(10, 20).safeParse(5);
console.log('Below range:', invalidBetweenLow);

const invalidBetweenHigh = k.number().between(10, 20).safeParse(25);
console.log('Above range:', invalidBetweenHigh);

console.log('\n=== Greater than / Less than ===');
const validGreater = k.number().greaterThan(10).safeParse(11);
console.log('Valid greater than 10:', validGreater);

const invalidGreater = k.number().greaterThan(10).safeParse(10);
console.log('Invalid greater than 10 (equal):', invalidGreater);

const validLess = k.number().lessThan(100).safeParse(99);
console.log('Valid less than 100:', validLess);

const invalidLess = k.number().lessThan(100).safeParse(100);
console.log('Invalid less than 100 (equal):', invalidLess);

console.log('\n=== One of / Not one of ===');
const validOneOf = k.number().oneOf([1, 2, 3, 5, 8]).safeParse(5);
console.log('Valid one of [1,2,3,5,8]:', validOneOf);

const invalidOneOf = k.number().oneOf([1, 2, 3, 5, 8]).safeParse(4);
console.log('Invalid one of:', invalidOneOf);

const validNotOneOf = k.number().notOneOf([13, 666]).safeParse(42);
console.log('Valid not one of [13, 666]:', validNotOneOf);

const invalidNotOneOf = k.number().notOneOf([13, 666]).safeParse(666);
console.log('Invalid not one of:', invalidNotOneOf);

console.log('\n=== Not equal ===');
const validNotEqual = k.number().notEqual(0).safeParse(1);
console.log('Valid not equal to 0:', validNotEqual);

const invalidNotEqual = k.number().notEqual(0).safeParse(0);
console.log('Invalid not equal to 0:', invalidNotEqual);

console.log('\n=== Chaining validations ===');
const chainedValid = k.number()
  .min(0)
  .max(120)
  .integer()
  .safeParse(25);
console.log('Chained valid (age):', chainedValid);

const chainedInvalid = k.number()
  .positive()
  .integer()
  .multipleOf(10)
  .safeParse(7);
console.log('Chained invalid (multiple errors):', chainedInvalid);

console.log('\n=== Optional validation ===');
const optionalNumber = k.number().min(0).optional();

const validOptionalValue = optionalNumber.safeParse(10);
console.log('Optional with value:', validOptionalValue);

const validOptionalUndefined = optionalNumber.safeParse(undefined);
console.log('Optional with undefined:', validOptionalUndefined);

const invalidOptional = optionalNumber.safeParse(-5);
console.log('Optional with invalid value:', invalidOptional);

const invalidOptionalType = optionalNumber.safeParse('hello');
console.log('Optional with wrong type:', invalidOptionalType);

console.log('\n=== Nullable validation ===');
const nullableNumber = k.number().positive().nullable();

const validNullableValue = nullableNumber.safeParse(42);
console.log('Nullable with value:', validNullableValue);

const validNullableNull = nullableNumber.safeParse(null);
console.log('Nullable with null:', validNullableNull);

const invalidNullable = nullableNumber.safeParse(-10);
console.log('Nullable with invalid value:', invalidNullable);

const invalidNullableType = nullableNumber.safeParse('test');
console.log('Nullable with wrong type:', invalidNullableType);

console.log('\n=== Complex optional scenario ===');
const rating = k.number()
  .integer()
  .between(1, 5)
  .optional();

console.log('Rating 4:', rating.safeParse(4));
console.log('Rating undefined:', rating.safeParse(undefined));
console.log('Rating 6 (out of range):', rating.safeParse(6));
console.log('Rating 3.5 (not integer):', rating.safeParse(3.5));

console.log('\n=== Complex nullable scenario ===');
const price = k.number()
  .positive()
  .multipleOf(0.01)
  .nullable();

console.log('Price 99.99:', price.safeParse(99.99));
console.log('Price null:', price.safeParse(null));
console.log('Price -10 (negative):', price.safeParse(-10));

console.log('\n=== Custom error messages ===');
const customError = k.number()
  .min(18, 'Debes ser mayor de edad')
  .integer('La edad debe ser un número entero')
  .safeParse(17.5);
console.log('Custom errors:', customError);

console.log('\n=== Real world examples ===');

// Percentage
const percentage = k.number()
  .min(0, 'El porcentaje no puede ser negativo')
  .max(100, 'El porcentaje no puede exceder 100')
  .safeParse(75);
console.log('Percentage validation:', percentage);

// Temperature in Celsius
const temperature = k.number()
  .finite()
  .between(-273.15, 1000)
  .safeParse(25.5);
console.log('Temperature validation:', temperature);

// Port number
const port = k.number()
  .integer()
  .between(1, 65535)
  .safeParse(3000);
console.log('Port validation:', port);

// Score with optional (no score yet)
const gameScore = k.number()
  .integer()
  .min(0)
  .optional();
console.log('Game score (undefined):', gameScore.safeParse(undefined));
console.log('Game score (100):', gameScore.safeParse(100));
