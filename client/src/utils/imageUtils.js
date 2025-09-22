// Utility functions for handling image URLs in both development and production

const getImageUrl = (imagePath) => {
  console.log('=== IMAGE UTILS DEBUG ===');
  console.log('Input imagePath:', imagePath);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  if (!imagePath) {
    console.log('No imagePath provided, returning placeholder');
    return '/placeholder-product.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('ImagePath is already a full URL, returning as is');
    return imagePath;
  }
  
  // Get the API base URL from environment or use localhost for development
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  console.log('API Base URL:', apiBaseUrl);
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  console.log('Normalized path:', normalizedPath);
  
  const finalUrl = `${apiBaseUrl}${normalizedPath}`;
  console.log('Final image URL:', finalUrl);
  console.log('========================');
  
  return finalUrl;
};

const getPlaceholderImage = () => {
  return '/placeholder-product.jpg';
};

export { getImageUrl, getPlaceholderImage };
