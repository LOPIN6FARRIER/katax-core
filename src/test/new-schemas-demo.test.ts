import { k } from '../k';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              NEW SCHEMAS DEMO                               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// EXAMPLE 1: File Upload API
// ============================================================================
console.log('🔷 EXAMPLE 1: File Upload API');
console.log('─────────────────────────────────────────────────');

try {
  const fileUploadSchema = k.object({
    userId: k.string().minLength(1),
    uploadedFile: k.file()
      .image('Only image files allowed')
      .maxSize(1024 * 1024 * 5, 'File must be smaller than 5MB')
      .extensions(['.jpg', '.jpeg', '.png', '.webp'], 'Only JPG, PNG, WEBP allowed'),
    description: k.string().minLength(5).optional(),
    isPublic: k.boolean().default(false)
  });

  console.log('Schema created successfully for browser environment');
  console.log('File validation would work in browser with real File objects\n');
} catch (error) {
  console.log('File schema demo - requires browser environment with File API\n');
}

// ============================================================================
// EXAMPLE 2: Base64 Image API
// ============================================================================
console.log('🔷 EXAMPLE 2: Base64 Image API');
console.log('─────────────────────────────────────────────────');

const base64ImageSchema = k.object({
  name: k.string().minLength(1),
  imageData: k.base64()
    .dataUrl('Must be a data URL')
    .image('Must be an image')
    .maxDecodedSize(1024 * 1024 * 2, 'Decoded image must be smaller than 2MB'),
  alt: k.string().maxLength(100).optional(),
  category: k.string().oneOf(['avatar', 'banner', 'content'], 'Invalid category')
});

// Valid example
const validImageData = {
  name: 'profile-avatar',
  imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  alt: 'User profile picture',
  category: 'avatar'
};

console.log('✅ Valid base64 image data:');
const imageResult = base64ImageSchema.safeParse(validImageData);
console.log(JSON.stringify(imageResult, null, 2));

// Invalid example
const invalidImageData = {
  name: 'document',
  imageData: 'data:text/plain;base64,SGVsbG8gV29ybGQ=', // Text, not image
  category: 'invalid-category'
};

console.log('\n❌ Invalid base64 image data:');
const invalidImageResult = base64ImageSchema.safeParse(invalidImageData);
console.log(JSON.stringify(invalidImageResult, null, 2));

// ============================================================================
// EXAMPLE 3: Corporate Email System
// ============================================================================
console.log('\n🔷 EXAMPLE 3: Corporate Email System');
console.log('─────────────────────────────────────────────────');

const corporateUserSchema = k.object({
  employeeId: k.string().regex(/^EMP-\d{4}$/, 'Must be format EMP-XXXX'),
  email: k.email()
    .domains(['company.com', 'subsidiary.org'], 'Must use corporate email')
    .localMinLength(3, 'Username too short')
    .noPlus('Plus addressing not allowed for corporate accounts'),
  department: k.string().oneOf(['IT', 'HR', 'Finance', 'Marketing'], 'Invalid department'),
  isManager: k.boolean().default(false),
  backupEmail: k.email().corporate('Backup must be corporate email').optional(),
});

// Valid corporate user
const validCorporateUser = {
  employeeId: 'EMP-1234',
  email: 'john.doe@company.com',
  department: 'IT',
  isManager: true,
  backupEmail: 'j.doe@enterprise.net'
};

console.log('✅ Valid corporate user:');
const corporateResult = corporateUserSchema.safeParse(validCorporateUser);
console.log(JSON.stringify(corporateResult, null, 2));

// Invalid corporate user
const invalidCorporateUser = {
  employeeId: 'INVALID',
  email: 'john+work@gmail.com', // Personal email + plus addressing
  department: 'InvalidDept',
  isManager: true
};

console.log('\n❌ Invalid corporate user:');
const invalidCorporateResult = corporateUserSchema.safeParse(invalidCorporateUser);
console.log(JSON.stringify(invalidCorporateResult, null, 2));

// ============================================================================
// EXAMPLE 4: Document Management API
// ============================================================================
console.log('\n🔷 EXAMPLE 4: Document Management API');
console.log('─────────────────────────────────────────────────');

const documentSchema = k.object({
  title: k.string().minLength(5).maxLength(100),
  content: k.base64()
    .minDecodedSize(100, 'Document too small')
    .maxDecodedSize(1024 * 1024 * 10, 'Document too large (max 10MB)'),
  author: k.email().corporate('Only corporate authors allowed'),
  tags: k.array(k.string().minLength(2)).minLength(1, 'At least one tag required'),
  isConfidential: k.boolean().default(false),
  approver: k.email().domain('company.com', 'Approver must be from main company').optional(),
  metadata: k.object({
    version: k.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semantic version'),
    createdAt: k.date().isPast('Creation date must be in the past'),
    size: k.number().min(0).integer('Size must be positive integer')
  }).optional()
});

// Valid document
const validDocument = {
  title: 'Company Policy Document',
  content: 'VGhpcyBpcyBhIHNhbXBsZSBkb2N1bWVudCB3aXRoIGVub3VnaCBjb250ZW50IHRvIHBhc3MgdGhlIG1pbmltdW0gc2l6ZSByZXF1aXJlbWVudC4gVGhpcyBpcyBhZGRpdGlvbmFsIGNvbnRlbnQgdG8gbWVldCB0aGUgbWluaW11bSBzaXplIHJlcXVpcmVtZW50IG9mIGF0IGxlYXN0IDEwMCBieXRlcy4=', // Longer content to meet 100 byte requirement
  author: 'policy.team@company.com',
  tags: ['policy', 'hr', 'guidelines'],
  isConfidential: true,
  approver: 'manager@company.com',
  metadata: {
    version: '1.2.3',
    createdAt: '2024-01-15',
    size: 1024
  }
};

console.log('✅ Valid document:');
const documentResult = documentSchema.safeParse(validDocument);
console.log(JSON.stringify(documentResult, null, 2));

// ============================================================================
// EXAMPLE 5: Multi-Format Contact API
// ============================================================================
console.log('\n🔷 EXAMPLE 5: Multi-Format Contact API');
console.log('─────────────────────────────────────────────────');

const contactSchema = k.object({
  name: k.string().minLength(2).maxLength(50),
  emails: k.array(k.email()).minLength(1, 'At least one email required').unique('No duplicate emails'),
  avatar: k.base64().image().optional(),
  company: k.object({
    name: k.string().minLength(2),
    domain: k.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Must be valid domain'),
    corporateEmail: k.email().transform(email => {
      // Transform to use company domain
      const username = email.split('@')[0];
      return `${username}@${validContact.company.domain}`;
    }).optional()
  }),
  preferences: k.object({
    newsletter: k.boolean().default(true),
    notifications: k.boolean().default(false),
    format: k.string().oneOf(['html', 'text'], 'Must be html or text').default('html')
  }).optional()
});

// Valid contact
const validContact = {
  name: 'Alice Johnson',
  emails: ['alice@personal.com', 'a.johnson@work.com'],
  avatar: 'data:image/jpeg;base64,SGVsbG8gV29ybGQ=', // Simple valid image base64
  company: {
    name: 'Tech Corp',
    domain: 'techcorp.com'
  },
  preferences: {
    newsletter: true,
    notifications: true,
    format: 'html'
  }
};

console.log('✅ Valid multi-format contact:');
const contactResult = contactSchema.safeParse(validContact);
console.log(JSON.stringify(contactResult, null, 2));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    New Schemas Complete!                   ║');
console.log('╚════════════════════════════════════════════════════════════╝');