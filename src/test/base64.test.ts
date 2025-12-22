import { k } from '../k';

console.log('=== Base64 Schema Individual Tests ===\n');

// Basic validation
const basicSchema = k.base64();
console.log('Basic valid:', basicSchema.safeParse('SGVsbG8='));
console.log('Basic invalid:', basicSchema.safeParse('invalid!!!'));

// Data URL validation
const dataUrlSchema = k.base64().dataUrl();
console.log('\nData URL valid:', dataUrlSchema.safeParse('data:image/png;base64,SGVsbG8='));
console.log('Data URL invalid:', dataUrlSchema.safeParse('SGVsbG8='));

// Image validation
const imageSchema = k.base64().image().dataUrl();
console.log('\nImage valid:', imageSchema.safeParse('data:image/png;base64,SGVsbG8='));
console.log('Image invalid:', imageSchema.safeParse('data:text/plain;base64,SGVsbG8='));

// Size validation
const sizeSchema = k.base64().minDecodedSize(5).maxDecodedSize(100);
console.log('\nSize valid:', sizeSchema.safeParse('SGVsbG8gV29ybGQ=')); // "Hello World"
console.log('Size too small:', sizeSchema.safeParse('SGk=')); // "Hi"

console.log('\n=== Base64 Tests Complete ===');