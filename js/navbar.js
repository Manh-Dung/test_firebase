// DOM Elements - Navigation
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const menuItems = document.querySelectorAll('.sidebar-menu li');
const contentPages = document.querySelectorAll('.content-page');

// Toggle sidebar on mobile
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Navigation between pages
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all menu items
        menuItems.forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        
        // Add active class to clicked menu item
        item.classList.add('active');
        
        // Get page to show
        const pageId = item.getAttribute('data-page');
        
        // Hide all pages
        contentPages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const selectedPage = document.getElementById(`${pageId}-page`);
        if (selectedPage) {
            selectedPage.classList.add('active');
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

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