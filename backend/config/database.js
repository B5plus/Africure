const { Sequelize } = require('sequelize');
require('dotenv').config();

// Try different connection approaches for Supabase
let sequelize;

// Method 1: Try with connection string if provided
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Method 2: Try with direct connection to Supabase
  // For Supabase, we need to use the direct connection details
  const projectRef = 'spulbnzwcylxgjshbkes';

  sequelize = new Sequelize({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
}

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection
};
