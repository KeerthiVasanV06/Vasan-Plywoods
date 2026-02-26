const API_URL = `${window.location.origin}/api`;

// ========================================
// Toast Notification Logic
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

    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// ========================================
// Custom Confirmation Dialog
// ========================================
function createConfirmDialogForAdmin() {
    let overlay = document.getElementById('confirm-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'confirm-overlay';
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon"><i class="fas fa-question-circle"></i></div>
                <div class="confirm-title">Are you sure?</div>
                <div class="confirm-message" id="confirm-message-text">Do you really want to perform this action?</div>
                <div class="confirm-buttons">
                    <button class="btn-confirm-no" id="btn-confirm-no">Cancel</button>
                    <button class="btn-confirm-yes" id="btn-confirm-yes">Yes, Delete It</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    return overlay;
}

function createPhoneDialog() {
    let overlay = document.getElementById('phone-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'phone-overlay';
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon"><i class="fas fa-phone-alt"></i></div>
                <div class="confirm-title" style="color:var(--primary-color)">Start a Call</div>
                <div class="confirm-message" id="phone-message-text" style="margin-bottom: 1.5rem;">Do you want to call this number?</div>
                <div class="confirm-buttons" style="flex-wrap: wrap; gap: 10px;">
                    <button class="btn-confirm-no" id="btn-phone-cancel">Cancel</button>
                    <button class="btn-confirm-yes" id="btn-phone-call">Call Now</button>
                    <button class="btn-confirm-no" id="btn-phone-copy" style="background: var(--secondary-color); color: white;">Copy</button>
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

    // Clean up old listeners
    const newCallBtn = callBtn.cloneNode(true);
    callBtn.replaceWith(newCallBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.replaceWith(newCancelBtn);

    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.replaceWith(newCopyBtn);

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

function showConfirmDialog(message, title = 'Are you sure?') {
    return new Promise((resolve) => {
        const overlay = createConfirmDialogForAdmin();
        const messageEl = document.getElementById('confirm-message-text');
        const titleEl = overlay.querySelector('.confirm-title');
        const yesBtn = document.getElementById('btn-confirm-yes');
        const noBtn = document.getElementById('btn-confirm-no');

        messageEl.textContent = message;
        titleEl.textContent = title;

        // Show overlay
        overlay.classList.add('active');

        const closeDialog = (result) => {
            overlay.classList.remove('active');
            // Clean up event listeners to avoid duplicates
            yesBtn.replaceWith(yesBtn.cloneNode(true));
            noBtn.replaceWith(noBtn.cloneNode(true));
            resolve(result);
        };

        // Re-select buttons after cloning (listeners removed) or first create
        document.getElementById('btn-confirm-yes').addEventListener('click', () => closeDialog(true));
        document.getElementById('btn-confirm-no').addEventListener('click', () => closeDialog(false));
    });
}

// ========================================
// Authentication Logic
// ========================================

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.token) {
                localStorage.setItem('adminToken', data.token);
                window.location.href = 'admin-dashboard.html';
            } else {
                errorMsg.textContent = data.message || 'Login failed';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMsg.textContent = 'An error occurred. Please try again.';
            errorMsg.style.display = 'block';
        }
    });
}

// Logout Logic (Sidebar)
const logoutBtnSide = document.getElementById('logoutBtnSide');
if (logoutBtnSide) {
    logoutBtnSide.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    });
}

// ========================================
// Dashboard Navigation
// ========================================

// Sidebar Toggle
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
if (sidebarLinks.length > 0) {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'logoutBtnSide') return;

            e.preventDefault();

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

            // Show target section
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ========================================
// Data Management
// ========================================

// --- Projects (Carousel) ---

const addProjectForm = document.getElementById('addProjectForm');
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const formData = new FormData(addProjectForm);

        try {
            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast('Project added successfully!', 'success');
                addProjectForm.reset();
                fetchProjectsAdmin();
            } else {
                const data = await response.json();
                showToast('Failed to add project: ' + data.message, 'error');
            }
        } catch (error) { showToast('An error occurred', 'error'); }
    });
}

async function fetchProjectsAdmin() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        // Update stats
        const statsProjects = document.getElementById('stats-projects');
        if (statsProjects) statsProjects.textContent = projects.length;

        projectsList.innerHTML = '';
        projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                <div class="product-info">
                    <img src="${API_URL.replace('/api', '')}${project.imageUrl}" alt="${project.title}" class="product-thumb">
                    <div>
                        <strong>${project.title}</strong><br>
                        <small>${project.category}</small>
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteProject('${project._id}')">Delete</button>
            `;
            projectsList.appendChild(div);
        });
    } catch (error) { projectsList.innerHTML = '<p>Error loading projects.</p>'; }
}

window.deleteProject = async (id) => {
    const confirmed = await showConfirmDialog('This action will permanently delete the project.', 'Delete Project?');
    if (!confirmed) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) fetchProjectsAdmin();
        else showToast('Failed to delete', 'error');
    } catch (error) { showToast('Error deleting project', 'error'); }
};

// --- Products ---

const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const formData = new FormData(addProductForm);
        formData.set('featured', document.getElementById('featured').checked);

        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast('Product added successfully!', 'success');
                addProductForm.reset();
                fetchProductsAdmin();
            } else {
                const data = await response.json();
                showToast('Failed to add product: ' + data.message, 'error');
            }
        } catch (error) { showToast('An error occurred', 'error'); }
    });
}

async function fetchProductsAdmin() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        // Update stats
        const statsProducts = document.getElementById('stats-products');
        if (statsProducts) statsProducts.textContent = products.length;

        productsList.innerHTML = '';
        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                <div class="product-info">
                    <img src="${API_URL.replace('/api', '')}${product.imageUrl}" alt="${product.name}" class="product-thumb">
                    <div>
                        <strong>${product.name}</strong><br>
                        <small>${product.category}</small>
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
            `;
            productsList.appendChild(div);
        });
    } catch (error) { productsList.innerHTML = '<p>Error loading products.</p>'; }
}

window.deleteProduct = async (id) => {
    const confirmed = await showConfirmDialog('This product will be removed from your catalog.', 'Delete Product?');
    if (!confirmed) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) fetchProductsAdmin();
        else showToast('Failed to delete', 'error');
    } catch (error) { showToast('Error deleting product', 'error'); }
};

// --- Slider Images ---

const addSliderForm = document.getElementById('addSliderForm');
if (addSliderForm) {
    addSliderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const formData = new FormData(addSliderForm);

        try {
            const response = await fetch(`${API_URL}/slider-images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast('Slider image added!', 'success');
                addSliderForm.reset();
                fetchSliderImagesAdmin();
            } else {
                const data = await response.json();
                showToast('Failed: ' + data.message, 'error');
            }
        } catch (error) { showToast('Error occurred', 'error'); }
    });
}

async function fetchSliderImagesAdmin() {
    const sliderList = document.getElementById('sliderList');
    if (!sliderList) return;

    try {
        const response = await fetch(`${API_URL}/slider-images`);
        const images = await response.json();

        sliderList.innerHTML = '';
        if (images.length === 0) {
            sliderList.innerHTML = '<p>No slider images.</p>';
            return;
        }

        images.forEach(image => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                <div class="product-info">
                    <img src="${API_URL.replace('/api', '')}${image.image}" alt="${image.altText}" class="product-thumb">
                    <div>
                        <strong>${image.altText || 'No description'}</strong><br>
                        <small>Active</small>
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteSliderImage('${image._id}')">Delete</button>
            `;
            sliderList.appendChild(div);
        });
    } catch (error) { sliderList.innerHTML = '<p>Error loading slider images.</p>'; }
}

window.deleteSliderImage = async (id) => {
    const confirmed = await showConfirmDialog('This image will be removed from the slider.', 'Remove Image?');
    if (!confirmed) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_URL}/slider-images/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) fetchSliderImagesAdmin();
        else showToast('Failed to delete', 'error');
    } catch (error) { showToast('Error deleting slider image', 'error'); }
};

// --- Messages ---

async function fetchMessagesAdmin() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await response.json();

        // Update stats
        const statsMessages = document.getElementById('stats-messages');
        if (statsMessages) statsMessages.textContent = messages.length;

        messagesList.innerHTML = '';
        if (messages.length === 0) {
            messagesList.innerHTML = '<p style="padding: 1rem; color: #666;">No new messages.</p>';
            return;
        }

        messages.forEach(msg => {
            const date = new Date(msg.date).toLocaleString();
            const div = document.createElement('div');
            div.className = 'message-item';
            div.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${msg.name}</span>
                    <span class="message-date">${date}</span>
                </div>
                <div class="message-contact">
                    <span><i class="fas fa-envelope"></i> ${msg.email}</span>
                    <span><i class="fas fa-phone"></i> <a href="tel:${msg.phone}" style="text-decoration: none; color: inherit;">${msg.phone}</a></span>
                </div>
                <div class="message-body">
                    ${msg.message}
                </div>
                <div class="message-actions">
                    <button class="btn-delete" onclick="deleteMessage('${msg._id}')">Delete</button>
                </div>
            `;
            messagesList.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        messagesList.innerHTML = '<p style="padding: 1rem;">Error loading messages.</p>';
    }
}

window.deleteMessage = async (id) => {
    const confirmed = await showConfirmDialog('This message will be permanently deleted.', 'Delete Message?');
    if (!confirmed) return;
    const token = localStorage.getItem('adminToken');

    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) fetchMessagesAdmin();
        else showToast('Failed to delete message', 'error');
    } catch (error) { showToast('An error occurred', 'error'); }
}

// ========================================
// Initialization
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-wrapper')) {
        fetchProductsAdmin();
        fetchProjectsAdmin();
        fetchSliderImagesAdmin();
        fetchMessagesAdmin();
    }
});
window.fetchSliderImagesAdmin = fetchSliderImagesAdmin; // Make global if needed

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
