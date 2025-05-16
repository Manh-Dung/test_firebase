// DOM Elements - Auth related
const loginForm = document.getElementById('login-form');
const userDetails = document.getElementById('user-details');
const userEmail = document.getElementById('user-email');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Get firebase services without redeclaring
const firebaseAuth = window.firebaseServices.auth;
const firebaseSDK = window.firebaseServices.firebase;

// Authentication
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    firebaseAuth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Clear inputs
            emailInput.value = '';
            passwordInput.value = '';
            console.log('Logged in successfully!');
        })
        .catch((error) => {
            console.error('Login error:', error.message);
            alert(`Login failed: ${error.message}`);
        });
});

signupBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    firebaseAuth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Clear inputs
            emailInput.value = '';
            passwordInput.value = '';
            console.log('Account created successfully!');
        })
        .catch((error) => {
            console.error('Signup error:', error.message);
            alert(`Signup failed: ${error.message}`);
        });
});

logoutBtn.addEventListener('click', () => {
    firebaseAuth.signOut()
        .then(() => {
            console.log('Logged out successfully!');
        })
        .catch((error) => {
            console.error('Logout error:', error.message);
        });
});

// Auth state change listener
firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginForm.style.display = 'none';
        userDetails.style.display = 'block';
        userEmail.textContent = user.email;
        
        // Load data after authentication
        window.dataLoader.loadItems(user.uid);
        window.dataLoader.loadProducts();
    } else {
        // User is signed out
        loginForm.style.display = 'block';
        userDetails.style.display = 'none';
        
        // Clear data displays
        document.getElementById('data-list').innerHTML = '';
        document.getElementById('product-table-body').innerHTML = '';
    }
});
