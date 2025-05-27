export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan_id: string;
  plan_expires_at?: string;
  created_at: string;
}

export interface UserPlan {
  id: string;
  name: string;
  display_name: string;
  max_notebooks: number;
  max_notes_per_page?: number;
  max_file_size_mb?: number;
  price_monthly: number;
  price_yearly: number;
  features: string[]; // Keep as string[] for our app logic
  is_active: boolean;
  sort_order: number;
}

export interface NotebookCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface NoteType {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  max_size_mb?: number;
  sort_order: number;
}

export interface RegisteredNotebook {
  id: string; // Physical notebook ID
  user_id: string;
  nickname: string; // User's custom name
  category_id: string;
  title: string; // Original template name
  total_pages: number;
  registered_at: string;
  last_used?: string;
  cover_image?: string;
}

export interface NotePage {
  id: string; // Format: notebookId-pageNumber
  notebook_id: string;
  page_number: number;
  last_modified: string;
  notes?: Note[]; // Added for easier data handling
}

export interface Note {
  id: string;
  page_id: string;
  type_id: string;
  content: string;
  timestamp: string;
  duration?: number; // For voice notes in seconds
  created_at: string;
}

export interface NotebookTemplate {
  id: string;
  title: string;
  category_id: string;
  pages: number;
  cover_image?: string;
  description?: string;
}

export interface QRScanResult {
  type: 'notebook' | 'page';
  notebookId: string;
  pageNumber?: number;
}
