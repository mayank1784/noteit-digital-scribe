import React, { createContext, useContext, useEffect, useState } from 'react';
import { RegisteredNotebook, NotePage, Note, NotebookTemplate, NotebookCategory, NoteType, UserPlan, PageGroup } from '@/types';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotebooksContextType {
  notebooks: RegisteredNotebook[];
  templates: NotebookTemplate[];
  categories: NotebookCategory[];
  noteTypes: NoteType[];
  userPlan: UserPlan | null;
  pageGroups: PageGroup[];
  registerNotebook: (notebookId: string, nickname: string) => Promise<boolean>;
  deleteNotebook: (notebookId: string) => void;
  getNotebook: (id: string) => RegisteredNotebook | undefined;
  getPage: (notebookId: string, pageNumber: number) => Promise<NotePage>;
  addNote: (notebookId: string, pageNumber: number, note: { type_id: string; content: string; duration?: number; file_url?: string }) => Promise<void>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  createPageGroup: (notebookId: string, name: string, description?: string) => Promise<PageGroup | null>;
  updatePageGroup: (groupId: string, name: string, description?: string) => Promise<void>;
  deletePageGroup: (groupId: string) => Promise<void>;
  addPagesToGroup: (groupId: string, pageNumbers: number[]) => Promise<void>;
  removePagesFromGroup: (groupId: string, pageNumbers: number[]) => Promise<void>;
  getNotebookGroups: (notebookId: string) => PageGroup[];
  isLoading: boolean;
}

const NotebooksContext = createContext<NotebooksContextType | undefined>(undefined);

export const NotebooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState<RegisteredNotebook[]>([]);
  const [templates, setTemplates] = useState<NotebookTemplate[]>([]);
  const [categories, setCategories] = useState<NotebookCategory[]>([]);
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [pageGroups, setPageGroups] = useState<PageGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setNotebooks([]);
      setUserPlan(null);
      setPageGroups([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Load user's notebooks
      const { data: notebooksData } = await supabase
        .from('registered_notebooks')
        .select('*')
        .eq('user_id', user!.id)
        .order('registered_at', { ascending: false });

      // Load templates
      const { data: templatesData } = await supabase
        .from('notebook_templates')
        .select('*');

      // Load categories
      const { data: categoriesData } = await supabase
        .from('notebook_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      // Load note types
      const { data: noteTypesData } = await supabase
        .from('note_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      // Load user plan
      const { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('id', user!.plan_id)
        .single();

      // Load page groups
      const { data: pageGroupsData } = await supabase
        .from('page_groups')
        .select('*')
        .eq('user_id', user!.id)
        .order('sort_order');

      // Load page group members
      const { data: groupMembersData } = await supabase
        .from('page_group_members')
        .select('*');

      // Combine groups with their pages
      const groupsWithPages: PageGroup[] = (pageGroupsData || []).map(group => ({
        ...group,
        pages: (groupMembersData || [])
          .filter(member => member.group_id === group.id)
          .map(member => member.page_number)
          .sort((a, b) => a - b)
      }));

      setNotebooks(notebooksData || []);
      setTemplates(templatesData || []);
      setCategories(categoriesData || []);
      setNoteTypes(noteTypesData || []);
      setPageGroups(groupsWithPages);
      
      // Convert the Json features to string[] for our UserPlan type
      if (planData) {
        const convertedPlan: UserPlan = {
          ...planData,
          features: Array.isArray(planData.features) ? planData.features as string[] : []
        };
        setUserPlan(convertedPlan);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerNotebook = async (notebookId: string, nickname: string): Promise<boolean> => {
    if (!user || !userPlan) return false;

    // Check if notebook already registered
    if (notebooks.find(nb => nb.id === notebookId)) {
      return false;
    }

    if (notebooks.length >= userPlan.max_notebooks) {
      return false;
    }

    // Find template
    const template = templates.find(t => notebookId.startsWith(t.id));
    if (!template) return false;

    const { error } = await supabase
      .from('registered_notebooks')
      .insert({
        id: notebookId,
        user_id: user.id,
        nickname: nickname && nickname.length > 0 ? nickname : notebookId,
        category_id: template.category_id,
        title: template.title,
        total_pages: template.pages,
        cover_image: template.cover_image
      });

    if (error) {
      console.error('Error registering notebook:', error);
      return false;
    }

    // Reload notebooks
    loadData();
    return true;
  };

  const deleteNotebook = async (notebookId: string) => {
    const { error } = await supabase
      .from('registered_notebooks')
      .delete()
      .eq('id', notebookId)
      .eq('user_id', user!.id);

    if (error) {
      console.error('Error deleting notebook:', error);
      return;
    }

    // Reload notebooks
    loadData();
  };

  const getNotebook = (id: string) => {
    return notebooks.find(nb => nb.id === id);
  };

  const getPage = async (notebookId: string, pageNumber: number): Promise<NotePage> => {
    if (!user) throw new Error('User not authenticated');

    const pageId = `${notebookId}-${pageNumber}`;
    
    // Try to get existing page with notes
    const { data: existingPage } = await supabase
      .from('note_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    // Get notes for this page
    const { data: notesData } = await supabase
      .from('notes')
      .select('*')
      .eq('page_id', pageId)
      .order('timestamp', { ascending: false });

    if (existingPage) {
      return {
        ...existingPage,
        notes: notesData || []
      };
    }

    // Create new page if it doesn't exist
    const { data: newPage, error } = await supabase
      .from('note_pages')
      .insert({
        id: pageId,
        notebook_id: notebookId,
        page_number: pageNumber
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating page:', error);
      throw error;
    }

    return {
      ...newPage,
      notes: []
    };
  };

  const addNote = async (notebookId: string, pageNumber: number, note: { type_id: string; content: string; duration?: number; file_url?: string }) => {
    if (!user) return;

    const pageId = `${notebookId}-${pageNumber}`;
    
    // Ensure page exists
    await getPage(notebookId, pageNumber);

    const { error } = await supabase
      .from('notes')
      .insert({
        page_id: pageId,
        type_id: note.type_id,
        content: note.content,
        duration: note.duration,
        file_url: note.file_url
      });

    if (error) {
      console.error('Error adding note:', error);
      return;
    }

    // Update notebook last used
    await supabase
      .from('registered_notebooks')
      .update({ last_used: new Date().toISOString() })
      .eq('id', notebookId)
      .eq('user_id', user.id);

    // Update page last modified
    await supabase
      .from('note_pages')
      .update({ last_modified: new Date().toISOString() })
      .eq('id', pageId);
  };

  const updateNote = async (noteId: string, content: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', noteId);

    if (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
    }
  };

  const createPageGroup = async (notebookId: string, name: string, description?: string): Promise<PageGroup | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('page_groups')
      .insert({
        notebook_id: notebookId,
        user_id: user.id,
        name,
        description,
        sort_order: pageGroups.filter(g => g.notebook_id === notebookId).length
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating page group:', error);
      return null;
    }

    const newGroup: PageGroup = { ...data, pages: [] };
    setPageGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  const updatePageGroup = async (groupId: string, name: string, description?: string) => {
    const { error } = await supabase
      .from('page_groups')
      .update({ 
        name, 
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId);

    if (error) {
      console.error('Error updating page group:', error);
      return;
    }

    setPageGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name, description, updated_at: new Date().toISOString() }
        : group
    ));
  };

  const deletePageGroup = async (groupId: string) => {
    const { error } = await supabase
      .from('page_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting page group:', error);
      return;
    }

    setPageGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const addPagesToGroup = async (groupId: string, pageNumbers: number[]) => {
    if (!pageNumbers.length) return;

    // Remove duplicates and filter out pages already in the group
    const group = pageGroups.find(g => g.id === groupId);
    if (!group) return;

    const newPages = pageNumbers.filter(pageNum => !group.pages.includes(pageNum));
    if (!newPages.length) return;

    const insertData = newPages.map(pageNumber => ({
      group_id: groupId,
      page_number: pageNumber
    }));

    const { error } = await supabase
      .from('page_group_members')
      .insert(insertData);

    if (error) {
      console.error('Error adding pages to group:', error);
      return;
    }

    setPageGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, pages: [...group.pages, ...newPages].sort((a, b) => a - b) }
        : group
    ));
  };

  const removePagesFromGroup = async (groupId: string, pageNumbers: number[]) => {
    if (!pageNumbers.length) return;

    const { error } = await supabase
      .from('page_group_members')
      .delete()
      .eq('group_id', groupId)
      .in('page_number', pageNumbers);

    if (error) {
      console.error('Error removing pages from group:', error);
      return;
    }

    setPageGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, pages: group.pages.filter(pageNum => !pageNumbers.includes(pageNum)) }
        : group
    ));
  };

  const getNotebookGroups = (notebookId: string): PageGroup[] => {
    return pageGroups.filter(group => group.notebook_id === notebookId);
  };

  return (
    <NotebooksContext.Provider value={{
      notebooks,
      templates,
      categories,
      noteTypes,
      userPlan,
      pageGroups,
      registerNotebook,
      deleteNotebook,
      getNotebook,
      getPage,
      addNote,
      updateNote,
      deleteNote,
      createPageGroup,
      updatePageGroup,
      deletePageGroup,
      addPagesToGroup,
      removePagesFromGroup,
      getNotebookGroups,
      isLoading
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
