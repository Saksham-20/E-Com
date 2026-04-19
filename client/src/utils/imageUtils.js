// Utility functions for handling image URLs in both development and production

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return getPlaceholderImage();
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
  return 'https://placehold.co/600x750/f4f3f1/1a1a1b?text=ECOM';
};

export { getImageUrl, getPlaceholderImage };
