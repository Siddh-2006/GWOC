import Joi from 'joi';

export const authValidation = {
  signUp: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters and spaces',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .allow('', null)
      .optional()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters and spaces'
      })
  }),

  signIn: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.min': 'First name is required',
        'string.max': 'First name cannot exceed 50 characters',
        'string.empty': 'First name is required',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .allow('', null)
      .optional()
      .messages({
        'string.min': 'Last name must be at least 1 character',
        'string.max': 'Last name cannot exceed 50 characters'
      }),

    avatar: Joi.string()
      .max(1000)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Avatar URL cannot exceed 1000 characters'
      }),

    bio: Joi.string()
      .max(150)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 150 characters'
      }),

    location: Joi.string()
      .max(100)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Location cannot exceed 100 characters'
      }),

    interests: Joi.string()
      .max(200)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Interests cannot exceed 200 characters'
      }),

    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer_not_to_say')
      .allow('', null)
      .optional(),

    address: Joi.string()
      .max(300)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Address cannot exceed 300 characters'
      }),

    quote: Joi.string()
      .max(200)
      .allow('', null)
      .optional(),

    language: Joi.string()
      .max(50)
      .allow('', null)
      .optional(),

    personality: Joi.string()
      .max(100)
      .allow('', null)
      .optional()
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  resetPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    otp: Joi.string()
      .length(6)
      .required()
      .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'any.required': 'OTP is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      })
  })
};