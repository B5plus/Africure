const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

/**
 * Supabase Database Configuration
 * Handles database connection and client setup for Africure Pharma API
 */
class SupabaseConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize Supabase client
   */
  initialize() {
    const { url, anonKey } = config.database.supabase;

    if (!url || !anonKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    this.client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });

    return this.client;
  }

  /**
   * Test database connection with retry logic
   */
  async testConnection() {
    try {
      if (!this.client) {
        this.initialize();
      }

      const { error } = await this.client
        .from('Contact_Us')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
        this.isConnected = false;
        return false;
      }

      console.log('✅ Supabase connection successful');
      this.isConnected = true;
      this.connectionAttempts = 0;
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error.message);
      this.isConnected = false;
      this.connectionAttempts++;

      if (this.connectionAttempts < this.maxRetries) {
        console.log(`🔄 Retrying connection... (${this.connectionAttempts}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.testConnection();
      }

      return false;
    }
  }

  /**
   * Get Supabase client instance
   */
  getClient() {
    if (!this.client) {
      this.initialize();
    }
    return this.client;
  }

  /**
   * Check if database is connected
   */
  isHealthy() {
    return this.isConnected;
  }

  /**
   * Reset connection state
   */
  reset() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.client = null;
  }
}

// Create singleton instance
const supabaseConfig = new SupabaseConfig();

module.exports = {
  supabase: supabaseConfig.getClient(),
  testSupabaseConnection: () => supabaseConfig.testConnection(),
  supabaseConfig
};
