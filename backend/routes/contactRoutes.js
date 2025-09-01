const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contact.controller');
const {
  validateContactForm,
  validatePagination,
  validateId,
  sanitizeInput,
  contactRateLimit
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 * @body    { fullName, email, contact, message }
 */
router.post('/',
  contactRateLimit,
  sanitizeInput,
  validateContactForm,
  asyncHandler(ContactController.createContact)
);

/**
 * @route   GET /api/contact/health
 * @desc    Health check for contact service
 * @access  Public
 */
router.get('/health', asyncHandler(ContactController.healthCheck));

/**
 * @route   GET /api/contact/test
 * @desc    Test Supabase connection
 * @access  Public
 */
router.get('/test', asyncHandler(ContactController.testConnection));

// Admin routes (you can add authentication middleware here later)

// Note: Admin routes are commented out for now
// Uncomment and implement authentication middleware when needed

/*
router.get('/admin/all',
  validatePagination,
  asyncHandler(ContactController.getAllContacts)
);

router.get('/admin/stats',
  asyncHandler(ContactController.getContactStats)
);

router.get('/admin/:id',
  validateId,
  asyncHandler(ContactController.getContactById)
);
*/

module.exports = router;
