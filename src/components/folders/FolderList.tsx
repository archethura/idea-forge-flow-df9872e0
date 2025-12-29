import React, { useState } from 'react';
import { Folder } from '@/types/database';
import { Plus, FolderIcon, MoreHorizontal, Trash2, ChevronRight } from 'lucide-react';
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

interface FolderListProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
}

const FOLDER_COLORS = [
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Folders / Tags
        </h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Input
                  placeholder="Folder name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
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

      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              selectedFolderId === folder.id
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
            }`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span className="flex-1 font-medium truncate">{folder.name}</span>
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
                <DropdownMenuItem onClick={() => onDeleteFolder(folder.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {folders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No folders yet</p>
            <p className="text-xs">Folders act as tags too</p>
          </div>
        )}
      </div>
    </div>
  );
};
