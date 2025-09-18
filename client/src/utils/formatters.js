// Currency formatting
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `₹${parseFloat(amount).toFixed(2)}`;
  }
};

// Number formatting
export const formatNumber = (number, locale = 'en-US', options = {}) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(number);
  } catch (error) {
    // Fallback formatting
    return parseFloat(number).toFixed(defaultOptions.maximumFractionDigits);
  }
};

// Percentage formatting
export const formatPercentage = (value, decimals = 2, locale = 'en-US') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    // Fallback formatting
    return `${parseFloat(value).toFixed(decimals)}%`;
  }
};

// Date formatting
export const formatDate = (date, format = 'medium', locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  try {
    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
        
      case 'medium':
        return new Intl.DateTimeFormat(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
        
      case 'long':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
        
      case 'time':
        return new Intl.DateTimeFormat(locale, {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(dateObj);
        
      case 'datetime':
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(dateObj);
        
      case 'relative':
        return getRelativeTime(dateObj);
        
      case 'iso':
        return dateObj.toISOString();
        
      case 'input':
        return dateObj.toISOString().split('T')[0];
        
      default:
        return new Intl.DateTimeFormat(locale).format(dateObj);
    }
  } catch (error) {
    // Fallback formatting
    return dateObj.toLocaleDateString();
  }
};

// Relative time formatting (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber, format = 'US') => {
  if (!phoneNumber) return '';
  
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  try {
    switch (format) {
      case 'US':
        if (cleaned.length === 10) {
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
          return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        break;
        
      case 'international':
        if (cleaned.length >= 10) {
          return `+${cleaned}`;
        }
        break;
        
      case 'dashed':
        if (cleaned.length === 10) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        break;
        
      default:
        return cleaned;
    }
    
    // Return cleaned number if no format matches
    return cleaned;
  } catch (error) {
    return phoneNumber;
  }
};

// Credit card formatting
export const formatCreditCard = (cardNumber, format = 'spaced') => {
  if (!cardNumber) return '';
  
  // Remove all non-digits
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  try {
    switch (format) {
      case 'spaced':
        // Format as XXXX XXXX XXXX XXXX
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
        
      case 'dashed':
        // Format as XXXX-XXXX-XXXX-XXXX
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1-');
        
      case 'masked':
        // Format as XXXX **** **** XXXX
        if (cleaned.length >= 8) {
          const firstFour = cleaned.slice(0, 4);
          const lastFour = cleaned.slice(-4);
          return `${firstFour} **** **** ${lastFour}`;
        }
        break;
        
      default:
        return cleaned;
    }
    
    // Return cleaned number if no format matches
    return cleaned;
  } catch (error) {
    return cardNumber;
  }
};

// File size formatting
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Text truncation
export const truncateText = (text, length = 100, suffix = '...') => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

// Text capitalization
export const capitalize = (text, type = 'first') => {
  if (!text) return '';
  
  try {
    switch (type) {
      case 'first':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        
      case 'words':
        return text.replace(/\b\w/g, char => char.toUpperCase());
        
      case 'sentence':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        
      case 'title':
        const words = text.toLowerCase().split(' ');
        const titleCase = words.map(word => {
          if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          return word;
        });
        return titleCase.join(' ');
        
      default:
        return text;
    }
  } catch (error) {
    return text;
  }
};

// Slug generation (URL-friendly strings)
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Address formatting
export const formatAddress = (address, format = 'full') => {
  if (!address) return '';
  
  try {
    const { street, city, state, zipCode, country } = address;
    
    switch (format) {
      case 'full':
        const parts = [street, city, state, zipCode, country].filter(Boolean);
        return parts.join(', ');
        
      case 'short':
        const shortParts = [city, state].filter(Boolean);
        return shortParts.join(', ');
        
      case 'city-state':
        return `${city}, ${state}`;
        
      case 'street-city':
        return `${street}, ${city}`;
        
      default:
        return address;
    }
  } catch (error) {
    return address;
  }
};

// Social media link formatting
export const formatSocialLink = (platform, username) => {
  if (!platform || !username) return '';
  
  const platforms = {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/in/',
    youtube: 'https://youtube.com/',
    github: 'https://github.com/',
    website: ''
  };
  
  const baseUrl = platforms[platform.toLowerCase()] || '';
  return baseUrl + username;
};

// Rating formatting
export const formatRating = (rating, maxRating = 5, showText = true) => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return showText ? 'No rating' : '';
  }
  
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  
  if (showText) {
    if (roundedRating >= 4.5) return 'Excellent';
    if (roundedRating >= 4.0) return 'Very Good';
    if (roundedRating >= 3.5) return 'Good';
    if (roundedRating >= 3.0) return 'Average';
    if (roundedRating >= 2.5) return 'Below Average';
    if (roundedRating >= 2.0) return 'Poor';
    return 'Very Poor';
  }
  
  return roundedRating;
};

// Price range formatting
export const formatPriceRange = (minPrice, maxPrice, currency = 'INR') => {
  if (minPrice === null || maxPrice === null) return '';
  
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice, currency);
  }
  
  return `${formatCurrency(minPrice, currency)} - ${formatCurrency(maxPrice, currency)}`;
};

// Export everything
const formatters = {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  getRelativeTime,
  formatPhoneNumber,
  formatCreditCard,
  formatFileSize,
  truncateText,
  capitalize,
  slugify,
  formatAddress,
  formatSocialLink,
  formatRating,
  formatPriceRange
};

export default formatters;
