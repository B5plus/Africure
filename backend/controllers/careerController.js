const { validationResult } = require('express-validator');
const CareerService = require('../services/careerService');
const config = require('../config');

/**
 * Career Controller
 * Handles HTTP requests for career application operations
 */
class CareerController {
  /**
   * Submit a new career application
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async submitApplication(req, res) {
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

      const {
        fullName,
        email,
        phone,
        location,
        position,
        experience,
        qualification,
        coverLetter,
        consent
      } = req.body;

      // Additional service-level validation
      const validation = CareerService.validateApplicationData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Check if resume file was uploaded
      const resumeFile = req.file;
      if (!resumeFile) {
        return res.status(400).json({
          success: false,
          message: 'Resume file is required',
          errors: ['Please upload your resume (PDF, DOC, or DOCX format)']
        });
      }

      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(resumeFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type',
          errors: ['Please upload a PDF, DOC, or DOCX file']
        });
      }

      if (resumeFile.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File too large',
          errors: ['Resume file must be less than 5MB']
        });
      }

      // Create application record
      const application = await CareerService.createApplication({
        fullName,
        email,
        phone,
        location,
        position,
        experience,
        qualification,
        coverLetter,
        consent
      }, resumeFile);

      // Log successful submission (without sensitive data)
      console.log(`✅ Career application submitted successfully - ID: ${application.id}, Position: ${position}, Email: ${email}`);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Thank you for your application! We have received your details and will get back to you soon.',
        data: {
          applicationNumber: application.applicationNumber,
          id: application.id,
          submittedAt: application.submittedAt,
          position: application.position,
          status: application.status
        }
      });

    } catch (error) {
      console.error('❌ Career application submission error:', error);
      
      // Determine error type and response
      const isDevelopment = config.server.environment === 'development';
      const errorResponse = {
        success: false,
        message: 'We apologize, but there was an issue submitting your application. Please try again later.',
        ...(isDevelopment && { error: error.message })
      };

      // Send appropriate status code based on error type
      const statusCode = error.message.includes('Database') || error.message.includes('upload') ? 503 : 500;
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * Get all career applications (admin endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllApplications(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'application_date', 
        sortOrder = 'desc',
        status,
        position 
      } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        status,
        position
      };

      const result = await CareerService.getAllApplications(options);

      res.status(200).json({
        success: true,
        message: 'Applications retrieved successfully',
        data: result.applications,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Get applications error:', error);
      
      const isDevelopment = config.server.environment === 'development';
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve applications',
        ...(isDevelopment && { error: error.message })
      });
    }
  }

  /**
   * Get application by ID (admin endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const application = await CareerService.getApplicationById(id);

      res.status(200).json({
        success: true,
        message: 'Application retrieved successfully',
        data: application
      });

    } catch (error) {
      console.error('❌ Get application by ID error:', error);
      
      const statusCode = error.message === 'Application not found' ? 404 : 500;
      const isDevelopment = config.server.environment === 'development';
      
      res.status(statusCode).json({
        success: false,
        message: error.message === 'Application not found' ? 'Application not found' : 'Failed to retrieve application',
        ...(isDevelopment && { error: error.message })
      });
    }
  }

  /**
   * Update application status (admin endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewed', 'hired', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          errors: [`Status must be one of: ${validStatuses.join(', ')}`]
        });
      }

      const application = await CareerService.updateApplicationStatus(id, status, notes);

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: application
      });

    } catch (error) {
      console.error('❌ Update application status error:', error);
      
      const isDevelopment = config.server.environment === 'development';
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        ...(isDevelopment && { error: error.message })
      });
    }
  }

  /**
   * Get application statistics (admin endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getApplicationStats(req, res) {
    try {
      const stats = await CareerService.getApplicationStats();

      res.status(200).json({
        success: true,
        message: 'Application statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      console.error('❌ Get application stats error:', error);
      
      const isDevelopment = config.server.environment === 'development';
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve application statistics',
        ...(isDevelopment && { error: error.message })
      });
    }
  }

  /**
   * Get available positions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAvailablePositions(req, res) {
    try {
      const positions = [
        { value: 'supply-chain', label: 'Supply Chain Dy. Managers' },
        { value: 'executive-ceo', label: 'Executive Assistant to CEO' },
        { value: 'executive-directors', label: 'Executive Assistant to Directors' },
        { value: 'manager-ehs', label: 'Manager - EHS' },
        { value: 'manager-hrd', label: 'Manager HRD' },
        { value: 'manager-accounts', label: 'Manager Accounts' },
        { value: 'manager-regulatory', label: 'Manager Regulatory Affairs' },
        { value: 'manager-procurement', label: 'Manager – API Procurement' },
        { value: 'trainee-procurement', label: 'Trainee- Procurement' },
        { value: 'business-development', label: 'Business Development Manager' },
        { value: 'manager-engineering', label: 'Manager-Engineering' },
        { value: 'deputy-qa', label: 'Deputy Manager-QA Validation' },
        { value: 'other', label: 'Other' }
      ];

      res.status(200).json({
        success: true,
        message: 'Available positions retrieved successfully',
        data: positions
      });

    } catch (error) {
      console.error('❌ Get positions error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve positions'
      });
    }
  }
}

module.exports = CareerController;
