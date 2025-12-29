import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { Lightbulb, FileText, Search, MoreHorizontal } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

const typeIcons = {
  idea: Lightbulb,
  note: FileText,
  research: Search,
};

const typeLabels = {
  idea: 'Idea',
  note: 'Note',
  research: 'Research',
};

export function NoteCard({ note, onClick }: NoteCardProps) {
  const Icon = typeIcons[note.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-5 rounded-xl border border-border bg-card cursor-pointer",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 animate-slide-up"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            note.type === 'idea' && "bg-primary/10 text-primary",
            note.type === 'note' && "bg-blue-500/10 text-blue-400",
            note.type === 'research' && "bg-purple-500/10 text-purple-400"
          )}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs text-muted-foreground">{typeLabels[note.type]}</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded transition-all">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2">
        {note.title}
      </h3>

      {/* Content Preview */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {note.content}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {note.tags.map(tag => (
          <span
            key={tag.id}
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${tag.color}15`,
              color: tag.color,
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Date */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        {note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}
