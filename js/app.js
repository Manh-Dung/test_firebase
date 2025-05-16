// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Firebase web application initialized');
    
    // Centralized page visibility tracking
    window.appState = {
        currentPage: 'dashboard', // Default page
        isAuthenticated: false
    };
    
    // Initialize main data loaders when user is authenticated
    window.firebaseServices.firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.appState.isAuthenticated = true;
            
            // Load data for the current page
            loadCurrentPageData();
        } else {
            window.appState.isAuthenticated = false;
        }
    });
    
    // Add event listener for page navigation
    const navItems = document.querySelectorAll('.sidebar-menu li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                // Update UI
                navItems.forEach(navItem => navItem.classList.remove('active'));
                this.classList.add('active');
                
                // Hide all pages
                document.querySelectorAll('.content-page').forEach(page => {
                    page.classList.remove('active');
                });
                
                // Show selected page
                const selectedPage = document.getElementById(`${pageId}-page`);
                if (selectedPage) {
                    selectedPage.classList.add('active');
                    window.appState.currentPage = pageId;
                    
                    // Load data for the selected page
                    loadCurrentPageData();
                }
            }
        });
    });
    
    // Handle closing sidebar on mobile when clicking a menu item
    const sidebar = document.querySelector('.sidebar');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close sidebar on mobile
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    });
});

// Centralized function to check if a page is currently visible
window.isPageVisible = function(pageId) {
    const page = document.getElementById(`${pageId}-page`);
    return page && page.classList.contains('active');
};

// Cập nhật hàm loadDashboardData để hiển thị số liệu tổng quan
function loadDashboardData() {
    console.log('Đang tải dữ liệu dashboard...');
    const db = window.firebaseServices.db;
    
    // Tải tổng số đơn hàng
    db.collection('order').get().then(snapshot => {
        const totalOrders = snapshot.size;
        const totalOrdersElement = document.getElementById('total-orders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = totalOrders;
        }
        
        // Tính tổng doanh thu
        let totalRevenue = 0;
        snapshot.forEach(doc => {
            const order = doc.data();
            if (order.products && order.products.length > 0) {
                totalRevenue += order.products.reduce((sum, product) => {
                    return sum + (product.totalPrice || 0);
                }, 0);
            }
        });
        
        // Hiển thị tổng doanh thu
        const totalRevenueElement = document.getElementById('total-revenue');
        if (totalRevenueElement) {
            totalRevenueElement.textContent = totalRevenue.toLocaleString('vi-VN') + ' ₫';
        }
        
        // Tải đơn hàng gần đây
        loadRecentOrders(snapshot.docs);
    }).catch(error => {
        console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
    });
    
    // Tải tổng số sản phẩm
    db.collection('product').get().then(snapshot => {
        const totalProducts = snapshot.size;
        const totalProductsElement = document.getElementById('total-products');
        if (totalProductsElement) {
            totalProductsElement.textContent = totalProducts;
        }
    }).catch(error => {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
    });
    
    // Tải tổng số người dùng
    db.collection('users').get().then(snapshot => {
        const totalUsers = snapshot.size;
        const totalUsersElement = document.getElementById('total-users');
        if (totalUsersElement) {
            totalUsersElement.textContent = totalUsers;
        }
    }).catch(error => {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
    });
}

// Tải đơn hàng gần đây cho dashboard
function loadRecentOrders(orders) {
    const recentOrdersElement = document.getElementById('recent-orders');
    if (!recentOrdersElement) {
        console.error('Không tìm thấy phần tử recent-orders');
        return;
    }
    
    // Nếu không có đơn hàng
    if (!orders || orders.length === 0) {
        recentOrdersElement.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">Không có đơn hàng nào</td>
            </tr>
        `;
        return;
    }
    
    // Sắp xếp đơn hàng theo thời gian (mới nhất trước)
    orders.sort((a, b) => {
        const orderA = a.data();
        const orderB = b.data();
        if (orderA.orderId && orderB.orderId) {
            return orderB.orderId - orderA.orderId;
        }
        return 0;
    });
    
    // Chỉ hiển thị 5 đơn hàng gần nhất
    const recentOrders = orders.slice(0, 5);
    recentOrdersElement.innerHTML = '';
    
    // Thêm từng đơn hàng vào bảng
    recentOrders.forEach(doc => {
        const order = doc.data();
        const orderId = doc.id;
        
        // Tính tổng giá trị đơn hàng
        let orderTotal = 0;
        if (order.products && order.products.length > 0) {
            orderTotal = order.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
        }
        
        // Tạo hàng dữ liệu
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderId || 'N/A'}</td>
            <td>${order.date || 'N/A'}</td>
            <td><span class="status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">${order.orderStatus || 'Pending'}</span></td>
            <td>${order.userId || 'N/A'}</td>
            <td>${orderTotal.toLocaleString('vi-VN')} ₫</td>
            <td>
                <button class="action-btn view-btn" data-id="${orderId}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        recentOrdersElement.appendChild(row);
        
        // Thêm sự kiện xem chi tiết đơn hàng
        const viewBtn = row.querySelector('.view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                // Chuyển đến trang Orders
                const ordersTab = document.querySelector('.sidebar-menu li[data-page="orders"]');
                if (ordersTab) {
                    ordersTab.click();
                }
                
                // Hiển thị chi tiết đơn hàng sau khi chuyển trang
                setTimeout(() => {
                    const viewOrderDetails = window.viewOrderDetails;
                    if (typeof viewOrderDetails === 'function') {
                        viewOrderDetails(orderId);
                    }
                }, 300);
            });
        }
    });
}

// Function to load data for the current page
function loadCurrentPageData() {
    // Check if user is authenticated
    if (!window.appState.isAuthenticated) {
        console.log('Người dùng chưa đăng nhập, không tải dữ liệu.');
        return;
    }
    
    const currentPage = window.appState.currentPage;
    console.log('Tải dữ liệu cho trang:', currentPage);
    
    try {
        // Load data based on current page
        switch (currentPage) {
            case 'dashboard':
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                break;
            case 'products':
                if (window.dataLoader && typeof window.dataLoader.loadProducts === 'function') {
                    window.dataLoader.loadProducts();
                }
                break;
            case 'orders':
                if (window.dataLoader && typeof window.dataLoader.loadOrders === 'function') {
                    window.dataLoader.loadOrders();
                }
                break;
            case 'users':
                if (window.dataLoader && typeof window.dataLoader.loadUsers === 'function') {
                    window.dataLoader.loadUsers();
                }
                break;
            default:
                console.log('Không có hàm tải dữ liệu cho trang:', currentPage);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu cho trang', currentPage, ':', error);
    }
}

// Export các hàm cần thiết
window.loadDashboardData = loadDashboardData;
