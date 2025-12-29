import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSpaces } from '@/hooks/useSpaces';
import { SpaceList } from '@/components/spaces/SpaceList';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Layers } from 'lucide-react';

interface AppSidebarProps {
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  selectedSpaceId,
  onSelectSpace,
}) => {
  const { spaces, createSpace, deleteSpace, updateSpace } = useSpaces();

  return (
    <aside className="w-64 h-full border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/20">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-bold text-gradient">SPACE</span>
      </div>

      <Separator className="opacity-50" />

      {/* Spaces */}
      <div className="flex-1 overflow-y-auto">
        <SpaceList
          spaces={spaces}
          selectedSpaceId={selectedSpaceId}
          onSelectSpace={onSelectSpace}
          onCreateSpace={createSpace}
          onDeleteSpace={deleteSpace}
          onUpdateSpace={updateSpace}
        />
      </div>

      <Separator className="opacity-50" />

      {/* AI Chat shortcut */}
      <div className="p-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium text-sm">AI Assistant</span>
        </button>
      </div>
    </aside>
  );
};
