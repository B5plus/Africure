const { supabase } = require('../config/supabase');
const config = require('../config');

/**
 * Contact Service
 * Handles all contact-related business logic and database operations
 */
class ContactService {
  /**
   * Create a new contact submission
   * @param {Object} contactData - Contact form data
   * @returns {Promise<Object>} Created contact record
   */
  static async createContact(contactData) {
    try {
      const { fullName, email, contact, message } = contactData;

      // Prepare data for database insertion
      const insertData = {
        Full_Name: fullName.trim(),
        Email_id: email.toLowerCase().trim(),
        Contact: contact.trim(),
        Enter_Message: message.trim()
      };

      // Insert contact record into Supabase
      const { data, error } = await supabase
        .from('Contact_Us')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw new Error(`Database insertion failed: ${error.message}`);
      }

      return {
        id: data.id,
        submittedAt: data.created_at || new Date().toISOString(),
        fullName: data.Full_Name,
        email: data.Email_id
      };
    } catch (error) {
      console.error('ContactService.createContact error:', error);
      throw error;
    }
  }

  /**
   * Get all contact submissions (admin use)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of contact submissions
   */
  static async getAllContacts(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('Contact_Us')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }

      return {
        contacts: data || [],
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('ContactService.getAllContacts error:', error);
      throw error;
    }
  }

  /**
   * Get contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise<Object>} Contact record
   */
  static async getContactById(id) {
    try {
      const { data, error } = await supabase
        .from('Contact_Us')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Contact not found');
        }
        throw new Error(`Failed to fetch contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ContactService.getContactById error:', error);
      throw error;
    }
  }

  /**
   * Update contact status (for admin use)
   * @param {string} id - Contact ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated contact record
   */
  static async updateContactStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('Contact_Us')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update contact status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ContactService.updateContactStatus error:', error);
      throw error;
    }
  }

  /**
   * Delete contact (for admin use)
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteContact(id) {
    try {
      const { error } = await supabase
        .from('Contact_Us')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete contact: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('ContactService.deleteContact error:', error);
      throw error;
    }
  }

  /**
   * Get contact statistics
   * @returns {Promise<Object>} Contact statistics
   */
  static async getContactStats() {
    try {
      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('Contact_Us')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }

      // Get today's count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('Contact_Us')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (todayError) {
        throw new Error(`Failed to get today's count: ${todayError.message}`);
      }

      return {
        total: totalCount || 0,
        today: todayCount || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('ContactService.getContactStats error:', error);
      throw error;
    }
  }

  /**
   * Validate contact data
   * @param {Object} contactData - Contact form data
   * @returns {Object} Validation result
   */
  static validateContactData(contactData) {
    const errors = [];
    const { validation } = config;

    // Validate full name
    if (!contactData.fullName || contactData.fullName.trim().length < validation.contact.fullName.minLength) {
      errors.push(`Full name must be at least ${validation.contact.fullName.minLength} characters long`);
    }

    if (contactData.fullName && contactData.fullName.length > validation.contact.fullName.maxLength) {
      errors.push(`Full name must not exceed ${validation.contact.fullName.maxLength} characters`);
    }

    if (contactData.fullName && !validation.contact.fullName.pattern.test(contactData.fullName)) {
      errors.push('Full name can only contain letters and spaces');
    }

    // Validate email
    if (!contactData.email || !validation.contact.email.pattern.test(contactData.email)) {
      errors.push('Please provide a valid email address');
    }

    // Validate contact number
    if (!contactData.contact || contactData.contact.length < validation.contact.contact.minLength) {
      errors.push(`Contact number must be at least ${validation.contact.contact.minLength} digits long`);
    }

    if (contactData.contact && !validation.contact.contact.pattern.test(contactData.contact)) {
      errors.push('Please provide a valid contact number');
    }

    // Validate message
    if (!contactData.message || contactData.message.trim().length < validation.contact.message.minLength) {
      errors.push(`Message must be at least ${validation.contact.message.minLength} characters long`);
    }

    if (contactData.message && contactData.message.length > validation.contact.message.maxLength) {
      errors.push(`Message must not exceed ${validation.contact.message.maxLength} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ContactService;
