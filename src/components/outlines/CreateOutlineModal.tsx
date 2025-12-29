import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { Note, Chat, ChatMessage } from '@/types/database';

interface CreateOutlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  chats: { chat: Chat; messages: ChatMessage[] }[];
  onCreateOutline: (title: string, description?: string) => Promise<any>;
  onGenerateOutline: (title: string, selectedContent: string) => Promise<void>;
}

export function CreateOutlineModal({
  open,
  onOpenChange,
  notes,
  chats,
  onCreateOutline,
  onGenerateOutline,
}: CreateOutlineModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');

  const toggleNote = (id: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const toggleChat = (id: string) => {
    setSelectedChatIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getSelectedContent = () => {
    const parts: string[] = [];
    
    // Add selected notes
    notes.filter(n => selectedNoteIds.includes(n.id)).forEach(note => {
      parts.push(`## Note: ${note.title}\n${note.content || '(empty)'}`);
    });
    
    // Add selected chat messages
    chats.filter(c => selectedChatIds.includes(c.chat.id)).forEach(({ chat, messages }) => {
      const chatContent = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      parts.push(`## Chat: ${chat.title}\n${chatContent}`);
    });
    
    return parts.join('\n\n---\n\n');
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    if (mode === 'manual') {
      await onCreateOutline(title, description || undefined);
      resetAndClose();
    } else {
      const content = getSelectedContent();
      if (!content.trim()) {
        // No content selected, just create empty outline
        await onCreateOutline(title, description || undefined);
        resetAndClose();
        return;
      }
      
      setIsGenerating(true);
      try {
        await onGenerateOutline(title, content);
        resetAndClose();
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setSelectedNoteIds([]);
    setSelectedChatIds([]);
    setMode('ai');
    onOpenChange(false);
  };

  const hasSelection = selectedNoteIds.length > 0 || selectedChatIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Outline</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Outline title..."
            />
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'ai')}>
            <TabsList className="w-full">
              <TabsTrigger value="ai" className="flex-1 gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex-1 gap-2">
                <FileText className="w-3.5 h-3.5" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-3 mt-3">
              <p className="text-sm text-muted-foreground">
                Select chats and notes to synthesize into outline points:
              </p>
              
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border/50 rounded-lg p-3">
                {chats.length === 0 && notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No chats or notes yet
                  </p>
                ) : (
                  <>
                    {chats.map(({ chat }) => (
                      <label
                        key={chat.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedChatIds.includes(chat.id)}
                          onCheckedChange={() => toggleChat(chat.id)}
                        />
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate">{chat.title}</span>
                      </label>
                    ))}
                    {notes.map((note) => (
                      <label
                        key={note.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedNoteIds.includes(note.id)}
                          onCheckedChange={() => toggleNote(note.id)}
                        />
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate">{note.title}</span>
                      </label>
                    ))}
                  </>
                )}
              </div>

              {hasSelection && (
                <p className="text-xs text-muted-foreground">
                  {selectedChatIds.length + selectedNoteIds.length} item(s) selected
                </p>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-3">
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this outline about?"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : mode === 'ai' && hasSelection ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Outline
              </>
            ) : (
              'Create Outline'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
