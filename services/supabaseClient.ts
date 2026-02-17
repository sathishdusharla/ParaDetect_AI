/**
 * Supabase Client Configuration
 * Handles database operations, authentication, and real-time subscriptions
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Supabase Configuration
// Add these to your .env.local file:
// VITE_SUPABASE_URL=your_supabase_project_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database Types (Auto-generated from Supabase schema)
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          patient_id: string;
          full_name: string;
          role: 'doctor' | 'patient';
          age?: number;
          gender?: string;
          weight?: number;
          blood_type?: string;
          phone?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          patient_id: string;
          patient_email: string;
          patient_name: string;
          type: 'Microscopy' | 'Lab Risk';
          status: 'Completed' | 'Pending' | 'In Progress';
          result: any; // JSON
          image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_email: string;
          title: string;
          message: string;
          type: 'alert' | 'info' | 'success';
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      lab_history: {
        Row: {
          id: string;
          user_email: string;
          input_data: any; // JSON
          result: any; // JSON
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lab_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lab_history']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          user_email: string;
          test_type: string;
          location_type: string;
          date: string;
          time: string;
          address?: string;
          contact?: string;
          status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
    };
  };
}

/**
 * Generate unique Patient ID
 * Format: PD-YYYYMMDD-XXXX
 */
export const generatePatientId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `PD-${year}${month}${day}-${random}`;
};

/**
 * Check if user exists, if not create with unique patient ID
 */
export const ensureUserExists = async (user: User, role: 'doctor' | 'patient'): Promise<string> => {
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('patient_id')
    .eq('email', user.email)
    .single();

  if (existingUser) {
    return existingUser.patient_id;
  }

  // Create new user with unique patient ID and explicit UUID
  const patientId = generatePatientId();
  const userId = crypto.randomUUID();
  
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: user.email!,
      patient_id: patientId,
      full_name: user.email!.split('@')[0],
      role: role
    });

  if (insertError) {
    console.error('Error creating user:', insertError);
    throw insertError;
  }

  return patientId;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Sign up new user
 */
export const signUp = async (email: string, password: string, role: 'doctor' | 'patient', fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');

  // Create user profile with explicit UUID
  const patientId = generatePatientId();
  const userId = crypto.randomUUID();
  
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: data.user.email!,
      patient_id: patientId,
      full_name: fullName || email.split('@')[0],
      role: role
    });

  if (profileError) throw profileError;

  return { user: data.user, patientId };
};

/**
 * Sign in user
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get user profile
 */
export const getUserProfile = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (email: string, updates: Partial<Database['public']['Tables']['users']['Update']>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', email)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export default supabase;
