import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Venture } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useVentures = () => {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVentures = useCallback(async () => {
    if (!user) {
      setVentures([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVentures(data || []);
    } catch (error) {
      console.error('Error fetching ventures:', error);
      toast.error('Failed to load ventures');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVentures();
  }, [fetchVentures]);

  const createVenture = async (name: string, primeDirective?: string, icon?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ventures')
        .insert({
          name,
          prime_directive: primeDirective || null,
          icon: icon || '🔥',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setVentures(prev => [data, ...prev]);
      toast.success('Venture created');
      return data;
    } catch (error) {
      console.error('Error creating venture:', error);
      toast.error('Failed to create venture');
      return null;
    }
  };

  const updateVenture = async (id: string, updates: Partial<Venture>) => {
    try {
      const { error } = await supabase
        .from('ventures')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setVentures(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
      toast.success('Venture updated');
    } catch (error) {
      console.error('Error updating venture:', error);
      toast.error('Failed to update venture');
    }
  };

  const deleteVenture = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ventures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVentures(prev => prev.filter(v => v.id !== id));
      toast.success('Venture deleted');
    } catch (error) {
      console.error('Error deleting venture:', error);
      toast.error('Failed to delete venture');
    }
  };

  return {
    ventures,
    loading,
    createVenture,
    updateVenture,
    deleteVenture,
    refetch: fetchVentures,
  };
};
