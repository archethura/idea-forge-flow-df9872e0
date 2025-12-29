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
import { Layers, FolderIcon, FileText, File, Sparkles, MessageSquare, List, PenLine } from 'lucide-react';

const WorkspaceContent: React.FC = () => {
  const { state, navigateToSpace, navigateToFolder, navigateToOutline, navigateToDocument } = useNavigation();
  
  const { spaces } = useSpaces();
  const { folders, createFolder, deleteFolder } = useFolders(state.spaceId);
  const { notes } = useNotes(state.folderId);
  const { outlines, createOutline, deleteOutline } = useOutlines(state.folderId);
  const { documents, createDocument, deleteDocument } = useDocuments(state.outlineId);
  const { pointTree, points, createPoint, updatePoint, deletePoint } = usePoints(state.outlineId);
  const { cardTree, cards, createCard, updateCard, deleteCard } = useCards(state.documentId);

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
    if (currentDocument) return `document "${currentDocument.title}"`;
    if (currentOutline) return `outline "${currentOutline.title}"`;
    if (currentFolder) return `folder "${currentFolder.name}"`;
    if (currentSpace) return `space "${currentSpace.name}"`;
    return 'workspace';
  };

  // Document level view
  if (state.level === 'document' && state.documentId) {
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
            {/* Content */}
            <div className="flex-1 overflow-auto border-r border-border">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{currentDocument?.title}</h1>
                    <p className="text-sm text-muted-foreground">Document cards</p>
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
            </div>
            
            {/* Chat */}
            <div className="w-[400px] flex-shrink-0">
              <ChatPanel context={chatContext} contextLabel={getContextLabel()} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Outline level view
  if (state.level === 'outline' && state.outlineId) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar selectedSpaceId={state.spaceId} onSelectSpace={navigateToSpace} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader
            spaceName={currentSpace?.name}
            folderName={currentFolder?.name}
            outlineName={currentOutline?.title}
          />
          
          <div className="flex-1 flex overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-auto border-r border-border">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{currentOutline?.title}</h1>
                    {currentOutline?.description && (
                      <p className="text-sm text-muted-foreground">{currentOutline.description}</p>
                    )}
                  </div>
                </div>
                
                <Tabs defaultValue="points" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="points" className="gap-2">
                      <List className="w-4 h-4" />
                      Points
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2">
                      <File className="w-4 h-4" />
                      Documents
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="points">
                    <div className="bg-card/30 rounded-xl p-4 border border-border/50">
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
            </div>
            
            {/* Chat */}
            <div className="w-[400px] flex-shrink-0">
              <ChatPanel context={chatContext} contextLabel={getContextLabel()} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Folder level view
  if (state.level === 'folder' && state.folderId) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar selectedSpaceId={state.spaceId} onSelectSpace={navigateToSpace} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader
            spaceName={currentSpace?.name}
            folderName={currentFolder?.name}
          />
          
          <div className="flex-1 flex overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-auto border-r border-border">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="p-2 rounded-lg" 
                    style={{ backgroundColor: `${currentFolder?.color}15` }}
                  >
                    <FolderIcon className="w-5 h-5" style={{ color: currentFolder?.color }} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{currentFolder?.name}</h1>
                    <p className="text-sm text-muted-foreground">Outlines & notes</p>
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
            </div>
            
            {/* Chat */}
            <div className="w-[400px] flex-shrink-0">
              <ChatPanel context={chatContext} contextLabel={getContextLabel()} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Space level view
  if (state.level === 'space' && state.spaceId) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar selectedSpaceId={state.spaceId} onSelectSpace={navigateToSpace} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader spaceName={currentSpace?.name} />
          
          <div className="flex-1 flex overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-auto border-r border-border">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <span className="text-xl">{currentSpace?.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{currentSpace?.name}</h1>
                    {currentSpace?.description && (
                      <p className="text-sm text-muted-foreground">{currentSpace.description}</p>
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
            </div>
            
            {/* Chat */}
            <div className="w-[400px] flex-shrink-0">
              <ChatPanel context={chatContext} contextLabel={getContextLabel()} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome screen (no space selected)
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar selectedSpaceId={state.spaceId} onSelectSpace={navigateToSpace} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <Layers className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
            <p className="text-muted-foreground mb-6">
              Select a space from the sidebar to start organizing your thoughts.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>AI-powered at every level</span>
            </div>
          </div>
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
