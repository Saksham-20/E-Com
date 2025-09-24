// Utility functions for handling image URLs in both development and production

const getImageUrl = (imagePath) => {
  console.log('🖼️ getImageUrl: Input imagePath:', imagePath);
  
  if (!imagePath) {
    console.log('🖼️ getImageUrl: No image path, returning placeholder');
    return '/placeholder-product.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('🖼️ getImageUrl: Full URL detected, returning as is:', imagePath);
    return imagePath;
  }
  
  // Get the API base URL from environment
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const finalUrl = `${apiBaseUrl}${normalizedPath}`;
  
  console.log('🖼️ getImageUrl: Constructed URL:', finalUrl);
  return finalUrl;
};

const getPlaceholderImage = () => {
  return '/placeholder-product.jpg';
};

export { getImageUrl, getPlaceholderImage };
