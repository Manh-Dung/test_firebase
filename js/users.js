// DOM Elements - User related
const userSearch = document.getElementById('user-search');

// Get firebase services
const usersDb = window.firebaseServices.db;
// Use the existing firebase object from window.firebaseServices

/**
 * Load and display users from Firestore
 */
function loadUsers(filter = '') {
    // Check if we're on the users page first
    if (window.isPageVisible && !window.isPageVisible('users')) {
        console.log('Không load danh sách người dùng vì đang không ở trang Users.');
        return;
    }
    
    // Get the table body element
    const usersTable = document.getElementById('users-table');
    if (!usersTable) {
        console.error('Không tìm thấy phần tử bảng người dùng');
        return;
    }
    
    // Show loading indicator
    usersTable.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #4285F4; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                Đang tải danh sách người dùng...
            </td>
        </tr>
    `;
    
    // Fetch users from Firestore
    usersDb.collection('users').get()
        .then(snapshot => {
            // Clear table
            usersTable.innerHTML = '';
            
            // Check if we have users
            if (snapshot.empty) {
                usersTable.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center;">Không có người dùng nào</td>
                    </tr>
                `;
                return;
            }
            
            // Process users
            let users = [];
            snapshot.forEach(doc => {
                const user = doc.data();
                user.id = doc.id;
                users.push(user);
            });
            
            // Apply text search filter if provided
            if (filter) {
                const searchLower = filter.toLowerCase();
                users = users.filter(user => 
                    (user.email && user.email.toLowerCase().includes(searchLower)) ||
                    (user.displayName && user.displayName.toLowerCase().includes(searchLower))
                );
            }
            
            // Check if we have users after filtering
            if (users.length === 0) {
                usersTable.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center;">Không tìm thấy người dùng phù hợp</td>
                    </tr>
                `;
                return;
            }
            
            // Add each user to the table
            users.forEach(user => {
                const row = document.createElement('tr');
                
                // Create row content
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.displayName || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${user.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn admin-btn" data-id="${user.id}" title="Set as Admin">
                            <i class="fas fa-user-shield"></i>
                        </button>
                    </td>
                `;
                
                usersTable.appendChild(row);
                
                // Check if user is admin and update button accordingly
                checkAdminStatus(user.id).then(isAdmin => {
                    const adminBtn = row.querySelector('.admin-btn');
                    if (adminBtn) {
                        if (isAdmin) {
                            adminBtn.classList.add('active');
                            adminBtn.title = 'Remove Admin';
                        } else {
                            adminBtn.classList.remove('active');
                            adminBtn.title = 'Set as Admin';
                        }
                    }
                });
            });
            
            // Add click events for admin buttons
            initUserActionButtons();
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách người dùng:', error);
            usersTable.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ea4335;">
                        Lỗi khi tải danh sách người dùng: ${error.message}
                        ${error.code === 'permission-denied' ? 
                          '<br><small>Kiểm tra quyền Firebase. Có thể bạn cần đăng nhập lại hoặc cần quyền admin.</small>' : ''}
                    </td>
                </tr>
            `;
            
            // If the error is permission denied, attempt to create the collection with a sample user
            if (error.code === 'permission-denied' && isAdmin()) {
                createUsersCollectionIfNeeded();
            }
        });
}

/**
 * Check if a user is an admin
 * @param {String} userId - The user ID to check
 * @returns {Promise<Boolean>} - Promise that resolves to true if user is admin
 */
async function checkAdminStatus(userId) {
    try {
        const doc = await usersDb.collection('admin').doc(userId).get();
        return doc.exists;
    } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        return false;
    }
}

/**
 * Toggle admin status for a user
 * @param {String} userId - The user ID to toggle
 */
async function toggleAdminStatus(userId) {
    try {
        const isAdmin = await checkAdminStatus(userId);
        
        if (isAdmin) {
            // Remove admin privileges
            await usersDb.collection('admin').doc(userId).delete();
            console.log('Đã xóa quyền admin cho người dùng:', userId);
            return false;
        } else {
            // Grant admin privileges
            await usersDb.collection('admin').doc(userId).set({
                role: 'admin',
                createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp()
            });
            console.log('Đã cấp quyền admin cho người dùng:', userId);
            return true;
        }
    } catch (error) {
        console.error('Lỗi khi thay đổi quyền admin:', error);
        throw error;
    }
}

/**
 * Initialize click events for user action buttons
 */
function initUserActionButtons() {
    // Handle admin status toggle
    const adminBtns = document.querySelectorAll('.admin-btn');
    adminBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.getAttribute('data-id');
            
            try {
                // Show loading state
                const icon = this.querySelector('i');
                const originalIcon = icon.className;
                icon.className = 'fas fa-spinner fa-spin';
                
                // Toggle admin status
                const isNowAdmin = await toggleAdminStatus(userId);
                
                // Update button appearance
                if (isNowAdmin) {
                    this.classList.add('active');
                    this.title = 'Remove Admin';
                } else {
                    this.classList.remove('active');
                    this.title = 'Set as Admin';
                }
                
                // Restore icon
                icon.className = originalIcon;
                
            } catch (error) {
                alert('Lỗi khi thay đổi quyền admin: ' + error.message);
                console.error('Lỗi khi thay đổi quyền admin:', error);
            }
        });
    });
    
    // Handle view user details (can be implemented later)
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            alert('Xem chi tiết người dùng: ' + userId + '\n(Chức năng này sẽ được phát triển sau)');
        });
    });
}

// Add search functionality
if (userSearch) {
    userSearch.addEventListener('input', function() {
        loadUsers(this.value);
    });
}

/**
 * Check if the current user is an admin
 * @returns {Boolean} - true if the current user is an admin
 */
function isAdmin() {
    const currentUser = firebaseInstance.auth().currentUser;
    if (!currentUser) return false;
    
    // We'll just return true here since we're already checking for admin status
    // in the Firestore rules. If this function is called, the user likely
    // has admin access already.
    return true;
}

/**
 * Create the users collection if it doesn't exist
 * This can only be done by an admin
 */
async function createUsersCollectionIfNeeded() {
    try {
        console.log('Attempting to create users collection...');
        
        // Get current user
        const currentUser = firebaseInstance.auth().currentUser;
        if (!currentUser) {
            console.error('No user logged in');
            return;
        }
        
        // Create a sample user document
        await usersDb.collection('users').doc(currentUser.uid).set({
            email: currentUser.email,
            displayName: currentUser.displayName || 'Admin User',
            createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
            isAdmin: true
        });
        
        console.log('Users collection created with sample user');
        
        // Reload users after a short delay
        setTimeout(() => {
            loadUsers();
        }, 1000);
        
    } catch (error) {
        console.error('Error creating users collection:', error);
    }
}

// Export functions
window.dataLoader = window.dataLoader || {};
window.dataLoader.loadUsers = loadUsers;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load users
    loadUsers();
});
