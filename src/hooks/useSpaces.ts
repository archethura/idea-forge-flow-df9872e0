import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Space } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSpaces = useCallback(async () => {
    if (!user) {
      setSpaces([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast.error('Failed to load spaces');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const createSpace = async (name: string, description?: string, icon?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          name,
          description: description || null,
          icon: icon || '📚',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setSpaces(prev => [data, ...prev]);
      toast.success('Space created');
      return data;
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
      return null;
    }
  };

  const updateSpace = async (id: string, updates: Partial<Space>) => {
    try {
      const { error } = await supabase
        .from('spaces')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setSpaces(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Space updated');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update space');
    }
  };

  const deleteSpace = async (id: string) => {
    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSpaces(prev => prev.filter(s => s.id !== id));
      toast.success('Space deleted');
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete space');
    }
  };

  return {
    spaces,
    loading,
    createSpace,
    updateSpace,
    deleteSpace,
    refetch: fetchSpaces,
  };
};
