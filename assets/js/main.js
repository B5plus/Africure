/**
 * AFRICURE PHARMA - MAIN JAVASCRIPT
 * Modern, accessible, and performant interactions
 */

(function() {
    'use strict';

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================

    /**
     * Debounce function to limit function calls
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit function calls
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // ===================================
    // MOBILE NAVIGATION
    // ===================================

    class MobileNavigation {
        constructor() {
            this.toggle = document.querySelector('.mobile-menu-toggle');
            this.menu = document.querySelector('.navbar-menu');
            this.closeBtn = document.querySelector('.mobile-menu-close');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.body = document.body;

            this.init();
        }

        init() {
            if (!this.toggle || !this.menu) return;

            this.toggle.addEventListener('click', () => this.toggleMenu());

            // Close button functionality
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.closeMenu());
            }

            // Close menu when clicking nav links
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMenu();
                }
            });

            // Handle resize
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= 1024) {
                    this.closeMenu();
                }
            }, 250));
        }

        toggleMenu() {
            const isOpen = this.toggle.getAttribute('aria-expanded') === 'true';
            
            if (isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }

        openMenu() {
            this.toggle.setAttribute('aria-expanded', 'true');
            this.menu.classList.add('active');
            this.body.style.overflow = 'hidden';
            
            // Focus first nav link for accessibility
            const firstLink = this.menu.querySelector('.nav-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }

        closeMenu() {
            this.toggle.setAttribute('aria-expanded', 'false');
            this.menu.classList.remove('active');
            this.body.style.overflow = '';
        }
    }

    // ===================================
    // HEADER SCROLL EFFECTS
    // ===================================

    class HeaderScrollEffects {
        constructor() {
            this.header = document.querySelector('.header');
            this.scrollThreshold = 100;
            
            this.init();
        }

        init() {
            if (!this.header) return;

            const handleScroll = throttle(() => {
                const scrollY = window.scrollY;
                
                if (scrollY > this.scrollThreshold) {
                    this.header.classList.add('scrolled');
                } else {
                    this.header.classList.remove('scrolled');
                }
            }, 16); // ~60fps

            window.addEventListener('scroll', handleScroll);
        }
    }

    // ===================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ===================================

    class SmoothScrolling {
        constructor() {
            this.init();
        }

        init() {
            // Handle anchor links
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                smoothScrollTo(target, headerHeight + 20);
            });
        }
    }

    // ===================================
    // FORM VALIDATION
    // ===================================

    class FormValidation {
        constructor() {
            this.forms = document.querySelectorAll('form');
            this.init();
        }

        init() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.handleSubmit(e, form));
                
                // Real-time validation
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', debounce(() => this.validateField(input), 300));
                });
            });
        }

        handleSubmit(e, form) {
            e.preventDefault();
            
            const isValid = this.validateForm(form);
            
            if (isValid) {
                this.submitForm(form);
            } else {
                // Focus first invalid field
                const firstInvalid = form.querySelector('.field-error input, .field-error textarea, .field-error select');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
        }

        validateForm(form) {
            const fields = form.querySelectorAll('input, textarea, select');
            let isValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        validateField(field) {
            const value = field.value.trim();
            const type = field.type;
            const required = field.hasAttribute('required');
            const fieldContainer = field.closest('.form-field') || field.parentElement;
            
            // Remove existing error state
            fieldContainer.classList.remove('field-error');
            const existingError = fieldContainer.querySelector('.field-error-message');
            if (existingError) {
                existingError.remove();
            }

            let isValid = true;
            let errorMessage = '';

            // Required validation
            if (required && !value) {
                isValid = false;
                errorMessage = 'This field is required.';
            }
            // Email validation
            else if (type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
            }
            // Phone validation
            else if (type === 'tel' && value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
            }

            if (!isValid) {
                fieldContainer.classList.add('field-error');
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error-message';
                errorElement.textContent = errorMessage;
                fieldContainer.appendChild(errorElement);
            }

            return isValid;
        }

        async submitForm(form) {
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Simulate form submission (replace with actual endpoint)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message
                this.showMessage(form, 'Thank you! Your message has been sent successfully.', 'success');
                form.reset();
                
            } catch (error) {
                // Show error message
                this.showMessage(form, 'Sorry, there was an error sending your message. Please try again.', 'error');
            } finally {
                // Reset button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }

        showMessage(form, message, type) {
            // Remove existing messages
            const existingMessage = form.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            const messageElement = document.createElement('div');
            messageElement.className = `form-message form-message-${type}`;
            messageElement.textContent = message;
            
            form.insertBefore(messageElement, form.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageElement.parentElement) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }

    // ===================================
    // INTERSECTION OBSERVER ANIMATIONS
    // ===================================

    class ScrollAnimations {
        constructor() {
            this.observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            this.init();
        }

        init() {
            if (!('IntersectionObserver' in window)) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            // Observe elements with animation classes
            const animatedElements = document.querySelectorAll('.animate-on-scroll');
            animatedElements.forEach(el => observer.observe(el));
        }
    }

    // ===================================
    // PERFORMANCE OPTIMIZATIONS
    // ===================================

    class PerformanceOptimizations {
        constructor() {
            this.init();
        }

        init() {
            // Lazy load images
            this.lazyLoadImages();
            
            // Preload critical resources
            this.preloadCriticalResources();
        }

        lazyLoadImages() {
            if (!('IntersectionObserver' in window)) return;

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }

        preloadCriticalResources() {
            // Preload next page resources on hover
            const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"]');
            
            internalLinks.forEach(link => {
                link.addEventListener('mouseenter', () => {
                    const href = link.getAttribute('href');
                    if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                        const prefetchLink = document.createElement('link');
                        prefetchLink.rel = 'prefetch';
                        prefetchLink.href = href;
                        document.head.appendChild(prefetchLink);
                    }
                }, { once: true });
            });
        }
    }

    // ===================================
    // HERO SLIDER
    // ===================================

    class HeroSlider {
        constructor() {
            this.slider = document.querySelector('.hero-slider');
            this.slides = document.querySelectorAll('.hero-slide');
            this.currentSlide = 0;
            this.slideInterval = null;

            if (this.slider && this.slides.length > 0) {
                this.init();
            }
        }

        init() {
            // Start the slider
            this.startSlider();

            // Pause on hover
            this.slider.addEventListener('mouseenter', () => this.pauseSlider());
            this.slider.addEventListener('mouseleave', () => this.startSlider());

            // Pause when page is not visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseSlider();
                } else {
                    this.startSlider();
                }
            });
        }

        startSlider() {
            this.pauseSlider(); // Clear any existing interval
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, 5000); // 5 seconds
        }

        pauseSlider() {
            if (this.slideInterval) {
                clearInterval(this.slideInterval);
                this.slideInterval = null;
            }
        }

        nextSlide() {
            // Remove active class from current slide
            this.slides[this.currentSlide].classList.remove('active');

            // Move to next slide
            this.currentSlide = (this.currentSlide + 1) % this.slides.length;

            // Add active class to new slide
            this.slides[this.currentSlide].classList.add('active');
        }

        goToSlide(index) {
            if (index >= 0 && index < this.slides.length) {
                this.slides[this.currentSlide].classList.remove('active');
                this.currentSlide = index;
                this.slides[this.currentSlide].classList.add('active');
            }
        }
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all components
        new MobileNavigation();
        new HeaderScrollEffects();
        new SmoothScrolling();
        new FormValidation();
        new ScrollAnimations();
        new PerformanceOptimizations();
        new HeroSlider();

        // Add body class to indicate JS is loaded
        document.body.classList.add('js-loaded');
    }

    // Start initialization
    init();

})();
