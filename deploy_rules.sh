#!/bin/bash
# Deploy Firebase rules

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase project (if not initialized)
if [ ! -f "firebase.json" ]; then
    echo "Initializing Firebase project..."
    firebase init firestore
fi

# Create rules file for deployment
echo "Creating Firestore rules file..."
cat firebase_rules.txt > firestore.rules

# Deploy rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

echo "Firebase rules deployment completed!"
