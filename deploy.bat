@echo off
REM 🚀 SpeakUp Deployment Script for Windows
REM This script builds and deploys the SpeakUp app to Firebase

echo 🎯 Building SpeakUp App...

REM Build the Angular app
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    echo 🔥 Deploying to Firebase...
    call firebase deploy --only hosting
    
    if %errorlevel% equ 0 (
        echo 🎉 Deployment successful!
        echo 🌐 Your app is live at: https://speakup-32e64.web.app
    ) else (
        echo ❌ Firebase deployment failed
        exit /b 1
    )
) else (
    echo ❌ Build failed
    exit /b 1
)
