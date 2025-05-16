# Firebase Web Application

A simple web application that uses Firebase for authentication and data storage.

## Project Structure

The project has been organized into the following structure:

```
test_firebase/
├── css/              # CSS stylesheets
│   ├── auth.css      # Auth-related styles
│   ├── items.css     # Item list styles
│   ├── main.css      # Main application styles
│   └── table.css     # Table-specific styles
├── db/               # Database utilities
│   └── firebase-db.js # Firebase database helper functions
├── js/               # JavaScript files
│   ├── app.js        # Main application initialization
│   ├── auth.js       # Authentication logic
│   ├── firebase-config.js # Firebase configuration
│   ├── items.js      # Item management logic
│   └── products.js   # Product display logic
└── index.html        # Main HTML entry point
```

## Features

- User authentication (login, signup, logout)
- Display products from Firestore database in a table
- Add, display, and delete personal items
- Responsive design

## How to Run

1. Open `index.html` in a web browser
2. Log in with your Firebase credentials
3. View products and manage items

## Firebase Configuration

The Firebase configuration is stored in `js/firebase-config.js`. Make sure your Firebase project has:

- Authentication with Email/Password enabled
- Firestore database with collections:
  - `product`: Product information
  - `items`: User items

## Dependencies

- Firebase SDK v10.5.0
  - firebase-app-compat.js
  - firebase-auth-compat.js
  - firebase-firestore-compat.js
