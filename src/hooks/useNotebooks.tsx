
import React, { createContext, useContext, useEffect, useState } from 'react';
import { RegisteredNotebook, NotePage, Note, NotebookTemplate } from '@/types';
import { useAuth } from './useAuth';

const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  {
    id: 'NB001',
    title: 'Student Grid Notebook',
    category: 'student',
    pages: 48,
    coverImage: '/covers/student-grid.jpg',
    description: 'Perfect for taking class notes with grid layout'
  },
  {
    id: 'NB002',
    title: 'Business Planner',
    category: 'business',
    pages: 64,
    coverImage: '/covers/business-planner.jpg',
    description: 'Professional planner for meetings and projects'
  },
  {
    id: 'NB003',
    title: 'Creative Sketchbook',
    category: 'creative',
    pages: 96,
    coverImage: '/covers/creative-sketch.jpg',
    description: 'Blank pages for sketches and creative ideas'
  },
  {
    id: 'NB004',
    title: 'Daily Journal',
    category: 'journal',
    pages: 120,
    coverImage: '/covers/daily-journal.jpg',
    description: 'Lined pages for daily thoughts and reflections'
  },
  {
    id: 'NB005',
    title: 'Weekly Planner',
    category: 'planner',
    pages: 52,
    coverImage: '/covers/weekly-planner.jpg',
    description: 'Structured weekly planning pages'
  }
];

interface NotebooksContextType {
  notebooks: RegisteredNotebook[];
  templates: NotebookTemplate[];
  registerNotebook: (notebookId: string, nickname: string) => Promise<boolean>;
  deleteNotebook: (notebookId: string) => void;
  getNotebook: (id: string) => RegisteredNotebook | undefined;
  getPage: (notebookId: string, pageNumber: number) => NotePage;
  addNote: (notebookId: string, pageNumber: number, note: Omit<Note, 'id' | 'timestamp'>) => void;
  updateNote: (notebookId: string, pageNumber: number, noteId: string, content: string) => void;
  deleteNote: (notebookId: string, pageNumber: number, noteId: string) => void;
}

const NotebooksContext = createContext<NotebooksContextType | undefined>(undefined);

export const NotebooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState<RegisteredNotebook[]>([]);

  useEffect(() => {
    if (user) {
      // Load user's notebooks from localStorage
      const storedNotebooks = localStorage.getItem(`noteit_notebooks_${user.id}`);
      if (storedNotebooks) {
        setNotebooks(JSON.parse(storedNotebooks));
      }
    } else {
      setNotebooks([]);
    }
  }, [user]);

  const saveNotebooks = (newNotebooks: RegisteredNotebook[]) => {
    if (user) {
      setNotebooks(newNotebooks);
      localStorage.setItem(`noteit_notebooks_${user.id}`, JSON.stringify(newNotebooks));
    }
  };

  const registerNotebook = async (notebookId: string, nickname: string): Promise<boolean> => {
    if (!user) return false;

    // Check if notebook already registered
    if (notebooks.find(nb => nb.id === notebookId)) {
      return false;
    }

    // Check if user has reached limit
    if (notebooks.length >= user.maxNotebooks) {
      return false;
    }

    // Find template
    const template = NOTEBOOK_TEMPLATES.find(t => notebookId.startsWith(t.id));
    if (!template) return false;

    const newNotebook: RegisteredNotebook = {
      id: notebookId,
      userId: user.id,
      nickname,
      category: template.category,
      title: template.title,
      totalPages: template.pages,
      registeredAt: new Date().toISOString(),
      coverImage: template.coverImage
    };

    saveNotebooks([...notebooks, newNotebook]);
    return true;
  };

  const deleteNotebook = (notebookId: string) => {
    const updatedNotebooks = notebooks.filter(nb => nb.id !== notebookId);
    saveNotebooks(updatedNotebooks);
    
    // Also clean up pages data
    if (user) {
      const pagesKey = `noteit_pages_${user.id}_${notebookId}`;
      localStorage.removeItem(pagesKey);
    }
  };

  const getNotebook = (id: string) => {
    return notebooks.find(nb => nb.id === id);
  };

  const getPage = (notebookId: string, pageNumber: number): NotePage => {
    if (!user) throw new Error('User not authenticated');

    const pagesKey = `noteit_pages_${user.id}_${notebookId}`;
    const storedPages = localStorage.getItem(pagesKey);
    const pages: NotePage[] = storedPages ? JSON.parse(storedPages) : [];
    
    const pageId = `${notebookId}-${pageNumber}`;
    let page = pages.find(p => p.id === pageId);
    
    if (!page) {
      page = {
        id: pageId,
        notebookId,
        pageNumber,
        notes: [],
        lastModified: new Date().toISOString()
      };
      pages.push(page);
      localStorage.setItem(pagesKey, JSON.stringify(pages));
    }
    
    return page;
  };

  const savePages = (notebookId: string, pages: NotePage[]) => {
    if (user) {
      const pagesKey = `noteit_pages_${user.id}_${notebookId}`;
      localStorage.setItem(pagesKey, JSON.stringify(pages));
    }
  };

  const addNote = (notebookId: string, pageNumber: number, note: Omit<Note, 'id' | 'timestamp'>) => {
    if (!user) return;

    const pagesKey = `noteit_pages_${user.id}_${notebookId}`;
    const storedPages = localStorage.getItem(pagesKey);
    const pages: NotePage[] = storedPages ? JSON.parse(storedPages) : [];
    
    const pageId = `${notebookId}-${pageNumber}`;
    let pageIndex = pages.findIndex(p => p.id === pageId);
    
    if (pageIndex === -1) {
      const newPage: NotePage = {
        id: pageId,
        notebookId,
        pageNumber,
        notes: [],
        lastModified: new Date().toISOString()
      };
      pages.push(newPage);
      pageIndex = pages.length - 1;
    }
    
    const newNote: Note = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    pages[pageIndex].notes.push(newNote);
    pages[pageIndex].lastModified = new Date().toISOString();
    
    savePages(notebookId, pages);
    
    // Update notebook last used
    const notebook = notebooks.find(nb => nb.id === notebookId);
    if (notebook) {
      notebook.lastUsed = new Date().toISOString();
      saveNotebooks([...notebooks]);
    }
  };

  const updateNote = (notebookId: string, pageNumber: number, noteId: string, content: string) => {
    if (!user) return;

    const pagesKey = `noteit_pages_${user.id}_${notebookId}`;
    const storedPages = localStorage.getItem(pagesKey);
    const pages: NotePage[] = storedPages ? JSON.parse(storedPages) : [];
    
    const pageIndex = pages.findIndex(p => p.id === `${notebookId}-${pageNumber}`);
    if (pageIndex === -1) return;
    
    const noteIndex = pages[pageIndex].notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;
    
    pages[pageIndex].notes[noteIndex].content = content;
    pages[pageIndex].lastModified = new Date().toISOString();
    
    savePages(notebookId, pages);
  };

  const deleteNote = (notebookId: string, pageNumber: number, noteId: string) => {
    if (!user) return;

    const pagesKey = `noteit_pages_${user.id}_${notebookId}`;
    const storedPages = localStorage.getItem(pagesKey);
    const pages: NotePage[] = storedPages ? JSON.parse(storedPages) : [];
    
    const pageIndex = pages.findIndex(p => p.id === `${notebookId}-${pageNumber}`);
    if (pageIndex === -1) return;
    
    pages[pageIndex].notes = pages[pageIndex].notes.filter(n => n.id !== noteId);
    pages[pageIndex].lastModified = new Date().toISOString();
    
    savePages(notebookId, pages);
  };

  return (
    <NotebooksContext.Provider value={{
      notebooks,
      templates: NOTEBOOK_TEMPLATES,
      registerNotebook,
      deleteNotebook,
      getNotebook,
      getPage,
      addNote,
      updateNote,
      deleteNote
    }}>
      {children}
    </NotebooksContext.Provider>
  );
};

export const useNotebooks = () => {
  const context = useContext(NotebooksContext);
  if (context === undefined) {
    throw new Error('useNotebooks must be used within a NotebooksProvider');
  }
  return context;
};
