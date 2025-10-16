#!/bin/bash

# 🚀 SpeakUp Deployment Script
# This script builds and deploys the SpeakUp app to Firebase

echo "🎯 Building SpeakUp App..."

# Build the Angular app
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🔥 Deploying to Firebase..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌐 Your app is live at: https://speakup-32e64.web.app"
    else
        echo "❌ Firebase deployment failed"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi
