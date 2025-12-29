import React, { useState } from 'react';
import { PointWithChildren } from '@/types/database';
import { Plus, ChevronRight, ChevronDown, GripVertical, Trash2, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PointTreeProps {
  points: PointWithChildren[];
  onCreatePoint: (text: string, parentPointId?: string) => void;
  onUpdatePoint: (id: string, text: string) => void;
  onDeletePoint: (id: string) => void;
}

interface PointItemProps {
  point: PointWithChildren;
  depth: number;
  onCreatePoint: (text: string, parentPointId?: string) => void;
  onUpdatePoint: (id: string, text: string) => void;
  onDeletePoint: (id: string) => void;
}

const PointItem: React.FC<PointItemProps> = ({
  point,
  depth,
  onCreatePoint,
  onUpdatePoint,
  onDeletePoint,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(point.text);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildText, setNewChildText] = useState('');

  const hasChildren = point.children && point.children.length > 0;

  const handleSave = () => {
    if (editText.trim() && editText !== point.text) {
      onUpdatePoint(point.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleAddChild = () => {
    if (newChildText.trim()) {
      onCreatePoint(newChildText.trim(), point.id);
      setNewChildText('');
      setIsAddingChild(false);
      setIsExpanded(true);
    }
  };

  return (
    <div className="group">
      <div
        className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        <button
          className="p-0.5 mt-1 text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') {
                  setEditText(point.text);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="min-h-[36px] text-sm"
            />
          ) : (
            <p
              className="text-sm cursor-pointer py-1"
              onClick={() => setIsEditing(true)}
            >
              {point.text}
            </p>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsAddingChild(true)}
          >
            <CornerDownRight className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={() => onDeletePoint(point.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isAddingChild && (
        <div
          className="flex items-center gap-2 py-1.5 px-2"
          style={{ paddingLeft: `${(depth + 1) * 24 + 8}px` }}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          </div>
          <Input
            placeholder="Add subpoint..."
            value={newChildText}
            onChange={(e) => setNewChildText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddChild();
              if (e.key === 'Escape') {
                setNewChildText('');
                setIsAddingChild(false);
              }
            }}
            onBlur={() => {
              if (!newChildText.trim()) setIsAddingChild(false);
            }}
            autoFocus
            className="h-8 text-sm"
          />
        </div>
      )}

      {hasChildren && isExpanded && (
        <div>
          {point.children!.map((child) => (
            <PointItem
              key={child.id}
              point={child}
              depth={depth + 1}
              onCreatePoint={onCreatePoint}
              onUpdatePoint={onUpdatePoint}
              onDeletePoint={onDeletePoint}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PointTree: React.FC<PointTreeProps> = ({
  points,
  onCreatePoint,
  onUpdatePoint,
  onDeletePoint,
}) => {
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootText, setNewRootText] = useState('');

  const handleAddRoot = () => {
    if (newRootText.trim()) {
      onCreatePoint(newRootText.trim());
      setNewRootText('');
      setIsAddingRoot(false);
    }
  };

  return (
    <div className="space-y-1">
      {points.map((point) => (
        <PointItem
          key={point.id}
          point={point}
          depth={0}
          onCreatePoint={onCreatePoint}
          onUpdatePoint={onUpdatePoint}
          onDeletePoint={onDeletePoint}
        />
      ))}

      {isAddingRoot ? (
        <div className="flex items-center gap-2 py-1.5 px-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          </div>
          <Input
            placeholder="Add point..."
            value={newRootText}
            onChange={(e) => setNewRootText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddRoot();
              if (e.key === 'Escape') {
                setNewRootText('');
                setIsAddingRoot(false);
              }
            }}
            onBlur={() => {
              if (!newRootText.trim()) setIsAddingRoot(false);
            }}
            autoFocus
            className="h-8 text-sm"
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setIsAddingRoot(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add point
        </Button>
      )}
    </div>
  );
};
