// DOM Elements - Product related (only define references for buttons that may be needed for event listeners)
const productSearch = document.getElementById('product-search');
const addProductBtn = document.getElementById('add-product-btn');
const saveProductBtn = document.getElementById('save-product-btn');

// Get firebase services without redeclaring
const firestoreDB = window.firebaseServices.db;
const firebaseInstance = window.firebaseServices.firebase;

/**
 * Load and display products from Firestore
 */
function loadProducts() {
    // Check if we're on the products page first
    if (window.isPageVisible && !window.isPageVisible('products')) {
        console.log('Không load sản phẩm vì đang không ở trang Products.');
        return;
    }
    
    // Get DOM element references inside the function to ensure they exist
    // Thay thế ID từ product-table-body sang products-table để phù hợp với HTML
    const productTableBody = document.getElementById('products-table');
    
    // Check if the product table exists before proceeding
    if (!productTableBody) {
        console.error('Không tìm thấy phần tử bảng sản phẩm. Đảm bảo bạn đang ở trang Products.');
        return;
    }
    
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
    // Get the table body element each time we need it
    const productTableBody = document.getElementById('products-table');
    if (!productTableBody) {
        console.error('Không tìm thấy phần tử bảng sản phẩm trong hàm displayProduct');
        return;
    }
    
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
        <td>${imageDisplay}</td>
        <td>${productId}</td>
        <td>${product.name || ''}</td>
        <td>${product.category || ''}</td>
        <td>${formattedPrice}</td>
        <td>${product.offerPercentage || 0}%</td>
        <td>
            <button class="action-btn edit-btn" data-id="${productId}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${productId}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    productTableBody.appendChild(row);
}

/**
 * Thêm hàm tạo sản phẩm mẫu
 */
async function createSampleProduct() {
    const sampleProduct = {
        name: 'Áo thun nam ' + Math.floor(Math.random() * 1000),
        category: 'Áo nam',
        price: Math.floor(Math.random() * 500000) + 100000,
        offerPercentage: Math.floor(Math.random() * 30),
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [0xFF0000, 0x00FF00, 0x0000FF],
        images: ['https://picsum.photos/200?' + Math.random()],
        description: 'Sản phẩm áo thun chất lượng cao, phù hợp mọi dịp.',
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await firestoreDB.collection('product').add(sampleProduct);
        console.log('Đã tạo sản phẩm mẫu:', docRef.id);
        loadProducts(); // Tải lại danh sách sản phẩm
        return docRef.id;
    } catch (error) {
        console.error('Lỗi khi tạo sản phẩm mẫu:', error);
        return null;
    }
}

/**
 * Edit product: Open modal and populate with product data
 * @param {String} productId - The product ID to edit
 */
async function editProduct(productId) {
    try {
        // Get product data from Firestore
        const doc = await firestoreDB.collection('product').doc(productId).get();
        if (!doc.exists) {
            console.error('Sản phẩm không tồn tại:', productId);
            return;
        }
        
        const product = doc.data();
        
        // Get elements from product modal
        const productModal = document.getElementById('product-modal');
        const productModalTitle = document.getElementById('product-modal-title');
        const productForm = document.getElementById('product-form');
        const productIdInput = document.getElementById('product-id');
        const productNameInput = document.getElementById('product-name');
        const productCategoryInput = document.getElementById('product-category');
        const productPriceInput = document.getElementById('product-price');
        const productDiscountInput = document.getElementById('product-discount');
        const productDescriptionInput = document.getElementById('product-description');
        const productImageInput = document.getElementById('product-image');
        const productColorsInput = document.getElementById('product-colors');
        const productSizesInput = document.getElementById('product-sizes');
        
        // Set modal title to edit mode
        productModalTitle.textContent = 'Edit Product';
        
        // Populate form with product data
        productIdInput.value = productId;
        productNameInput.value = product.name || '';
        productCategoryInput.value = product.category || '';
        productPriceInput.value = product.price || '';
        productDiscountInput.value = product.offerPercentage || 0;
        productDescriptionInput.value = product.description || product.desciption || '';
        
        // Handle image array
        if (product.images && product.images.length > 0) {
            productImageInput.value = product.images[0];
        } else {
            productImageInput.value = '';
        }
        
        // Handle colors array - convert from numbers to hex strings if needed
        if (product.colors && product.colors.length > 0) {
            const colorStrings = product.colors.map(color => {
                if (typeof color === 'number') {
                    // Convert number to hex string without # prefix
                    return color.toString(16).padStart(6, '0');
                }
                return color;
            });
            productColorsInput.value = colorStrings.join(',');
        } else {
            productColorsInput.value = '';
        }
        
        // Handle sizes array
        if (product.sizes && product.sizes.length > 0) {
            productSizesInput.value = product.sizes.join(',');
        } else {
            productSizesInput.value = '';
        }
        
        // Show the modal
        productModal.style.display = 'flex';
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
    }
}

/**
 * Mở modal thêm sản phẩm mới
 */
function openAddProductModal() {
    // Reset form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.reset();
    }
    
    // Reset hidden input
    const productIdInput = document.getElementById('product-id');
    if (productIdInput) {
        productIdInput.value = '';
    }
    
    // Set modal title to add mode
    const productModalTitle = document.getElementById('product-modal-title');
    if (productModalTitle) {
        productModalTitle.textContent = 'Add New Product';
    }
    
    // Show the modal
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        productModal.style.display = 'flex';
    }
}

// Khi click vào nút "Add Product"
if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
        console.log("Mở modal thêm sản phẩm mới");
        openAddProductModal();
    });
}

// Cập nhật sự kiện cho nút edit trong bảng sản phẩm
document.addEventListener('click', function(e) {
    // Kiểm tra nếu click vào nút edit
    if (e.target.closest('.edit-btn')) {
        const productId = e.target.closest('.edit-btn').getAttribute('data-id');
        console.log('Edit product:', productId);
        editProduct(productId);
    }
    
    // Kiểm tra nếu click vào nút delete
    if (e.target.closest('.delete-btn')) {
        const productId = e.target.closest('.delete-btn').getAttribute('data-id');
        console.log('Delete product:', productId);
        if (confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
            firestoreDB.collection('product').doc(productId).delete()
                .then(() => {
                    console.log("Sản phẩm đã được xóa!");
                    loadProducts(); // Tải lại danh sách sản phẩm
                })
                .catch(error => {
                    console.error("Lỗi khi xóa sản phẩm:", error);
                });
        }
    }
});

// Thêm hàm lưu sản phẩm
async function saveProduct() {
    // Lấy giá trị từ form
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const offerPercentage = parseInt(document.getElementById('product-discount').value) || 0;
    const description = document.getElementById('product-description').value;
    const imageUrl = document.getElementById('product-image').value;
    
    // Xử lý chuỗi màu sắc và kích thước
    const colorInput = document.getElementById('product-colors').value;
    const colors = colorInput.split(',')
        .map(c => c.trim())
        .filter(c => c !== '')
        .map(c => {
            // Nếu đầu vào là mã hex, chuyển thành số
            if (/^[0-9A-Fa-f]{6}$/.test(c)) {
                return parseInt(c, 16);
            }
            return c;
        });
    
    const sizeInput = document.getElementById('product-sizes').value;
    const sizes = sizeInput.split(',')
        .map(s => s.trim())
        .filter(s => s !== '');
    
    // Tạo object dữ liệu sản phẩm
    const productData = {
        name,
        category,
        price,
        offerPercentage,
        description,
        colors,
        sizes,
        updatedAt: firebaseInstance.firestore.FieldValue.serverTimestamp()
    };
    
    // Thêm ảnh nếu có
    if (imageUrl) {
        productData.images = [imageUrl];
    }
    
    try {
        // Lưu dữ liệu vào Firestore
        if (productId) {
            // Cập nhật sản phẩm đã tồn tại
            await firestoreDB.collection('product').doc(productId).update(productData);
            console.log('Sản phẩm đã được cập nhật:', productId);
        } else {
            // Thêm sản phẩm mới
            productData.createdAt = firebaseInstance.firestore.FieldValue.serverTimestamp();
            const docRef = await firestoreDB.collection('product').add(productData);
            console.log('Sản phẩm mới đã được tạo:', docRef.id);
        }
        
        // Đóng modal và tải lại danh sách sản phẩm
        closeProductModal();
        loadProducts();
        
        return true;
    } catch (error) {
        console.error('Lỗi khi lưu sản phẩm:', error);
        return false;
    }
}

// Hàm đóng modal sản phẩm
function closeProductModal() {
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        productModal.style.display = 'none';
    }
}

// Khởi tạo sự kiện cho modal sản phẩm
function initProductModal() {
    // Nút lưu sản phẩm
    const saveProductBtn = document.getElementById('save-product-btn');
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', saveProduct);
    }
    
    // Nút đóng modal
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeProductModal);
    });
    
    // Thêm sự kiện đóng modal khi click ra ngoài
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProductModal();
            }
        });
    }
}

// Export functions
window.dataLoader = window.dataLoader || {};
window.dataLoader.loadProducts = loadProducts;

// Khởi động ứng dụng
loadProducts();
initProductModal();
