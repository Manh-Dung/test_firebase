// Script để tạo admin user
// Cần chạy trên Node.js, không phải trong trình duyệt

/*
HƯỚNG DẪN SỬ DỤNG:

1. Tạo file service-account.json:
   - Vào Firebase console: https://console.firebase.google.com/
   - Chọn dự án của bạn
   - Vào "Project settings" (Cài đặt dự án - biểu tượng bánh răng)
   - Chọn tab "Service accounts"
   - Click "Generate new private key"
   - Lưu file JSON được tải về dưới tên "service-account.json" cùng thư mục với script này

2. Chạy script với lệnh:
   node create-admin.js

3. Nhập Firebase Auth UID và email khi được yêu cầu
*/

const admin = require('firebase-admin');
const readline = require('readline');
let serviceAccount;

try {
  serviceAccount = require('./service-account.json'); // Đảm bảo bạn đã có file này
} catch (error) {
  console.error('Không thể đọc file service-account.json!');
  console.error('Vui lòng tải file này từ Firebase Console và đặt nó cùng thư mục với script.');
  console.error('Chi tiết lỗi:', error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createInitialCollections() {
  console.log('Tạo các collections cần thiết...');
  
  try {
    // Kiểm tra và tạo collection users nếu chưa tồn tại
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.limit(1).get();
    
    if (usersSnapshot.empty) {
      console.log('Tạo collection users...');
      await usersRef.doc('placeholder').set({
        email: 'placeholder@example.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        note: 'Placeholder user, có thể xóa'
      });
      console.log('✅ Đã tạo collection users!');
    } else {
      console.log('Collection users đã tồn tại.');
    }
    
    // Kiểm tra và tạo các collection khác nếu cần
    const collectionsToCreate = ['orders', 'products', 'settings'];
    
    for (const collName of collectionsToCreate) {
      const collRef = db.collection(collName);
      const snapshot = await collRef.limit(1).get();
      
      if (snapshot.empty) {
        console.log(`Tạo collection ${collName}...`);
        await collRef.doc('placeholder').set({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          note: `Placeholder ${collName}, có thể xóa`
        });
        console.log(`✅ Đã tạo collection ${collName}!`);
      } else {
        console.log(`Collection ${collName} đã tồn tại.`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi tạo collections:', error);
    return false;
  }
}

async function createAdminUser() {
  try {
    const userId = await question('Nhập user ID của bạn từ Firebase Authentication: ');
    const email = await question('Nhập email của bạn: ');

    if (!userId || !email) {
      console.error('User ID và email là bắt buộc!');
      rl.close();
      return;
    }

    await db.collection('admin').doc(userId).set({
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Successfully created admin user: ${userId}`);
    console.log('Bây giờ bạn có thể sử dụng quyền admin trong ứng dụng.');
    
    // Kiểm tra quyền truy cập
    console.log('Kiểm tra collection admin...');
    const adminDoc = await db.collection('admin').doc(userId).get();
    if (adminDoc.exists) {
      console.log('✅ Đã xác nhận admin user trong database!');
      
      // Tạo các collection cần thiết
      await createInitialCollections();
      
      console.log('\nLƯU Ý QUAN TRỌNG:');
      console.log('Bạn cần cập nhật Firestore Security Rules để cho phép admin truy cập.');
      console.log('Vào Firebase Console > Firestore Database > Rules và thêm rules sau:');
      console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kiểm tra xem người dùng có phải là admin không
    function isAdmin() {
      return exists(/databases/$(database)/documents/admin/$(request.auth.uid));
    }
    
    // Admin có toàn quyền truy cập
    match /{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Người dùng chỉ có thể đọc profile của chính họ
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
    }
    
    // Các quy tắc khác nếu cần...
  }
}
`);
    } else {
      console.log('❌ Không thể xác nhận admin user trong database.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    rl.close();
  }
}

createAdminUser().then(() => process.exit(0));