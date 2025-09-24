// Utility functions for handling image URLs in both development and production

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-product.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Get the API base URL from environment
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${apiBaseUrl}${normalizedPath}`;
};

const getPlaceholderImage = () => {
  return '/placeholder-product.jpg';
};

export { getImageUrl, getPlaceholderImage };
