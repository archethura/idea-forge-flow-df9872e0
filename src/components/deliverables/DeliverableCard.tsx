import { Deliverable, Note } from '@/types';
import { cn } from '@/lib/utils';
import { Target, Clock, CheckCircle, FileText, MoreHorizontal } from 'lucide-react';

interface DeliverableCardProps {
  deliverable: Deliverable;
  sourceNotes: Note[];
  onClick?: () => void;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
};

export function DeliverableCard({ deliverable, sourceNotes, onClick }: DeliverableCardProps) {
  const status = statusConfig[deliverable.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-5 rounded-xl border border-border bg-card cursor-pointer",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", status.bg, status.color)}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {status.label}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded transition-all">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-foreground mb-2">
        {deliverable.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {deliverable.description}
      </p>

      {/* Source Notes */}
      {sourceNotes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">
            Based on {sourceNotes.length} source{sourceNotes.length > 1 ? 's' : ''}:
          </p>
          <div className="flex flex-wrap gap-1">
            {sourceNotes.slice(0, 3).map(note => (
              <span
                key={note.id}
                className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground truncate max-w-[120px]"
              >
                {note.title}
              </span>
            ))}
            {sourceNotes.length > 3 && (
              <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                +{sourceNotes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {deliverable.tags.map(tag => (
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

      {/* Due Date */}
      {deliverable.dueDate && (
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Due {deliverable.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}
