import { k } from '../k';

console.log('=== File Schema Tests ===\n');

// Mock File objects for testing (since we might not be in browser)
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

// Check if File is available, if not, use mock
const FileConstructor = typeof File !== 'undefined' ? File : MockFile as any;

console.log('=== Basic file validation ===');
try {
  const fileSchema = k.file();
  
  // Create test files
  const validImage = new FileConstructor('photo.jpg', 1024 * 100, 'image/jpeg'); // 100KB
  const validDocument = new FileConstructor('document.pdf', 1024 * 1024 * 2, 'application/pdf'); // 2MB
  
  console.log('Valid image file:', fileSchema.safeParse(validImage));
  console.log('Invalid type (string):', fileSchema.safeParse('not-a-file'));
} catch (error) {
  console.log('File API not available in this environment:', (error as Error).message);
}

console.log('\n=== File size validation ===');
try {
  const sizeSchema = k.file().maxSize(1024 * 1024); // 1MB max
  const smallFile = new FileConstructor('small.txt', 1024, 'text/plain'); // 1KB
  const largeFile = new FileConstructor('large.zip', 1024 * 1024 * 5, 'application/zip'); // 5MB
  
  console.log('Small file (valid):', sizeSchema.safeParse(smallFile));
  console.log('Large file (invalid):', sizeSchema.safeParse(largeFile));
} catch (error) {
  console.log('File size validation - File API not available');
}

console.log('\n=== File type validation ===');
try {
  const imageSchema = k.file().image();
  const docSchema = k.file().document();
  
  const jpegFile = new FileConstructor('photo.jpg', 1024, 'image/jpeg');
  const pdfFile = new FileConstructor('doc.pdf', 1024, 'application/pdf');
  const textFile = new FileConstructor('readme.txt', 1024, 'text/plain');
  
  console.log('JPEG as image (valid):', imageSchema.safeParse(jpegFile));
  console.log('PDF as image (invalid):', imageSchema.safeParse(pdfFile));
  console.log('PDF as document (valid):', docSchema.safeParse(pdfFile));
  console.log('Text as document (valid):', docSchema.safeParse(textFile));
} catch (error) {
  console.log('File type validation - File API not available');
}

console.log('\n=== File extension validation ===');
try {
  const extensionSchema = k.file().extensions(['.jpg', '.png', '.gif']);
  
  const jpgFile = new FileConstructor('photo.jpg', 1024, 'image/jpeg');
  const pngFile = new FileConstructor('image.PNG', 1024, 'image/png'); // Test case insensitive
  const txtFile = new FileConstructor('readme.txt', 1024, 'text/plain');
  
  console.log('JPG file (valid):', extensionSchema.safeParse(jpgFile));
  console.log('PNG file case insensitive (valid):', extensionSchema.safeParse(pngFile));
  console.log('TXT file (invalid):', extensionSchema.safeParse(txtFile));
} catch (error) {
  console.log('File extension validation - File API not available');
}

console.log('\n=== Complex file validation ===');
try {
  const complexSchema = k.file()
    .image('Must be an image file')
    .maxSize(1024 * 1024 * 2, 'Image must be smaller than 2MB')
    .extensions(['.jpg', '.jpeg', '.png'], 'Only JPG and PNG allowed');
  
  const validImage = new FileConstructor('photo.jpg', 1024 * 500, 'image/jpeg'); // 500KB JPEG
  const tooLargeImage = new FileConstructor('huge.jpg', 1024 * 1024 * 3, 'image/jpeg'); // 3MB JPEG
  const wrongExtension = new FileConstructor('photo.gif', 1024 * 500, 'image/gif'); // GIF
  
  console.log('Valid complex image:', complexSchema.safeParse(validImage));
  console.log('Too large image:', complexSchema.safeParse(tooLargeImage));
  console.log('Wrong extension:', complexSchema.safeParse(wrongExtension));
} catch (error) {
  console.log('Complex file validation - File API not available');
}

console.log('\n=== Base64 Schema Tests ===\n');

console.log('=== Basic base64 validation ===');
const base64Schema = k.base64();
console.log('Valid base64:', base64Schema.safeParse('SGVsbG8gV29ybGQ=')); // "Hello World"
console.log('Valid base64 with padding:', base64Schema.safeParse('SGVsbG8=')); // "Hello"
console.log('Invalid base64:', base64Schema.safeParse('Invalid!!!'));
console.log('Empty string:', base64Schema.safeParse(''));
console.log('Non-string input:', base64Schema.safeParse(123));

console.log('\n=== Data URL validation ===');
const dataUrlSchema = k.base64().dataUrl();
const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
console.log('Valid data URL:', dataUrlSchema.safeParse(imageDataUrl));
console.log('Plain base64 (invalid for data URL):', dataUrlSchema.safeParse('SGVsbG8gV29ybGQ='));

console.log('\n=== MIME type validation ===');
const pngBase64Schema = k.base64().mimeType('image/png');
console.log('PNG data URL (valid):', pngBase64Schema.safeParse(imageDataUrl));
console.log('Wrong MIME type:', pngBase64Schema.safeParse('data:text/plain;base64,SGVsbG8gV29ybGQ='));

console.log('\n=== Size validation ===');
const sizeBase64Schema = k.base64().maxDecodedSize(50); // 50 bytes max
console.log('Small base64 (valid):', sizeBase64Schema.safeParse('SGVsbG8=')); // "Hello" = 5 bytes
console.log('Large base64 (valid):', sizeBase64Schema.safeParse('SGVsbG8gV29ybGQ=')); // "Hello World" = 11 bytes

console.log('\n=== Image base64 validation ===');
const imageBase64Schema = k.base64().image();
console.log('Image data URL (valid):', imageBase64Schema.safeParse(imageDataUrl));
console.log('Text data URL (invalid):', imageBase64Schema.safeParse('data:text/plain;base64,SGVsbG8gV29ybGQ='));

console.log('\n=== Email Schema Tests ===\n');

console.log('=== Basic email validation ===');
const emailSchema = k.email();
console.log('Valid email:', emailSchema.safeParse('user@example.com'));
console.log('Valid email with subdomain:', emailSchema.safeParse('admin@mail.company.com'));
console.log('Invalid email (no @):', emailSchema.safeParse('invalid-email'));
console.log('Invalid email (no domain):', emailSchema.safeParse('user@'));
console.log('Invalid email (multiple @):', emailSchema.safeParse('user@@example.com'));
console.log('Non-string input:', emailSchema.safeParse(123));

console.log('\n=== Domain validation ===');
const companyEmailSchema = k.email().domain('company.com');
console.log('Company email (valid):', companyEmailSchema.safeParse('john@company.com'));
console.log('Wrong domain (invalid):', companyEmailSchema.safeParse('john@gmail.com'));

console.log('\n=== Multiple domains ===');
const allowedDomainsSchema = k.email().domains(['company.com', 'partner.org']);
console.log('Allowed domain 1:', allowedDomainsSchema.safeParse('user@company.com'));
console.log('Allowed domain 2:', allowedDomainsSchema.safeParse('user@partner.org'));
console.log('Not allowed domain:', allowedDomainsSchema.safeParse('user@gmail.com'));

console.log('\n=== Domain pattern ===');
const wildcardSchema = k.email().domainPattern('*.company.com');
console.log('Main domain:', wildcardSchema.safeParse('user@company.com'));
console.log('Subdomain (valid):', wildcardSchema.safeParse('user@mail.company.com'));
console.log('Different domain (invalid):', wildcardSchema.safeParse('user@other.com'));

console.log('\n=== Corporate email (no free providers) ===');
const corporateSchema = k.email().corporate();
console.log('Corporate email (valid):', corporateSchema.safeParse('employee@company.com'));
console.log('Gmail (invalid):', corporateSchema.safeParse('user@gmail.com'));
console.log('Yahoo (invalid):', corporateSchema.safeParse('user@yahoo.com'));

console.log('\n=== Local part validation ===');
const localSchema = k.email().localMinLength(3).localMaxLength(10);
console.log('Valid username length:', localSchema.safeParse('john@example.com')); // 4 chars
console.log('Too short username:', localSchema.safeParse('jo@example.com')); // 2 chars
console.log('Too long username:', localSchema.safeParse('verylongusername@example.com')); // 16 chars

console.log('\n=== No plus addressing ===');
const noPlusSchema = k.email().noPlus();
console.log('Regular email (valid):', noPlusSchema.safeParse('user@example.com'));
console.log('Plus addressing (invalid):', noPlusSchema.safeParse('user+tag@example.com'));

console.log('\n=== Complex email validation ===');
const complexEmailSchema = k.email()
  .domains(['company.com', 'partner.org'])
  .localMinLength(3, 'Username must be at least 3 characters')
  .noPlus('Plus addressing not allowed');

console.log('Valid complex email:', complexEmailSchema.safeParse('john@company.com'));
console.log('Invalid domain:', complexEmailSchema.safeParse('john@gmail.com'));
console.log('Username too short:', complexEmailSchema.safeParse('jo@company.com'));
console.log('Has plus addressing:', complexEmailSchema.safeParse('john+work@company.com'));