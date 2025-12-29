import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Outline } from '@/types/database';
import { toast } from 'sonner';

export const useOutlines = (folderId: string | null) => {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutlines = useCallback(async () => {
    if (!folderId) {
      setOutlines([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('outlines')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutlines(data || []);
    } catch (error) {
      console.error('Error fetching outlines:', error);
      toast.error('Failed to load outlines');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchOutlines();
  }, [fetchOutlines]);

  const createOutline = async (title: string, description?: string) => {
    if (!folderId) return null;

    try {
      const { data, error } = await supabase
        .from('outlines')
        .insert({
          folder_id: folderId,
          title,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      setOutlines(prev => [data, ...prev]);
      toast.success('Outline created');
      return data;
    } catch (error) {
      console.error('Error creating outline:', error);
      toast.error('Failed to create outline');
      return null;
    }
  };

  const updateOutline = async (id: string, updates: Partial<Outline>) => {
    try {
      const { error } = await supabase
        .from('outlines')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setOutlines(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
      toast.success('Outline updated');
    } catch (error) {
      console.error('Error updating outline:', error);
      toast.error('Failed to update outline');
    }
  };

  const deleteOutline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('outlines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOutlines(prev => prev.filter(o => o.id !== id));
      toast.success('Outline deleted');
    } catch (error) {
      console.error('Error deleting outline:', error);
      toast.error('Failed to delete outline');
    }
  };

  return {
    outlines,
    loading,
    createOutline,
    updateOutline,
    deleteOutline,
    refetch: fetchOutlines,
  };
};
