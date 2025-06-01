
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan_id?: string;
  plan_expires_at?: string;
  created_at?: string;
}

export interface RegisteredNotebook {
  id: string;
  user_id: string;
  nickname: string;
  category_id: string;
  title: string;
  total_pages: number;
  cover_image: string | null;
  registered_at: string | null;
  last_used: string | null;
}

export interface NotebookTemplate {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  pages: number;
  cover_image: string | null;
}

export interface NotebookCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_active: boolean | null;
  sort_order: number | null;
}

export interface NotePage {
  id: string;
  notebook_id: string;
  page_number: number;
  last_modified: string | null;
  notes: Note[];
}

export interface Note {
  id: string;
  page_id: string;
  type_id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  duration: number | null;
  file_url: string | null;
}

export interface NoteType {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  max_size_mb: number | null;
}

export interface UserPlan {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean | null;
  sort_order: number | null;
  max_notebooks: number;
  max_notes_per_page: number | null;
  max_file_size_mb: number | null;
  price_monthly: number | null;
  price_yearly: number | null;
  features: string[];
}

export interface PageGroup {
  id: string;
  notebook_id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
  pages: number[]; // Array of page numbers in this group
}

export interface PageGroupMember {
  id: string;
  group_id: string;
  page_number: number;
  created_at: string;
}
