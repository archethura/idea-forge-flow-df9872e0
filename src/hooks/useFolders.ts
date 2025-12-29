import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Folder, FolderWithCounts } from '@/types/database';
import { toast } from 'sonner';

export const useFolders = (spaceId: string | null) => {
  const [folders, setFolders] = useState<FolderWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!spaceId) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (name: string, color?: string, icon?: string) => {
    if (!spaceId) return null;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          space_id: spaceId,
          name,
          color: color || '#F59E0B',
          icon: icon || '📁',
        })
        .select()
        .single();

      if (error) throw error;
      setFolders(prev => [...prev, data]);
      toast.success('Folder created');
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
      return null;
    }
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    try {
      const { error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      toast.success('Folder updated');
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFolders(prev => prev.filter(f => f.id !== id));
      toast.success('Folder deleted');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    refetch: fetchFolders,
  };
};
