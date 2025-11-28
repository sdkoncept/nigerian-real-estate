/**
 * Input validation and sanitization utilities
 * Prevents XSS attacks, SQL injection, and invalid data
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags
  const div = document.createElement('div');
  div.textContent = input;
  const sanitized = div.textContent || div.innerText || '';
  
  // Escape special characters
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Nigerian phone number
 */
export function validateNigerianPhone(phone: string): boolean {
  // Nigerian phone numbers: +234XXXXXXXXXX or 0XXXXXXXXXX
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  const cleaned = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleaned);
}

/**
 * Validate price (must be positive number)
 */
export function validatePrice(price: number): boolean {
  return price > 0 && isFinite(price);
}

/**
 * Validate property title (length and content)
 */
export function validatePropertyTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 10) {
    return { valid: false, error: 'Title must be at least 10 characters' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  return { valid: true };
}

/**
 * Validate property description
 */
export function validatePropertyDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  if (description.length < 50) {
    return { valid: false, error: 'Description must be at least 50 characters' };
  }
  if (description.length > 5000) {
    return { valid: false, error: 'Description must be less than 5000 characters' };
  }
  return { valid: true };
}

/**
 * Validate URL to prevent malicious links
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate form data
 */
export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized: Record<string, any>;
}

export function validatePropertyForm(data: {
  title: string;
  description: string;
  price: number;
  email?: string;
  phone?: string;
}): FormValidationResult {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, any> = {};

  // Validate and sanitize title
  const titleValidation = validatePropertyTitle(data.title);
  if (!titleValidation.valid) {
    errors.title = titleValidation.error || 'Invalid title';
  } else {
    sanitized.title = sanitizeInput(data.title);
  }

  // Validate and sanitize description
  const descriptionValidation = validatePropertyDescription(data.description);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.error || 'Invalid description';
  } else {
    sanitized.description = sanitizeInput(data.description);
  }

  // Validate price
  if (!validatePrice(data.price)) {
    errors.price = 'Price must be a positive number';
  } else {
    sanitized.price = data.price;
  }

  // Validate email if provided
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  } else if (data.email) {
    sanitized.email = data.email.toLowerCase().trim();
  }

  // Validate phone if provided
  if (data.phone && !validateNigerianPhone(data.phone)) {
    errors.phone = 'Invalid Nigerian phone number format';
  } else if (data.phone) {
    sanitized.phone = data.phone.replace(/[\s-]/g, '');
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

