/**
 * Extract text content from the uploaded file
 * In a production app, this would use more sophisticated parsing based on file type (PDF, DOCX, etc.)
 */
export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // For simplicity, we're treating all files as plain text
        // In a real app, you'd use specialized libraries for different file types
        const text = event.target.result;
        resolve(text);
      } catch (error) {
        reject(new Error('Failed to extract text from file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validate the file type and size
 */
export const validateFile = (file, allowedTypes = ['application/pdf', 'text/plain']) => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds the 5MB limit'
    };
  }
  
  return { valid: true };
}; 