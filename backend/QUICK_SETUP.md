# Quick Setup Guide

## Issue Fixed ✅
The validation error was actually a nodemailer configuration issue. Fixed by changing `createTransporter` to `createTransport`.

## Current Setup

### 1. Development Mode (Skip Email)
Your `.env` file is configured to skip email sending in development:
```env
SKIP_EMAIL=true
```

**How it works:**
- OTP is logged to console instead of sent via email
- Perfect for testing without email setup
- Look for this in your server console:
```
🔐 OTP for user@example.com: 123456
📧 Email type: registration
⏰ Valid for 10 minutes
```

### 2. Test the Fixed Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Please verify your email with the OTP sent to your email address.",
  "data": {
    "email": "test@example.com",
    "requiresVerification": true
  }
}
```

### 3. Complete Registration Flow

1. **Sign Up** → Creates Auth record, generates OTP
2. **Check Console** → Copy the 6-digit OTP from server logs
3. **Verify OTP**:
```bash
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```
4. **Sign In** → Now you can sign in with verified account

## Production Email Setup

When ready for production, update your `.env`:

```env
# Remove or set to false
SKIP_EMAIL=false

# Add real email credentials
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Gmail Setup Steps:
1. Enable 2-factor authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. Use the 16-character app password in EMAIL_PASSWORD

## Clean Up

You can now delete these debug files:
- `test-signup.js`
- `DEBUG_SIGNUP.md`
- `QUICK_SETUP.md` (this file)

## API Endpoints Ready

✅ `POST /api/auth/signup` - Register user  
✅ `POST /api/otp/verify` - Verify email  
✅ `POST /api/otp/resend` - Resend OTP  
✅ `POST /api/auth/signin` - Sign in  
✅ `GET /api/auth/profile` - Get profile  
✅ `PUT /api/auth/profile` - Update profile  
✅ `POST /api/auth/logout` - Logout  

Your authentication system is now fully functional! 🎉