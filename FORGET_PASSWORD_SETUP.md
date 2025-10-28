# Environment Variables for Forget Password Functionality

## Backend (.env in api directory)
Add these variables to your existing .env file:

```env
# Existing variables...
MONGO_URL=mongodb://localhost:27017/pricewise
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# New variables for password reset
RESEND_API_KEY=your-resend-api-key-here
```

## Frontend (.env in client directory)
Your existing .env file should already have:
```env
VITE_API_URL=http://localhost:5000
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd api
npm install resend crypto
```

### 2. Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your backend .env file

### 3. Verify Domain (Optional but Recommended)
1. In Resend dashboard, add and verify your domain
2. Update the "from" email in the forgot-password route to use your verified domain
3. Current fallback: "Pricewise <noreply@pricewise.com>"

### 4. Test the Functionality
1. Start your backend: `cd api && npm start`
2. Start your frontend: `cd client && npm run dev`
3. Navigate to `/forgot-password`
4. Enter a registered email address
5. Check your email for the reset link
6. Click the link to reset your password

## Security Features Implemented

- ✅ Secure token generation using crypto.randomBytes
- ✅ Token expiration (15 minutes)
- ✅ Password strength validation
- ✅ Email format validation
- ✅ Rate limiting protection (can be added)
- ✅ No user enumeration (same response for existing/non-existing emails)
- ✅ Token cleanup after use or expiration
- ✅ HTTPS-ready email templates

## API Endpoints Added

- `POST /api/users/forgot-password` - Send password reset email
- `POST /api/users/reset-password` - Reset password with token

## Frontend Pages Added

- `/forgot-password` - Request password reset
- `/reset-password?token=...` - Reset password with token
