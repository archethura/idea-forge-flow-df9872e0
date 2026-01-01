import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ingot } from '@/types/database';
import { toast } from 'sonner';

export const useIngots = (outlineId: string | null) => {
  const [ingots, setIngots] = useState<Ingot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngots = useCallback(async () => {
    if (!outlineId) {
      setIngots([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ingots')
        .select('*')
        .eq('outline_id', outlineId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setIngots(data || []);
    } catch (error) {
      console.error('Error fetching ingots:', error);
      toast.error('Failed to load ingots');
    } finally {
      setLoading(false);
    }
  }, [outlineId]);

  useEffect(() => {
    fetchIngots();
  }, [fetchIngots]);

  const createIngot = async (pureConcept: string, oreId?: string) => {
    if (!outlineId) return null;

    try {
      const maxOrder = ingots.reduce((max, i) => Math.max(max, i.order_index), -1);
      
      const { data, error } = await supabase
        .from('ingots')
        .insert({
          outline_id: outlineId,
          ore_id: oreId || null,
          pure_concept: pureConcept,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      setIngots(prev => [...prev, data]);
      
      // Mark ore as processed if provided
      if (oreId) {
        await supabase
          .from('ore')
          .update({ is_processed: true })
          .eq('id', oreId);
      }
      
      toast.success('Ingot created');
      return data;
    } catch (error) {
      console.error('Error creating ingot:', error);
      toast.error('Failed to create ingot');
      return null;
    }
  };

  const updateIngot = async (id: string, updates: Partial<Ingot>) => {
    try {
      const { error } = await supabase
        .from('ingots')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setIngots(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    } catch (error) {
      console.error('Error updating ingot:', error);
      toast.error('Failed to update ingot');
    }
  };

  const deleteIngot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ingots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIngots(prev => prev.filter(i => i.id !== id));
      toast.success('Ingot deleted');
    } catch (error) {
      console.error('Error deleting ingot:', error);
      toast.error('Failed to delete ingot');
    }
  };

  const reorderIngots = async (reorderedIngots: Ingot[]) => {
    try {
      const updates = reorderedIngots.map((ingot, index) => ({
        id: ingot.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('ingots')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      setIngots(reorderedIngots.map((ingot, index) => ({
        ...ingot,
        order_index: index,
      })));
    } catch (error) {
      console.error('Error reordering ingots:', error);
      toast.error('Failed to reorder');
    }
  };

  return {
    ingots,
    loading,
    createIngot,
    updateIngot,
    deleteIngot,
    reorderIngots,
    refetch: fetchIngots,
  };
};
