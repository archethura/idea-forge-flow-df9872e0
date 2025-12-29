import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardWithChildren, Point } from '@/types/database';
import { toast } from 'sonner';

const buildCardTree = (cards: Card[]): CardWithChildren[] => {
  const cardMap = new Map<string, CardWithChildren>();
  const roots: CardWithChildren[] = [];

  // First pass: create all nodes
  cards.forEach(card => {
    cardMap.set(card.id, { ...card, children: [] });
  });

  // Second pass: build tree
  cards.forEach(card => {
    const node = cardMap.get(card.id)!;
    if (card.parent_card_id) {
      const parent = cardMap.get(card.parent_card_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort children by order_index
  const sortChildren = (nodes: CardWithChildren[]) => {
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

export const useCards = (documentId: string | null) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [cardTree, setCardTree] = useState<CardWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    if (!documentId) {
      setCards([]);
      setCardTree([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('document_id', documentId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCards(data || []);
      setCardTree(buildCardTree(data || []));
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = async (content: string, sourcePointId?: string, parentCardId?: string) => {
    if (!documentId) return null;

    // Get the next order_index
    const siblings = cards.filter(c => c.parent_card_id === (parentCardId || null));
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(c => c.order_index)) : -1;

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          document_id: documentId,
          content,
          source_point_id: sourcePointId || null,
          parent_card_id: parentCardId || null,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      const newCards = [...cards, data];
      setCards(newCards);
      setCardTree(buildCardTree(newCards));
      return data;
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
      return null;
    }
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      const newCards = cards.map(c => c.id === id ? { ...c, ...updates } : c);
      setCards(newCards);
      setCardTree(buildCardTree(newCards));
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card');
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      const newCards = cards.filter(c => c.id !== id && c.parent_card_id !== id);
      setCards(newCards);
      setCardTree(buildCardTree(newCards));
      toast.success('Card deleted');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  const createCardsFromPoints = async (points: Point[]) => {
    if (!documentId) return;

    try {
      const cardsToCreate = points.map((point, index) => ({
        document_id: documentId,
        content: '',
        source_point_id: point.id,
        parent_card_id: null,
        order_index: index,
      }));

      const { data, error } = await supabase
        .from('cards')
        .insert(cardsToCreate)
        .select();

      if (error) throw error;
      const newCards = [...cards, ...(data || [])];
      setCards(newCards);
      setCardTree(buildCardTree(newCards));
      toast.success('Cards created from points');
    } catch (error) {
      console.error('Error creating cards from points:', error);
      toast.error('Failed to create cards');
    }
  };

  return {
    cards,
    cardTree,
    loading,
    createCard,
    updateCard,
    deleteCard,
    createCardsFromPoints,
    refetch: fetchCards,
  };
};
