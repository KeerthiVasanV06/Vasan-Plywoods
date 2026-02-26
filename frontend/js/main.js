// ========================================
// Configuration
// ========================================
// Use the current host to support both localhost and network access
const API_BASE_URL = `${window.location.origin}/api`;

// ========================================
// Toast Notification Logic (Main Site)
// ========================================
function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info') {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Choose icon based on type
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';

    // Add font awesome if not present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease-in forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

// ========================================
// Custom Phone Popup Logic
// ========================================
function createPhoneDialog() {
    let overlay = document.getElementById('phone-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'phone-overlay';
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon"><i class="fas fa-phone-alt"></i></div>
                <div class="confirm-title">Start a Call</div>
                <div class="confirm-message" id="phone-message-text">Do you want to call this number?</div>
                <div class="confirm-buttons">
                    <button class="btn-confirm-no" id="btn-phone-cancel">Cancel</button>
                    <button class="btn-confirm-yes" id="btn-phone-call">Call Now</button>
                    <button class="btn-confirm-no" id="btn-phone-copy" style="margin-left: 10px; background: var(--wood-light); color: white;">Copy</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    return overlay;
}

function handlePhoneClick(e, phoneNumber) {
    e.preventDefault();
    const overlay = createPhoneDialog();
    const messageEl = document.getElementById('phone-message-text');
    const callBtn = document.getElementById('btn-phone-call');
    const cancelBtn = document.getElementById('btn-phone-cancel');
    const copyBtn = document.getElementById('btn-phone-copy');

    messageEl.textContent = `Do you want to call ${phoneNumber}?`;

    overlay.classList.add('active');

    // Clean up old listeners by cloning
    const newCallBtn = callBtn.cloneNode(true);
    callBtn.replaceWith(newCallBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.replaceWith(newCancelBtn);

    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.replaceWith(newCopyBtn);

    // Add new listeners
    newCallBtn.addEventListener('click', () => {
        window.location.href = `tel:${phoneNumber}`;
        overlay.classList.remove('active');
    });

    newCancelBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    newCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(phoneNumber).then(() => {
            showToast('Number copied to clipboard!', 'success');
            overlay.classList.remove('active');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy number', 'error');
        });
    });
}

// Global click interceptor for tel: links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (link) {
        const phoneNumber = link.href.replace('tel:', '');
        handlePhoneClick(e, phoneNumber);
    }
});

// ========================================
// Mobile Navigation Toggle
// ========================================
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ========================================
// Carousel Functionality
// ========================================
class Carousel {
    constructor(carouselId, indicatorsId) {
        this.carousel = document.getElementById(carouselId);
        this.indicatorsContainer = document.getElementById(indicatorsId);
        this.currentIndex = 0;
        this.items = [];
        this.autoPlayInterval = null;
    }

    async loadProjects() {
        try {
            const response = await fetch(`${API_BASE_URL}/projects`);
            const projects = await response.json();

            if (projects.length > 0) {
                this.renderProjects(projects);
                this.setupControls();
                this.startAutoPlay();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showErrorState();
        }
    }

    renderProjects(projects) {
        this.carousel.innerHTML = projects.map((project, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${project.imageUrl}" alt="${project.title}">
                <div class="carousel-caption">
                    <h3>${project.title}</h3>
                    <p style="font-size: 0.9rem; opacity: 0.9;">${project.description}</p>
                </div>
            </div>
        `).join('');

        this.items = this.carousel.querySelectorAll('.carousel-item');
        this.createIndicators(projects.length);
    }

    createIndicators(count) {
        this.indicatorsContainer.innerHTML = Array.from({ length: count }, (_, i) =>
            `<div class="indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');

        // Add click event to indicators
        this.indicatorsContainer.querySelectorAll('.indicator').forEach(indicator => {
            indicator.addEventListener('click', () => {
                this.goToSlide(parseInt(indicator.dataset.index));
            });
        });
    }

    setupControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) this.nextSlide();
            if (touchEndX > touchStartX + 50) this.previousSlide();
        };
        this.handleSwipe = handleSwipe;
    }

    goToSlide(index) {
        if (this.items.length === 0) return;

        // Remove active class from current slide
        this.items[this.currentIndex].classList.remove('active');

        // Update indicators
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        if (indicators[this.currentIndex]) {
            indicators[this.currentIndex].classList.remove('active');
        }

        // Update current index
        this.currentIndex = index;

        // Add active class to new slide
        this.items[this.currentIndex].classList.add('active');

        // Update indicators
        if (indicators[this.currentIndex]) {
            indicators[this.currentIndex].classList.add('active');
        }

        // Reset autoplay
        this.resetAutoPlay();
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.items.length;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    resetAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }

    showEmptyState() {
        this.carousel.innerHTML = `
            <div class="carousel-item active">
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: var(--wood-lightest); color: var(--wood-dark);">
                    <div style="text-align: center; padding: 2rem;">
                        <h3>No Projects Yet</h3>
                        <p>Check back soon for our latest work!</p>
                    </div>
                </div>
            </div>
        `;
    }

    showErrorState() {
        this.carousel.innerHTML = `
            <div class="carousel-item active">
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: var(--wood-lightest); color: var(--wood-dark);">
                    <div style="text-align: center; padding: 2rem;">
                        <h3>Unable to Load Projects</h3>
                        <p>Please check your connection and try again.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// ========================================
// Products Loading
// ========================================
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();

        if (products.length > 0) {
            productsGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageUrl}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">${product.price}</div>
                        <span class="product-category">${product.category}</span>
                    </div>
                </div>
            `).join('');
        } else {
            productsGrid.innerHTML = `
                <div class="product-card">
                    <div class="product-info" style="text-align: center; padding: 2rem;">
                        <h3>Products Coming Soon</h3>
                        <p>We're updating our catalog. Please check back later!</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="product-card">
                <div class="product-info" style="text-align: center; padding: 2rem;">
                    <h3>Unable to Load Products</h3>
                    <p>Please check your connection and try again.</p>
                </div>
            </div>
        `;
    }
}

// ========================================
// Contact Form Handling
// ========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('There was an error submitting your message. Please try again.', 'error');
        }
    });
}

// ========================================
// Smooth Scroll Animation on Scroll
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .product-card, .contact-item').forEach(el => {
    observer.observe(el);
});

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel
    const carousel = new Carousel('projectCarousel', 'carouselIndicators');
    carousel.loadProjects();

    // Load products
    loadProducts();

    // Load slider images
    loadSliderImages();

    // Check for Admin Login and update Navbar
    const token = localStorage.getItem('adminToken');
    if (token) {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = '<a href="admin-dashboard.html" class="nav-link" style="color: #e67e22; font-weight: bold;">Admin Dashboard</a>';
            navMenu.appendChild(adminLi);
        }
    }

    console.log('VASAN PLYWOODS website initialized successfully!');
});

// ========================================
// Continuous Slider Logic
// ========================================
async function loadSliderImages() {
    const sliderTrack = document.getElementById('sliderTrack');
    if (!sliderTrack) return;

    try {
        const response = await fetch(`${API_BASE_URL}/slider-images`);
        const images = await response.json();

        if (images.length > 0) {
            // Create items HTML
            const itemsHtml = images.map(image => `
                <div class="slider-item">
                    <img src="${image.image}" alt="${image.altText || 'Slider Image'}">
                </div>
            `).join('');

            // Duplicate for continuous effect
            sliderTrack.innerHTML = itemsHtml + itemsHtml;

            // Adjust speed: 3s per image
            const duration = images.length * 3;
            sliderTrack.style.animationDuration = `${duration}s`;
        } else {
            // Hide if empty
            const wrapper = document.querySelector('.slider-wrapper');
            if (wrapper) wrapper.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading slider images:', error);
    }
}

// ========================================
// Smooth Scrolling for Navigation Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
