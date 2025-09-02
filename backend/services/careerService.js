const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Create a Supabase client - try service key first, fallback to anon
let supabaseKey = config.database.supabase.anonKey;
if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'SUPABASE_SERVICE_KEY') {
  supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

const supabase = createClient(
  config.database.supabase.url,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

/**
 * Career Service
 * Handles all career application-related business logic and database operations
 */
class CareerService {
  /**
   * Create a new career application
   * @param {Object} applicationData - Career application form data
   * @param {Object} resumeFile - Uploaded resume file
   * @returns {Promise<Object>} Created application record
   */
  static async createApplication(applicationData, resumeFile = null) {
    try {
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
      } = applicationData;

      // Handle resume file upload if provided
      let resumeUrl = null;
      let resumeFileName = null;
      
      if (resumeFile) {
        const uploadResult = await this.uploadResume(resumeFile);
        resumeUrl = uploadResult.url;
        resumeFileName = uploadResult.fileName;
      }

      // Prepare data for database insertion
      const insertData = {
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        location: location.trim(),
        position: position,
        experience: experience,
        qualification: qualification,
        cover_letter: coverLetter ? coverLetter.trim() : null,
        resume_url: resumeUrl,
        resume_file_name: resumeFileName,
        consent_given: consent === 'on' || consent === true,
        application_status: 'pending',
        application_date: new Date().toISOString()
      };

      // Insert application record into Supabase
      let data, error;

      try {
        const result = await supabase
          .from('Career_Applications')
          .insert([insertData])
          .select()
          .single();

        data = result.data;
        error = result.error;
      } catch (insertError) {
        // If RLS is blocking, try with raw SQL
        console.log('Standard insert failed, trying raw SQL approach...');

        const { data: rawData, error: rawError } = await supabase.rpc('insert_career_application', {
          application_data: insertData
        });

        if (rawError) {
          throw new Error(`Database insertion failed: ${rawError.message}`);
        }

        data = rawData;
        error = null;
      }

      if (error) {
        throw new Error(`Database insertion failed: ${error.message}`);
      }

      return {
        id: data.id,
        applicationNumber: `AC-${data.id.toString().padStart(6, '0')}`,
        submittedAt: data.application_date,
        fullName: data.full_name,
        email: data.email,
        position: data.position,
        status: data.application_status
      };
    } catch (error) {
      console.error('CareerService.createApplication error:', error);
      throw error;
    }
  }

  /**
   * Upload resume file to storage
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} Upload result with URL and filename
   */
  static async uploadResume(file) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `resume_${timestamp}_${randomString}${fileExtension}`;
      const filePath = `resumes/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('career-applications')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw new Error(`File upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('career-applications')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        fileName: file.originalname,
        storagePath: filePath
      };
    } catch (error) {
      console.error('CareerService.uploadResume error:', error);
      throw error;
    }
  }

  /**
   * Get all career applications (admin use)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of career applications
   */
  static async getAllApplications(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'application_date', 
        sortOrder = 'desc',
        status = null,
        position = null 
      } = options;
      
      const offset = (page - 1) * limit;

      let query = supabase
        .from('Career_Applications')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      // Add filters
      if (status) {
        query = query.eq('application_status', status);
      }
      
      if (position) {
        query = query.eq('position', position);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }

      return {
        applications: data || [],
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('CareerService.getAllApplications error:', error);
      throw error;
    }
  }

  /**
   * Get application by ID
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Application record
   */
  static async getApplicationById(id) {
    try {
      const { data, error } = await supabase
        .from('Career_Applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Application not found');
        }
        throw new Error(`Failed to fetch application: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('CareerService.getApplicationById error:', error);
      throw error;
    }
  }

  /**
   * Update application status
   * @param {string} id - Application ID
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Updated application record
   */
  static async updateApplicationStatus(id, status, notes = null) {
    try {
      const updateData = {
        application_status: status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from('Career_Applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update application status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('CareerService.updateApplicationStatus error:', error);
      throw error;
    }
  }

  /**
   * Get application statistics
   * @returns {Promise<Object>} Application statistics
   */
  static async getApplicationStats() {
    try {
      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('Career_Applications')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }

      // Get status breakdown
      const { data: statusData, error: statusError } = await supabase
        .from('Career_Applications')
        .select('application_status')
        .not('application_status', 'is', null);

      if (statusError) {
        throw new Error(`Failed to get status breakdown: ${statusError.message}`);
      }

      const statusBreakdown = statusData.reduce((acc, app) => {
        acc[app.application_status] = (acc[app.application_status] || 0) + 1;
        return acc;
      }, {});

      // Get today's count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('Career_Applications')
        .select('*', { count: 'exact', head: true })
        .gte('application_date', `${today}T00:00:00.000Z`)
        .lt('application_date', `${today}T23:59:59.999Z`);

      if (todayError) {
        throw new Error(`Failed to get today's count: ${todayError.message}`);
      }

      return {
        total: totalCount || 0,
        today: todayCount || 0,
        statusBreakdown,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('CareerService.getApplicationStats error:', error);
      throw error;
    }
  }

  /**
   * Validate career application data
   * @param {Object} applicationData - Career application form data
   * @returns {Object} Validation result
   */
  static validateApplicationData(applicationData) {
    const errors = [];

    // Validate required fields
    const requiredFields = [
      'fullName', 'email', 'phone', 'location', 
      'position', 'experience', 'qualification'
    ];

    requiredFields.forEach(field => {
      if (!applicationData[field] || applicationData[field].toString().trim().length === 0) {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (applicationData.email && !emailRegex.test(applicationData.email)) {
      errors.push('Please provide a valid email address');
    }

    // Validate phone number
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (applicationData.phone && !phoneRegex.test(applicationData.phone)) {
      errors.push('Please provide a valid phone number');
    }

    // Validate consent
    if (!applicationData.consent) {
      errors.push('You must agree to the terms and conditions');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = CareerService;
