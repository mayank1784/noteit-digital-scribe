
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro';
  maxNotebooks: number;
  createdAt: string;
}

export interface RegisteredNotebook {
  id: string; // Physical notebook ID
  userId: string;
  nickname: string; // User's custom name
  category: NotebookCategory;
  title: string; // Original template name
  totalPages: number;
  registeredAt: string;
  lastUsed?: string;
  coverImage?: string;
}

export interface NotePage {
  id: string; // Format: notebookId-pageNumber
  notebookId: string;
  pageNumber: number;
  notes: Note[];
  lastModified: string;
}

export interface Note {
  id: string;
  type: 'text' | 'photo' | 'voice';
  content: string;
  timestamp: string;
  duration?: number; // For voice notes in seconds
}

export type NotebookCategory = 'student' | 'business' | 'creative' | 'journal' | 'planner';

export interface NotebookTemplate {
  id: string;
  title: string;
  category: NotebookCategory;
  pages: number;
  coverImage: string;
  description: string;
}

export interface QRScanResult {
  type: 'notebook' | 'page';
  notebookId: string;
  pageNumber?: number;
}
