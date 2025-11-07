// Validation utility functions

const validateRegister = (data) => {
  const errors = {};
  
  // Name validation
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length === 0) {
    errors.name = 'Name cannot be empty';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (data.name.trim().length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (data.email.trim().length === 0) {
    errors.email = 'Email cannot be empty';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  } else if (data.password.length > 50) {
    errors.password = 'Password must be less than 50 characters';
  }

  // Phone validation
  if (!data.phone) {
    errors.phone = 'Phone number is required';
  } else {
    // Remove spaces, dashes, and other characters
    const cleanPhone = data.phone.replace(/[\s\-()]/g, '');
    
    // Indian phone validation: 10 digits, starts with 6-9
    // Supports: +91, 91, or 10-digit number
    if (/^(\+91|91)?[6-9]\d{9}$/.test(cleanPhone)) {
      // Valid Indian phone number
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      errors.phone = 'Phone number must be 10 digits';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errors.phone = 'Phone number must start with 6, 7, 8, or 9';
    } else {
      errors.phone = 'Please provide a valid phone number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateRegister
};
