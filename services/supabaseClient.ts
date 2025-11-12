import { createClient } from '@supabase/supabase-js';
import type { Note, Project } from '../types';

const supabaseUrl = 'https://aoyagoggyfjhqiqyegdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFveWFnb2dneWZqaHFpcXllZ2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODQ3OTEsImV4cCI6MjA3ODQ2MDc5MX0.zN0_hlnmHcERRGEHqvAcQBx4J4qQCr9GQhnTY305mtg';


interface Database {
  public: {
    Tables: {
      notes: {
        Row: Note;
        // Fix: Use more specific types for Insert and Update operations.
        // By omitting database-generated columns, we provide a more accurate type
        // that prevents Supabase's type inference from failing and resolving to 'never'.
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>;
        // FIX: Omitted 'updated_at' from the Update type, assuming it's handled by the database.
        // This is a common pattern and could resolve the 'never' type inference issue.
        Update: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        // Fix: Use more specific types for Insert and Update operations
        // for consistency and to prevent type inference failures.
        Insert: Omit<Project, 'id' | 'created_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
    };
  };
}

// Create the Supabase client.
// The URL and Key are hardcoded, so we assume they are always present.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
