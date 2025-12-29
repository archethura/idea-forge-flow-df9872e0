import { Note } from '@/types';
import { NoteCard } from './NoteCard';

interface NotesGridProps {
  notes: Note[];
  onNoteClick?: (note: Note) => void;
}

export function NotesGrid({ notes, onNoteClick }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="font-display font-semibold text-lg mb-2">No notes yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Start capturing your ideas, research, and notes. They'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note, index) => (
        <div key={note.id} style={{ animationDelay: `${index * 50}ms` }}>
          <NoteCard note={note} onClick={() => onNoteClick?.(note)} />
        </div>
      ))}
    </div>
  );
}
