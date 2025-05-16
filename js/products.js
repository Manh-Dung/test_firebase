// DOM Elements - Product related
const productTableBody = document.getElementById('product-table-body');

// Get firebase services without redeclaring
const firestoreDB = window.firebaseServices.db;

/**
 * Load and display products from Firestore
 */
function loadProducts() {
    // Show loading indicator
    productTableBody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #4285F4; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                Đang tải dữ liệu sản phẩm...
            </td>
        </tr>
    `;
    
    firestoreDB.collection('product').get()
        .then((querySnapshot) => {
            // Clear the table first
            productTableBody.innerHTML = '';
            
            // Check if we have any products
            if (querySnapshot.empty) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = '<td colspan="9">Không có dữ liệu sản phẩm</td>';
                productTableBody.appendChild(noDataRow);
                return;
            }
            
            // Add each product to the table
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productId = doc.id;
                
                displayProduct(product, productId);
            });
        })
        .catch((error) => {
            console.error('Error loading products:', error);
            // Show error in the table
            productTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="color: #DB4437;">Lỗi khi tải dữ liệu sản phẩm: ${error.message}</td>
                </tr>
            `;
        });
}

/**
 * Display a single product in the table
 * @param {Object} product - The product data
 * @param {String} productId - The product document ID
 */
function displayProduct(product, productId) {
    const row = document.createElement('tr');
    
    // Format price with comma separators
    const formattedPrice = product.price ? product.price.toLocaleString('vi-VN') : '';
    
    // Handle colors array
    const colorDisplay = product.colors && product.colors.length > 0 
        ? product.colors.map(color => {
            // If color is a number, convert to hex color code
            if (typeof color === 'number') {
                let colorStr;
                if (color < 0) {
                    // For negative numbers like -1111111
                    colorStr = Math.abs(color).toString(16).padStart(6, '0');
                } else {
                    colorStr = color.toString(16).padStart(6, '0');
                }
                return `<span style="display: inline-block; width: 20px; height: 20px; background-color: #${colorStr}; border: 1px solid #ddd; margin-right: 5px;"></span>`;
            }
            return color;
        }).join('') 
        : '';
    
    // Handle sizes array
    const sizesDisplay = product.sizes && product.sizes.length > 0 
        ? product.sizes.join(', ') 
        : '';
    
    // Handle image
    const imageDisplay = product.images && product.images.length > 0 
        ? `<img src="${product.images[0]}" alt="${product.name || 'Product'}" width="50" height="50" style="object-fit: cover;">` 
        : '';
    
    // Create table cells with product data
    row.innerHTML = `
        <td>${productId}</td>
        <td>${product.name || ''}</td>
        <td>${product.category || ''}</td>
        <td>${formattedPrice}</td>
        <td>${product.offerPercentage || 0}%</td>
        <td>${colorDisplay}</td>
        <td>${sizesDisplay}</td>
        <td>${imageDisplay}</td>
        <td>${product.desciption || product.description || ''}</td>
    `;
    
    productTableBody.appendChild(row);
}

// Export functions
window.dataLoader = window.dataLoader || {};
window.dataLoader.loadProducts = loadProducts;
