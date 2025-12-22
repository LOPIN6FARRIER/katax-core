import { k } from '../k';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              STRESS TESTS & CORNER CASES                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// TEST 1: Circular reference protection (should not cause infinite loop)
// ============================================================================
console.log('🔍 TEST 1: Circular References');
console.log('─────────────────────────────────────────────────');

const obj: any = { name: 'test' };
obj.self = obj; // Circular reference

const schema1 = k.object({
  name: k.string()
});

try {
  const result = schema1.safeParse(obj);
  console.log('Circular ref (ignored extra keys):', result.success);
} catch (e) {
  console.log('ERROR:', (e as Error).message);
}

// ============================================================================
// TEST 2: Array with mixed valid/invalid elements - error paths
// ============================================================================
console.log('\n🔍 TEST 2: Error Paths in Arrays');
console.log('─────────────────────────────────────────────────');

const schema2 = k.array(k.number().min(0).max(100));
const result2 = schema2.safeParse([50, -10, 150, 75, 200]);

console.log('Mixed valid/invalid array:');
console.log('  Success:', result2.success);
if (!result2.success) {
  console.log('  Errors:');
  result2.issues.forEach(issue => {
    console.log('    - Path:', JSON.stringify(issue.path), '| Message:', issue.message);
  });
}

// ============================================================================
// TEST 3: Deeply nested error paths
// ============================================================================
console.log('\n🔍 TEST 3: Deeply Nested Error Paths');
console.log('─────────────────────────────────────────────────');

const schema3 = k.object({
  users: k.array(
    k.object({
      name: k.string().minLength(2),
      contacts: k.array(
        k.object({
          type: k.string(),
          value: k.string().email()
        })
      )
    })
  )
});

const result3 = schema3.safeParse({
  users: [
    {
      name: 'John',
      contacts: [
        { type: 'email', value: 'valid@email.com' },
        { type: 'email', value: 'invalid-email' }
      ]
    },
    {
      name: 'J', // Too short
      contacts: [
        { type: 'email', value: 'another-invalid' }
      ]
    }
  ]
});

console.log('Nested validation errors:');
console.log('  Success:', result3.success);
if (!result3.success) {
  console.log('  Errors:');
  result3.issues.forEach(issue => {
    console.log('    - Path:', JSON.stringify(issue.path), '| Message:', issue.message);
  });
}

// ============================================================================
// TEST 4: Transform that throws error
// ============================================================================
console.log('\n🔍 TEST 4: Transform Error Handling');
console.log('─────────────────────────────────────────────────');

const schema4 = k.string().transform(s => {
  if (s === 'throw') {
    throw new Error('Transform error!');
  }
  return s.toUpperCase();
});

console.log('Transform with normal value:', schema4.safeParse('hello'));

try {
  console.log('Transform with throw:', schema4.safeParse('throw'));
} catch (e) {
  console.log('  ERROR caught:', (e as Error).message);
}

// ============================================================================
// TEST 5: Very long strings
// ============================================================================
console.log('\n🔍 TEST 5: Very Long Strings');
console.log('─────────────────────────────────────────────────');

const longString = 'a'.repeat(10000);
const schema5 = k.string().minLength(5000).maxLength(20000);

const start5 = Date.now();
const result5 = schema5.safeParse(longString);
const end5 = Date.now();

console.log('Long string (10k chars):', {
  success: result5.success,
  length: result5.success ? result5.data.length : 0,
  timeMs: end5 - start5
});

// ============================================================================
// TEST 6: Special characters in strings
// ============================================================================
console.log('\n🔍 TEST 6: Special Characters');
console.log('─────────────────────────────────────────────────');

const schema6 = k.string();
console.log('Emoji:', schema6.safeParse('Hello 👋 World 🌍'));
console.log('Unicode:', schema6.safeParse('你好世界'));
console.log('Special chars:', schema6.safeParse('Test\n\t\r'));
console.log('HTML:', schema6.safeParse('<script>alert("xss")</script>'));

// ============================================================================
// TEST 7: Date with various timezone formats
// ============================================================================
console.log('\n🔍 TEST 7: Date Timezone Handling');
console.log('─────────────────────────────────────────────────');

const schema7 = k.date();
console.log('UTC (Z):', schema7.safeParse('2024-01-15T10:30:00Z'));
console.log('Offset +05:00:', schema7.safeParse('2024-01-15T10:30:00+05:00'));
console.log('Offset -08:00:', schema7.safeParse('2024-01-15T10:30:00-08:00'));
console.log('No timezone:', schema7.safeParse('2024-01-15T10:30:00'));
console.log('Date only:', schema7.safeParse('2024-01-15'));

// ============================================================================
// TEST 8: Number edge values
// ============================================================================
console.log('\n🔍 TEST 8: Number Edge Values');
console.log('─────────────────────────────────────────────────');

const schema8 = k.number();
console.log('Zero:', schema8.safeParse(0));
console.log('Negative zero:', schema8.safeParse(-0));
console.log('Very large:', schema8.safeParse(Number.MAX_SAFE_INTEGER));
console.log('Very small:', schema8.safeParse(Number.MIN_SAFE_INTEGER));
console.log('Infinity:', schema8.safeParse(Infinity));
console.log('NaN:', schema8.safeParse(NaN));
console.log('Float precision:', schema8.safeParse(0.1 + 0.2));

// ============================================================================
// TEST 9: Object with extra keys (strict mode)
// ============================================================================
console.log('\n🔍 TEST 9: Object Strict Mode');
console.log('─────────────────────────────────────────────────');

const schema9 = k.object({
  name: k.string(),
  age: k.number()
}).strict();

console.log('Strict with exact keys:', schema9.safeParse({
  name: 'John',
  age: 30
}));

console.log('Strict with extra keys:', schema9.safeParse({
  name: 'John',
  age: 30,
  extra: 'field'
}));

// ============================================================================
// TEST 10: Array length edge cases
// ============================================================================
console.log('\n🔍 TEST 10: Array Length Edge Cases');
console.log('─────────────────────────────────────────────────');

const schema10 = k.array(k.string()).length(0);
console.log('Length exactly 0 with empty:', schema10.safeParse([]));
console.log('Length exactly 0 with one:', schema10.safeParse(['a']));

const schema10b = k.array(k.string()).minLength(0);
console.log('MinLength 0 with empty:', schema10b.safeParse([]));

// ============================================================================
// TEST 11: formatOutput with complex formats
// ============================================================================
console.log('\n🔍 TEST 11: Date Format Output Edge Cases');
console.log('─────────────────────────────────────────────────');

const schema11 = k.date().formatOutput("yyyy-MM-dd'T'HH:mm:ss'Z'");
console.log('Custom format with literals:', schema11.safeParse('2024-01-15T10:30:00Z'));

const schema11b = k.date().formatOutput('QQQQ yyyy');
console.log('Quarter format:', schema11b.safeParse('2024-06-15'));

// ============================================================================
// TEST 12: Multiple transforms chained
// ============================================================================
console.log('\n🔍 TEST 12: Multiple Transform Chains');
console.log('─────────────────────────────────────────────────');

const schema12 = k.string()
  .transform(s => s.trim())
  .transform(s => s.toLowerCase())
  .transform(s => s.replace(/\s+/g, '-'));

console.log('Triple transform:', schema12.safeParse('  Hello World  '));

// ============================================================================
// TEST 13: Array unique with NaN and special numbers
// ============================================================================
console.log('\n🔍 TEST 13: Array Unique with Special Values');
console.log('─────────────────────────────────────────────────');

const schema13 = k.array(k.number().finite()).unique();
console.log('With duplicate zeros:', schema13.safeParse([0, -0, 1, 2]));
console.log('With floats:', schema13.safeParse([1.0, 1, 2.0, 2]));

// ============================================================================
// TEST 14: Default values with complex types
// ============================================================================
console.log('\n🔍 TEST 14: Default Values with Complex Types');
console.log('─────────────────────────────────────────────────');

const schema14 = k.object({
  items: k.array(k.string()).default(['default1', 'default2'])
});

console.log('With value:', schema14.safeParse({ items: ['a', 'b'] }));
console.log('With undefined:', schema14.safeParse({ items: undefined }));

// ============================================================================
// TEST 15: Case sensitivity in object keys
// ============================================================================
console.log('\n🔍 TEST 15: Object Case Sensitivity');
console.log('─────────────────────────────────────────────────');

const schema15 = k.object({
  Name: k.string(),
  Age: k.number()
});

console.log('Exact case:', schema15.safeParse({ Name: 'John', Age: 30 }));
console.log('Wrong case:', schema15.safeParse({ name: 'John', age: 30 }));

const schema15b = k.object({
  Name: k.string(),
  Age: k.number()
}).caseInsensitive();

console.log('Case insensitive:', schema15b.safeParse({ name: 'John', age: 30 }));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                 Stress Tests Complete!                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
