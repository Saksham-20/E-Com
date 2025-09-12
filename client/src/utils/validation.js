// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/
};

// Common validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  confirmPassword: 'Passwords must match',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must not exceed ${max} characters`,
  minValue: (min) => `Must be at least ${min}`,
  maxValue: (max) => `Must not exceed ${max}`,
  pattern: 'Format is invalid',
  url: 'Please enter a valid URL',
  date: 'Please enter a valid date'
};

// Validation functions
export const validators = {
  // Required field validation
  required: (value) => {
    if (value === null || value === undefined) return messages.required;
    if (typeof value === 'string' && value.trim() === '') return messages.required;
    if (Array.isArray(value) && value.length === 0) return messages.required;
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return null;
    if (!patterns.email.test(value)) return messages.email;
    return null;
  },

  // Phone validation
  phone: (value) => {
    if (!value) return null;
    if (!patterns.phone.test(value)) return messages.phone;
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return null;
    if (!patterns.password.test(value)) return messages.password;
    return null;
  },

  // Confirm password validation
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return messages.required;
    if (password !== confirmPassword) return messages.confirmPassword;
    return null;
  },

  // Length validation
  minLength: (value, min) => {
    if (!value) return null;
    if (value.length < min) return messages.minLength(min);
    return null;
  },

  maxLength: (value, max) => {
    if (!value) return null;
    if (value.length > max) return messages.maxLength(max);
    return null;
  },

  // Number validation
  minValue: (value, min) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < min) return messages.minValue(min);
    return null;
  },

  maxValue: (value, max) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num > max) return messages.maxValue(max);
    return null;
  },

  // Pattern validation
  pattern: (value, pattern) => {
    if (!value) return null;
    if (!pattern.test(value)) return messages.pattern;
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null;
    if (!patterns.url.test(value)) return messages.url;
    return null;
  },

  // Date validation
  date: (value) => {
    if (!value) return null;
    if (!patterns.date.test(value)) return messages.date;
    const date = new Date(value);
    if (isNaN(date.getTime())) return messages.date;
    return null;
  },

  // Credit card validation (Luhn algorithm)
  creditCard: (value) => {
    if (!value) return null;
    const cleanNumber = value.replace(/\s/g, '');
    if (!/^\d+$/.test(cleanNumber)) return messages.pattern;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) return 'Invalid credit card number';
    return null;
  },

  // ZIP code validation
  zipCode: (value) => {
    if (!value) return null;
    if (!patterns.zipCode.test(value)) return 'Please enter a valid ZIP code';
    return null;
  }
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rules = validationRules[field];
    
    for (const rule of rules) {
      let error = null;
      
      switch (rule.type) {
        case 'required':
          error = validators.required(value);
          break;
          
        case 'email':
          error = validators.email(value);
          break;
          
        case 'phone':
          error = validators.phone(value);
          break;
          
        case 'password':
          error = validators.password(value);
          break;
          
        case 'confirmPassword':
          error = validators.confirmPassword(formData[rule.passwordField], value);
          break;
          
        case 'minLength':
          error = validators.minLength(value, rule.value);
          break;
          
        case 'maxLength':
          error = validators.maxLength(value, rule.value);
          break;
          
        case 'minValue':
          error = validators.minValue(value, rule.value);
          break;
          
        case 'maxValue':
          error = validators.maxValue(value, rule.value);
          break;
          
        case 'pattern':
          error = validators.pattern(value, rule.value);
          break;
          
        case 'url':
          error = validators.url(value);
          break;
          
        case 'date':
          error = validators.date(value);
          break;
          
        case 'creditCard':
          error = validators.creditCard(value);
          break;
          
        case 'zipCode':
          error = validators.zipCode(value);
          break;
          
        case 'custom':
          error = rule.validator(value, formData);
          break;
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation helper
export const validateField = (value, rules) => {
  for (const rule of rules) {
    let error = null;
    
    switch (rule.type) {
      case 'required':
        error = validators.required(value);
        break;
        
      case 'email':
        error = validators.email(value);
        break;
        
      case 'phone':
        error = validators.phone(value);
        break;
        
      case 'password':
        error = validators.password(value);
        break;
        
      case 'minLength':
        error = validators.minLength(value, rule.value);
        break;
        
      case 'maxLength':
        error = validators.maxLength(value, rule.value);
        break;
        
      case 'minValue':
        error = validators.minValue(value, rule.value);
        break;
        
      case 'maxValue':
        error = validators.maxValue(value, rule.value);
        break;
        
      case 'pattern':
        error = validators.pattern(value, rule.value);
        break;
        
      case 'url':
        error = validators.url(value);
        break;
        
      case 'date':
        error = validators.date(value);
        break;
        
      case 'creditCard':
        error = validators.creditCard(value);
        break;
        
      case 'zipCode':
        error = validators.zipCode(value);
        break;
        
      case 'custom':
        error = rule.validator(value);
        break;
    }
    
    if (error) return error;
  }
  
  return null;
};

// Common validation rule sets
export const commonRules = {
  email: [
    { type: 'required' },
    { type: 'email' }
  ],
  
  password: [
    { type: 'required' },
    { type: 'password' }
  ],
  
  phone: [
    { type: 'required' },
    { type: 'phone' }
  ],
  
  name: [
    { type: 'required' },
    { type: 'minLength', value: 2 },
    { type: 'maxLength', value: 50 }
  ],
  
  zipCode: [
    { type: 'required' },
    { type: 'zipCode' }
  ],
  
  url: [
    { type: 'url' }
  ],
  
  date: [
    { type: 'date' }
  ]
};

// Export everything
export default {
  patterns,
  messages,
  validators,
  validateForm,
  validateField,
  commonRules
};
