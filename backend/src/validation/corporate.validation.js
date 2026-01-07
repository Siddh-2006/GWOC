import Joi from 'joi';

export const corporateValidation = {
  createInquiry: Joi.object({
    organizationName: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Organization name must be at least 2 characters',
        'string.max': 'Organization name cannot exceed 200 characters',
        'any.required': 'Organization name is required'
      }),
    
    contactPerson: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Contact person name must be at least 2 characters',
        'string.max': 'Contact person name cannot exceed 100 characters',
        'any.required': 'Contact person name is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    engagementType: Joi.string()
      .valid('workplace-workshops', 'institutional-education', 'event-sessions', 'community-programs', 'other')
      .required()
      .messages({
        'any.only': 'Please select a valid engagement type',
        'any.required': 'Engagement type is required'
      }),
    
    message: Joi.string()
      .trim()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Message must be at least 10 characters',
        'string.max': 'Message cannot exceed 2000 characters',
        'any.required': 'Message is required'
      }),
    
    organizationSize: Joi.string()
      .valid('small', 'medium', 'large', 'not-specified')
      .default('not-specified'),
    
    preferredContact: Joi.string()
      .valid('email', 'phone', 'either')
      .default('email')
  }),

  updateInquiry: Joi.object({
    status: Joi.string()
      .valid('new', 'confirmed', 'in-discussion', 'closed')
      .messages({
        'any.only': 'Invalid status value'
      }),
    
    adminNotes: Joi.string()
      .trim()
      .max(1000)
      .allow('')
      .messages({
        'string.max': 'Admin notes cannot exceed 1000 characters'
      })
  }).min(1)
};