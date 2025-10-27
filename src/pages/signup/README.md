# Authentication System - Setup Guide

This folder contains the authentication system for user signup and login using Supabase.

## 📁 Folder Structure

```
signup/
├── backend/
│   ├── supabaseClient.ts    # Supabase client configuration
│   └── authService.ts        # Authentication service (signup/login logic)
├── AuthPage.tsx              # Main auth page component (login/signup UI)
└── AuthPage.css              # Styling for auth page
```

## 🚀 Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://fqgprrdrbdjlohhzhtxq.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**To get your Supabase keys:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** and **anon public key**

### 2. Create the Users Table in Supabase

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  phone_number varchar(20),
  date_of_birth date,
  gender varchar(10) CHECK (gender IN ('Male','Female','Other')),
  address text,
  city varchar(50),
  state varchar(50),
  country varchar(50),
  postal_code varchar(20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Optional: Add Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can view their own data" 
ON users 
FOR SELECT 
USING (auth.uid() = id);
```

### 3. Run the Application

```bash
npm run dev
```

## 🔐 Security Notes

### Password Hashing
The current implementation uses SHA-256 hashing on the frontend. **For production**, consider:

1. **Backend Implementation**: Move password hashing to a secure backend
2. **Better Hashing**: Use bcrypt, argon2, or scrypt
3. **Supabase Auth**: Use Supabase's built-in authentication system

### Recommended Production Setup

For a production environment, consider using Supabase Auth instead:

```typescript
// Using Supabase Auth (recommended for production)
import { supabase } from './supabaseClient';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};
```

## 📝 Features

### Sign Up
- First name, last name (required)
- Email address (required, unique)
- Password (required, min 6 characters)
- Phone number (optional)
- Date of birth (optional)
- Gender (optional)
- Address details (optional): address, city, state, country, postal code

### Login
- Email address
- Password
- Password visibility toggle
- Remember user session

### UI Features
- Responsive design
- Form validation
- Error messages
- Success messages
- Loading states
- Toggle between login and signup
- Modern gradient styling matching the site theme

## 🎨 Styling

The auth page uses a gradient background similar to other pages in the application:
- Blue gradient background
- White card with glassmorphism effect
- Smooth animations and transitions
- Mobile responsive

## 🔄 User Flow

1. User clicks "Log In" button in navbar
2. User is redirected to `/auth`
3. User can toggle between Login and Sign Up
4. After successful signup, user is prompted to login
5. After successful login, user is redirected to home page
6. User data is stored in localStorage for session management

## 📦 Dependencies

All required dependencies are already in `package.json`:
- `@supabase/supabase-js` - Supabase client
- `lucide-react` - Icons
- `react-router-dom` - Navigation

## 🔍 Troubleshooting

### "User with this email already exists"
- This email is already registered. Try logging in instead.

### "Invalid email or password"
- Check your credentials and try again.
- Passwords are case-sensitive.

### "Failed to create account"
- Check your Supabase connection.
- Verify the users table exists.
- Check the browser console for detailed errors.

### Connection Issues
- Verify your Supabase URL and anon key in `.env`
- Check if your Supabase project is active
- Verify RLS policies if enabled

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React Router Documentation](https://reactrouter.com/)
