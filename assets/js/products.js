/**
 * AFRICURE PHARMA - PRODUCTS PAGE FUNCTIONALITY
 * Product filtering, searching, and dynamic loading
 */

(function() {
    'use strict';

    // ===================================
    // PRODUCT DATA
    // ===================================

    const productData = [
        {
            id: 1,
            name: "Amoxicillin 500mg",
            category: "antibiotics",
            description: "Broad-spectrum antibiotic for treating bacterial infections",
            strength: "500mg Capsules",
            pack: "Pack of 20",
            image: "assets/images/product-1.jpg",
            featured: true,
            badge: "Bestseller"
        },
        {
            id: 2,
            name: "Amlodipine 5mg",
            category: "cardiovascular",
            description: "Calcium channel blocker for hypertension treatment",
            strength: "5mg Tablets",
            pack: "Pack of 30",
            image: "assets/images/product-2.jpg",
            featured: true
        },
        {
            id: 3,
            name: "Ibuprofen 400mg",
            category: "pain-management",
            description: "Non-steroidal anti-inflammatory drug for pain relief",
            strength: "400mg Tablets",
            pack: "Pack of 24",
            image: "assets/images/product-3.jpg",
            featured: true
        },
        {
            id: 4,
            name: "Salbutamol Inhaler",
            category: "respiratory",
            description: "Fast-acting bronchodilator for asthma relief",
            strength: "100mcg/dose",
            pack: "200 doses",
            image: "assets/images/product-4.jpg",
            featured: true
        },
        {
            id: 5,
            name: "Metformin 500mg",
            category: "diabetes",
            description: "First-line treatment for type 2 diabetes",
            strength: "500mg Tablets",
            pack: "Pack of 60",
            image: "assets/images/product-5.jpg",
            featured: true
        },
        {
            id: 6,
            name: "Vitamin D3 1000IU",
            category: "vitamins",
            description: "Essential vitamin for bone health and immunity",
            strength: "1000IU Capsules",
            pack: "Pack of 90",
            image: "assets/images/product-6.jpg",
            featured: true
        },
        // Additional products for demonstration
        {
            id: 7,
            name: "Ciprofloxacin 500mg",
            category: "antibiotics",
            description: "Fluoroquinolone antibiotic for various infections",
            strength: "500mg Tablets",
            pack: "Pack of 14",
            image: "assets/images/product-7.jpg",
            featured: false
        },
        {
            id: 8,
            name: "Atenolol 50mg",
            category: "cardiovascular",
            description: "Beta-blocker for heart conditions and hypertension",
            strength: "50mg Tablets",
            pack: "Pack of 28",
            image: "assets/images/product-8.jpg",
            featured: false
        },
        {
            id: 9,
            name: "Paracetamol 500mg",
            category: "pain-management",
            description: "Analgesic and antipyretic for pain and fever",
            strength: "500mg Tablets",
            pack: "Pack of 20",
            image: "assets/images/product-9.jpg",
            featured: false
        },
        {
            id: 10,
            name: "Montelukast 10mg",
            category: "respiratory",
            description: "Leukotriene receptor antagonist for asthma",
            strength: "10mg Tablets",
            pack: "Pack of 30",
            image: "assets/images/product-10.jpg",
            featured: false
        }
    ];

    // ===================================
    // PRODUCT FILTERING & SEARCH
    // ===================================

    class ProductManager {
        constructor() {
            this.products = productData;
            this.filteredProducts = [...this.products];
            this.currentCategory = 'all';
            this.currentSearch = '';
            this.productsPerPage = 6;
            this.currentPage = 1;
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.renderProducts();
        }

        bindEvents() {
            // Category filter buttons
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.handleCategoryFilter(e.target);
                });
            });

            // Category cards
            const categoryCards = document.querySelectorAll('.category-card');
            categoryCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    const category = card.getAttribute('data-category');
                    this.filterByCategory(category);
                    this.updateActiveFilterButton(category);
                });
            });

            // Search input
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                searchInput.addEventListener('input', debounce((e) => {
                    this.handleSearch(e.target.value);
                }, 300));
            }

            // Search button
            const searchBtn = document.querySelector('.search-btn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    const searchInput = document.getElementById('product-search');
                    if (searchInput) {
                        this.handleSearch(searchInput.value);
                    }
                });
            }

            // Load more button
            const loadMoreBtn = document.getElementById('load-more');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    this.loadMoreProducts();
                });
            }
        }

        handleCategoryFilter(button) {
            const category = button.getAttribute('data-category');
            this.filterByCategory(category);
            this.updateActiveFilterButton(category);
        }

        filterByCategory(category) {
            this.currentCategory = category;
            this.currentPage = 1;
            this.applyFilters();
        }

        handleSearch(searchTerm) {
            this.currentSearch = searchTerm.toLowerCase();
            this.currentPage = 1;
            this.applyFilters();
        }

        applyFilters() {
            this.filteredProducts = this.products.filter(product => {
                const matchesCategory = this.currentCategory === 'all' || 
                                      product.category === this.currentCategory;
                const matchesSearch = this.currentSearch === '' ||
                                    product.name.toLowerCase().includes(this.currentSearch) ||
                                    product.description.toLowerCase().includes(this.currentSearch);
                
                return matchesCategory && matchesSearch;
            });

            this.renderProducts();
        }

        updateActiveFilterButton(category) {
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-category') === category) {
                    btn.classList.add('active');
                }
            });
        }

        renderProducts() {
            const productsGrid = document.getElementById('products-grid');
            if (!productsGrid) return;

            const startIndex = 0;
            const endIndex = this.currentPage * this.productsPerPage;
            const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

            productsGrid.innerHTML = '';

            if (productsToShow.length === 0) {
                this.renderNoResults(productsGrid);
                return;
            }

            productsToShow.forEach(product => {
                const productCard = this.createProductCard(product);
                productsGrid.appendChild(productCard);
            });

            this.updateLoadMoreButton();
        }

        createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category);

            const categoryName = this.getCategoryDisplayName(product.category);

            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" width="300" height="200">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${categoryName}</p>
                    <p class="product-description">${product.description}</p>
                    <div class="product-details">
                        <span class="product-strength">${product.strength}</span>
                        <span class="product-pack">${product.pack}</span>
                    </div>
                    <button class="btn btn-primary btn-sm product-btn">View Details</button>
                </div>
            `;

            // Add click event for product details
            const detailsBtn = card.querySelector('.product-btn');
            detailsBtn.addEventListener('click', () => {
                this.showProductDetails(product);
            });

            return card;
        }

        getCategoryDisplayName(category) {
            const categoryMap = {
                'antibiotics': 'Antibiotics',
                'cardiovascular': 'Cardiovascular',
                'pain-management': 'Pain Management',
                'respiratory': 'Respiratory',
                'diabetes': 'Diabetes Care',
                'vitamins': 'Vitamins & Supplements'
            };
            return categoryMap[category] || category;
        }

        renderNoResults(container) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                    </div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn btn-outline" onclick="location.reload()">Reset Filters</button>
                </div>
            `;
        }

        loadMoreProducts() {
            this.currentPage++;
            this.renderProducts();
        }

        updateLoadMoreButton() {
            const loadMoreBtn = document.getElementById('load-more');
            if (!loadMoreBtn) return;

            const totalProducts = this.filteredProducts.length;
            const shownProducts = this.currentPage * this.productsPerPage;

            if (shownProducts >= totalProducts) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-flex';
                const remaining = totalProducts - shownProducts;
                loadMoreBtn.textContent = `Load More Products (${remaining} remaining)`;
            }
        }

        showProductDetails(product) {
            // Create modal or navigate to product detail page
            // For now, we'll show an alert with product info
            alert(`Product Details:\n\nName: ${product.name}\nCategory: ${this.getCategoryDisplayName(product.category)}\nDescription: ${product.description}\nStrength: ${product.strength}\nPack Size: ${product.pack}`);
        }
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================

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

    // ===================================
    // INITIALIZATION
    // ===================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Only initialize on products page
        if (document.getElementById('products-grid')) {
            new ProductManager();
        }
    }

    // Start initialization
    init();

})();
