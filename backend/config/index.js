require('dotenv').config();

/**
 * Application Configuration
 * Centralized configuration management for the Africure Pharma API
 */

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3002,
    environment: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },

  // Database Configuration
  database: {
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_KEY
    }
  },

  // Security Configuration
  security: {
    cors: {
      origins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
      ],
      credentials: true
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        }
      }
    }
  },

  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api',
    bodyLimit: '10mb'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'combined',
    enabled: process.env.NODE_ENV !== 'test'
  },

  // Validation Configuration
  validation: {
    contact: {
      fullName: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      contact: {
        minLength: 10,
        maxLength: 15,
        pattern: /^[\+]?[\d\s\-\(\)]+$/
      },
      message: {
        minLength: 10,
        maxLength: 1000
      }
    }
  }
};

/**
 * Validate required environment variables
 */
function validateConfig() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Get configuration for specific environment
 */
function getConfig(env = config.server.environment) {
  const envConfig = {
    development: {
      ...config,
      security: {
        ...config.security,
        cors: {
          ...config.security.cors,
          origins: ['*'] // Allow all origins in development
        }
      }
    },
    production: {
      ...config,
      logging: {
        ...config.logging,
        level: 'combined'
      }
    },
    test: {
      ...config,
      logging: {
        ...config.logging,
        enabled: false
      }
    }
  };

  return envConfig[env] || config;
}

// Validate configuration on load
validateConfig();

module.exports = getConfig();
