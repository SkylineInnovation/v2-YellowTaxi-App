#!/bin/bash

# Deploy Firestore indexes and rules
# This script deploys the Firestore configuration to Firebase

echo "🚀 Deploying Firestore indexes and rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Deploy Firestore rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy Firestore indexes
echo "🔍 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi

echo "🎉 Firestore deployment completed successfully!"
echo ""
echo "📊 Index creation may take a few minutes to complete."
echo "You can monitor the progress in the Firebase Console:"
echo "https://console.firebase.google.com/project/$(firebase use --current)/firestore/indexes"
echo ""
echo "🔒 Security rules are now active and protecting your data."
