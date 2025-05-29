
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
