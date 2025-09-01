# Africure Pharma - Frontend

This folder contains all the frontend files for the Africure Pharma website.

## 📁 Project Structure

```
frontend/
├── index.html              # Homepage
├── about.html              # About Us page
├── capabilities.html       # Our Capabilities page
├── careers.html            # Careers page
├── contact.html            # Contact Us page (with backend integration)
├── events.html             # Events & Milestones page
├── quality-policy.html     # Quality Policy page
├── robots.txt              # SEO robots file
├── sitemap.xml             # SEO sitemap
├── README.md               # This file
└── assets/
    ├── css/
    │   └── main.css         # Main stylesheet
    ├── js/
    │   └── main.js          # Main JavaScript file
    ├── images/              # All website images
    └── fonts/               # Custom fonts

```

## 🚀 Features

### ✅ Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Cross-browser compatibility

### ✅ Contact Form Integration
- Real-time frontend validation
- Backend API integration
- Success/error messaging
- Loading states

### ✅ SEO Optimized
- Semantic HTML structure
- Meta tags and descriptions
- Sitemap and robots.txt
- Optimized images

### ✅ Performance
- Optimized CSS and JavaScript
- Compressed images
- Fast loading times

## 🔧 Backend Integration

The contact form (`contact.html`) is integrated with the backend API:

- **API Endpoint**: `http://localhost:3002/api/contact`
- **Method**: POST
- **Data Format**: JSON
- **Validation**: Frontend + Backend validation
- **Database**: Supabase (Contact_Us table)

## 🧪 Testing

### Local Development
1. Open any HTML file in a web browser
2. For contact form testing, ensure backend is running on port 3002
3. Test form validation and submission

### Contact Form Testing
1. Fill out the contact form with various data
2. Test validation (empty fields, invalid email, etc.)
3. Submit valid data and check Supabase database
4. Verify success/error messages

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🎨 Customization

### Colors
Main brand colors are defined in `assets/css/main.css`:
- Primary: #1e40af (blue)
- Secondary: #10b981 (green)
- Accent: #f59e0b (orange)

### Fonts
- Primary: Inter (Google Fonts)
- Fallback: system fonts

### Images
All images are stored in `assets/images/` with descriptive names.

## 📞 Contact Form Validation Rules

### Full Name
- Required field
- 2-50 characters
- Letters and spaces only

### Email
- Required field
- Valid email format
- Standard email regex

### Contact Number
- Required field
- 10-15 digits
- International format supported

### Message
- Required field
- 10-1000 characters
- Prevents spam and overflow

## 🔄 Updates

To update the frontend:
1. Edit HTML files for content changes
2. Update `assets/css/main.css` for styling
3. Modify `assets/js/main.js` for functionality
4. Test changes across all pages
5. Verify contact form still works with backend

## 📋 Deployment

For production deployment:
1. Update API endpoints in contact.html (change localhost to production URL)
2. Optimize images for web
3. Minify CSS and JavaScript
4. Test all functionality
5. Deploy to web server

---

**Africure Pharma** - Building African pharmaceutical self-sufficiency
