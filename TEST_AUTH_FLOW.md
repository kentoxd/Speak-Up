# 🧪 Authentication Flow Test

## 📋 **Manual Testing Steps**

### **Test 1: Fresh User (No Authentication)**
1. **Clear Browser Data**
   - Open DevTools → Application → Storage → Clear All
   - Or use incognito/private browsing

2. **Launch App**
   - Should see: Splash Screen (2 seconds)
   - Then: Login Page

3. **Sign Up New Account**
   - Click "Sign Up" button
   - Fill in: Name, Email, Password
   - Click "Create Account"
   - Should see: Success toast → Redirect to Main App

4. **Verify Account Creation**
   - Check Firebase Console → Authentication → Users
   - Check Firestore → userProgressions collection
   - Should see new user document

### **Test 2: Returning User (Authenticated)**
1. **Launch App with Existing Session**
   - Should see: Splash Screen (2 seconds)
   - Then: Main App directly (skip login)

2. **Verify User Data**
   - Go to Profile page
   - Should see user information
   - Should see analytics dashboard

3. **Test Practice Session**
   - Go to Practice page
   - Start a practice session
   - Complete the session
   - Check if data is saved to Firestore

### **Test 3: Logout Flow**
1. **From Main App**
   - Go to Profile page
   - Click "Sign Out" button
   - Confirm logout

2. **Verify Logout**
   - Should redirect to Login page
   - Local storage should be cleared
   - Firebase Auth should be signed out

3. **Test Re-login**
   - Enter credentials
   - Should authenticate successfully
   - Should redirect to Main App

### **Test 4: Route Protection**
1. **Try Direct Access**
   - Type `/tabs` in address bar (without auth)
   - Should redirect to `/login`

2. **After Login**
   - Should redirect back to `/tabs`
   - Should show Main App

## 🔍 **What to Look For**

### **✅ Success Indicators**
- Smooth page transitions
- No infinite redirects
- Proper loading states
- User data loads correctly
- Practice sessions save data
- Logout works properly

### **❌ Error Indicators**
- Stuck on login page
- Infinite redirect loops
- Blank pages
- Console errors
- Network request failures
- Data not saving

## 🚨 **Common Issues & Solutions**

### **Issue: Stuck on Login Page**
- **Cause**: Incorrect route redirect
- **Solution**: Check navigation calls use `/tabs`

### **Issue: Infinite Redirect Loop**
- **Cause**: Auth state not properly managed
- **Solution**: Check AuthService implementation

### **Issue: User Data Not Loading**
- **Cause**: Firestore rules or initialization
- **Solution**: Check Firebase configuration

### **Issue: Practice Data Not Saving**
- **Cause**: User progression service not working
- **Solution**: Check Firestore permissions

## 📊 **Expected Console Output**

### **Successful Login:**
```
Firebase Auth: User signed in
Firestore: User document created/loaded
Navigation: Redirecting to /tabs
```

### **Successful Logout:**
```
Firebase Auth: User signed out
Local Storage: Cleared
Navigation: Redirecting to /login
```

## 🎯 **Test Results**

After running these tests, you should see:
- ✅ New users can sign up successfully
- ✅ Returning users are auto-logged in
- ✅ Users can logout and login again
- ✅ Each user's data is isolated
- ✅ Practice sessions save per user
- ✅ Route protection works
- ✅ Navigation is smooth

## 🔧 **Debug Commands**

### **Check Authentication State:**
```javascript
// In browser console:
firebase.auth().currentUser
```

### **Check Firestore Data:**
```javascript
// In browser console:
firebase.firestore().collection('userProgressions').get()
```

### **Check Local Storage:**
```javascript
// In browser console:
localStorage.getItem('firebase:authUser:...')
```
