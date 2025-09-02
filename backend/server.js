const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { testSupabaseConnection } = require('./config/supabase');
const contactRoutes = require('./routes/contactRoutes');
const careerRoutes = require('./routes/careerRoutes');
const { errorHandler } = require('./middleware/errorHandler');

/**
 * Africure Pharma API Server
 * Clean, organized backend for contact form and future features
 */
class Server {
  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: config.security.helmet.contentSecurityPolicy
    }));

    // CORS configuration
    const corsOptions = {
      origin: (origin, callback) => {
        if (config.server.environment === 'development') {
          callback(null, true);
          return;
        }

        if (!origin || config.security.cors.origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: config.security.cors.credentials,
      optionsSuccessStatus: 200
    };

    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.security.rateLimit.windowMs,
      max: config.security.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use(limiter);

    // Logging
    if (config.logging.enabled) {
      this.app.use(morgan(config.logging.level));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: config.api.bodyLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: config.api.bodyLimit }));
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Africure Pharma API is running',
        timestamp: new Date().toISOString(),
        environment: config.server.environment,
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use(`${config.api.prefix}/contact`, contactRoutes);
    this.app.use(`${config.api.prefix}/careers`, careerRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist.`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Test database connection
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        console.log('✅ Supabase connection established successfully.');
      } else {
        console.log('⚠️  Supabase connection failed, but server will start anyway.');
      }

      // Start server
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Africure Pharma API server running on port ${this.port}`);
        console.log(`📊 Environment: ${config.server.environment}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(`🔗 Test Supabase: http://localhost:${this.port}${config.api.prefix}/contact/test`);
        console.log(`🔗 Contact API: http://localhost:${this.port}${config.api.prefix}/contact`);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Unable to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`🔄 ${signal} received, shutting down gracefully...`);

      if (this.server) {
        this.server.close(() => {
          console.log('✅ Server closed successfully');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }
}

// Create and start server instance
const server = new Server();

// Start the server
server.start().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Export the Express app for testing
module.exports = server.getApp();
