import React, { createContext, useContext, useState, useCallback } from 'react';
import { NavigationState, NavigationLevel } from '@/types/database';

interface NavigationContextType {
  state: NavigationState;
  navigateToSpace: (spaceId: string) => void;
  navigateToFolder: (folderId: string) => void;
  navigateToOutline: (outlineId: string) => void;
  navigateToDocument: (documentId: string) => void;
  navigateToChat: (chatId: string) => void;
  navigateBack: () => void;
  reset: () => void;
}

const defaultState: NavigationState = {
  spaceId: null,
  folderId: null,
  outlineId: null,
  documentId: null,
  chatId: null,
  level: 'space',
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>(defaultState);

  const navigateToSpace = useCallback((spaceId: string) => {
    setState({
      spaceId,
      folderId: null,
      outlineId: null,
      documentId: null,
      chatId: null,
      level: 'space',
    });
  }, []);

  const navigateToFolder = useCallback((folderId: string) => {
    setState(prev => ({
      ...prev,
      folderId,
      outlineId: null,
      documentId: null,
      chatId: null,
      level: 'folder',
    }));
  }, []);

  const navigateToOutline = useCallback((outlineId: string) => {
    setState(prev => ({
      ...prev,
      outlineId,
      documentId: null,
      chatId: null,
      level: 'outline',
    }));
  }, []);

  const navigateToDocument = useCallback((documentId: string) => {
    setState(prev => ({
      ...prev,
      documentId,
      chatId: null,
      level: 'document',
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
      switch (prev.level) {
        case 'document':
          return { ...prev, documentId: null, chatId: null, level: 'outline' as NavigationLevel };
        case 'outline':
          return { ...prev, outlineId: null, chatId: null, level: 'folder' as NavigationLevel };
        case 'folder':
          return { ...prev, folderId: null, chatId: null, level: 'space' as NavigationLevel };
        default:
          return prev;
      }
    });
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        state,
        navigateToSpace,
        navigateToFolder,
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
