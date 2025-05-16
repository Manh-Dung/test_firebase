#!/bin/bash

# Firebase Web Application Setup Script

echo "Setting up Firebase Web Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Installing globally..."
    npm install -g firebase-tools
fi

# Ask about Firebase initialization
read -p "Do you want to initialize Firebase for this project? (y/n) " init_firebase

if [[ "$init_firebase" == "y" ]]; then
    echo "Initializing Firebase project..."
    firebase login
    firebase init
fi

echo "Setup complete! Run 'npm start' to launch the application."
