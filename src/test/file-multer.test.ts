import { k } from "../k";

console.log("=== File Schema - Multer/Node.js Support Test ===\n");

// Simulate a Multer file object (Node.js environment)
const mockMulterFile = {
  fieldname: "file",
  originalname: "test-image.jpg",
  encoding: "7bit",
  mimetype: "image/jpeg",
  buffer: Buffer.from("fake-image-data"),
  size: 1024 * 500, // 500KB
};

// Test 1: Basic Multer file acceptance
console.log("Test 1: Basic Multer file object");
try {
  const fileSchema = k.file();
  const result = fileSchema.safeParse(mockMulterFile);

  if (result.success) {
    console.log("✅ PASS: Multer file object accepted");
  } else {
    console.log("❌ FAIL: Multer file object rejected");
    console.log("Issues:", result.issues);
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 2: File size validation with Multer object
console.log("\nTest 2: File size validation (maxSize 1MB)");
try {
  const sizeSchema = k.file().maxSize(1024 * 1024); // 1MB max
  const result = sizeSchema.safeParse(mockMulterFile);

  if (result.success) {
    console.log("✅ PASS: File size validation passed (500KB < 1MB)");
  } else {
    console.log("❌ FAIL: File size validation failed unexpectedly");
    console.log("Issues:", result.issues);
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 3: File size validation should fail
console.log("\nTest 3: File size validation should fail (maxSize 100KB)");
try {
  const sizeSchema = k.file().maxSize(1024 * 100); // 100KB max
  const result = sizeSchema.safeParse(mockMulterFile);

  if (!result.success) {
    console.log(
      "✅ PASS: File size validation correctly rejected (500KB > 100KB)",
    );
    console.log("Error message:", result.issues[0].message);
  } else {
    console.log("❌ FAIL: File size validation should have failed");
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 4: MIME type validation
console.log("\nTest 4: MIME type validation (image/*)");
try {
  const imageSchema = k.file().image();
  const result = imageSchema.safeParse(mockMulterFile);

  if (result.success) {
    console.log("✅ PASS: Image MIME type validation passed");
  } else {
    console.log("❌ FAIL: Image MIME type validation failed");
    console.log("Issues:", result.issues);
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 5: Extension validation
console.log("\nTest 5: Extension validation (.jpg, .png)");
try {
  const extensionSchema = k.file().extensions(["jpg", "jpeg", "png"]);
  const result = extensionSchema.safeParse(mockMulterFile);

  if (result.success) {
    console.log("✅ PASS: Extension validation passed (.jpg)");
  } else {
    console.log("❌ FAIL: Extension validation failed");
    console.log("Issues:", result.issues);
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 6: Extension validation should fail
console.log("\nTest 6: Extension validation should fail (.pdf only)");
try {
  const extensionSchema = k.file().extensions(["pdf"]);
  const result = extensionSchema.safeParse(mockMulterFile);

  if (!result.success) {
    console.log("✅ PASS: Extension validation correctly rejected");
    console.log("Error message:", result.issues[0].message);
  } else {
    console.log("❌ FAIL: Extension validation should have failed");
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 7: Multiple validations combined
console.log("\nTest 7: Multiple validations combined");
try {
  const complexSchema = k
    .file()
    .maxSize(1024 * 1024 * 2) // 2MB
    .image()
    .extensions(["jpg", "png"]);

  const result = complexSchema.safeParse(mockMulterFile);

  if (result.success) {
    console.log("✅ PASS: Multiple validations passed");
  } else {
    console.log("❌ FAIL: Multiple validations failed");
    console.log("Issues:", result.issues);
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 8: Invalid input (not a file object)
console.log("\nTest 8: Invalid input (plain object)");
try {
  const fileSchema = k.file();
  const result = fileSchema.safeParse({ name: "not-a-file" });

  if (!result.success) {
    console.log("✅ PASS: Non-file object correctly rejected");
    console.log("Error message:", result.issues[0].message);
  } else {
    console.log("❌ FAIL: Non-file object should have been rejected");
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

// Test 9: Missing required Multer properties
console.log("\nTest 9: Incomplete Multer object (missing mimetype)");
try {
  const incompleteFile = {
    buffer: Buffer.from("data"),
    originalname: "file.txt",
    size: 100,
    // missing mimetype
  };

  const fileSchema = k.file();
  const result = fileSchema.safeParse(incompleteFile);

  if (!result.success) {
    console.log("✅ PASS: Incomplete Multer object correctly rejected");
    console.log("Error message:", result.issues[0].message);
  } else {
    console.log("❌ FAIL: Incomplete object should have been rejected");
  }
} catch (error) {
  console.log("❌ ERROR:", error instanceof Error ? error.message : error);
}

console.log("\n=== File Multer Tests Complete ===");
