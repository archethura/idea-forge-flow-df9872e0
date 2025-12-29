import React, { useState } from 'react';
import { Outline } from '@/types/database';
import { Plus, FileText, MoreHorizontal, Trash2, ChevronRight } from 'lucide-react';
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
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Outlines
        </span>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New Outline</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Outline title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
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
                Create Outline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {outlines.map((outline) => (
          <div
            key={outline.id}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border",
              selectedOutlineId === outline.id
                ? "bg-secondary border-border"
                : "bg-transparent border-transparent hover:bg-secondary/50 hover:border-border/50"
            )}
            onClick={() => onSelectOutline(outline.id)}
          >
            <div className="w-7 h-7 rounded-lg level-outline flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">{outline.title}</span>
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
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => onDeleteOutline(outline.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {outlines.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No outlines yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create an outline to structure your ideas</p>
          </div>
        )}
      </div>
    </div>
  );
};
