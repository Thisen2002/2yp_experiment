import { supabase } from './supabaseClient';

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: any;
  error?: string;
}

// Simple hash function (for demo purposes - in production, use backend hashing)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const signUp = async (data: SignUpData): Promise<UserResponse> => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists',
        error: 'EMAIL_EXISTS'
      };
    }

    // Hash the password
    const passwordHash = await hashPassword(data.password);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password_hash: passwordHash,
          phone_number: data.phoneNumber || null,
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          postal_code: data.postalCode || null,
        }
      ])
      .select('id, first_name, last_name, email, created_at')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return {
        success: false,
        message: 'Failed to create account',
        error: insertError.message
      };
    }

    return {
      success: true,
      message: 'Account created successfully',
      user: newUser
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error.message
    };
  }
};

export const login = async (data: LoginData): Promise<UserResponse> => {
  try {
    // Hash the provided password
    const passwordHash = await hashPassword(data.password);

    // Fetch user by email and password hash
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .eq('password_hash', passwordHash)
      .single();

    if (fetchError || !user) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      };
    }

    // Return user data (excluding password_hash)
    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error.message
    };
  }
};
