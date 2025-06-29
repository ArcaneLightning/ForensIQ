import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Missing Supabase environment variables. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Check if the URL is still a placeholder value
if (supabaseUrl.includes('your_supabase_project_url') || supabaseUrl === 'your_supabase_project_url') {
  console.error('Supabase URL is still set to placeholder value. Please update your .env file with your actual Supabase project URL.');
  throw new Error('Supabase URL is not configured. Please update VITE_SUPABASE_URL in your .env file with your actual Supabase project URL (e.g., https://your-project-id.supabase.co)');
}

// Check if the anon key is still a placeholder value
if (supabaseAnonKey.includes('your_supabase_anon_key') || supabaseAnonKey === 'your_supabase_anon_key') {
  console.error('Supabase anon key is still set to placeholder value. Please update your .env file with your actual Supabase anon key.');
  throw new Error('Supabase anon key is not configured. Please update VITE_SUPABASE_ANON_KEY in your .env file with your actual Supabase anonymous key');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please ensure it starts with https:// and is a valid URL (e.g., https://your-project-id.supabase.co)`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'student' | 'coach' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  topic: string;
  duration: number;
  audio_url?: string;
  transcript?: string;
  analysis: {
    overall_score: number;
    clarity: number;
    pace: number;
    volume: number;
    tone_variety: number;
    filler_words: number;
    engagement: number;
    insights: Array<{
      type: 'positive' | 'improvement';
      title: string;
      description: string;
    }>;
    recommendations: string[];
  };
  created_at: string;
}

export interface DebateSession {
  id: string;
  user_id: string;
  topic: string;
  user_position: 'pro' | 'con';
  user_score: number;
  ai_score: number;
  messages: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    points?: number;
  }>;
  duration: number;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}