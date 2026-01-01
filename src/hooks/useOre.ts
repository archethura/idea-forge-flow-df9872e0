import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ore } from '@/types/database';
import { toast } from 'sonner';

export const useOre = (folderId: string | null) => {
  const [ore, setOre] = useState<Ore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOre = useCallback(async () => {
    if (!folderId) {
      setOre([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ore')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOre(data || []);
    } catch (error) {
      console.error('Error fetching ore:', error);
      toast.error('Failed to load warehouse');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchOre();
  }, [fetchOre]);

  const harvestFromComment = async (commentId: string, refinedText: string) => {
    if (!folderId) return null;

    try {
      const { data, error } = await supabase
        .from('ore')
        .insert({
          folder_id: folderId,
          source_comment_id: commentId,
          refined_text: refinedText,
        })
        .select()
        .single();

      if (error) throw error;
      setOre(prev => [data, ...prev]);
      
      // Mark the comment as harvested
      await supabase
        .from('chat_messages')
        .update({ is_ripe: true })
        .eq('id', commentId);
        
      toast.success('Harvested to warehouse');
      return data;
    } catch (error) {
      console.error('Error harvesting:', error);
      toast.error('Failed to harvest');
      return null;
    }
  };

  const harvestFromNote = async (noteId: string, refinedText: string) => {
    if (!folderId) return null;

    try {
      const { data, error } = await supabase
        .from('ore')
        .insert({
          folder_id: folderId,
          source_note_id: noteId,
          refined_text: refinedText,
        })
        .select()
        .single();

      if (error) throw error;
      setOre(prev => [data, ...prev]);
      toast.success('Harvested to warehouse');
      return data;
    } catch (error) {
      console.error('Error harvesting:', error);
      toast.error('Failed to harvest');
      return null;
    }
  };

  const updateOre = async (id: string, updates: Partial<Ore>) => {
    try {
      const { error } = await supabase
        .from('ore')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setOre(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    } catch (error) {
      console.error('Error updating ore:', error);
      toast.error('Failed to update');
    }
  };

  const deleteOre = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ore')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOre(prev => prev.filter(o => o.id !== id));
      toast.success('Removed from warehouse');
    } catch (error) {
      console.error('Error deleting ore:', error);
      toast.error('Failed to delete');
    }
  };

  // Separate processed and unprocessed ore
  const unprocessedOre = ore.filter(o => !o.is_processed);
  const processedOre = ore.filter(o => o.is_processed);

  return {
    ore,
    unprocessedOre,
    processedOre,
    loading,
    harvestFromComment,
    harvestFromNote,
    updateOre,
    deleteOre,
    refetch: fetchOre,
  };
};
