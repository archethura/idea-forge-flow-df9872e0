import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Note, Tag, Deliverable } from '@/types';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateDeliverableModalProps {
  notes: Note[];
  tags: Tag[];
  onClose: () => void;
  onSubmit: (data: Omit<Deliverable, 'id' | 'createdAt'>) => void;
}

export function CreateDeliverableModal({ notes, tags, onClose, onSubmit }: CreateDeliverableModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'in-progress'>('draft');

  const toggleNote = (noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title,
      description,
      status,
      sourceNotes: selectedNotes,
      tags: tags.filter(t => selectedTags.includes(t.id)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass rounded-2xl p-6 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <h2 className="font-display text-xl font-bold mb-6">Create Deliverable</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Title</label>
          <input
            type="text"
            placeholder="What will you deliver?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-secondary rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Description</label>
          <textarea
            placeholder="Describe what this deliverable will include..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-secondary rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatus('draft')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                status === 'draft'
                  ? "bg-secondary text-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Draft
            </button>
            <button
              onClick={() => setStatus('in-progress')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                status === 'in-progress'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Start Now
            </button>
          </div>
        </div>

        {/* Source Notes */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            Link Source Notes ({selectedNotes.length} selected)
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2 bg-secondary/50 rounded-lg p-3">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => toggleNote(note.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all",
                  selectedNotes.includes(note.id)
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-secondary"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  selectedNotes.includes(note.id)
                    ? "bg-primary border-primary"
                    : "border-border"
                )}>
                  {selectedNotes.includes(note.id) && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{note.content}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  selectedTags.includes(tag.id)
                    ? "ring-2 ring-offset-2 ring-offset-card"
                    : "opacity-60 hover:opacity-100"
                )}
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!title.trim()}>
            Create Deliverable
          </Button>
        </div>
      </div>
    </div>
  );
}
