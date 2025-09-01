const { validationResult } = require('express-validator');
const ContactService = require('../services/contactService');
const config = require('../config');

/**
 * Contact Controller
 * Handles HTTP requests for contact-related operations
 */
class ContactController {
  /**
   * Create a new contact submission
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createContact(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
          }))
        });
      }

      const { fullName, email, contact, message } = req.body;

      // Additional service-level validation
      const validation = ContactService.validateContactData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Create contact record
      const contactRecord = await ContactService.createContact({
        fullName,
        email,
        contact,
        message
      });

      // Log successful submission (without sensitive data)
      console.log(`✅ Contact form submitted successfully - ID: ${contactRecord.id}, Email: ${contactRecord.email}`);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Thank you for contacting Africure Pharma! We will get back to you soon.',
        data: {
          id: contactRecord.id,
          submittedAt: contactRecord.submittedAt,
          reference: `AF-${contactRecord.id.slice(-8).toUpperCase()}`
        }
      });

    } catch (error) {
      console.error('❌ Contact submission error:', error);
      
      // Determine error type and response
      const isDevelopment = config.server.environment === 'development';
      const errorResponse = {
        success: false,
        message: 'We apologize, but there was an issue submitting your contact form. Please try again later.',
        ...(isDevelopment && { error: error.message })
      };

      // Send appropriate status code based on error type
      const statusCode = error.message.includes('Database') ? 503 : 500;
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * Test database connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async testConnection(req, res) {
    try {
      const { testSupabaseConnection } = require('../config/supabase');
      const isConnected = await testSupabaseConnection();

      res.status(200).json({
        success: true,
        message: isConnected ? 'Database connection successful' : 'Database connection failed',
        data: {
          connected: isConnected,
          timestamp: new Date().toISOString(),
          database: 'Supabase'
        }
      });

    } catch (error) {
      console.error('❌ Test connection error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to test database connection',
        data: {
          connected: false,
          timestamp: new Date().toISOString(),
          error: error.message
        }
      });
    }
  }

  /**
   * Health check endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async healthCheck(req, res) {
    try {
      const { testSupabaseConnection } = require('../config/supabase');
      const dbConnected = await testSupabaseConnection();

      const health = {
        status: dbConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: dbConnected ? 'up' : 'down',
          api: 'up'
        },
        environment: config.server.environment,
        version: '1.0.0'
      };

      const statusCode = dbConnected ? 200 : 503;
      res.status(statusCode).json({
        success: true,
        message: `Service is ${health.status}`,
        data: health
      });

    } catch (error) {
      console.error('❌ Health check error:', error);
      
      res.status(503).json({
        success: false,
        message: 'Service unavailable',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      });
    }
  }
}

module.exports = ContactController;
