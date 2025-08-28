# Africure Pharma Website

A modern, professional, and responsive website for Africure Pharma, a pharmaceutical company specializing in manufacturing and distributing high-quality medicines across Africa.

## 🌟 Features

### ✅ Fully Responsive Design

- Mobile-first approach with smooth performance across all devices
- Responsive breakpoints: 640px, 768px, 1024px, 1280px, 1536px
- Optimized for tablets, smartphones, and desktop computers

### ✅ SEO-Friendly

- Fast loading speeds with optimized assets
- Comprehensive meta tags and Open Graph data
- Semantic HTML structure with proper heading hierarchy
- Schema.org structured data for better search engine understanding
- XML sitemap and robots.txt included
- Optimized images with lazy loading

### ✅ Modern UI/UX

- Clean, professional typography using Inter font family
- Brand-appropriate medical/healthcare color palette
- Smooth animations and transitions
- Clear call-to-action buttons
- Accessible design with WCAG compliance
- Professional medical theme with blue and green color scheme

### ✅ Multi-Page Structure

- **Home Page**: Hero section, company overview, services, statistics
- **About Us**: Mission, vision, values, leadership team, company story
- **Products**: Product categories, search/filter functionality, featured products
- **Manufacturing**: Facilities, certifications, quality processes, technology
- **Careers**: Job listings, company culture, benefits, application process
- **Contact**: Contact form, office locations, business hours, map integration

## 🚀 Technical Specifications

### Performance Optimizations

- Minified CSS and JavaScript
- Optimized images with proper alt tags
- Lazy loading for images
- Efficient CSS Grid and Flexbox layouts
- Smooth scrolling and animations
- Debounced search functionality

### Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Skip links for navigation

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement approach
- Graceful degradation for older browsers

## 📁 File Structure

```
Africure Main/
├── index.html              # Home page
├── about.html              # About Us page
├── products.html           # Products page
├── manufacturing.html      # Manufacturing page
├── careers.html           # Careers page
├── contact.html           # Contact page
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
├── README.md              # This file
└── assets/
    ├── css/
    │   └── main.css       # Main stylesheet (1900+ lines)
    ├── js/
    │   ├── main.js        # Core functionality
    │   └── products.js    # Product filtering & search
    ├── images/            # Image assets (placeholder references)
    └── fonts/             # Web fonts directory
```

## 🎨 Design System

### Color Palette

- **Primary Blue**: #2563eb (Professional medical blue)
- **Secondary Green**: #059669 (Medical/healthcare green)
- **Accent Red**: #dc2626 (Emergency/important actions)
- **Neutral Grays**: #f9fafb to #111827 (Complete gray scale)

### Typography

- **Font Family**: Inter (modern, readable sans-serif)
- **Responsive Scale**: 12px to 60px with proper line heights
- **Font Weights**: 300 (light) to 800 (extrabold)

### Spacing System

- **Scale**: 4px to 128px using CSS custom properties
- **Consistent**: All spacing uses the defined scale
- **Responsive**: Adjusts appropriately across breakpoints

## 🛠️ Setup Instructions

### 1. Local Development

1. Clone or download the project files
2. Open `index.html` in a web browser
3. For development, use a local server (recommended):

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

### 2. Image Assets

The website references image files that need to be added to `assets/images/`:

- Logo files (logo.svg, logo-white.svg)
- Hero and section background images
- Product images (product-1.jpg through product-10.jpg)
- Team/leadership photos
- Office location images
- Certification logos
- Favicon and touch icons

### 3. Font Loading

The CSS references Inter font. For optimal performance:

1. Download Inter font from Google Fonts
2. Place font files in `assets/fonts/`
3. Update CSS font-face declarations if needed

### 4. Production Deployment

1. Optimize images (compress, convert to WebP where supported)
2. Minify CSS and JavaScript files
3. Configure server compression (gzip/brotli)
4. Set up proper caching headers
5. Update sitemap.xml with actual domain
6. Configure SSL certificate

## 🔧 Customization

### Colors

Update CSS custom properties in `:root` section of `main.css`:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #059669;
  /* ... other colors */
}
```

### Content

- Update company information in HTML files
- Modify contact details and addresses
- Add actual product data in `products.js`
- Update social media links

### Functionality

- Integrate contact form with backend service
- Add Google Maps integration for office locations
- Implement actual product search/filtering with database
- Add analytics tracking (Google Analytics, etc.)

## 📱 Mobile Optimization

- Touch-friendly interface with appropriate button sizes
- Optimized mobile navigation with hamburger menu
- Responsive images and flexible layouts
- Fast loading on mobile networks
- Proper viewport configuration

## 🔍 SEO Features

- Comprehensive meta tags for all pages
- Open Graph and Twitter Card support
- Structured data markup (JSON-LD)
- Semantic HTML with proper heading structure
- XML sitemap for search engines
- Robots.txt for crawler guidance
- Fast loading speeds for better rankings

## 🎯 Call-to-Actions

Strategic placement of CTAs throughout the site:

- Primary: "Get In Touch" / "Contact Us"
- Secondary: "Learn More" / "View Products"
- Product-specific: "View Details" / "Apply Now"

## 📞 Support

For technical support or customization requests:

- Email: info@africurepharma.com
- Phone: +234-1-234-5678

## 📄 License

This website template is created for Africure Pharma. All rights reserved.

---

**Built with modern web standards and best practices for optimal performance, accessibility, and user experience.**
