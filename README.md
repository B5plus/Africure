# Africure Pharma - Complete Web Application

A full-stack web application for Africure Pharma, featuring a modern frontend and robust backend API with database integration.

## 🏗️ Project Structure

```
Africure Main/
├── frontend/                # Frontend application
│   ├── *.html              # Website pages
│   ├── assets/             # CSS, JS, images, fonts
│   ├── robots.txt          # SEO configuration
│   ├── sitemap.xml         # SEO sitemap
│   └── README.md           # Frontend documentation
├── backend/                # Backend API server
│   ├── server.js           # Main server file
│   ├── config/             # Database and app configuration
│   ├── controllers/        # API route handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Backend documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for database)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with Supabase credentials
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
# Open index.html in your browser or use a local server
# For contact form, ensure backend is running on port 3002
```

### 3. Database Setup

1. Create a Supabase project
2. Create the `Contact_Us` table
3. Configure RLS policies
4. Update backend .env with your credentials

## � Features

### Frontend

- ✅ Responsive design (mobile-first)
- ✅ Multiple pages (Home, About, Contact, etc.)
- ✅ Contact form with real-time validation
- ✅ Modern UI/UX design
- ✅ SEO optimized

### Backend

- ✅ Express.js REST API
- ✅ Supabase database integration
- ✅ Contact form processing
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Error handling and logging

### Integration

- ✅ Frontend-backend communication
- ✅ Form submission and validation
- ✅ Success/error messaging
- ✅ Database storage

## 🔧 Configuration

### Backend Environment Variables

```env
PORT=3002
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500
```

### Frontend API Configuration

Update the API URL in `frontend/contact.html`:

```javascript
const API_BASE_URL = "http://localhost:3002";
```

## 📱 Pages

1. **Homepage** (`index.html`) - Company overview and hero section
2. **About Us** (`about.html`) - Company history and mission
3. **Capabilities** (`capabilities.html`) - Manufacturing capabilities
4. **Quality Policy** (`quality-policy.html`) - Quality standards
5. **Careers** (`careers.html`) - Job opportunities
6. **Events** (`events.html`) - Company milestones
7. **Contact** (`contact.html`) - Contact form with backend integration

## 🧪 Testing

### Contact Form Testing

1. Start the backend server: `cd backend && npm run dev`
2. Open `frontend/contact.html` in browser
3. Test form validation and submission
4. Check Supabase database for saved data

### API Testing

```bash
# Health check
curl http://localhost:3002/health

# Test contact submission
curl -X POST http://localhost:3002/api/contact \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","contact":"1234567890","message":"Test message"}'
```

## 🚀 Deployment

### Frontend Deployment

- Deploy to any static hosting (Netlify, Vercel, GitHub Pages)
- Update API URLs to production backend

### Backend Deployment

- Deploy to cloud platforms (Heroku, Railway, DigitalOcean)
- Configure production environment variables
- Update CORS settings for production domain

## � Support

For questions or issues:

1. Check the README files in frontend/ and backend/ folders
2. Review the code comments and documentation
3. Test the contact form functionality

---

**Africure Pharma** - "AFRICURE IS BORN TO HEAL"
Building African pharmaceutical self-sufficiency with manufacturing facilities across Africa.
