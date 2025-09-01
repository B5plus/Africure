const { body, query, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Validation Middleware
 * Clean, reusable validation rules for the Africure Pharma API
 */

// Contact form validation rules
const validateContactForm = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ 
      min: config.validation.contact.fullName.minLength, 
      max: config.validation.contact.fullName.maxLength 
    })
    .withMessage(`Full name must be between ${config.validation.contact.fullName.minLength} and ${config.validation.contact.fullName.maxLength} characters`)
    .matches(config.validation.contact.fullName.pattern)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom((value) => {
      if (!config.validation.contact.email.pattern.test(value)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),
  
  body('contact')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .isLength({ 
      min: config.validation.contact.contact.minLength, 
      max: config.validation.contact.contact.maxLength 
    })
    .withMessage(`Contact number must be between ${config.validation.contact.contact.minLength} and ${config.validation.contact.contact.maxLength} digits`)
    .matches(config.validation.contact.contact.pattern)
    .withMessage('Please provide a valid contact number'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ 
      min: config.validation.contact.message.minLength, 
      max: config.validation.contact.message.maxLength 
    })
    .withMessage(`Message must be between ${config.validation.contact.message.minLength} and ${config.validation.contact.message.maxLength} characters`)
    .escape() // Sanitize HTML entities
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
    
  query('sortBy')
    .optional()
    .isIn(['created_at', 'Full_Name', 'Email_id'])
    .withMessage('Invalid sort field'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// ID validation
const validateId = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format')
];

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove script tags and other potentially dangerous content
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};

// Rate limiting for contact form
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact form submissions per windowMs
  message: {
    success: false,
    error: 'Too many contact form submissions from this IP. Please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many contact form submissions from this IP. Please try again later.',
      retryAfter: Math.ceil(15 * 60), // 15 minutes in seconds
      timestamp: new Date().toISOString()
    });
  }
});

// General API rate limiting
const apiRateLimit = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.',
    retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
      retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  validateContactForm,
  validatePagination,
  validateId,
  sanitizeInput,
  contactRateLimit,
  apiRateLimit,
  handleValidationErrors
};
