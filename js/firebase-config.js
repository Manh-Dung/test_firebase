// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnJHgfSlJujrX9fTlwkWWJsaN2ibFyHec",
  authDomain: "tests-96d28.firebaseapp.com",
  projectId: "tests-96d28",
  storageBucket: "tests-96d28.firebasestorage.app",
  messagingSenderId: "496482568887",
  appId: "1:496482568887:web:5aa9dd13f26dd90d281b32",
  measurementId: "G-L2QT3C7C3K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase service references
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseServices = {
  auth,
  db,
  firebase
};
