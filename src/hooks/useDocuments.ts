import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, DeliverableStatus, GovernorSettings } from '@/types/database';
import { toast } from 'sonner';

// Helper to transform Supabase data to our Document type
const transformDocument = (data: any): Document => ({
  ...data,
  governor_settings: (data.governor_settings || {}) as GovernorSettings,
});

export const useDocuments = (outlineId: string | null) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!outlineId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('outline_id', outlineId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []).map(transformDocument));
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [outlineId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (title: string) => {
    if (!outlineId) return null;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          outline_id: outlineId,
          title,
          status: 'draft' as DeliverableStatus,
        })
        .select()
        .single();

      if (error) throw error;
      const doc = transformDocument(data);
      setDocuments(prev => [doc, ...prev]);
      toast.success('Document created');
      return doc;
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      // Transform GovernorSettings to JSON-compatible format
      const dbUpdates: any = { ...updates };
      if (updates.governor_settings) {
        dbUpdates.governor_settings = updates.governor_settings as any;
      }
      
      const { error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      toast.success('Document updated');
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
};
