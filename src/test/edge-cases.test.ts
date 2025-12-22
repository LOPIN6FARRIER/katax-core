import { k } from '../k';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              EDGE CASES & BUG HUNTING                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// TEST 1: Empty arrays in various scenarios
// ============================================================================
console.log('🔍 TEST 1: Empty Arrays');
console.log('─────────────────────────────────────────────────');

const emptyArraySchema = k.array(k.string());
console.log('Empty array with element schema:', emptyArraySchema.safeParse([]));

const emptyArrayInObject = k.object({
  items: k.array(k.number())
});
console.log('Object with empty array:', emptyArrayInObject.safeParse({ items: [] }));

// ============================================================================
// TEST 2: Nested objects with arrays
// ============================================================================
console.log('\n🔍 TEST 2: Deeply Nested Structures');
console.log('─────────────────────────────────────────────────');

const deeplyNested = k.object({
  level1: k.object({
    level2: k.object({
      level3: k.array(
        k.object({
          id: k.string(),
          tags: k.array(k.string())
        })
      )
    })
  })
});

console.log('Deeply nested valid:', deeplyNested.safeParse({
  level1: {
    level2: {
      level3: [
        { id: '1', tags: ['a', 'b'] },
        { id: '2', tags: ['c'] }
      ]
    }
  }
}));

console.log('Deeply nested invalid (missing tags):', deeplyNested.safeParse({
  level1: {
    level2: {
      level3: [
        { id: '1' }
      ]
    }
  }
}));

// ============================================================================
// TEST 3: Arrays with null/undefined elements
// ============================================================================
console.log('\n🔍 TEST 3: Null/Undefined in Arrays');
console.log('─────────────────────────────────────────────────');

const arrayWithNulls = k.array(k.string());
console.log('Array with null:', arrayWithNulls.safeParse(['a', null, 'b']));
console.log('Array with undefined:', arrayWithNulls.safeParse(['a', undefined, 'b']));

const arrayWithOptional = k.array(k.string().optional());
console.log('Array with optional (undefined):', arrayWithOptional.safeParse(['a', undefined, 'b']));

// ============================================================================
// TEST 4: TwoDates with empty arrays issue
// ============================================================================
console.log('\n🔍 TEST 4: TwoDates Edge Cases');
console.log('─────────────────────────────────────────────────');

const twoDates = k.twoDates();
console.log('Same date twice:', twoDates.safeParse('2024-01-15|2024-01-15'));
console.log('Invalid separator:', twoDates.safeParse('2024-01-15,2024-01-20'));
console.log('Empty string:', twoDates.safeParse(''));
console.log('Only one date:', twoDates.safeParse('2024-01-15'));

// ============================================================================
// TEST 5: Transform with arrays
// ============================================================================
console.log('\n🔍 TEST 5: Transform with Arrays');
console.log('─────────────────────────────────────────────────');

const transformArray = k.array(k.number())
  .transform(arr => arr.map(n => n * 2));

console.log('Transform array:', transformArray.safeParse([1, 2, 3]));

const transformInObject = k.object({
  numbers: k.array(k.number()).transform(arr => arr.length)
});

console.log('Transform array in object:', transformInObject.safeParse({
  numbers: [1, 2, 3, 4, 5]
}));

// ============================================================================
// TEST 6: Date formatOutput with invalid dates
// ============================================================================
console.log('\n🔍 TEST 6: Date Edge Cases');
console.log('─────────────────────────────────────────────────');

const dateSchema = k.date();
console.log('Invalid date string:', dateSchema.safeParse('invalid-date'));
console.log('Partial date:', dateSchema.safeParse('2024-01'));
console.log('Numeric timestamp:', dateSchema.safeParse(1705276800000));

const dateWithTransform = k.date().formatOutput('yyyy-MM-dd');
console.log('Date transform with timezone:', dateWithTransform.safeParse('2024-01-15T23:59:59Z'));

// ============================================================================
// TEST 7: Array unique with objects
// ============================================================================
console.log('\n🔍 TEST 7: Array Unique with Complex Types');
console.log('─────────────────────────────────────────────────');

const uniqueNumbers = k.array(k.number()).unique();
console.log('Unique numbers with duplicate:', uniqueNumbers.safeParse([1, 2, 3, 2, 4]));

// Objects are compared by reference, not value
const uniqueObjects = k.array(k.object({ id: k.string() })).unique();
console.log('Unique objects (different references):', uniqueObjects.safeParse([
  { id: '1' },
  { id: '1' }  // Same value but different object reference
]));

// ============================================================================
// TEST 8: Chaining optional/nullable with transforms
// ============================================================================
console.log('\n🔍 TEST 8: Optional/Nullable with Transforms');
console.log('─────────────────────────────────────────────────');

const optionalTransform = k.string()
  .transform(s => s.toUpperCase())
  .optional();

console.log('Optional transform with value:', optionalTransform.safeParse('hello'));
console.log('Optional transform with undefined:', optionalTransform.safeParse(undefined));

const transformOptional = k.string()
  .optional()
  .transform(s => s ? s.toUpperCase() : 'DEFAULT');

console.log('Transform optional with value:', transformOptional.safeParse('hello'));
console.log('Transform optional with undefined:', transformOptional.safeParse(undefined));

// ============================================================================
// TEST 9: Array contains with complex values
// ============================================================================
console.log('\n🔍 TEST 9: Array Contains Edge Cases');
console.log('─────────────────────────────────────────────────');

const containsString = k.array(k.string()).contains('hello');
console.log('Contains existing:', containsString.safeParse(['world', 'hello', 'test']));
console.log('Contains missing:', containsString.safeParse(['world', 'test']));

// ============================================================================
// TEST 10: Object with array that has validation errors
// ============================================================================
console.log('\n🔍 TEST 10: Mixed Validation Errors');
console.log('─────────────────────────────────────────────────');

const complexSchema = k.object({
  name: k.string().minLength(3),
  emails: k.array(k.string().email()).minLength(1),
  age: k.number().min(18).max(100)
});

console.log('Multiple field errors:', complexSchema.safeParse({
  name: 'AB',  // Too short
  emails: ['valid@email.com', 'invalid-email'],  // One invalid
  age: 150  // Too high
}));

console.log('Array validation + element validation:', complexSchema.safeParse({
  name: 'John',
  emails: [],  // Empty array (fails minLength)
  age: 25
}));

// ============================================================================
// TEST 11: Date in arrays and objects
// ============================================================================
console.log('\n🔍 TEST 11: Dates in Complex Structures');
console.log('─────────────────────────────────────────────────');

const eventsSchema = k.object({
  events: k.array(
    k.object({
      name: k.string(),
      date: k.date().isFuture(),
      attendees: k.array(k.string()).optional()
    })
  )
});

console.log('Events with future dates:', eventsSchema.safeParse({
  events: [
    { name: 'Event 1', date: '2030-01-15', attendees: ['Alice', 'Bob'] },
    { name: 'Event 2', date: '2030-06-20' }
  ]
}));

console.log('Events with past date (should fail):', eventsSchema.safeParse({
  events: [
    { name: 'Event 1', date: '2020-01-15' }
  ]
}));

// ============================================================================
// TEST 12: Empty objects and arrays
// ============================================================================
console.log('\n🔍 TEST 12: Empty Values');
console.log('─────────────────────────────────────────────────');

const emptyObject = k.object({});
console.log('Empty object schema with data:', emptyObject.safeParse({ foo: 'bar' }));
console.log('Empty object schema with empty:', emptyObject.safeParse({}));

const arrayNotEmpty = k.array(k.string()).notEmpty();
console.log('NotEmpty with empty array:', arrayNotEmpty.safeParse([]));
console.log('NotEmpty with one element:', arrayNotEmpty.safeParse(['a']));

// ============================================================================
// TEST 13: Boolean edge cases
// ============================================================================
console.log('\n🔍 TEST 13: Boolean Edge Cases');
console.log('─────────────────────────────────────────────────');

const boolSchema = k.boolean();
console.log('Boolean true:', boolSchema.safeParse(true));
console.log('Boolean false:', boolSchema.safeParse(false));
console.log('Boolean from number 1:', boolSchema.safeParse(1));
console.log('Boolean from number 0:', boolSchema.safeParse(0));
console.log('Boolean from string "true":', boolSchema.safeParse('true'));
console.log('Boolean from string "false":', boolSchema.safeParse('false'));

// ============================================================================
// TEST 14: Very large arrays
// ============================================================================
console.log('\n🔍 TEST 14: Performance with Large Arrays');
console.log('─────────────────────────────────────────────────');

const largeArray = Array.from({ length: 1000 }, (_, i) => i);
const largeArraySchema = k.array(k.number()).minLength(500);

const start = Date.now();
const result = largeArraySchema.safeParse(largeArray);
const end = Date.now();

console.log('Large array (1000 elements):', {
  success: result.success,
  length: result.success ? result.data.length : 0,
  timeMs: end - start
});

// ============================================================================
// TEST 15: Object partial with arrays
// ============================================================================
console.log('\n🔍 TEST 15: Object Partial with Arrays');
console.log('─────────────────────────────────────────────────');

const userSchema = k.object({
  name: k.string(),
  tags: k.array(k.string()),
  age: k.number()
});

const partialUser = userSchema.partial();

console.log('Partial with all fields:', partialUser.safeParse({
  name: 'John',
  tags: ['dev', 'js'],
  age: 30
}));

console.log('Partial with only array:', partialUser.safeParse({
  tags: ['dev']
}));

console.log('Partial with nothing:', partialUser.safeParse({}));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                  Edge Cases Complete!                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
