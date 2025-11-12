
// Fix: Import React to use its types for JSX elements.
import type React from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  // Fix: Corrected formatting.
  updated_at: string;
  // Fix: Allow null for optional fields to match database nullability.
  summary?: string | null;
  tags?: string[] | null;
  action_items?: string[] | null;
  project_id?: string | null;
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  // Fix: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error in a .ts file.
  icon: React.ReactNode;
}

export type Selection = {
  type: 'category' | 'project';
  id: string;
};
