import { useState } from 'react';
import { Tag, Bucket, Note, Deliverable, ChatMessage } from '@/types';

const initialTags: Tag[] = [
  { id: '1', name: 'Strategy', color: 'hsl(38 92% 50%)' },
  { id: '2', name: 'Research', color: 'hsl(200 80% 50%)' },
  { id: '3', name: 'Design', color: 'hsl(280 80% 60%)' },
  { id: '4', name: 'Development', color: 'hsl(150 70% 45%)' },
  { id: '5', name: 'Marketing', color: 'hsl(340 80% 55%)' },
];

const initialBuckets: Bucket[] = [
  { id: '1', name: 'Product Ideas', icon: '💡', count: 12 },
  { id: '2', name: 'Market Research', icon: '📊', count: 8 },
  { id: '3', name: 'User Feedback', icon: '💬', count: 15 },
  { id: '4', name: 'Competitors', icon: '🎯', count: 6 },
  { id: '5', name: 'Technical Notes', icon: '⚙️', count: 9 },
];

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'AI-Powered Feature Ideas',
    content: 'Explore integrating GPT-4 for smart suggestions. Consider voice-to-text for quick capture. Research sentiment analysis for feedback categorization.',
    tags: [initialTags[0], initialTags[3]],
    bucketId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    type: 'idea',
  },
  {
    id: '2',
    title: 'Competitor Analysis: Notion',
    content: 'Strong database functionality. Excellent collaboration features. Could improve on mobile experience. Pricing competitive for teams.',
    tags: [initialTags[1]],
    bucketId: '4',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    type: 'research',
  },
  {
    id: '3',
    title: 'User Interview Insights',
    content: 'Users want faster note capture. Tag organization is highly valued. Request for better search functionality. Mobile app is essential.',
    tags: [initialTags[1], initialTags[4]],
    bucketId: '3',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    type: 'note',
  },
  {
    id: '4',
    title: 'Design System Principles',
    content: 'Minimalist approach with focus on content. Dark mode as default. Warm accent colors for actions. Consistent spacing and typography.',
    tags: [initialTags[2]],
    bucketId: '5',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    type: 'note',
  },
];

const initialDeliverables: Deliverable[] = [
  {
    id: '1',
    title: 'MVP Feature Spec',
    description: 'Define core features for initial launch based on user research and competitive analysis.',
    status: 'in-progress',
    sourceNotes: ['1', '2', '3'],
    tags: [initialTags[0], initialTags[1]],
    createdAt: new Date('2024-01-16'),
    dueDate: new Date('2024-02-01'),
  },
  {
    id: '2',
    title: 'Design Guidelines Document',
    description: 'Comprehensive design system documentation including colors, typography, and components.',
    status: 'draft',
    sourceNotes: ['4'],
    tags: [initialTags[2]],
    createdAt: new Date('2024-01-16'),
  },
];

export function useWorkspace() {
  const [tags] = useState<Tag[]>(initialTags);
  const [buckets, setBuckets] = useState<Bucket[]>(initialBuckets);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialDeliverables);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const filteredNotes = notes.filter(note => {
    if (selectedBucket && note.bucketId !== selectedBucket) return false;
    if (selectedTags.length > 0 && !note.tags.some(tag => selectedTags.includes(tag.id))) return false;
    return true;
  });

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    
    // Update bucket count
    setBuckets(prev => prev.map(b => 
      b.id === note.bucketId ? { ...b, count: b.count + 1 } : b
    ));
  };

  const addDeliverable = (deliverable: Omit<Deliverable, 'id' | 'createdAt'>) => {
    const newDeliverable: Deliverable = {
      ...deliverable,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setDeliverables(prev => [newDeliverable, ...prev]);
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return {
    tags,
    buckets,
    notes: filteredNotes,
    allNotes: notes,
    deliverables,
    chatMessages,
    selectedBucket,
    selectedTags,
    setSelectedBucket,
    toggleTag,
    addNote,
    addDeliverable,
    addChatMessage,
  };
}
