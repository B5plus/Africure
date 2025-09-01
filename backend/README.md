# Africure Pharma Backend API

A Node.js backend API for the Africure Pharma website with Supabase integration using Sequelize ORM.

## Features

- ✅ Contact form submission with validation
- ✅ Supabase PostgreSQL integration
- ✅ Sequelize ORM for database operations
- ✅ Input validation and sanitization
- ✅ Rate limiting for security
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Admin endpoints for contact management
- ✅ Health check endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **ORM**: Sequelize
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Update the `.env` file with your Supabase credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://spulbnzwcylxgjshbkes.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration (Supabase PostgreSQL)
DB_HOST=db.spulbnzwcylxgjshbkes.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_db_password
DB_SSL=true
```

### 3. Database Setup

The application will automatically sync the database models with your Supabase table. Make sure your Supabase table has these columns:

- `id` (integer, primary key, auto-increment)
- `Full_Name` (varchar)
- `Email_id` (varchar)
- `Contact` (varchar)
- `Enter_Message` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Public Endpoints

#### Submit Contact Form
```
POST /api/contact
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "contact": "+1234567890",
  "message": "Your message here"
}
```

#### Health Check
```
GET /api/contact/health
```

### Admin Endpoints

#### Get All Contacts
```
GET /api/contact/admin/all?page=1&limit=10
```

#### Get Contact Statistics
```
GET /api/contact/admin/stats
```

#### Get Contact by ID
```
GET /api/contact/admin/:id
```

#### Delete Contact
```
DELETE /api/contact/admin/:id
```

## Validation Rules

### Contact Form
- **Full Name**: 2-255 characters, letters only
- **Email**: Valid email format, max 255 characters
- **Contact**: 10-16 digits, valid phone number format
- **Message**: 10-2000 characters

## Security Features

- **Rate Limiting**: 3 contact submissions per 15 minutes per IP
- **Input Sanitization**: XSS protection and HTML entity escaping
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Validation**: Comprehensive input validation

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Success Response

```json
{
  "success": true,
  "message": "Contact form submitted successfully!",
  "data": {
    "id": 123,
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── controllers/
│   └── contactController.js
├── middleware/
│   ├── errorHandler.js
│   └── validation.js
├── models/
│   └── Contact.js
├── routes/
│   └── contactRoutes.js
├── .env
├── server.js
└── package.json
```

### Adding New Features

1. Create new models in `models/`
2. Add controllers in `controllers/`
3. Define routes in `routes/`
4. Add validation in `middleware/validation.js`

## Deployment

1. Set `NODE_ENV=production` in environment
2. Update CORS origins for production domains
3. Set secure database password
4. Configure proper SSL certificates
5. Use process manager like PM2

## Support

For issues and questions, contact the development team or check the project documentation.
