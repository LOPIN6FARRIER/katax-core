import { k } from "../k";

console.log("=== Basic object validation ===");

const personSchema = k
  .object({
    nombre: k.string(),
    edad: k.number().min(0).max(150),
    apellido: k.string().optional().default("Perez"),
    isNew: k
      .boolean()
      .isTrue()
      .default(true)
      .optional()
      .transform((val) => !!val),
  })
  .caseInsensitive();

const validPerson = personSchema.safeParse({
  nombre: "Juan",
  edad: 30,
});
console.log("Valid person:", validPerson);

const invalidPersonAge = personSchema.safeParse({
  nombre: "María",
  edad: 200,
});
console.log("Invalid age:", invalidPersonAge);

const invalidPersonMissingField = personSchema.safeParse({
  nombre: "Pedro",
});
console.log("Missing edad field:", invalidPersonMissingField);

const invalidPersonWrongType = personSchema.safeParse({
  nombre: 123,
  edad: 25,
});
console.log("Wrong type for nombre:", invalidPersonWrongType);

console.log("\n=== Complex object validation ===");

const userSchema = k.object({
  nombre: k.string().minLength(2).maxLength(50),
  email: k.string().email(),
  edad: k.number().integer().min(18).max(120),
  telefono: k.string().regex(/^\d{3}-\d{3}-\d{4}$/),
});

const validUser = userSchema.safeParse({
  nombre: "Ana García",
  email: "ana@example.com",
  edad: 28,
  telefono: "555-123-4567",
});
console.log("Valid user:", validUser);

const invalidUser = userSchema.safeParse({
  nombre: "A",
  email: "not-an-email",
  edad: 16,
  telefono: "123",
});
console.log("Invalid user (multiple errors):", invalidUser);

console.log("\n=== Optional fields ===");

// Schema with optional fields
const profileSchema = k.object({
  nombre: k.string(),
  edad: k.number().optional(),
  bio: k.string().optional(),
  website: k.string().url().optional(),
});

const validProfileComplete = profileSchema.safeParse({
  nombre: "Carlos",
  edad: 35,
  bio: "Developer",
  website: "https://carlos.dev",
});
console.log("Complete profile:", validProfileComplete);

const validProfilePartial = profileSchema.safeParse({
  nombre: "Laura",
});
console.log("Partial profile (only nombre):", validProfilePartial);

const validProfileWithSome = profileSchema.safeParse({
  nombre: "Diego",
  edad: 42,
});
console.log("Profile with some optional fields:", validProfileWithSome);

console.log("\n=== Nullable fields ===");

const productSchema = k.object({
  nombre: k.string(),
  precio: k.number().positive(),
  descuento: k.number().min(0).max(100).nullable(),
  descripcion: k.string().nullable(),
});

const productWithDiscount = productSchema.safeParse({
  nombre: "Laptop",
  precio: 999.99,
  descuento: 15,
  descripcion: "High-performance laptop",
});
console.log("Product with discount:", productWithDiscount);

const productNoDiscount = productSchema.safeParse({
  nombre: "Mouse",
  precio: 29.99,
  descuento: null,
  descripcion: null,
});
console.log("Product without discount (null):", productNoDiscount);

console.log("\n=== Nested objects ===");

const addressSchema = k.object({
  calle: k.string(),
  ciudad: k.string(),
  codigoPostal: k.string().regex(/^\d{5}$/),
});

const personWithAddressSchema = k.object({
  nombre: k.string(),
  edad: k.number().integer().positive(),
  direccion: addressSchema,
});

const validPersonWithAddress = personWithAddressSchema.safeParse({
  nombre: "Roberto",
  edad: 45,
  direccion: {
    calle: "123 Main St",
    ciudad: "Springfield",
    codigoPostal: "12345",
  },
});
console.log("Person with address:", validPersonWithAddress);

const invalidNestedAddress = personWithAddressSchema.safeParse({
  nombre: "María",
  edad: 32,
  direccion: {
    calle: "456 Elm St",
    ciudad: "Shelbyville",
    codigoPostal: "INVALID",
  },
});
console.log("Invalid nested address:", invalidNestedAddress);

const missingNestedField = personWithAddressSchema.safeParse({
  nombre: "José",
  edad: 28,
  direccion: {
    calle: "789 Oak Ave",
    ciudad: "Capital City",
  },
});
console.log("Missing nested field:", missingNestedField);

console.log("\n=== Strict mode (no extra keys) ===");

const strictPersonSchema = k
  .object({
    nombre: k.string(),
    edad: k.number(),
  })
  .strict();

const validStrict = strictPersonSchema.safeParse({
  nombre: "Ana",
  edad: 25,
});
console.log("Valid strict:", validStrict);

const invalidStrictExtraKeys = strictPersonSchema.safeParse({
  nombre: "Luis",
  edad: 30,
  extraField: "not allowed",
});
console.log("Invalid strict (extra keys):", invalidStrictExtraKeys);

console.log("\n=== Partial (all fields optional) ===");

const requiredSchema = k.object({
  nombre: k.string(),
  edad: k.number(),
  email: k.string().email(),
});

const partialSchema = requiredSchema.partial();

const validPartialEmpty = partialSchema.safeParse({});
console.log("Valid partial (empty):", validPartialEmpty);

const validPartialSome = partialSchema.safeParse({
  nombre: "Pedro",
  email: "pedro@example.com",
});
console.log("Valid partial (some fields):", validPartialSome);

const invalidPartialWrongType = partialSchema.safeParse({
  edad: "not a number",
});
console.log("Invalid partial (wrong type):", invalidPartialWrongType);

console.log("\n=== Pick and Omit ===");

const fullUserSchema = k.object({
  id: k.number(),
  nombre: k.string(),
  email: k.string().email(),
  password: k.string().minLength(8),
  edad: k.number(),
});

// Pick only some fields
const publicUserSchema = fullUserSchema.pick(["id", "nombre", "email"]);

const validPublicUser = publicUserSchema.safeParse({
  id: 1,
  nombre: "Julia",
  email: "julia@example.com",
});
console.log("Valid public user (pick):", validPublicUser);

// Omit campos sensibles
const userWithoutPasswordSchema = fullUserSchema.omit(["password"]);

const validUserWithoutPassword = userWithoutPasswordSchema.safeParse({
  id: 2,
  nombre: "Miguel",
  email: "miguel@example.com",
  edad: 35,
});
console.log("Valid user without password (omit):", validUserWithoutPassword);

console.log("\n=== Real world example: Registration form ===");

const registrationSchema = k.object({
  username: k.string().minLength(3).maxLength(20),
  email: k.string().email(),
  password: k.string().minLength(8),
  confirmPassword: k.string().minLength(8),
  edad: k.number().integer().min(18),
  aceptaTerminos: k.number(), // Simulating boolean as 0/1
  newsletter: k.number().optional(),
});

const validRegistration = registrationSchema.safeParse({
  username: "johndoe",
  email: "john@example.com",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
  edad: 25,
  aceptaTerminos: 1,
  newsletter: 1,
});
console.log("Valid registration:", validRegistration);

const invalidRegistration = registrationSchema.safeParse({
  username: "ab",
  email: "invalid-email",
  password: "short",
  confirmPassword: "short",
  edad: 16,
  aceptaTerminos: 1,
});
console.log("Invalid registration (multiple errors):", invalidRegistration);

console.log("\n=== Deep nesting example ===");

const companySchema = k.object({
  nombre: k.string(),
  empleados: k.number().integer().min(1),
  direccion: k.object({
    calle: k.string(),
    ciudad: k.string(),
    pais: k.string(),
    coordenadas: k.object({
      latitud: k.number().between(-90, 90),
      longitud: k.number().between(-180, 180),
    }),
  }),
});

const validCompany = companySchema.safeParse({
  nombre: "Tech Corp",
  empleados: 150,
  direccion: {
    calle: "100 Innovation Drive",
    ciudad: "San Francisco",
    pais: "USA",
    coordenadas: {
      latitud: 37.7749,
      longitud: -122.4194,
    },
  },
});
console.log("Valid company:", validCompany);

const invalidDeepNesting = companySchema.safeParse({
  nombre: "Startup Inc",
  empleados: 10,
  direccion: {
    calle: "200 Start St",
    ciudad: "Austin",
    pais: "USA",
    coordenadas: {
      latitud: 200, // Invalid: out of range
      longitud: -97.7431,
    },
  },
});
console.log("Invalid deep nesting:", invalidDeepNesting);

console.log("\n=== Case sensitivity (default: case-sensitive) ===");

const caseSensitiveSchema = k.object({
  Nombre: k.string(),
  Edad: k.number(),
});

const validCaseSensitive = caseSensitiveSchema.safeParse({
  Nombre: "Carlos",
  Edad: 30,
});
console.log("Valid case-sensitive (exact match):", validCaseSensitive);

const invalidCaseSensitiveLower = caseSensitiveSchema.safeParse({
  nombre: "Carlos", // lowercase 'n'
  edad: 30, // lowercase 'e'
});
console.log("Invalid case-sensitive (lowercase):", invalidCaseSensitiveLower);

const invalidCaseSensitiveMixed = caseSensitiveSchema.safeParse({
  NOMBRE: "Carlos", // uppercase
  Edad: 30,
});
console.log("Invalid case-sensitive (uppercase):", invalidCaseSensitiveMixed);

console.log("\n=== Case insensitive validation ===");

const caseInsensitiveSchema = k
  .object({
    Nombre: k.string(),
    Edad: k.number(),
    Email: k.string().email(),
  })
  .caseInsensitive();

const validCaseInsensitiveExact = caseInsensitiveSchema.safeParse({
  Nombre: "Ana",
  Edad: 25,
  Email: "ana@example.com",
});
console.log("Case-insensitive (exact match):", validCaseInsensitiveExact);

const validCaseInsensitiveLower = caseInsensitiveSchema.safeParse({
  nombre: "Ana", // lowercase
  edad: 25, // lowercase
  email: "ana@example.com", // lowercase
});
console.log("Case-insensitive (lowercase):", validCaseInsensitiveLower);

const validCaseInsensitiveUpper = caseInsensitiveSchema.safeParse({
  NOMBRE: "Ana", // uppercase
  EDAD: 25, // uppercase
  EMAIL: "ana@example.com", // uppercase
});
console.log("Case-insensitive (uppercase):", validCaseInsensitiveUpper);

const validCaseInsensitiveMixed = caseInsensitiveSchema.safeParse({
  NoMbRe: "Ana", // mixed case
  EdAd: 25, // mixed case
  eMaIl: "ana@example.com", // mixed case
});
console.log("Case-insensitive (mixed case):", validCaseInsensitiveMixed);

const invalidCaseInsensitive = caseInsensitiveSchema.safeParse({
  nombre: "A", // too short
  EDAD: 25,
  email: "invalid", // invalid email
});
console.log("Case-insensitive (validation errors):", invalidCaseInsensitive);

console.log("\n=== Real world: API response validation ===");

// Simula una API que devuelve campos en diferentes casos
const apiResponseSchema = k
  .object({
    UserId: k.number(),
    UserName: k.string(),
    Email: k.string().email(),
    IsActive: k.number(),
  })
  .caseInsensitive();

const apiResponse1 = apiResponseSchema.safeParse({
  userid: 123,
  username: "john_doe",
  email: "john@example.com",
  isactive: 1,
});
console.log("API response (lowercase):", apiResponse1);

const apiResponse2 = apiResponseSchema.safeParse({
  UserId: 456,
  UserName: "jane_smith",
  Email: "jane@example.com",
  IsActive: 1,
});
console.log("API response (PascalCase):", apiResponse2);

const apiResponse3 = apiResponseSchema.safeParse({
  user_id: 789, // Different format, won't match
  user_name: "bob",
  email: "bob@example.com",
  is_active: 0,
});
console.log("API response (snake_case - wont match):", apiResponse3);
