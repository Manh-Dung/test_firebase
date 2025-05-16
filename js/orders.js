// DOM Elements - Orders
const orderSearch = document.getElementById('order-search');
const statusFilter = document.getElementById('status-filter');
const updateOrderBtn = document.getElementById('update-order-btn');

// Get firebase services
const ordersDb = window.firebaseServices.db;
// Sử dụng biến toàn cục thay vì khai báo const để tránh xung đột
firebaseInstance = window.firebaseServices.firebase;

// Current order being viewed
let currentOrderId = null;

// Load all orders
function loadOrders(filter = '', status = '') {
    // Check if we're on the orders page first
    if (window.isPageVisible && !window.isPageVisible('orders')) {
        console.log('Không load đơn hàng vì đang không ở trang Orders.');
        return;
    }

    // Thay đổi ID này từ order-table-body thành orders-table để phù hợp với HTML
    const ordersTable = document.getElementById('orders-table');
    if (!ordersTable) {
        console.error('Không tìm thấy phần tử bảng đơn hàng');
        return;
    }
    
    // Show loading state
    ordersTable.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #4285F4; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                Loading orders...
            </td>
        </tr>
    `;
    
    // Create query
    let query = ordersDb.collection('order');
    
    // Apply status filter if provided
    if (status) {
        query = query.where('orderStatus', '==', status);
    }
    
    // Execute query
    query.get().then(snapshot => {
        // Clear table
        ordersTable.innerHTML = '';
        
        // Check if we have orders
        if (snapshot.empty) {
            ordersTable.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">No orders found</td>
                </tr>
            `;
            return;
        }
        
        // Process orders
        let orders = [];
        snapshot.forEach(doc => {
            const order = doc.data();
            order.id = doc.id;
            orders.push(order);
        });
        
        // Apply text search filter if provided
        if (filter) {
            const searchLower = filter.toLowerCase();
            orders = orders.filter(order => 
                (order.orderId && order.orderId.toString().includes(searchLower)) ||
                (order.userId && order.userId.toLowerCase().includes(searchLower)) ||
                (order.orderStatus && order.orderStatus.toLowerCase().includes(searchLower))
            );
        }
        
        // Check if we have orders after filtering
        if (orders.length === 0) {
            ordersTable.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">No orders matching your search</td>
                </tr>
            `;
            return;
        }
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => {
            if (a.orderId && b.orderId) {
                return b.orderId - a.orderId;
            }
            return 0;
        });
        
        // Add each order to the table
        orders.forEach(order => {
            // Calculate total items
            const totalItems = order.products ? order.products.length : 0;
            
            // Calculate order total
            let orderTotal = 0;
            if (order.products && order.products.length > 0) {
                orderTotal = order.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
            }
            
            // Create row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderId || 'N/A'}</td>
                <td>${order.date || 'N/A'}</td>
                <td><span class="status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">${order.orderStatus || 'Pending'}</span></td>
                <td>${order.userId || 'N/A'}</td>
                <td>${totalItems} item(s)</td>
                <td>${orderTotal.toLocaleString('vi-VN')} ₫</td>
                <td>
                    <button class="action-btn view-btn" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            ordersTable.appendChild(row);
            
            // Add click event to view button
            const viewBtn = row.querySelector('.view-btn');
            viewBtn.addEventListener('click', () => {
                viewOrderDetails(order.id);
            });
        });
    }).catch(error => {
        console.error('Error loading orders:', error);
        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #ea4335;">
                    Error loading orders: ${error.message}
                </td>
            </tr>
        `;
    });
}

// Expose viewOrderDetails to window
window.viewOrderDetails = viewOrderDetails;

// Cải thiện hiển thị thông tin đơn hàng
function viewOrderDetails(orderId) {
    // Store current order ID
    currentOrderId = orderId;
    
    // Get the order details container
    const orderDetails = document.getElementById('order-details');
    if (!orderDetails) {
        console.error('Không tìm thấy phần tử hiển thị chi tiết đơn hàng');
        return;
    }
    
    // Show loading state
    orderDetails.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #4285F4; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            <p>Đang tải thông tin đơn hàng...</p>
        </div>
    `;
    
    // Open the order modal
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.style.display = 'flex';
    }
    
    // Fetch order details
    ordersDb.collection('order').doc(orderId).get()
        .then(doc => {
            if (!doc.exists) {
                orderDetails.innerHTML = `<p class="error-message">Không tìm thấy thông tin đơn hàng</p>`;
                return;
            }
            
            const order = doc.data();
            order.id = doc.id;
            
            // Calculate order total
            let orderTotal = 0;
            if (order.products && order.products.length > 0) {
                orderTotal = order.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
            }
            
            // Set current status in dropdown
            const statusSelect = document.getElementById('order-status');
            if (statusSelect && order.orderStatus) {
                for (let i = 0; i < statusSelect.options.length; i++) {
                    if (statusSelect.options[i].value === order.orderStatus) {
                        statusSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Format products list
            let productsHTML = '';
            if (order.products && order.products.length > 0) {
                productsHTML = `
                    <div class="order-products">
                        <h3>Sản phẩm (${order.products.length})</h3>
                        <table class="order-products-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                order.products.forEach(product => {
                    productsHTML += `
                        <tr>
                            <td>
                                <div class="product-info">
                                    ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" width="40" height="40">` : ''}
                                    <span>${product.name || 'Sản phẩm'}</span>
                                </div>
                            </td>
                            <td>${product.quantity || 1}</td>
                            <td>${(product.price || 0).toLocaleString('vi-VN')} ₫</td>
                            <td>${(product.totalPrice || 0).toLocaleString('vi-VN')} ₫</td>
                        </tr>
                    `;
                });
                
                productsHTML += `
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="total-label">Tổng cộng:</td>
                                    <td class="total-value">${orderTotal.toLocaleString('vi-VN')} ₫</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `;
            } else {
                productsHTML = '<p>Không có thông tin sản phẩm</p>';
            }
            
            // Render order details
            orderDetails.innerHTML = `
                <div class="order-header">
                    <div class="order-id">
                        <span class="label">Mã đơn hàng:</span>
                        <span class="value">#${order.orderId || 'N/A'}</span>
                    </div>
                    <div class="order-date">
                        <span class="label">Ngày đặt:</span>
                        <span class="value">${order.date || 'N/A'}</span>
                    </div>
                    <div class="order-status">
                        <span class="label">Trạng thái:</span>
                        <span class="value status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">${order.orderStatus || 'Pending'}</span>
                    </div>
                </div>
                
                <div class="order-info">
                    <div class="customer-info">
                        <h3>Thông tin khách hàng</h3>
                        <p><strong>Người dùng:</strong> ${order.userId || 'N/A'}</p>
                        <p><strong>Tên:</strong> ${order.shippingAddress?.name || 'N/A'}</p>
                        <p><strong>Số điện thoại:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                    
                    <div class="shipping-info">
                        <h3>Thông tin giao hàng</h3>
                        <p><strong>Địa chỉ:</strong> ${formatAddress(order.shippingAddress)}</p>
                        <p><strong>Ghi chú:</strong> ${order.note || 'Không có'}</p>
                    </div>
                </div>
                
                ${productsHTML}
            `;
            
        })
        .catch(error => {
            console.error('Error loading order details:', error);
            orderDetails.innerHTML = `
                <p class="error-message">Lỗi khi tải thông tin đơn hàng: ${error.message}</p>
            `;
        });
}

// Helper function to format address
function formatAddress(address) {
    if (!address) return 'N/A';
    
    const parts = [
        address.address,
        address.ward,
        address.district,
        address.city
    ].filter(Boolean);
    
    return parts.join(', ') || 'N/A';
}

// Cập nhật trạng thái đơn hàng
async function updateOrderStatus() {
    // Kiểm tra xem có đơn hàng nào đang được xem không
    if (!currentOrderId) {
        console.error('Không có đơn hàng nào được chọn.');
        return;
    }
    
    // Lấy trạng thái mới từ dropdown
    const statusSelect = document.getElementById('order-status');
    if (!statusSelect) {
        console.error('Không tìm thấy phần tử chọn trạng thái.');
        return;
    }
    
    const newStatus = statusSelect.value;
    
    // Hiển thị trạng thái đang cập nhật
    const updateBtn = document.getElementById('update-order-btn');
    if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
    }
    
    try {
        // Cập nhật trạng thái đơn hàng trong Firestore
        await ordersDb.collection('order').doc(currentOrderId).update({
            orderStatus: newStatus,
            updatedAt: firebaseInstance.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Đã cập nhật trạng thái đơn hàng thành công:', newStatus);
        
        // Đóng modal
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.style.display = 'none';
        }
        
        // Tải lại danh sách đơn hàng
        loadOrders();
        
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        alert('Lỗi khi cập nhật trạng thái đơn hàng: ' + error.message);
    } finally {
        // Khôi phục trạng thái nút
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.innerHTML = 'Update Status';
        }
    }
}

// Khởi tạo sự kiện modal đơn hàng
function initOrderModal() {
    // Sự kiện cập nhật trạng thái đơn hàng
    const updateOrderBtn = document.getElementById('update-order-btn');
    if (updateOrderBtn) {
        updateOrderBtn.addEventListener('click', updateOrderStatus);
    }
    
    // Đóng modal khi click nút Close
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderModal = document.getElementById('order-modal');
            if (orderModal) {
                orderModal.style.display = 'none';
            }
        });
    });
    
    // Đóng modal khi click ra ngoài
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === this) {
                orderModal.style.display = 'none';
            }
        });
    }
    
    // Sự kiện lọc đơn hàng theo trạng thái
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const searchFilter = document.getElementById('order-search')?.value || '';
            loadOrders(searchFilter, this.value);
        });
    }
    
    // Sự kiện tìm kiếm đơn hàng
    const orderSearch = document.getElementById('order-search');
    if (orderSearch) {
        orderSearch.addEventListener('input', function() {
            const statusValue = document.getElementById('status-filter')?.value || '';
            loadOrders(this.value, statusValue);
        });
    }
}

// Search and filter
orderSearch.addEventListener('input', () => {
    loadOrders(orderSearch.value, statusFilter.value);
});

statusFilter.addEventListener('change', () => {
    loadOrders(orderSearch.value, statusFilter.value);
});

// Khởi tạo sự kiện và tải dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo sự kiện cho order modal
    initOrderModal();
    
    // Export functions
    window.dataLoader = window.dataLoader || {};
    window.dataLoader.loadOrders = loadOrders;
    
    // Tải dữ liệu đơn hàng ban đầu
    loadOrders();
});