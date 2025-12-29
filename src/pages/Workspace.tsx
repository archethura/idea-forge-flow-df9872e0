import React, { useMemo } from 'react';
import { useNavigation, NavigationProvider } from '@/contexts/NavigationContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { FolderList } from '@/components/folders/FolderList';
import { OutlineList } from '@/components/outlines/OutlineList';
import { DocumentList } from '@/components/documents/DocumentList';
import { PointTree } from '@/components/outlines/PointTree';
import { CardEditor } from '@/components/documents/CardEditor';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useSpaces } from '@/hooks/useSpaces';
import { useFolders } from '@/hooks/useFolders';
import { useOutlines } from '@/hooks/useOutlines';
import { useDocuments } from '@/hooks/useDocuments';
import { usePoints } from '@/hooks/usePoints';
import { useCards } from '@/hooks/useCards';
import { useNotes } from '@/hooks/useNotes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, FolderIcon, FileText, File, Sparkles, List, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const WorkspaceContent: React.FC = () => {
  const { state, navigateToSpace, navigateToFolder, navigateToOutline, navigateToDocument } = useNavigation();
  const [showContent, setShowContent] = useState(true);
  
  const { spaces, refetch: refetchSpaces } = useSpaces();
  const { folders, createFolder, deleteFolder, refetch: refetchFolders } = useFolders(state.spaceId);
  const { notes, refetch: refetchNotes } = useNotes(state.folderId);
  const { outlines, createOutline, deleteOutline, refetch: refetchOutlines } = useOutlines(state.folderId);
  const { documents, createDocument, deleteDocument, refetch: refetchDocuments } = useDocuments(state.outlineId);
  const { pointTree, points, createPoint, updatePoint, deletePoint, refetch: refetchPoints } = usePoints(state.outlineId);
  const { cardTree, cards, createCard, updateCard, deleteCard, refetch: refetchCards } = useCards(state.documentId);

  // Refetch data after AI makes changes
  const handleDataChange = () => {
    refetchSpaces();
    refetchFolders();
    refetchNotes();
    refetchOutlines();
    refetchDocuments();
    refetchPoints();
    refetchCards();
  };

  // Get current items for breadcrumbs and context
  const currentSpace = spaces.find(s => s.id === state.spaceId);
  const currentFolder = folders.find(f => f.id === state.folderId);
  const currentOutline = outlines.find(o => o.id === state.outlineId);
  const currentDocument = documents.find(d => d.id === state.documentId);

  // Build context for AI based on current level
  const chatContext = useMemo(() => {
    const ctx: any = { level: state.level };
    
    if (currentSpace) {
      ctx.space = { id: currentSpace.id, name: currentSpace.name, description: currentSpace.description };
    }
    if (currentFolder) {
      ctx.folder = { id: currentFolder.id, name: currentFolder.name };
      if (notes?.length) {
        ctx.notes = notes.map(n => ({ id: n.id, title: n.title, content: n.content }));
      }
    }
    if (currentOutline) {
      ctx.outline = { id: currentOutline.id, title: currentOutline.title, description: currentOutline.description };
      if (points?.length) {
        ctx.points = points.map(p => ({ id: p.id, text: p.text, parent_point_id: p.parent_point_id, order_index: p.order_index }));
      }
    }
    if (currentDocument) {
      ctx.document = { id: currentDocument.id, title: currentDocument.title, status: currentDocument.status };
      if (cards?.length) {
        ctx.cards = cards.map(c => ({ id: c.id, content: c.content, order_index: c.order_index }));
      }
    }
    
    return ctx;
  }, [state.level, currentSpace, currentFolder, currentOutline, currentDocument, notes, points, cards]);

  const getContextLabel = () => {
    if (currentDocument) return `"${currentDocument.title}"`;
    if (currentOutline) return `"${currentOutline.title}"`;
    if (currentFolder) return `"${currentFolder.name}"`;
    if (currentSpace) return `"${currentSpace.name}"`;
    return 'workspace';
  };

  const currentLevel = state.level as 'space' | 'folder' | 'outline' | 'document';

  // Content panel for current level
  const ContentPanel = () => {
    if (state.level === 'document' && state.documentId) {
      return (
        <div className="p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg level-document flex items-center justify-center">
              <File className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{currentDocument?.title}</h1>
              <p className="text-xs text-muted-foreground">Document cards</p>
            </div>
          </div>
          <CardEditor
            cards={cardTree}
            points={points}
            onCreateCard={(content, sourcePointId, parentCardId) => createCard(content, sourcePointId, parentCardId)}
            onUpdateCard={(id, content) => updateCard(id, { content })}
            onDeleteCard={deleteCard}
          />
        </div>
      );
    }

    if (state.level === 'outline' && state.outlineId) {
      return (
        <div className="p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg level-outline flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{currentOutline?.title}</h1>
              {currentOutline?.description && (
                <p className="text-xs text-muted-foreground">{currentOutline.description}</p>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="mb-4 bg-secondary/50">
              <TabsTrigger value="points" className="gap-2 text-sm">
                <List className="w-3.5 h-3.5" />
                Points
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2 text-sm">
                <File className="w-3.5 h-3.5" />
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="points">
              <div className="bg-card/50 rounded-xl p-4 border border-border/30">
                <PointTree
                  points={pointTree}
                  onCreatePoint={(text, parentId) => createPoint(text, parentId)}
                  onUpdatePoint={(id, text) => updatePoint(id, { text })}
                  onDeletePoint={deletePoint}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <DocumentList
                documents={documents}
                selectedDocumentId={null}
                onSelectDocument={navigateToDocument}
                onCreateDocument={createDocument}
                onDeleteDocument={deleteDocument}
              />
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    if (state.level === 'folder' && state.folderId) {
      return (
        <div className="p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg level-folder flex items-center justify-center">
              <FolderIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{currentFolder?.name}</h1>
              <p className="text-xs text-muted-foreground">Outlines & notes</p>
            </div>
          </div>
          
          <OutlineList
            outlines={outlines}
            selectedOutlineId={null}
            onSelectOutline={navigateToOutline}
            onCreateOutline={createOutline}
            onDeleteOutline={deleteOutline}
          />
        </div>
      );
    }

    if (state.level === 'space' && state.spaceId) {
      return (
        <div className="p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg level-space flex items-center justify-center">
              <span className="text-sm">{currentSpace?.icon}</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{currentSpace?.name}</h1>
              {currentSpace?.description && (
                <p className="text-xs text-muted-foreground">{currentSpace.description}</p>
              )}
            </div>
          </div>
          
          <FolderList
            folders={folders}
            selectedFolderId={null}
            onSelectFolder={navigateToFolder}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
          />
        </div>
      );
    }

    return null;
  };

  // Welcome screen (no space selected)
  if (!state.spaceId) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar selectedSpaceId={state.spaceId} onSelectSpace={navigateToSpace} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-6 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-2xl font-semibold mb-3">Welcome</h1>
              <p className="text-muted-foreground mb-8">
                Select a space from the sidebar to start. Each level has its own AI agent with full context.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Agent-first architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main workspace with chat-first layout
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar selectedSpaceId={state.spaceId} onSelectSpace={navigateToSpace} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          spaceName={currentSpace?.name}
          folderName={currentFolder?.name}
          outlineName={currentOutline?.title}
          documentName={currentDocument?.title}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel - Primary */}
          <div className="flex-1 border-r border-border/30">
            <ChatPanel 
              context={chatContext} 
              contextLabel={getContextLabel()} 
              level={currentLevel}
              onDataChange={handleDataChange}
            />
          </div>
          
          {/* Content Panel - Secondary */}
          {showContent && (
            <div className="w-[420px] overflow-y-auto scrollbar-thin bg-card/30 animate-fade-in">
              <ContentPanel />
            </div>
          )}
          
          {/* Toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowContent(!showContent)}
            className="absolute right-4 top-[72px] z-10 bg-background/80 backdrop-blur-sm border border-border/30"
          >
            {showContent ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Workspace: React.FC = () => {
  return (
    <NavigationProvider>
      <WorkspaceContent />
    </NavigationProvider>
  );
};

export default Workspace;
