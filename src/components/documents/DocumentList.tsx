import React, { useState } from 'react';
import { Document as DocType, DeliverableStatus } from '@/types/database';
import { Plus, FileText, MoreHorizontal, Trash2, ChevronRight, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface DocumentListProps {
  documents: DocType[];
  selectedDocumentId: string | null;
  onSelectDocument: (documentId: string) => void;
  onCreateDocument: (title: string) => void;
  onDeleteDocument: (id: string) => void;
}

const statusColors: Record<DeliverableStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-amber-500/20 text-amber-500',
  completed: 'bg-green-500/20 text-green-500',
};

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateDocument(newTitle.trim());
      setNewTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <File className="w-4 h-4" />
          Documents
        </h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Input
                  placeholder="Document title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              selectedDocumentId === doc.id
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
            }`}
            onClick={() => onSelectDocument(doc.id)}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 font-medium truncate">{doc.title}</span>
            <Badge variant="secondary" className={`text-xs ${statusColors[doc.status]}`}>
              {doc.status}
            </Badge>
            
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
                <DropdownMenuItem onClick={() => onDeleteDocument(doc.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
