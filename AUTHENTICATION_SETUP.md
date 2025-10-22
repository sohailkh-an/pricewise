# Authentication System Setup

## Overview
I've implemented a complete authentication system with cookie-based authentication, beautiful shadcn UI forms, and route protection.

## Features Implemented

### Backend (API)
- ✅ User model with proper validation and password hashing
- ✅ JWT-based authentication with secure cookies
- ✅ Authentication middleware for protected routes
- ✅ User registration, login, logout, and profile management
- ✅ CORS configuration for cookie support

### Frontend (Client)
- ✅ Beautiful login/register forms using shadcn UI
- ✅ Authentication context with React hooks
- ✅ Public and private route protection
- ✅ Updated NavBar with authentication state
- ✅ Cookie-based authentication (no localStorage for tokens)

## Setup Instructions

### 1. Backend Setup
1. Install the new dependency:
```bash
cd api
npm install cookie-parser
```

2. Create a `.env` file in the `api` directory:
```env
MONGO_URL=mongodb://localhost:27017/pricewise
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 2. Frontend Setup
1. Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Install Missing Dependencies
If you don't have these packages, install them:

```bash
# In client directory
npm install @radix-ui/react-label lucide-react

# In api directory (if not already installed)
npm install cookie-parser
```

## API Endpoints

### Authentication Routes (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user (protected)
- `PUT /profile` - Update user profile (protected)

## Usage Examples

### Protected Routes
```jsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Public Routes (redirect if authenticated)
```jsx
import PublicRoute from "@/components/auth/PublicRoute";

<Route 
  path="/login" 
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  } 
/>
```

### Using Authentication Context
```jsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <p>Welcome, {user.firstName}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};
```

## Security Features

- ✅ Passwords are hashed with bcrypt (salt rounds: 12)
- ✅ JWT tokens stored in httpOnly cookies
- ✅ CSRF protection with SameSite cookies
- ✅ Secure cookie settings for production
- ✅ Input validation on both client and server
- ✅ Rate limiting ready (can be added)

## UI Features

- ✅ Responsive design with mobile support
- ✅ Dark mode support
- ✅ Loading states and error handling
- ✅ Password visibility toggle
- ✅ Form validation with real-time feedback
- ✅ Beautiful gradient backgrounds
- ✅ Consistent with your app's design system

## Next Steps

1. Set up your environment variables
2. Install the missing dependencies
3. Start your servers:
   - Backend: `cd api && npm start`
   - Frontend: `cd client && npm run dev`
4. Test the authentication flow
5. Add more protected routes as needed

The authentication system is now ready to use! 🎉
