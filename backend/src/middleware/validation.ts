/**
 * Input Validation Middleware using Zod
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validate request body against a Zod schema
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        error: 'Server Error',
        message: 'Validation failed',
      });
    }
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  email: z.string().email('Invalid email format'),
  nigerianPhone: z.string().regex(
    /^(\+234|0)[789][01]\d{8}$/,
    'Invalid Nigerian phone number format'
  ),
  price: z.number().positive('Price must be positive'),
  propertyTitle: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  propertyDescription: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description must be less than 5000 characters'),
  uuid: z.string().uuid('Invalid UUID format'),
};

/**
 * Property validation schema
 */
export const propertySchema = z.object({
  title: schemas.propertyTitle,
  description: schemas.propertyDescription,
  price: schemas.price,
  currency: z.string().default('NGN'),
  property_type: z.enum(['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial']),
  listing_type: z.enum(['sale', 'rent', 'lease']),
  location: z.string().min(3, 'Location is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().positive().optional(),
  sqm: z.number().positive().optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

/**
 * Contact form validation schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: schemas.email,
  phone: schemas.nigerianPhone.optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
  property_id: schemas.uuid.optional(),
  agent_id: schemas.uuid.optional(),
});

/**
 * Report validation schema
 */
export const reportSchema = z.object({
  entity_type: z.enum(['property', 'agent', 'user']),
  entity_id: schemas.uuid,
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
});

/**
 * Payment validation schema
 */
export const paymentSchema = z.object({
  amount: schemas.price,
  currency: z.string().optional().default('NGN'),
  property_id: schemas.uuid.optional(),
  description: z.string().max(500).optional(),
  callback_url: z.string().url().optional().or(z.literal('')),
  payment_type: z.enum(['subscription', 'featured_listing', 'verification_fee']).optional(),
  plan_type: z.enum(['premium', 'enterprise', 'professional']).optional(),
  entity_id: schemas.uuid.optional(),
}).passthrough(); // Allow extra fields that might be sent

