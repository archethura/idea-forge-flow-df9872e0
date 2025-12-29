import React, { useState } from 'react';
import { CardWithChildren, Point } from '@/types/database';
import { Plus, Trash2, Link2, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CardEditorProps {
  cards: CardWithChildren[];
  points: Point[];
  onCreateCard: (content: string, sourcePointId?: string, parentCardId?: string) => void;
  onUpdateCard: (id: string, content: string) => void;
  onDeleteCard: (id: string) => void;
}

interface CardItemProps {
  card: CardWithChildren;
  depth: number;
  points: Point[];
  onCreateCard: (content: string, sourcePointId?: string, parentCardId?: string) => void;
  onUpdateCard: (id: string, content: string) => void;
  onDeleteCard: (id: string) => void;
}

const CardItem: React.FC<CardItemProps> = ({
  card,
  depth,
  points,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [content, setContent] = useState(card.content);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildContent, setNewChildContent] = useState('');

  const hasChildren = card.children && card.children.length > 0;
  const sourcePoint = card.source_point_id
    ? points.find((p) => p.id === card.source_point_id)
    : null;

  const handleSave = () => {
    if (content !== card.content) {
      onUpdateCard(card.id, content);
    }
  };

  const handleAddChild = () => {
    if (newChildContent.trim()) {
      onCreateCard(newChildContent.trim(), undefined, card.id);
      setNewChildContent('');
      setIsAddingChild(false);
      setIsExpanded(true);
    }
  };

  return (
    <div className="group">
      <div
        className="relative bg-card border border-border/50 rounded-lg p-4 mb-2 hover:border-border transition-colors"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {sourcePoint && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Link2 className="w-3 h-3" />
            <span className="truncate">From: {sourcePoint.text}</span>
          </div>
        )}

        <div className="flex items-start gap-2">
          {hasChildren && (
            <button
              className="p-0.5 mt-1 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Write your content here..."
            className="flex-1 min-h-[80px] resize-none bg-transparent border-none focus-visible:ring-0 p-0"
          />
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsAddingChild(true)}
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={() => onDeleteCard(card.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isAddingChild && (
        <div
          className="bg-card/50 border border-dashed border-border/50 rounded-lg p-4 mb-2"
          style={{ marginLeft: `${(depth + 1) * 24}px` }}
        >
          <Textarea
            value={newChildContent}
            onChange={(e) => setNewChildContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleAddChild();
              if (e.key === 'Escape') {
                setNewChildContent('');
                setIsAddingChild(false);
              }
            }}
            placeholder="Add nested card content... (⌘+Enter to save)"
            className="min-h-[60px] resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewChildContent('');
                setIsAddingChild(false);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddChild}>
              Add Card
            </Button>
          </div>
        </div>
      )}

      {hasChildren && isExpanded && (
        <div>
          {card.children!.map((child) => (
            <CardItem
              key={child.id}
              card={child}
              depth={depth + 1}
              points={points}
              onCreateCard={onCreateCard}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CardEditor: React.FC<CardEditorProps> = ({
  cards,
  points,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootContent, setNewRootContent] = useState('');

  const handleAddRoot = () => {
    if (newRootContent.trim()) {
      onCreateCard(newRootContent.trim());
      setNewRootContent('');
      setIsAddingRoot(false);
    }
  };

  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          depth={0}
          points={points}
          onCreateCard={onCreateCard}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
        />
      ))}

      {isAddingRoot ? (
        <div className="bg-card/50 border border-dashed border-border/50 rounded-lg p-4">
          <Textarea
            value={newRootContent}
            onChange={(e) => setNewRootContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleAddRoot();
              if (e.key === 'Escape') {
                setNewRootContent('');
                setIsAddingRoot(false);
              }
            }}
            placeholder="Add card content... (⌘+Enter to save)"
            className="min-h-[60px] resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewRootContent('');
                setIsAddingRoot(false);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddRoot}>
              Add Card
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setIsAddingRoot(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      )}
    </div>
  );
};
