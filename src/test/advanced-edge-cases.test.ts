import { k } from '../k';

console.log('=== ADVANCED EDGE CASES & BUG HUNTING ===\n');

// TEST 1: Base64 with malformed data URLs
console.log('🔍 TEST 1: Base64 Edge Cases');
console.log('─────────────────────────────');
const base64Schema = k.base64();
console.log('Empty base64:', base64Schema.safeParse(''));
console.log('Just data prefix:', base64Schema.safeParse('data:'));
console.log('No comma in data URL:', base64Schema.safeParse('data:image/png;base64'));
console.log('Invalid base64 chars:', base64Schema.safeParse('SGVsbG8@'));
console.log('Wrong padding:', base64Schema.safeParse('SGVsbG8==='));

// TEST 2: Email edge cases
console.log('\n🔍 TEST 2: Email Edge Cases');
console.log('─────────────────────────────');
const emailSchema = k.email();
console.log('Email with spaces:', emailSchema.safeParse(' user@example.com '));
console.log('Email with double @:', emailSchema.safeParse('user@@example.com'));
console.log('Email starting with dot:', emailSchema.safeParse('.user@example.com'));
console.log('Email ending with dot:', emailSchema.safeParse('user.@example.com'));
console.log('Email with consecutive dots:', emailSchema.safeParse('user..name@example.com'));
console.log('Very long email:', emailSchema.safeParse('a'.repeat(300) + '@example.com'));

// TEST 3: String oneOf/notOneOf edge cases
console.log('\n🔍 TEST 3: String oneOf/notOneOf Edge Cases');
console.log('─────────────────────────────');
const oneOfSchema = k.string().oneOf(['', 'test', 'hello']);
console.log('Empty string in oneOf:', oneOfSchema.safeParse(''));
console.log('Null in oneOf:', oneOfSchema.safeParse(null));
console.log('Undefined in oneOf:', oneOfSchema.safeParse(undefined));

const notOneOfSchema = k.string().notOneOf(['bad', 'forbidden']);
console.log('NotOneOf with allowed:', notOneOfSchema.safeParse('good'));
console.log('NotOneOf with forbidden:', notOneOfSchema.safeParse('bad'));

// TEST 4: Number edge cases with floating point
console.log('\n🔍 TEST 4: Number Floating Point Edge Cases');
console.log('─────────────────────────────');
const numberSchema = k.number();
console.log('Very large number:', numberSchema.safeParse(Number.MAX_SAFE_INTEGER));
console.log('Number.POSITIVE_INFINITY:', numberSchema.safeParse(Number.POSITIVE_INFINITY));
console.log('Number.NEGATIVE_INFINITY:', numberSchema.safeParse(Number.NEGATIVE_INFINITY));
console.log('Number.NaN:', numberSchema.safeParse(Number.NaN));
console.log('Very small number:', numberSchema.safeParse(Number.MIN_VALUE));

const multipleSchema = k.number().multipleOf(0.1);
console.log('Floating point multiple 0.3:', multipleSchema.safeParse(0.3));
console.log('Floating point multiple 0.33:', multipleSchema.safeParse(0.33));

// TEST 5: Array with mixed data types
console.log('\n🔍 TEST 5: Array Mixed Data Types');
console.log('─────────────────────────────');
const mixedArraySchema = k.array(k.string());
console.log('Array with mixed types:', mixedArraySchema.safeParse(['hello', 123, true, null]));

// TEST 6: Date with extreme values
console.log('\n🔍 TEST 6: Date Extreme Values');
console.log('─────────────────────────────');
const dateSchema = k.date();
console.log('Year 1000:', dateSchema.safeParse('1000-01-01'));
console.log('Year 9999:', dateSchema.safeParse('9999-12-31'));
console.log('February 29 leap year:', dateSchema.safeParse('2024-02-29'));
console.log('February 29 non-leap year:', dateSchema.safeParse('2023-02-29'));
console.log('Invalid month:', dateSchema.safeParse('2024-13-01'));
console.log('Invalid day:', dateSchema.safeParse('2024-01-32'));

// TEST 7: Object with circular references (should be prevented)
console.log('\n🔍 TEST 7: Object Edge Cases');
console.log('─────────────────────────────');
const objSchema = k.object({
  name: k.string(),
  value: k.number()
});

const circularObj: any = { name: 'test', value: 42 };
circularObj.self = circularObj; // Circular reference

// safeParse should never throw - it handles circular references gracefully
console.log('Object with circular reference:', objSchema.safeParse(circularObj));

// Test with strict mode to see if extra fields are detected
const strictSchema = k.object({
  name: k.string(),
  value: k.number()
}).strict();

console.log('Strict mode with extra field:', strictSchema.safeParse(circularObj));

// TEST 8: Transform edge cases
console.log('\n🔍 TEST 8: Transform Edge Cases');
console.log('─────────────────────────────');
const transformSchema = k.string().transform(s => {
  if (s === 'error') throw new Error('Transform error');
  return s.toUpperCase();
});

console.log('Transform normal:', transformSchema.safeParse('hello'));
console.log('Transform throws error:', transformSchema.safeParse('error'));

// TEST 9: Deep nesting levels
console.log('\n🔍 TEST 9: Deep Nesting');
console.log('─────────────────────────────');
const deepSchema = k.object({
  level1: k.object({
    level2: k.object({
      level3: k.object({
        level4: k.object({
          level5: k.string()
        })
      })
    })
  })
});

console.log('Deep nesting valid:', deepSchema.safeParse({
  level1: {
    level2: {
      level3: {
        level4: {
          level5: 'deep'
        }
      }
    }
  }
}));

console.log('Deep nesting invalid:', deepSchema.safeParse({
  level1: {
    level2: {
      level3: {
        level4: {
          level5: 123 // Should be string
        }
      }
    }
  }
}));

// TEST 10: Memory intensive operations
console.log('\n🔍 TEST 10: Memory Intensive Operations');
console.log('─────────────────────────────');
const largeObjectSchema = k.object(Object.fromEntries(
  Array.from({length: 100}, (_, i) => [`field${i}`, k.string().optional()])
));

const largeObject = Object.fromEntries(
  Array.from({length: 50}, (_, i) => [`field${i}`, `value${i}`])
);

console.log('Large object schema:', largeObjectSchema.safeParse(largeObject).success);

console.log('\n=== Advanced Edge Cases Complete ===');