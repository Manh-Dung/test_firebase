
/*
 * Cách khắc phục lỗi kết nối và quyền truy cập Firebase
 * ==========================================================
 * 
 * 1. Cập nhật Firestore Security Rules
 * ------------------------------------
 * Các bước:
 * a. Truy cập Firebase Console tại https://console.firebase.google.com/
 * b. Chọn dự án "tests-96d28"
 * c. Trong thanh menu bên trái, chọn "Firestore Database"
 * d. Chọn tab "Rules"
 * e. Sao chép nội dung từ file firebase_rules.txt đã tạo
 * f. Dán vào trình soạn thảo rules
 * g. Nhấn "Publish" để áp dụng các rules mới
 * 
 * 2. Kiểm tra kết nối mạng
 * ------------------------
 * - Ứng dụng hiện đã có chức năng kiểm tra kết nối mạng tự động
 * - Nếu mất kết nối, sẽ hiển thị thông báo ở phía dưới màn hình
 * - Khi có kết nối trở lại, thông báo sẽ tự động biến mất
 * 
 * 3. Khởi động lại ứng dụng
 * ------------------------
 * - Sau khi cập nhật rules, làm mới trang web để khởi động lại ứng dụng
 * - Nếu gặp lỗi "Quyền truy cập bị từ chối", có thể do cache. Hãy:
 *   + Xóa cache trình duyệt
 *   + Thử đăng xuất và đăng nhập lại
 *   + Kiểm tra xem rules đã được cập nhật thành công chưa
 * 
 * 4. Lý do lỗi kết nối Firebase
 * ---------------------------
 * - Lỗi timeout 10 giây: Có thể do kết nối mạng không ổn định hoặc máy chủ Firebase bận
 * - Lỗi quyền truy cập: Có thể do chưa cập nhật các quy tắc bảo mật Firestore
 * 
 * Lưu ý: Các lỗi sẽ được hiển thị trong banner màu cam ở góc dưới bên phải màn hình
 */
