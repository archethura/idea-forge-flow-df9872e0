import React, { useState } from 'react';
import { Folder } from '@/types/database';
import { Plus, FolderIcon, MoreHorizontal, Trash2, ChevronRight } from 'lucide-react';
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

interface FolderListProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
}

const FOLDER_COLORS = [
  '#9b87f5', '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#06b6d4', '#eab308', '#8b5cf6',
];

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateFolder(newName.trim(), selectedColor);
      setNewName('');
      setSelectedColor(FOLDER_COLORS[0]);
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Folders
        </span>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Folder name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-secondary border-border/50"
              />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-7 h-7 rounded-full transition-all",
                        selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border",
              selectedFolderId === folder.id
                ? "bg-secondary border-border"
                : "bg-transparent border-transparent hover:bg-secondary/50 hover:border-border/50"
            )}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color || FOLDER_COLORS[0] }}
            />
            <span className="flex-1 text-sm font-medium text-foreground truncate">{folder.name}</span>
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
                <DropdownMenuItem onClick={() => onDeleteFolder(folder.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {folders.length === 0 && (
          <div className="text-center py-8">
            <FolderIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No folders yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Folders organize your outlines</p>
          </div>
        )}
      </div>
    </div>
  );
};
