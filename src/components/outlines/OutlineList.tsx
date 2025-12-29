import React, { useState } from 'react';
import { Outline } from '@/types/database';
import { Plus, FileText, MoreHorizontal, Trash2, ChevronRight, List } from 'lucide-react';
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

interface OutlineListProps {
  outlines: Outline[];
  selectedOutlineId: string | null;
  onSelectOutline: (outlineId: string) => void;
  onCreateOutline: (title: string, description?: string) => void;
  onDeleteOutline: (id: string) => void;
}

export const OutlineList: React.FC<OutlineListProps> = ({
  outlines,
  selectedOutlineId,
  onSelectOutline,
  onCreateOutline,
  onDeleteOutline,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateOutline(newTitle.trim(), newDescription.trim() || undefined);
      setNewTitle('');
      setNewDescription('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <List className="w-4 h-4" />
          Outlines
        </h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Outline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Input
                  placeholder="Outline title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                Create Outline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {outlines.map((outline) => (
          <div
            key={outline.id}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              selectedOutlineId === outline.id
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
            }`}
            onClick={() => onSelectOutline(outline.id)}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate block">{outline.title}</span>
              {outline.description && (
                <span className="text-xs text-muted-foreground truncate block">
                  {outline.description}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            
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
                <DropdownMenuItem onClick={() => onDeleteOutline(outline.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {outlines.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No outlines yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
