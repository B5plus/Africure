const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Full_Name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Full name is required'
      },
      len: {
        args: [2, 255],
        msg: 'Full name must be between 2 and 255 characters'
      }
    }
  },
  Email_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Email is required'
      },
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  Contact: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Contact number is required'
      },
      is: {
        args: /^[\+]?[1-9][\d]{0,15}$/,
        msg: 'Please provide a valid contact number'
      }
    }
  },
  Enter_Message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message is required'
      },
      len: {
        args: [10, 2000],
        msg: 'Message must be between 10 and 2000 characters'
      }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Contact',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['Email_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
Contact.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    id: values.id,
    fullName: values.Full_Name,
    email: values.Email_id,
    contact: values.Contact,
    message: values.Enter_Message,
    createdAt: values.created_at,
    updatedAt: values.updated_at
  };
};

// Class methods
Contact.findByEmail = function(email) {
  return this.findOne({
    where: {
      Email_id: email
    }
  });
};

Contact.findRecent = function(limit = 10) {
  return this.findAll({
    order: [['created_at', 'DESC']],
    limit: limit
  });
};

module.exports = Contact;
