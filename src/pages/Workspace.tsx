import React, { useState } from 'react';
import { useNavigation, NavigationProvider } from '@/contexts/NavigationContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { FolderList } from '@/components/folders/FolderList';
import { OutlineList } from '@/components/outlines/OutlineList';
import { DocumentList } from '@/components/documents/DocumentList';
import { PointTree } from '@/components/outlines/PointTree';
import { CardEditor } from '@/components/documents/CardEditor';
import { HierarchicalChatView } from '@/components/chat/HierarchicalChatView';
import { useSpaces } from '@/hooks/useSpaces';
import { useFolders } from '@/hooks/useFolders';
import { useOutlines } from '@/hooks/useOutlines';
import { useDocuments } from '@/hooks/useDocuments';
import { usePoints } from '@/hooks/usePoints';
import { useCards } from '@/hooks/useCards';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Layers, FolderIcon, FileText, File, Sparkles, MessageSquare, X } from 'lucide-react';

const WorkspaceContent: React.FC = () => {
  const { state, navigateToSpace, navigateToFolder, navigateToOutline, navigateToDocument } = useNavigation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { spaces } = useSpaces();
  const { folders, createFolder, deleteFolder } = useFolders(state.spaceId);
  const { outlines, createOutline, deleteOutline } = useOutlines(state.folderId);
  const { documents, createDocument, deleteDocument } = useDocuments(state.outlineId);
  const { pointTree, points, createPoint, updatePoint, deletePoint } = usePoints(state.outlineId);
  const { cardTree, createCard, updateCard, deleteCard } = useCards(state.documentId);

  // Get names for breadcrumbs
  const currentSpace = spaces.find(s => s.id === state.spaceId);
  const currentFolder = folders.find(f => f.id === state.folderId);
  const currentOutline = outlines.find(o => o.id === state.outlineId);
  const currentDocument = documents.find(d => d.id === state.documentId);

  const renderContent = () => {
    // Document level - show cards editor
    if (state.level === 'document' && state.documentId) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <File className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentDocument?.title || 'Document'}</h1>
              <p className="text-muted-foreground text-sm">Write and organize content cards</p>
            </div>
          </div>
          <Separator />
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

    // Outline level - show points tree and documents
    if (state.level === 'outline' && state.outlineId) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentOutline?.title || 'Outline'}</h1>
              {currentOutline?.description && (
                <p className="text-muted-foreground text-sm">{currentOutline.description}</p>
              )}
            </div>
          </div>
          <Separator />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Points */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Points
              </h2>
              <div className="bg-card/50 rounded-xl p-4 border border-border/50">
                <PointTree
                  points={pointTree}
                  onCreatePoint={(text, parentId) => createPoint(text, parentId)}
                  onUpdatePoint={(id, text) => updatePoint(id, { text })}
                  onDeletePoint={deletePoint}
                />
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <DocumentList
                documents={documents}
                selectedDocumentId={null}
                onSelectDocument={navigateToDocument}
                onCreateDocument={createDocument}
                onDeleteDocument={deleteDocument}
              />
            </div>
          </div>
        </div>
      );
    }

    // Folder level - show outlines
    if (state.level === 'folder' && state.folderId) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg" 
              style={{ backgroundColor: `${currentFolder?.color}20` }}
            >
              <FolderIcon className="w-5 h-5" style={{ color: currentFolder?.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentFolder?.name || 'Folder'}</h1>
              <p className="text-muted-foreground text-sm">Organize your outlines and notes</p>
            </div>
          </div>
          <Separator />
          
          <div className="bg-card/50 rounded-xl p-6 border border-border/50">
            <OutlineList
              outlines={outlines}
              selectedOutlineId={null}
              onSelectOutline={navigateToOutline}
              onCreateOutline={createOutline}
              onDeleteOutline={deleteOutline}
            />
          </div>
        </div>
      );
    }

    // Space level - show folders
    if (state.level === 'space' && state.spaceId) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <span className="text-xl">{currentSpace?.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentSpace?.name || 'Space'}</h1>
              {currentSpace?.description && (
                <p className="text-muted-foreground text-sm">{currentSpace.description}</p>
              )}
            </div>
          </div>
          <Separator />
          
          <div className="bg-card/50 rounded-xl p-6 border border-border/50">
            <FolderList
              folders={folders}
              selectedFolderId={null}
              onSelectFolder={navigateToFolder}
              onCreateFolder={createFolder}
              onDeleteFolder={deleteFolder}
            />
          </div>
        </div>
      );
    }

    // No space selected - welcome screen
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="p-4 rounded-2xl bg-primary/10 mb-6">
          <Layers className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Welcome to SPACE</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Select a space from the sidebar to begin organizing your thoughts into 
          folders, outlines, and documents.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>AI-powered knowledge management</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        selectedSpaceId={state.spaceId}
        onSelectSpace={navigateToSpace}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          spaceName={currentSpace?.name}
          folderName={currentFolder?.name}
          outlineName={currentOutline?.title}
          documentName={currentDocument?.title}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <main className={`flex-1 overflow-auto p-8 transition-all ${isChatOpen ? 'pr-4' : ''}`}>
            {renderContent()}
          </main>
          
          {/* Chat Panel */}
          {isChatOpen ? (
            <div className="w-96 border-l border-border bg-card/50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-semibold">AI Chat</span>
                <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                <HierarchicalChatView />
              </div>
            </div>
          ) : (
            <Button
              className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          )}
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
