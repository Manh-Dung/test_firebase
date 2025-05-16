// DOM Elements - Orders
const ordersTable = document.getElementById('orders-table');
const orderSearch = document.getElementById('order-search');
const statusFilter = document.getElementById('status-filter');
const orderDetails = document.getElementById('order-details');
const orderStatus = document.getElementById('order-status');
const updateOrderBtn = document.getElementById('update-order-btn');

// Get firebase services
const ordersDb = window.firebaseServices.db;
const firebase = window.firebaseServices.firebase;

// Current order being viewed
let currentOrderId = null;

// Load all orders
function loadOrders(filter = '', status = '') {
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

// View order details
function viewOrderDetails(orderId) {
    // Store current order ID
    currentOrderId = orderId;
    
    // Show loading state
    orderDetails.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #4285F4; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            Loading order details...
        </div>
    `;
    
    // Open modal
    window.openModal('order-modal');
    
    // Get order data
    ordersDb.collection('order').doc(orderId).get().then(doc => {
        if (!doc.exists) {
            orderDetails.innerHTML = `<p>Order not found</p>`;
            return;
        }
        
        const order = doc.data();
        
        // Calculate order total
        let orderTotal = 0;
        if (order.products && order.products.length > 0) {
            orderTotal = order.products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
        }
        
        // Set current status in dropdown
        if (order.orderStatus) {
            orderStatus.value = order.orderStatus;
        }
        
        // Format address
        let addressHTML = '';
        if (order.address) {
            addressHTML = `
                <div class="info-item">
                    <div class="info-label">Address</div>
                    <div class="info-value">
                        ${order.address.street ? order.address.street + '<br>' : ''}
                        ${order.address.city ? order.address.city + ', ' : ''}
                        ${order.address.state ? order.address.state : ''}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${order.address.phone || 'N/A'}</div>
                </div>
            `;
        }
        
        // Build products HTML
        let productsHTML = '';
        if (order.products && order.products.length > 0) {
            order.products.forEach(item => {
                const product = item.product || {};
                
                productsHTML += `
                    <div class="product-item">
                        <img src="${product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/60'}" 
                            alt="${product.name || 'Product'}" class="product-image">
                        <div class="product-details">
                            <div class="product-name">${product.name || 'Unknown Product'}</div>
                            <div class="product-meta">
                                <span>Quantity: ${item.quantity || 1}</span>
                                ${item.selectedSize ? `<span>Size: ${item.selectedSize}</span>` : ''}
                                ${item.selectedColor ? `<span>Color: <span style="display: inline-block; width: 12px; height: 12px; background-color: #${Math.abs(item.selectedColor).toString(16).padStart(6, '0')}; border: 1px solid #ddd; margin-right: 5px;"></span></span>` : ''}
                            </div>
                        </div>
                        <div class="product-price">${(item.totalPrice || 0).toLocaleString('vi-VN')} ₫</div>
                    </div>
                `;
            });
        } else {
            productsHTML = '<p>No products in this order</p>';
        }
        
        // Build detail HTML
        orderDetails.innerHTML = `
            <div class="order-info">
                <h3>Order Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Order ID</div>
                        <div class="info-value">${order.orderId || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date</div>
                        <div class="info-value">${order.date || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">
                            <span class="status-badge status-${order.orderStatus?.toLowerCase() || 'pending'}">
                                ${order.orderStatus || 'Pending'}
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Customer ID</div>
                        <div class="info-value">${order.userId || 'N/A'}</div>
                    </div>
                    ${addressHTML}
                </div>
            </div>
            
            <div class="order-products">
                <h3>Order Items</h3>
                ${productsHTML}
                <div class="order-total">
                    <h4>Total: ${orderTotal.toLocaleString('vi-VN')} ₫</h4>
                </div>
            </div>
        `;
    }).catch(error => {
        console.error('Error loading order details:', error);
        orderDetails.innerHTML = `
            <div style="color: #ea4335; padding: 20px;">
                Error loading order details: ${error.message}
            </div>
        `;
    });
}

// Update order status
updateOrderBtn.addEventListener('click', () => {
    if (!currentOrderId) return;
    
    const newStatus = orderStatus.value;
    
    // Show loading
    updateOrderBtn.disabled = true;
    updateOrderBtn.innerHTML = `
        <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #fff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></span>
        Updating...
    `;
    
    // Update in Firestore
    ordersDb.collection('order').doc(currentOrderId).update({
        orderStatus: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Close modal
        closeAllModals();
        
        // Reload orders
        loadOrders(orderSearch.value, statusFilter.value);
        
        // Update dashboard too
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        
        console.log('Order status updated successfully');
    }).catch(error => {
        console.error('Error updating order status:', error);
        alert(`Error updating order status: ${error.message}`);
    }).finally(() => {
        // Reset button
        updateOrderBtn.disabled = false;
        updateOrderBtn.textContent = 'Update Status';
    });
});

// Search and filter
orderSearch.addEventListener('input', () => {
    loadOrders(orderSearch.value, statusFilter.value);
});

statusFilter.addEventListener('change', () => {
    loadOrders(orderSearch.value, statusFilter.value);
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});