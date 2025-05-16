#!/bin/bash

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Make sure user is logged in
firebase login

# Initialize Firebase hosting if not already done
if [ ! -f "firebase.json" ] || ! grep -q "hosting" "firebase.json"; then
    echo "Initializing Firebase hosting..."
    firebase init hosting
fi

# Deploy to Firebase hosting
echo "Deploying to Firebase hosting..."
firebase deploy --only hosting

echo "Firebase hosting deployment completed!"
echo "Your site is now live at https://$(grep -o '"site": "[^"]*' firebase.json | cut -d'"' -f4).web.app"
