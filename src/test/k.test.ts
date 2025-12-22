import { k } from '../k';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         KATAX-CORE - Complete API Example                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');

// ============================================================================
// EXAMPLE 1: Blog Post API
// ============================================================================
console.log('\n🔷 EXAMPLE 1: Blog Post API');
console.log('─────────────────────────────────────────────────');

const blogPostSchema = k.object({
  id: k.string(),
  title: k.string().minLength(5).maxLength(100),
  content: k.string().minLength(20),
  author: k.object({
    id: k.string(),
    name: k.string().minLength(2),
    email: k.string().email(),
    avatar: k.string().url().optional()
  }),
  tags: k.array(k.string())
    .minLength(1, 'At least one tag required')
    .maxLength(10)
    .unique(),
  publishedAt: k.date()
    .isPast('Post must be published in the past')
    .formatOutput('MMMM dd, yyyy'),
  viewCount: k.number().min(0).integer(),
  isPublished: k.boolean(),
  comments: k.array(
    k.object({
      id: k.string(),
      author: k.string(),
      text: k.string().minLength(1),
      createdAt: k.date().isPast()
    })
  ).optional()
});

console.log('\n✅ Valid blog post:');
const validPost = blogPostSchema.safeParse({
  id: 'post-123',
  title: 'Getting Started with TypeScript',
  content: 'TypeScript is a powerful superset of JavaScript that adds static typing...',
  author: {
    id: 'user-456',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  },
  tags: ['typescript', 'javascript', 'programming'],
  publishedAt: '2024-01-15',
  viewCount: 1250,
  isPublished: true,
  comments: [
    {
      id: 'comment-1',
      author: 'Jane Smith',
      text: 'Great article!',
      createdAt: '2024-01-16T10:30:00Z'
    }
  ]
});
console.log(JSON.stringify(validPost, null, 2));

console.log('\n❌ Invalid blog post (missing required fields):');
const invalidPost = blogPostSchema.safeParse({
  id: 'post-123',
  title: 'Hi', // Too short
  content: 'Short content', // Too short
  author: {
    id: 'user-456',
    name: 'J', // Too short
    email: 'invalid-email' // Invalid format
  },
  tags: [], // Empty array
  publishedAt: '2030-01-15', // Future date
  viewCount: -10, // Negative
  isPublished: true
});
console.log(JSON.stringify(invalidPost, null, 2));

// ============================================================================
// EXAMPLE 2: E-commerce Product API
// ============================================================================
console.log('\n\n🔷 EXAMPLE 2: E-commerce Product API');
console.log('─────────────────────────────────────────────────');

const productSchema = k.object({
  id: k.string(),
  name: k.string().minLength(3).maxLength(200),
  description: k.string().minLength(10).optional(),
  price: k.number().positive().transform(p => Math.round(p * 100) / 100), // Round to 2 decimals
  discount: k.number().min(0).max(100).optional(), // Percentage
  finalPrice: k.number().positive(),
  stock: k.number().min(0).integer(),
  category: k.string().minLength(2),
  images: k.array(k.string().url())
    .minLength(1, 'At least one image required')
    .maxLength(10),
  tags: k.array(k.string()).unique().optional(),
  ratings: k.object({
    average: k.number().min(0).max(5),
    count: k.number().min(0).integer()
  }),
  inStock: k.boolean(),
  createdAt: k.date().isPast().formatOutput('yyyy-MM-dd'),
  updatedAt: k.date().isPast().formatOutput('yyyy-MM-dd HH:mm:ss')
});

console.log('\n✅ Valid product:');
const validProduct = productSchema.safeParse({
  id: 'prod-789',
  name: 'Wireless Bluetooth Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 149.99,
  discount: 15,
  finalPrice: 127.49,
  stock: 45,
  category: 'Electronics',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  tags: ['audio', 'wireless', 'bluetooth'],
  ratings: {
    average: 4.5,
    count: 230
  },
  inStock: true,
  createdAt: '2024-01-10',
  updatedAt: '2024-06-15T14:30:00Z'
});
console.log(JSON.stringify(validProduct, null, 2));

// ============================================================================
// EXAMPLE 3: User Registration API
// ============================================================================
console.log('\n\n🔷 EXAMPLE 3: User Registration API');
console.log('─────────────────────────────────────────────────');

const userRegistrationSchema = k.object({
  username: k.string()
    .minLength(3, 'Username must be at least 3 characters')
    .maxLength(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: k.string().email('Invalid email format'),
  password: k.string()
    .minLength(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  birthDate: k.date()
    .isPast('Birth date must be in the past')
    .isDateOnly('Birth date should not include time')
    .max('2010-01-01', 'Must be at least 14 years old'),
  phoneNumbers: k.array(
    k.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  ).minLength(1).maxLength(3).optional(),
  address: k.object({
    street: k.string().minLength(5),
    city: k.string().minLength(2),
    country: k.string().length(2, 'Country code must be 2 characters'),
    zipCode: k.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
  }).optional(),
  preferences: k.object({
    newsletter: k.boolean(),
    notifications: k.boolean(),
    theme: k.string().optional()
  }).optional(),
  agreedToTerms: k.boolean(),
  registeredAt: k.date().formatOutput('yyyy-MM-dd HH:mm:ss')
});

console.log('\n✅ Valid user registration:');
const validUser = userRegistrationSchema.safeParse({
  username: 'john_doe_123',
  email: 'john.doe@example.com',
  password: 'SecurePass123',
  birthDate: '1995-06-15',
  phoneNumbers: ['+1234567890'],
  address: {
    street: '123 Main Street',
    city: 'New York',
    country: 'US',
    zipCode: '10001'
  },
  preferences: {
    newsletter: true,
    notifications: false,
    theme: 'dark'
  },
  agreedToTerms: true,
  registeredAt: '2024-06-15T10:30:00Z'
});
console.log(JSON.stringify(validUser, null, 2));

console.log('\n❌ Invalid user registration:');
const invalidUser = userRegistrationSchema.safeParse({
  username: 'ab', // Too short
  email: 'not-an-email',
  password: 'weak', // Too short, missing requirements
  birthDate: '2015-01-01', // Too young
  agreedToTerms: false,
  registeredAt: '2024-06-15T10:30:00Z'
});
console.log(JSON.stringify(invalidUser, null, 2));

// ============================================================================
// EXAMPLE 4: Event Booking API
// ============================================================================
console.log('\n\n🔷 EXAMPLE 4: Event Booking API');
console.log('─────────────────────────────────────────────────');

const eventBookingSchema = k.object({
  eventId: k.string(),
  eventName: k.string().minLength(3),
  eventDates: k.twoDates()
    .order(true, 'End date must be after start date')
    .maxDifference(30, 'Event cannot last more than 30 days'),
  attendees: k.array(
    k.object({
      name: k.string().minLength(2),
      email: k.string().email(),
      ticketType: k.string(),
      age: k.number().min(0).max(150).integer().optional()
    })
  ).minLength(1, 'At least one attendee required')
    .maxLength(100, 'Maximum 100 attendees per booking'),
  totalPrice: k.number().positive(),
  paymentMethod: k.string(),
  bookingDate: k.date().isPast().formatOutput('yyyy-MM-dd'),
  specialRequests: k.string().maxLength(500).optional()
});

console.log('\n✅ Valid event booking:');
const validBooking = eventBookingSchema.safeParse({
  eventId: 'event-456',
  eventName: 'Annual Tech Conference 2024',
  eventDates: '2024-09-15|2024-09-17',
  attendees: [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      ticketType: 'VIP',
      age: 30
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      ticketType: 'Standard',
      age: 28
    }
  ],
  totalPrice: 599.99,
  paymentMethod: 'credit_card',
  bookingDate: '2024-06-10',
  specialRequests: 'Vegetarian meal preference'
});
console.log(JSON.stringify(validBooking, null, 2));

// ============================================================================
// EXAMPLE 5: Analytics Dashboard API
// ============================================================================
console.log('\n\n🔷 EXAMPLE 5: Analytics Dashboard API');
console.log('─────────────────────────────────────────────────');

const analyticsDashboardSchema = k.object({
  userId: k.string(),
  dateRange: k.twoDates(',')
    .order(true)
    .maxDifference(365, 'Maximum 1 year of data'),
  metrics: k.object({
    pageViews: k.number().min(0).integer(),
    uniqueVisitors: k.number().min(0).integer(),
    bounceRate: k.number().min(0).max(100), // Percentage
    avgSessionDuration: k.number().min(0) // Seconds
  }),
  topPages: k.array(
    k.object({
      url: k.string().url(),
      views: k.number().min(0).integer(),
      avgTime: k.number().min(0)
    })
  ).maxLength(10),
  deviceBreakdown: k.object({
    mobile: k.number().min(0).max(100),
    desktop: k.number().min(0).max(100),
    tablet: k.number().min(0).max(100)
  }),
  generatedAt: k.date().formatOutput('EEEE, MMMM dd, yyyy HH:mm:ss')
});

console.log('\n✅ Valid analytics data:');
const validAnalytics = analyticsDashboardSchema.safeParse({
  userId: 'user-789',
  dateRange: '2024-01-01,2024-06-30',
  metrics: {
    pageViews: 125000,
    uniqueVisitors: 45000,
    bounceRate: 42.5,
    avgSessionDuration: 185.4
  },
  topPages: [
    { url: 'https://example.com/home', views: 35000, avgTime: 120.5 },
    { url: 'https://example.com/products', views: 28000, avgTime: 200.3 },
    { url: 'https://example.com/about', views: 15000, avgTime: 90.2 }
  ],
  deviceBreakdown: {
    mobile: 55.5,
    desktop: 35.2,
    tablet: 9.3
  },
  generatedAt: '2024-06-15T14:30:45Z'
});
console.log(JSON.stringify(validAnalytics, null, 2));

console.log('\n\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    Tests Complete!                         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
