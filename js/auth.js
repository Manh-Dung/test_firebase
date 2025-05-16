// DOM Elements - Auth related
let authContainer, dashboardContainer, adminEmail;
let loginTab, registerTab, loginForm, registerForm, loginBtn, registerBtn, loginEmail, loginPassword;
let registerEmail, registerPassword, registerConfirm, loginError, registerError, logoutBtn;

// Initialize DOM elements only if they don't exist and are in the DOM
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if elements exist in DOM
    if (document.getElementById('auth-container')) {
        authContainer = document.getElementById('auth-container');
        dashboardContainer = document.getElementById('dashboard-container');
        adminEmail = document.getElementById('admin-email');

        // Login form elements
        loginTab = document.getElementById('login-tab');
        registerTab = document.getElementById('register-tab');
        loginForm = document.getElementById('login-form');
        registerForm = document.getElementById('register-form');
        loginBtn = document.getElementById('login-btn');
        registerBtn = document.getElementById('register-btn');
                loginEmail = document.getElementById('login-email');
        loginPassword = document.getElementById('login-password');
        registerEmail = document.getElementById('register-email');
        registerPassword = document.getElementById('register-password');
        registerConfirm = document.getElementById('register-confirm');
        loginError = document.getElementById('login-error');
        registerError = document.getElementById('register-error');
        logoutBtn = document.getElementById('logout-btn');
        
        // Initialize auth functionality once elements are available
        // Function to initialize auth-related functionality
function initializeAuth() {
    // Get firebase services
    const firebaseAuth = window.firebaseServices.auth;
    const firestoreDb = window.firebaseServices.db;
    
    // Toggle between login and register tabs
    loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Show loading state on button
function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.opacity = '0';
        btnLoader.style.display = 'flex';
        button.disabled = true;
    } else {
        btnText.style.opacity = '1';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Check if a user is an admin
async function checkIfAdmin(userId) {
    try {
        const adminDoc = await firestoreDb.collection('admin').doc(userId).get();
        return adminDoc.exists;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Authentication
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    // Validate inputs
    if (!email || !password) {
        loginError.textContent = 'Please enter both email and password';
        return;
    }
    
    // Show loading state
    setButtonLoading(loginBtn, true);
    loginError.textContent = '';
    
    try {
        // Sign in with Firebase Auth
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user is an admin
        const isAdmin = await checkIfAdmin(user.uid);
        
        if (!isAdmin) {
            // If not admin, sign out and show error
            await firebaseAuth.signOut();
            loginError.textContent = 'Access denied. Only admin accounts can log in.';
        } else {
            // Clear inputs
            loginEmail.value = '';
            loginPassword.value = '';
            console.log('Admin logged in successfully!');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message;
    } finally {
        setButtonLoading(loginBtn, false);
    }
});

registerBtn.addEventListener('click', async () => {
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirm.value.trim();
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
        registerError.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        registerError.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Show loading state
    setButtonLoading(registerBtn, true);
    registerError.textContent = '';
    
    try {
        // Create user with Firebase Auth
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Add user to admin collection in Firestore
        await firestoreDb.collection('admin').doc(user.uid).set({
            email: email,
            createdAt: new Date(),
        });
        
        // Clear inputs
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirm.value = '';
        
        // Switch to login tab
        loginTab.click();
        console.log('Admin account created successfully!');
        
        // Show success message
        loginError.textContent = 'Registration successful! You can now log in.';
        loginError.style.color = '#34A853';
    } catch (error) {
        console.error('Registration error:', error);
        registerError.textContent = error.message;
    } finally {
        setButtonLoading(registerBtn, false);
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await firebaseAuth.signOut();
        console.log('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Auth state change listener
firebaseAuth.onAuthStateChanged(async (user) => {
    if (user) {
        // Check if user is an admin
        const isAdmin = await checkIfAdmin(user.uid);
        
        if (isAdmin) {
            // Show dashboard
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'flex';
            adminEmail.textContent = user.email;
            
            // Load dashboard data
            loadDashboardData();
        } else {
            // If not admin, sign out
            console.log('Non-admin user tried to access admin panel');
            await firebaseAuth.signOut();
        }
    } else {
        // User is signed out
        authContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
        
        // Clear any error messages
        loginError.textContent = '';
        registerError.textContent = '';
        loginError.style.color = '#ea4335';
    }
});

// Load dashboard data
function loadDashboardData() {
    // Load orders count for dashboard
    firestoreDb.collection('order').get().then(snapshot => {
        document.getElementById('total-orders').textContent = snapshot.size;
        
        // Load recent orders for dashboard
        const recentOrdersElement = document.getElementById('recent-orders');
        recentOrdersElement.innerHTML = '';
        
        let totalRevenue = 0;
        
        snapshot.forEach(doc => {
            const order = doc.data();
            
            // Calculate order total
            let orderTotal = 0;
            if (order.products && order.products.length > 0) {
                orderTotal = order.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
            }
            
            // Add to total revenue
            totalRevenue += orderTotal;
            
            // Add recent order to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderId || doc.id}</td>
                <td>${order.date || 'N/A'}</td>
                <td><span class="status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">${order.orderStatus || 'Pending'}</span></td>
                <td>${order.userId || 'N/A'}</td>
                <td>${orderTotal.toLocaleString('vi-VN')} ₫</td>
                <td>
                    <button class="action-btn view-btn" data-id="${doc.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            recentOrdersElement.appendChild(row);
        });
        
        // Update revenue
        document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('vi-VN') + ' ₫';
    }).catch(error => {
        console.error('Error loading orders:', error);
    });
    
    // Load products count
    firestoreDb.collection('product').get().then(snapshot => {
        document.getElementById('total-products').textContent = snapshot.size;
    }).catch(error => {
        console.error('Error loading products:', error);
    });
    
    // Load users count
    firestoreDb.collection('user').get().then(snapshot => {
        document.getElementById('total-users').textContent = snapshot.size;
    }).catch(error => {
        console.error('Error loading users:', error);
    });
}

// End of initializeAuth function
}
