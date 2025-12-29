import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSpaces } from '@/hooks/useSpaces';
import { SpaceList } from '@/components/spaces/SpaceList';
import { Separator } from '@/components/ui/separator';
import { Layers, Plus } from 'lucide-react';

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
    <aside className="w-60 h-full border-r border-border/30 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <Layers className="w-4 h-4 text-background" />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">Workspace</span>
      </div>

      <Separator className="opacity-30" />

      {/* Spaces */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <SpaceList
          spaces={spaces}
          selectedSpaceId={selectedSpaceId}
          onSelectSpace={onSelectSpace}
          onCreateSpace={createSpace}
          onDeleteSpace={deleteSpace}
          onUpdateSpace={updateSpace}
        />
      </div>
    </aside>
  );
};
