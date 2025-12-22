import { k } from '../k';

console.log('=== File Schema Individual Tests ===\n');

// Check if File schema is available
console.log('File schema available:', typeof k.file === 'function');

try {
  const fileSchema = k.file();
  console.log('File schema created successfully');
  
  // In Node.js environment, File API is not available
  console.log('Note: File validation requires browser environment with File API');
  
  // Show schema configuration
  const imageFileSchema = k.file()
    .image('Only images allowed')
    .maxSize(1024 * 1024 * 5, 'Max 5MB')
    .extensions(['.jpg', '.png'], 'Only JPG/PNG');
    
  console.log('Image file schema configured successfully');
  
} catch (error) {
  console.log('File schema error:', error instanceof Error ? error.message : error);
}

console.log('\n=== File Tests Complete ===');