/**
 * Theo dõi trạng thái hoạt động của Firestore
 * 
 * Tập lệnh này kiểm tra trạng thái hoạt động của Firestore để phát hiện lỗi kết nối
 * và cung cấp phản hồi về hiệu suất.
 */

// Khởi tạo các biến theo dõi hiệu suất
let requestStartTime = 0;
let lastLatency = 0;
let connectionStatus = 'unknown';

// Tạo phần tử hiển thị trạng thái kết nối
function setupStatusMonitor() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'firebase-status';
  statusDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: #f0f0f0;
    color: #333;
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    opacity: 0.8;
    user-select: none;
    z-index: 9999;
  `;
  
  // Thêm chỉ số kết nối
  const statusIndicator = document.createElement('span');
  statusIndicator.id = 'connection-indicator';
  statusIndicator.style.cssText = `
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
    background-color: #999;
  `;
  
  statusDiv.appendChild(statusIndicator);
  
  // Thêm văn bản trạng thái
  const statusText = document.createElement('span');
  statusText.id = 'connection-status';
  statusText.textContent = 'Đang kiểm tra kết nối...';
  statusDiv.appendChild(statusText);
  
  // Thêm độ trễ
  const latencyText = document.createElement('div');
  latencyText.id = 'connection-latency';
  latencyText.style.fontSize = '10px';
  latencyText.style.marginTop = '4px';
  latencyText.textContent = 'Độ trễ: --ms';
  statusDiv.appendChild(latencyText);
  
  // Thêm vào document
  document.body.appendChild(statusDiv);
  
  // Thêm sự kiện click để ẩn/hiện
  statusDiv.addEventListener('click', () => {
    if (statusDiv.style.opacity === '0.8') {
      statusDiv.style.opacity = '0.2';
    } else {
      statusDiv.style.opacity = '0.8';
    }
  });
}

// Cập nhật trạng thái kết nối
function updateConnectionStatus(status, latency = null) {
  const indicator = document.getElementById('connection-indicator');
  const statusText = document.getElementById('connection-status');
  const latencyText = document.getElementById('connection-latency');
  
  if (!indicator || !statusText) return;
  
  connectionStatus = status;
  
  switch(status) {
    case 'connected':
      indicator.style.backgroundColor = '#4CAF50';
      statusText.textContent = 'Đã kết nối Firebase';
      break;
    case 'connecting':
      indicator.style.backgroundColor = '#FFC107';
      statusText.textContent = 'Đang kết nối...';
      break;
    case 'disconnected':
      indicator.style.backgroundColor = '#F44336';
      statusText.textContent = 'Mất kết nối Firebase';
      break;
    case 'error':
      indicator.style.backgroundColor = '#F44336';
      statusText.textContent = 'Lỗi kết nối Firebase';
      break;
    default:
      indicator.style.backgroundColor = '#999';
      statusText.textContent = 'Trạng thái không xác định';
  }
  
  if (latency !== null && latencyText) {
    lastLatency = latency;
    latencyText.textContent = `Độ trễ: ${latency}ms`;
  }
}

// Hàm theo dõi thời gian phản hồi
function startRequestTimer() {
  requestStartTime = Date.now();
  updateConnectionStatus('connecting');
}

function endRequestTimer() {
  if (requestStartTime === 0) return;
  
  const latency = Date.now() - requestStartTime;
  updateConnectionStatus('connected', latency);
  requestStartTime = 0;
}

// Khởi tạo theo dõi kết nối Firestore
function initFirestoreMonitoring() {
  // Tạo giao diện theo dõi trạng thái
  setupStatusMonitor();
  
  // Kiểm tra kết nối ban đầu
  const db = window.firebaseServices.db;
  
  if (!db) {
    updateConnectionStatus('error');
    return;
  }
  
  // Ping Firestore để kiểm tra kết nối
  startRequestTimer();
  db.collection('__health').doc('status')
    .get()
    .then(() => {
      endRequestTimer();
    })
    .catch(err => {
      console.warn('Health check failed:', err);
      updateConnectionStatus('error');
    });
    
  // Thêm listener cho trạng thái kết nối
  db.enableNetwork()
    .then(() => {
      updateConnectionStatus('connected');
    })
    .catch(err => {
      console.error('Failed to enable network:', err);
      updateConnectionStatus('error');
    });
}

// Khởi tạo khi trang đã tải
document.addEventListener('DOMContentLoaded', () => {
  if (window.firebaseServices && window.firebaseServices.db) {
    setTimeout(initFirestoreMonitoring, 1000); // Delay 1s để cho phép các kịch bản khác tải
  }
});
