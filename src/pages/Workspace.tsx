import React, { useState } from 'react';
import { useNavigation, NavigationProvider } from '@/contexts/NavigationContext';
import { useVentures } from '@/hooks/useVentures';
import { useSpaces } from '@/hooks/useSpaces';
import { useFolders } from '@/hooks/useFolders';
import { useChats } from '@/hooks/useChats';
import { useOutlines } from '@/hooks/useOutlines';
import { Flame, ChevronRight, Plus, MessageSquare, Package, Factory, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WorldView } from '@/types/database';

const VIEW_CONFIG: Record<WorldView, { icon: React.ElementType; label: string; color: string }> = {
  exchange: { icon: MessageSquare, label: 'Exchange', color: 'view-exchange' },
  warehouse: { icon: Package, label: 'Warehouse', color: 'view-warehouse' },
  factory: { icon: Factory, label: 'Factory', color: 'view-factory' },
  studio: { icon: Palette, label: 'Studio', color: 'view-studio' },
};

const WorkspaceContent: React.FC = () => {
  const { state, navigateToVenture, navigateToSpace, navigateToWorld, navigateToView } = useNavigation();
  const { ventures, createVenture } = useVentures();
  const { spaces, topLevelSpaces, getWorlds, createSpace } = useSpaces(state.ventureId);
  const { folders } = useFolders(state.worldId);
  const { chats } = useChats(state.folderId);
  const { outlines } = useOutlines(state.folderId);
  
  const [newVentureName, setNewVentureName] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentVenture = ventures.find(v => v.id === state.ventureId);
  const currentSpace = spaces.find(s => s.id === state.spaceId);
  const currentWorld = spaces.find(s => s.id === state.worldId);
  const worlds = state.spaceId ? getWorlds(state.spaceId) : [];

  const handleCreateVenture = async () => {
    if (!newVentureName.trim()) return;
    await createVenture(newVentureName);
    setNewVentureName('');
    setDialogOpen(false);
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    await createSpace(newSpaceName, undefined, undefined, 'space');
    setNewSpaceName('');
  };

  const handleCreateWorld = async () => {
    if (!newSpaceName.trim() || !state.spaceId) return;
    await createSpace(newSpaceName, undefined, undefined, 'world', state.spaceId);
    setNewSpaceName('');
  };

  // Welcome screen
  if (!state.ventureId) {
    return (
      <div className="flex h-screen bg-background">
        {/* Pane 1: Ventures */}
        <div className="w-64 border-r border-border bg-sidebar flex flex-col">
          <div className="p-4 flex items-center gap-2 border-b border-border">
            <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center">
              <Flame className="w-4 h-4 text-fire-foreground" />
            </div>
            <span className="font-semibold text-foreground">Basefire</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 bear-list">
            {ventures.map(venture => (
              <div
                key={venture.id}
                onClick={() => navigateToVenture(venture.id)}
                className="bear-list-item flex items-center gap-2"
              >
                <span>{venture.icon}</span>
                <span className="truncate">{venture.name}</span>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-border">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                  <Plus className="w-4 h-4" />
                  New Venture
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Venture</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Venture name..."
                  value={newVentureName}
                  onChange={e => setNewVentureName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateVenture()}
                />
                <Button onClick={handleCreateVenture}>Create</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Welcome */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl fire-gradient flex items-center justify-center mx-auto mb-6">
              <Flame className="w-8 h-8 text-fire-foreground" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">Basefire Studio</h1>
            <p className="text-muted-foreground">
              Select or create a venture to begin your journey from raw ideas to polished output.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main 3-pane layout
  return (
    <div className="flex h-screen bg-background">
      {/* Pane 1: Navigation Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center">
            <Flame className="w-4 h-4 text-fire-foreground" />
          </div>
          <span className="font-semibold text-foreground">Basefire</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {/* Ventures */}
          {ventures.map(venture => (
            <div key={venture.id}>
              <div
                onClick={() => navigateToVenture(venture.id)}
                className={`bear-list-item flex items-center gap-2 ${state.ventureId === venture.id ? 'active' : ''}`}
              >
                <span>{venture.icon}</span>
                <span className="truncate font-medium">{venture.name}</span>
              </div>

              {/* Spaces under this venture */}
              {state.ventureId === venture.id && (
                <div className="ml-4 mt-1">
                  {topLevelSpaces.filter(s => s.venture_id === venture.id).map(space => (
                    <div key={space.id}>
                      <div
                        onClick={() => navigateToSpace(space.id)}
                        className={`bear-list-item flex items-center gap-2 text-sm ${state.spaceId === space.id ? 'active' : ''}`}
                      >
                        <span>{space.icon}</span>
                        <span className="truncate">{space.name}</span>
                      </div>

                      {/* Worlds under this space */}
                      {state.spaceId === space.id && (
                        <div className="ml-4 mt-1">
                          {getWorlds(space.id).map(world => (
                            <div key={world.id}>
                              <div
                                onClick={() => {
                                  const folder = folders.find(f => f.space_id === world.id);
                                  navigateToWorld(world.id, folder?.id);
                                }}
                                className={`bear-list-item flex items-center gap-2 text-xs ${state.worldId === world.id ? 'active' : ''}`}
                              >
                                <span>🌍</span>
                                <span className="truncate">{world.name}</span>
                              </div>

                              {/* Views under this world */}
                              {state.worldId === world.id && state.view && (
                                <div className="ml-4 mt-1 space-y-0.5">
                                  {(Object.keys(VIEW_CONFIG) as WorldView[]).map(view => {
                                    const cfg = VIEW_CONFIG[view];
                                    const Icon = cfg.icon;
                                    return (
                                      <div
                                        key={view}
                                        onClick={() => navigateToView(view)}
                                        className={`bear-list-item flex items-center gap-2 text-xs ${state.view === view ? 'active' : ''}`}
                                      >
                                        <Icon className="w-3 h-3" />
                                        <span>{cfg.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-1 text-xs text-muted-foreground h-7"
                            onClick={handleCreateWorld}
                          >
                            <Plus className="w-3 h-3" />
                            New World
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-1 text-xs text-muted-foreground h-7"
                    onClick={handleCreateSpace}
                  >
                    <Plus className="w-3 h-3" />
                    New Space
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pane 2: List View */}
      <div className="w-72 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            {state.view ? VIEW_CONFIG[state.view].label : currentWorld?.name || currentSpace?.name || 'Select'}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 bear-list">
          {state.view === 'exchange' && chats.map(chat => (
            <div key={chat.id} className="bear-list-item">
              <span className="truncate">{chat.title}</span>
            </div>
          ))}
          {state.view === 'factory' && outlines.map(outline => (
            <div key={outline.id} className="bear-list-item">
              <span className="truncate">{outline.title}</span>
            </div>
          ))}
          {!state.view && (
            <p className="text-sm text-muted-foreground p-4">Select a view from the sidebar</p>
          )}
        </div>
      </div>

      {/* Pane 3: Main Editor */}
      <div className="flex-1 bg-background flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {currentVenture && <span>{currentVenture.name}</span>}
            {currentSpace && <><ChevronRight className="w-3 h-3" /><span>{currentSpace.name}</span></>}
            {currentWorld && <><ChevronRight className="w-3 h-3" /><span>{currentWorld.name}</span></>}
            {state.view && <><ChevronRight className="w-3 h-3" /><span className="text-foreground font-medium">{VIEW_CONFIG[state.view].label}</span></>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bear-prose">
          <div className="max-w-2xl mx-auto">
            {state.view === 'exchange' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">The Exchange</h1>
                <p className="text-muted-foreground">Chat and brainstorm. The AI Observer watches for ripe ideas.</p>
              </div>
            )}
            {state.view === 'warehouse' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">The Warehouse</h1>
                <p className="text-muted-foreground">Harvested ore ready for processing.</p>
              </div>
            )}
            {state.view === 'factory' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">The Factory</h1>
                <p className="text-muted-foreground">Refine ore into ingots. Build slabs (outlines).</p>
              </div>
            )}
            {state.view === 'studio' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">The Studio</h1>
                <p className="text-muted-foreground">Mount slabs on pedestals. The AI Sculptor reveals your statue.</p>
              </div>
            )}
            {!state.view && (
              <div className="text-center text-muted-foreground">
                <p>Navigate the hierarchy on the left to begin.</p>
              </div>
            )}
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
