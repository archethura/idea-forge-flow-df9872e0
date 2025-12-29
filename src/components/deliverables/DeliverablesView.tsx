import { Deliverable, Note, Tag } from '@/types';
import { DeliverableCard } from './DeliverableCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateDeliverableModal } from './CreateDeliverableModal';

interface DeliverablesViewProps {
  deliverables: Deliverable[];
  notes: Note[];
  tags: Tag[];
  onCreateDeliverable: (data: Omit<Deliverable, 'id' | 'createdAt'>) => void;
}

export function DeliverablesView({ deliverables, notes, tags, onCreateDeliverable }: DeliverablesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getSourceNotes = (sourceIds: string[]) => {
    return notes.filter(note => sourceIds.includes(note.id));
  };

  const groupedDeliverables = {
    'in-progress': deliverables.filter(d => d.status === 'in-progress'),
    draft: deliverables.filter(d => d.status === 'draft'),
    completed: deliverables.filter(d => d.status === 'completed'),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Deliverables</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Turn your ideas and research into actionable outputs
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Deliverable
        </Button>
      </div>

      {/* In Progress */}
      {groupedDeliverables['in-progress'].length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            In Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedDeliverables['in-progress'].map(deliverable => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                sourceNotes={getSourceNotes(deliverable.sourceNotes)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Drafts */}
      {groupedDeliverables.draft.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Drafts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedDeliverables.draft.map(deliverable => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                sourceNotes={getSourceNotes(deliverable.sourceNotes)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {groupedDeliverables.completed.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-green-400 mb-4">Completed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedDeliverables.completed.map(deliverable => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                sourceNotes={getSourceNotes(deliverable.sourceNotes)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {deliverables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">No deliverables yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Create deliverables from your ideas and research to track your outputs.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Deliverable
          </Button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDeliverableModal
          notes={notes}
          tags={tags}
          onClose={() => setShowCreateModal(false)}
          onSubmit={data => {
            onCreateDeliverable(data);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
