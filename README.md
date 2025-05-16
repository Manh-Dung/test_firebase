# E-Commerce Admin Portal

Ứng dụng quản trị viên toàn diện cho cửa hàng thương mại điện tử, được xây dựng với Firebase.

## Tính năng

- **Dashboard**: Tổng quan về các chỉ số quan trọng và đơn hàng gần đây
- **Quản lý Sản phẩm**: Thêm, sửa, và xóa sản phẩm
- **Quản lý Đơn hàng**: Xem và cập nhật trạng thái đơn hàng
- **Quản lý Người dùng**: Xem người dùng và cấp quyền quản trị viên
- **Xác thực**: Đăng nhập và đăng ký an toàn cho quản trị viên

## Công nghệ sử dụng

- HTML, CSS, JavaScript (Vanilla)
- Firebase (Authentication, Firestore)
- Font Awesome cho biểu tượng

## Hướng dẫn cài đặt

### Yêu cầu

- Node.js và npm
- Tài khoản Firebase
- Firebase CLI (`npm install -g firebase-tools`)

### Cài đặt

1. Clone repository này
2. Cập nhật `js/firebase-config.js` với cấu hình dự án Firebase của bạn
3. Triển khai quy tắc Firebase:
   ```
   ./deploy_rules.sh
   ```
4. Triển khai lên Firebase hosting:
   ```
   ./deploy_hosting.sh
   ```

## Cấu trúc Firebase

### Collections

- **users**: Lưu trữ thông tin người dùng
- **admin**: Chứa tài liệu cho người dùng có quyền quản trị
- **product**: Danh mục sản phẩm
- **order**: Đơn hàng của khách hàng

### Quy tắc bảo mật

Ứng dụng sử dụng quy tắc bảo mật Firestore để đảm bảo:
- Chỉ người dùng đã xác thực mới có thể đọc và ghi dữ liệu
- Chỉ quản trị viên mới có thể truy cập một số bộ sưu tập nhất định
- Người dùng chỉ có thể xem đơn hàng của riêng họ

## Phát triển

### Cấu trúc tệp

- `index.html`: HTML chính của ứng dụng
- `css/`: Stylesheets cho ứng dụng
- `js/`: Chức năng JavaScript
  - `app.js`: Logic ứng dụng chính
  - `auth.js`: Xử lý xác thực
  - `products.js`: Quản lý sản phẩm
  - `orders.js`: Quản lý đơn hàng
  - `users.js`: Quản lý người dùng
  - `navbar.js`: Chức năng điều hướng
- `firebase_rules.txt`: Quy tắc bảo mật Firestore

### Thêm tính năng mới

Khi thêm tính năng mới:
1. Tạo HTML phù hợp trong `index.html`
2. Thêm quy tắc CSS trong stylesheet phù hợp
3. Triển khai chức năng JavaScript theo mẫu module
4. Cập nhật quy tắc bảo mật Firebase nếu cần thiết
