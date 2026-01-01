import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Space, SpaceLevel } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Helper to transform Supabase data to our Space type
const transformSpace = (data: any): Space => ({
  ...data,
  level: (data.level || 'space') as SpaceLevel,
});

export const useSpaces = (ventureId?: string | null) => {
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
      let query = supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by venture if provided
      if (ventureId) {
        query = query.eq('venture_id', ventureId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSpaces((data || []).map(transformSpace));
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast.error('Failed to load spaces');
    } finally {
      setLoading(false);
    }
  }, [user, ventureId]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const createSpace = async (
    name: string, 
    description?: string, 
    icon?: string,
    level: SpaceLevel = 'space',
    parentSpaceId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          name,
          description: description || null,
          icon: icon || '📚',
          user_id: user.id,
          venture_id: ventureId || null,
          parent_space_id: parentSpaceId || null,
          level,
        })
        .select()
        .single();

      if (error) throw error;
      const space = transformSpace(data);
      setSpaces(prev => [space, ...prev]);
      toast.success(level === 'world' ? 'World created' : 'Space created');
      return space;
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
      toast.success('Updated');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update');
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
      toast.success('Deleted');
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete');
    }
  };

  // Get only top-level spaces (not worlds)
  const topLevelSpaces = spaces.filter(s => s.level === 'space');
  
  // Get worlds for a specific space
  const getWorlds = (spaceId: string) => spaces.filter(s => s.level === 'world' && s.parent_space_id === spaceId);

  return {
    spaces,
    topLevelSpaces,
    getWorlds,
    loading,
    createSpace,
    updateSpace,
    deleteSpace,
    refetch: fetchSpaces,
  };
};
