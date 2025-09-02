const express = require('express');
const router = express.Router();
const multer = require('multer');
const CareerController = require('../controllers/careerController');
const { asyncHandler } = require('../middleware/errorHandler');
const rateLimit = require('express-rate-limit');

/**
 * Career Application Routes
 * Handles all career-related API endpoints
 */

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file allowed
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, DOC, or DOCX files only.'), false);
    }
  }
});

// Rate limiting for career applications
const careerApplicationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 applications per hour
  message: {
    success: false,
    error: 'Too many career applications from this IP. Please try again later.',
    retryAfter: 60 * 60 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many career applications from this IP. Please try again later.',
      retryAfter: 60 * 60, // 1 hour in seconds
      timestamp: new Date().toISOString()
    });
  }
});

// Input sanitization middleware
const sanitizeCareerInput = (req, res, next) => {
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

// Validation middleware for career applications
const { body } = require('express-validator');

const validateCareerApplication = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Full name can only contain letters, spaces, dots, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits')
    .matches(/^[\+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Current location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isIn([
      'supply-chain', 'executive-ceo', 'executive-directors', 'manager-ehs',
      'manager-hrd', 'manager-accounts', 'manager-regulatory', 'manager-procurement',
      'trainee-procurement', 'business-development', 'manager-engineering', 'deputy-qa', 'other'
    ])
    .withMessage('Please select a valid position'),
  
  body('experience')
    .notEmpty()
    .withMessage('Experience is required')
    .isIn(['0-1', '2-3', '4-5', '6-7', '8-10', '10+'])
    .withMessage('Please select a valid experience range'),
  
  body('qualification')
    .notEmpty()
    .withMessage('Qualification is required')
    .isIn(['bpharm', 'mpharm', 'mba', 'bsc', 'msc', 'bcom', 'mcom', 'ca', 'engineering', 'other'])
    .withMessage('Please select a valid qualification'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter must not exceed 2000 characters'),
  
  body('consent')
    .notEmpty()
    .withMessage('You must agree to the terms and conditions')
];

/**
 * @route   POST /api/careers/apply
 * @desc    Submit a new career application
 * @access  Public
 */
router.post('/apply',
  careerApplicationRateLimit,
  upload.single('resume'),
  sanitizeCareerInput,
  validateCareerApplication,
  asyncHandler(CareerController.submitApplication)
);

/**
 * @route   GET /api/careers/positions
 * @desc    Get available positions
 * @access  Public
 */
router.get('/positions', asyncHandler(CareerController.getAvailablePositions));

// Admin routes (commented out for now - implement authentication when needed)
/*
router.get('/admin/applications',
  // Add authentication middleware here
  asyncHandler(CareerController.getAllApplications)
);

router.get('/admin/applications/:id',
  // Add authentication middleware here
  asyncHandler(CareerController.getApplicationById)
);

router.put('/admin/applications/:id/status',
  // Add authentication middleware here
  asyncHandler(CareerController.updateApplicationStatus)
);

router.get('/admin/stats',
  // Add authentication middleware here
  asyncHandler(CareerController.getApplicationStats)
);
*/

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        errors: ['Resume file must be less than 5MB']
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        errors: ['Please upload only one resume file']
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      errors: ['Please upload a PDF, DOC, or DOCX file']
    });
  }
  
  next(error);
});

module.exports = router;
