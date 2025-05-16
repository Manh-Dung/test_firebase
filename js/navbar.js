// DOM Elements - Navigation
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const menuItems = document.querySelectorAll('.sidebar-menu li');
const contentPages = document.querySelectorAll('.content-page');

// Toggle sidebar on mobile
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// We'll let app.js handle the page navigation to centralize the data loading
// The event listeners in app.js will handle page switching now

// Auto-load products when switching to Products page
const productsMenuItem = document.querySelector('li[data-page="products"]');
if (productsMenuItem) {
    productsMenuItem.addEventListener('click', () => {
        // Use a short timeout to ensure DOM updates are complete
        setTimeout(() => {
            if (window.isPageVisible && window.isPageVisible('products') && 
                window.dataLoader && typeof window.dataLoader.loadProducts === 'function') {
                window.dataLoader.loadProducts();
            }
        }, 100);
    });
}

// Add event listener for Orders page
const ordersMenuItem = document.querySelector('li[data-page="orders"]');
if (ordersMenuItem) {
    ordersMenuItem.addEventListener('click', () => {
        // Use a short timeout to ensure DOM updates are complete
        setTimeout(() => {
            if (window.isPageVisible && window.isPageVisible('orders') && 
                typeof loadOrders === 'function') {
                loadOrders();
            }
        }, 100);
    });
}

// Modal handling
const modals = document.querySelectorAll('.modal');
const modalCloseButtons = document.querySelectorAll('.close-modal');

// Close modal function
function closeAllModals() {
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Close modal when clicking close button
modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeAllModals);
});

// Close modal when clicking outside modal content
window.addEventListener('click', (event) => {
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Open modal function (to be used by other scripts)
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
};