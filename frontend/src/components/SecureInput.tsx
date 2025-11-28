/**
 * Secure Input Component
 * Provides input validation and XSS protection
 */

import { useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import { sanitizeInput, validateEmail, validateNigerianPhone } from '../utils/validation';

interface SecureInputProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  validation?: (value: string) => { valid: boolean; error?: string };
  rows?: number;
}

export default function SecureInput({
  type = 'text',
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  validation,
  rows = 4,
}: SecureInputProps) {
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    
    // Sanitize input to prevent XSS
    const sanitized = type === 'email' || type === 'tel' 
      ? inputValue 
      : sanitizeInput(inputValue);
    
    onChange(sanitized);

    // Validate on change if touched
    if (touched && validation) {
      const result = validation(sanitized);
      setError(result.error || '');
    } else if (touched) {
      // Default validation
      if (type === 'email' && !validateEmail(sanitized)) {
        setError('Invalid email format');
      } else if (type === 'tel' && sanitized && !validateNigerianPhone(sanitized)) {
        setError('Invalid Nigerian phone number');
      } else {
        setError('');
      }
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(true);
    const inputValue = e.target.value;

    if (required && !inputValue.trim()) {
      setError(`${label} is required`);
      return;
    }

    if (validation) {
      const result = validation(inputValue);
      setError(result.error || '');
    } else {
      // Default validation
      if (type === 'email' && inputValue && !validateEmail(inputValue)) {
        setError('Invalid email format');
      } else if (type === 'tel' && inputValue && !validateNigerianPhone(inputValue)) {
        setError('Invalid Nigerian phone number');
      } else {
        setError('');
      }
    }
  };

  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

