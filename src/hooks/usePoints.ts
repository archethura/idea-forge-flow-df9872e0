import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Point, PointWithChildren } from '@/types/database';
import { toast } from 'sonner';

const buildPointTree = (points: Point[]): PointWithChildren[] => {
  const pointMap = new Map<string, PointWithChildren>();
  const roots: PointWithChildren[] = [];

  // First pass: create all nodes
  points.forEach(point => {
    pointMap.set(point.id, { ...point, children: [] });
  });

  // Second pass: build tree
  points.forEach(point => {
    const node = pointMap.get(point.id)!;
    if (point.parent_point_id) {
      const parent = pointMap.get(point.parent_point_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort children by order_index
  const sortChildren = (nodes: PointWithChildren[]) => {
    nodes.sort((a, b) => a.order_index - b.order_index);
    nodes.forEach(node => {
      if (node.children?.length) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(roots);
  return roots;
};

export const usePoints = (outlineId: string | null) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [pointTree, setPointTree] = useState<PointWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    if (!outlineId) {
      setPoints([]);
      setPointTree([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('outline_id', outlineId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPoints(data || []);
      setPointTree(buildPointTree(data || []));
    } catch (error) {
      console.error('Error fetching points:', error);
      toast.error('Failed to load points');
    } finally {
      setLoading(false);
    }
  }, [outlineId]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const createPoint = async (text: string, parentPointId?: string) => {
    if (!outlineId) return null;

    // Get the next order_index
    const siblings = points.filter(p => p.parent_point_id === (parentPointId || null));
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(p => p.order_index)) : -1;

    try {
      const { data, error } = await supabase
        .from('points')
        .insert({
          outline_id: outlineId,
          text,
          parent_point_id: parentPointId || null,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      const newPoints = [...points, data];
      setPoints(newPoints);
      setPointTree(buildPointTree(newPoints));
      return data;
    } catch (error) {
      console.error('Error creating point:', error);
      toast.error('Failed to create point');
      return null;
    }
  };

  const updatePoint = async (id: string, updates: Partial<Point>) => {
    try {
      const { error } = await supabase
        .from('points')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      const newPoints = points.map(p => p.id === id ? { ...p, ...updates } : p);
      setPoints(newPoints);
      setPointTree(buildPointTree(newPoints));
    } catch (error) {
      console.error('Error updating point:', error);
      toast.error('Failed to update point');
    }
  };

  const deletePoint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('points')
        .delete()
        .eq('id', id);

      if (error) throw error;
      const newPoints = points.filter(p => p.id !== id && p.parent_point_id !== id);
      setPoints(newPoints);
      setPointTree(buildPointTree(newPoints));
      toast.success('Point deleted');
    } catch (error) {
      console.error('Error deleting point:', error);
      toast.error('Failed to delete point');
    }
  };

  return {
    points,
    pointTree,
    loading,
    createPoint,
    updatePoint,
    deletePoint,
    refetch: fetchPoints,
  };
};
