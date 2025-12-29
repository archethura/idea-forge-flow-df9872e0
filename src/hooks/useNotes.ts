import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, ContentType } from '@/types/database';
import { toast } from 'sonner';

export const useNotes = (folderId: string | null) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!folderId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (title: string, content?: string, type: ContentType = 'note') => {
    if (!folderId) return null;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          folder_id: folderId,
          title,
          content: content || null,
          type,
        })
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => [data, ...prev]);
      toast.success('Note created');
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
      toast.success('Note updated');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
};
