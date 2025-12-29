import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, Bucket } from '@/types';
import { Plus, Lightbulb, FileText, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickCaptureProps {
  buckets: Bucket[];
  tags: Tag[];
  onSubmit: (data: {
    title: string;
    content: string;
    type: 'idea' | 'note' | 'research';
    bucketId: string;
    tags: Tag[];
  }) => void;
}

export function QuickCapture({ buckets, tags, onSubmit }: QuickCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'idea' | 'note' | 'research'>('idea');
  const [selectedBucket, setSelectedBucket] = useState(buckets[0]?.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const typeOptions = [
    { id: 'idea', label: 'Idea', icon: Lightbulb },
    { id: 'note', label: 'Note', icon: FileText },
    { id: 'research', label: 'Research', icon: Search },
  ] as const;

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onSubmit({
      title,
      content,
      type,
      bucketId: selectedBucket,
      tags: tags.filter(t => selectedTags.includes(t.id)),
    });

    setTitle('');
    setContent('');
    setType('idea');
    setSelectedTags([]);
    setIsOpen(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-xl glow-primary"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Quick Capture
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass rounded-2xl p-6 animate-scale-in shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Type Selector */}
        <div className="flex gap-2 mb-6">
          {typeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setType(option.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                type === option.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Title your thought..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-transparent text-xl font-display font-semibold placeholder:text-muted-foreground/50 focus:outline-none mb-4"
          autoFocus
        />

        {/* Content Textarea */}
        <textarea
          placeholder="Expand on your idea..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className="w-full bg-secondary/50 rounded-lg p-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
        />

        {/* Bucket Selector */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block">Save to bucket</label>
          <select
            value={selectedBucket}
            onChange={e => setSelectedBucket(e.target.value)}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {buckets.map(bucket => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.icon} {bucket.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-2 block">Tags</label>
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

        {/* Submit Button */}
        <Button onClick={handleSubmit} className="w-full" disabled={!title.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Save {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </div>
    </div>
  );
}
