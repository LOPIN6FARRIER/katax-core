import { k } from '../k';

console.log('=== Email Schema Individual Tests ===\n');

// Basic validation
const basicSchema = k.email();
console.log('Basic valid:', basicSchema.safeParse('user@example.com'));
console.log('Basic invalid:', basicSchema.safeParse('invalid-email'));

// Domain validation
const domainSchema = k.email().domain('company.com');
console.log('\nDomain valid:', domainSchema.safeParse('user@company.com'));
console.log('Domain invalid:', domainSchema.safeParse('user@other.com'));

// Domain pattern validation (fixed)
const patternSchema = k.email().domainPattern('*.company.com');
console.log('\nPattern company.com:', patternSchema.safeParse('user@company.com'));
console.log('Pattern mail.company.com:', patternSchema.safeParse('user@mail.company.com'));
console.log('Pattern other.com:', patternSchema.safeParse('user@other.com'));

// Corporate email
const corporateSchema = k.email().corporate();
console.log('\nCorporate valid:', corporateSchema.safeParse('employee@company.com'));
console.log('Corporate invalid (Gmail):', corporateSchema.safeParse('user@gmail.com'));

// Local part validation
const localSchema = k.email().localMinLength(3).noPlus();
console.log('\nLocal valid:', localSchema.safeParse('john@example.com'));
console.log('Local too short:', localSchema.safeParse('jo@example.com'));
console.log('Local with plus:', localSchema.safeParse('john+work@example.com'));

console.log('\n=== Email Tests Complete ===');