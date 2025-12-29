import { useMemo } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useSpaces } from './useSpaces';
import { useFolders } from './useFolders';
import { useNotes } from './useNotes';
import { useOutlines } from './useOutlines';
import { usePoints } from './usePoints';
import { useDocuments } from './useDocuments';
import { useCards } from './useCards';

export interface HierarchicalContext {
  space?: {
    id: string;
    name: string;
    description: string | null;
  };
  folder?: {
    id: string;
    name: string;
  };
  notes?: Array<{
    id: string;
    title: string;
    content: string | null;
  }>;
  outline?: {
    id: string;
    title: string;
    description: string | null;
  };
  points?: Array<{
    id: string;
    text: string;
    parent_point_id: string | null;
    order_index: number;
  }>;
  document?: {
    id: string;
    title: string;
    status: string;
  };
  cards?: Array<{
    id: string;
    content: string;
    order_index: number;
  }>;
  level: string;
}

export function useHierarchicalContext(): HierarchicalContext {
  const { state } = useNavigation();
  const { spaces } = useSpaces();
  const { folders } = useFolders(state.spaceId);
  const { notes } = useNotes(state.folderId);
  const { outlines } = useOutlines(state.folderId);
  const { points } = usePoints(state.outlineId);
  const { documents } = useDocuments(state.outlineId);
  const { cards } = useCards(state.documentId);

  const context = useMemo(() => {
    const ctx: HierarchicalContext = {
      level: state.level,
    };

    // Always include space if selected
    if (state.spaceId) {
      const space = spaces?.find(s => s.id === state.spaceId);
      if (space) {
        ctx.space = {
          id: space.id,
          name: space.name,
          description: space.description,
        };
      }
    }

    // Include folder if at folder level or deeper
    if (state.folderId) {
      const folder = folders?.find(f => f.id === state.folderId);
      if (folder) {
        ctx.folder = {
          id: folder.id,
          name: folder.name,
        };
      }

      // Include notes in this folder
      if (notes && notes.length > 0) {
        ctx.notes = notes.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content,
        }));
      }
    }

    // Include outline if at outline level or deeper
    if (state.outlineId) {
      const outline = outlines?.find(o => o.id === state.outlineId);
      if (outline) {
        ctx.outline = {
          id: outline.id,
          title: outline.title,
          description: outline.description,
        };
      }

      // Include points in this outline
      if (points && points.length > 0) {
        ctx.points = points.map(p => ({
          id: p.id,
          text: p.text,
          parent_point_id: p.parent_point_id,
          order_index: p.order_index,
        }));
      }
    }

    // Include document if at document level
    if (state.documentId) {
      const document = documents?.find(d => d.id === state.documentId);
      if (document) {
        ctx.document = {
          id: document.id,
          title: document.title,
          status: document.status,
        };
      }

      // Include cards in this document
      if (cards && cards.length > 0) {
        ctx.cards = cards.map(c => ({
          id: c.id,
          content: c.content,
          order_index: c.order_index,
        }));
      }
    }

    return ctx;
  }, [state, spaces, folders, notes, outlines, points, documents, cards]);

  return context;
}
