import React, { createContext, useContext, useState, useCallback } from 'react';
import { NavigationState, NavigationLevel, WorldView } from '@/types/database';

interface NavigationContextType {
  state: NavigationState;
  navigateToVenture: (ventureId: string) => void;
  navigateToSpace: (spaceId: string) => void;
  navigateToWorld: (worldId: string, folderId?: string) => void;
  navigateToView: (view: WorldView) => void;
  navigateToOutline: (outlineId: string) => void;
  navigateToDocument: (documentId: string) => void;
  navigateToChat: (chatId: string) => void;
  navigateBack: () => void;
  reset: () => void;
}

const defaultState: NavigationState = {
  ventureId: null,
  spaceId: null,
  worldId: null,
  folderId: null,
  outlineId: null,
  documentId: null,
  chatId: null,
  view: null,
  level: 'venture',
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>(defaultState);

  const navigateToVenture = useCallback((ventureId: string) => {
    setState({
      ventureId,
      spaceId: null,
      worldId: null,
      folderId: null,
      outlineId: null,
      documentId: null,
      chatId: null,
      view: null,
      level: 'venture',
    });
  }, []);

  const navigateToSpace = useCallback((spaceId: string) => {
    setState(prev => ({
      ...prev,
      spaceId,
      worldId: null,
      folderId: null,
      outlineId: null,
      documentId: null,
      chatId: null,
      view: null,
      level: 'space',
    }));
  }, []);

  const navigateToWorld = useCallback((worldId: string, folderId?: string) => {
    setState(prev => ({
      ...prev,
      worldId,
      folderId: folderId || null,
      outlineId: null,
      documentId: null,
      chatId: null,
      view: 'exchange', // Default to Exchange view
      level: 'exchange',
    }));
  }, []);

  const navigateToView = useCallback((view: WorldView) => {
    setState(prev => ({
      ...prev,
      outlineId: null,
      documentId: null,
      chatId: null,
      view,
      level: view as NavigationLevel,
    }));
  }, []);

  const navigateToOutline = useCallback((outlineId: string) => {
    setState(prev => ({
      ...prev,
      outlineId,
      documentId: null,
      chatId: null,
    }));
  }, []);

  const navigateToDocument = useCallback((documentId: string) => {
    setState(prev => ({
      ...prev,
      documentId,
      chatId: null,
    }));
  }, []);

  const navigateToChat = useCallback((chatId: string) => {
    setState(prev => ({
      ...prev,
      chatId,
    }));
  }, []);

  const navigateBack = useCallback(() => {
    setState(prev => {
      // If in a document, go back to outline view
      if (prev.documentId) {
        return { ...prev, documentId: null, chatId: null };
      }
      // If in an outline, go back to factory view
      if (prev.outlineId) {
        return { ...prev, outlineId: null, chatId: null };
      }
      // If in a view, go back to world selection
      if (prev.view) {
        return { ...prev, view: null, worldId: null, folderId: null, level: 'space' as NavigationLevel };
      }
      // If in a world, go back to space
      if (prev.worldId) {
        return { ...prev, worldId: null, folderId: null, view: null, level: 'space' as NavigationLevel };
      }
      // If in a space, go back to venture
      if (prev.spaceId) {
        return { ...prev, spaceId: null, level: 'venture' as NavigationLevel };
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        state,
        navigateToVenture,
        navigateToSpace,
        navigateToWorld,
        navigateToView,
        navigateToOutline,
        navigateToDocument,
        navigateToChat,
        navigateBack,
        reset,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
