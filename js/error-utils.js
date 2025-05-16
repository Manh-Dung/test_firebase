// Utility file for error handling and debugging
(function() {
  // Check if Firestore is properly initialized
  window.addEventListener('DOMContentLoaded', () => {
    // Make sure Firebase is loaded
    if (!window.firebase) {
      showError('Firebase SDK không được tải. Vui lòng kiểm tra kết nối internet.');
      return;
    }

    // Make sure config is available
    if (!window.firebaseServices) {
      showError('Cấu hình Firebase không được tìm thấy. Vui lòng kiểm tra file firebase-config.js.');
      return;
    }

    // Check if auth and Firestore are available
    const { auth, db } = window.firebaseServices;
    if (!auth || !db) {
      showError('Các dịch vụ Firebase không được khởi tạo đúng cách.');
      return;
    }

    console.log('Firebase đã được khởi tạo thành công!');
    
    // Khởi tạo xử lý lỗi Firebase
    if (window.errorUtils.handleFirebaseErrors) {
      window.errorUtils.handleFirebaseErrors();
    }
    
    // Khởi tạo giám sát trạng thái mạng
    if (window.errorUtils.setupNetworkStatusMonitor) {
      window.errorUtils.setupNetworkStatusMonitor();
    }
  });

  // Display error messages on the page
  function showError(message) {
    console.error(message);
    
    // Create an error banner if it doesn't exist
    const errorDiv = document.getElementById('error-banner') || createErrorBanner();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  // Create an error banner element
  function createErrorBanner() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-banner';
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #DB4437;
      color: white;
      padding: 10px;
      text-align: center;
      z-index: 10000;
      display: none;
    `;
    
    document.body.prepend(errorDiv);
    return errorDiv;
  }

  // Export utility functions
  window.errorUtils = {
    showError
  };
})();
