export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Bucket {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  bucketId: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'idea' | 'note' | 'research';
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in-progress' | 'completed';
  sourceNotes: string[];
  tags: Tag[];
  createdAt: Date;
  dueDate?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: string[];
}
