import React, { useState } from 'react';
import { Space } from '@/types/database';
import { Plus, Layers, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Spaces
        </h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Input
                  placeholder="Space name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <Input
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Space
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              selectedSpaceId === space.id
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
            }`}
            onClick={() => onSelectSpace(space.id)}
          >
            <span className="text-lg">{space.icon}</span>
            <span className="flex-1 font-medium truncate">{space.name}</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDeleteSpace(space.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {spaces.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No spaces yet</p>
            <p className="text-xs">Create one to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
