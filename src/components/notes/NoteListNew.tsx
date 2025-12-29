import React, { useState } from 'react';
import { Note, ContentType } from '@/types/database';
import { Plus, StickyNote, Lightbulb, Search, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NoteListProps {
  notes: Note[];
  onCreateNote: (title: string, content?: string, type?: ContentType) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

const typeIcons: Record<ContentType, React.ReactNode> = {
  idea: <Lightbulb className="w-4 h-4 text-amber-400" />,
  note: <StickyNote className="w-4 h-4 text-blue-400" />,
  research: <Search className="w-4 h-4 text-green-400" />,
  chat: <StickyNote className="w-4 h-4 text-purple-400" />,
};

const typeColors: Record<ContentType, string> = {
  idea: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  note: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  research: 'bg-green-500/20 text-green-400 border-green-500/30',
  chat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<ContentType>('note');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateNote(newTitle.trim(), newContent.trim() || undefined, newType);
      setNewTitle('');
      setNewContent('');
      setNewType('note');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          Notes & Ideas
        </h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Note title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <Select value={newType} onValueChange={(v) => setNewType(v as ContentType)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Textarea
                  placeholder="Content (optional)"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group bg-card/50 border border-border/50 rounded-lg p-4 hover:border-border transition-colors cursor-pointer"
            onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
          >
            <div className="flex items-start gap-3">
              {typeIcons[note.type]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{note.title}</span>
                  <Badge variant="outline" className={`text-xs ${typeColors[note.type]}`}>
                    {note.type}
                  </Badge>
                </div>
                {note.content && (
                  <p className={`text-sm text-muted-foreground ${expandedNote === note.id ? '' : 'line-clamp-2'}`}>
                    {note.content}
                  </p>
                )}
              </div>
              
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
                  <DropdownMenuItem onClick={() => onDeleteNote(note.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs">Capture your ideas here</p>
          </div>
        )}
      </div>
    </div>
  );
};
