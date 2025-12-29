import React, { useState } from 'react';
import { Space } from '@/types/database';
import { Plus, Layers, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SpaceListProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
  onCreateSpace: (name: string, description?: string) => void;
  onDeleteSpace: (id: string) => void;
  onUpdateSpace: (id: string, updates: Partial<Space>) => void;
}

export const SpaceList: React.FC<SpaceListProps> = ({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onCreateSpace,
  onDeleteSpace,
  onUpdateSpace,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateSpace(newName.trim(), newDescription.trim() || undefined);
      setNewName('');
      setNewDescription('');
      setIsCreating(false);
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3 px-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Spaces
        </span>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Space name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-secondary border-border/50"
              />
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-secondary border-border/50"
              />
              <Button onClick={handleCreate} className="w-full">
                Create Space
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-0.5">
        {spaces.map((space) => (
          <div
            key={space.id}
            className={cn(
              "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors",
              selectedSpaceId === space.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
            onClick={() => onSelectSpace(space.id)}
          >
            <span className="text-base">{space.icon}</span>
            <span className="flex-1 text-sm font-medium truncate">{space.name}</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => onDeleteSpace(space.id)} className="text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {spaces.length === 0 && (
          <div className="text-center py-8 px-4">
            <Layers className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No spaces yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create one to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
