// Database types matching the schema
export type ContentType = 'idea' | 'note' | 'research' | 'chat';
export type DeliverableStatus = 'draft' | 'in-progress' | 'completed';

export interface Space {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  space_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  folder_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  references_ids: string[];
  created_at: string;
}

export interface Note {
  id: string;
  folder_id: string;
  title: string;
  content: string | null;
  type: ContentType;
  created_at: string;
  updated_at: string;
}

export interface NoteTag {
  id: string;
  note_id: string;
  folder_id: string;
}

export interface Outline {
  id: string;
  folder_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Point {
  id: string;
  outline_id: string;
  parent_point_id: string | null;
  text: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  outline_id: string;
  title: string;
  status: DeliverableStatus;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  document_id: string;
  source_point_id: string | null;
  parent_card_id: string | null;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  document_id: string;
  title: string;
  compiled_content: string | null;
  format: string;
  created_at: string;
}

// Extended types with relations
export interface FolderWithCounts extends Folder {
  notes_count?: number;
  chats_count?: number;
  outlines_count?: number;
}

export interface PointWithChildren extends Point {
  children?: PointWithChildren[];
}

export interface CardWithChildren extends Card {
  children?: CardWithChildren[];
  source_point?: Point;
}

// Navigation context
export type NavigationLevel = 'space' | 'folder' | 'outline' | 'document';

export interface NavigationState {
  spaceId: string | null;
  folderId: string | null;
  outlineId: string | null;
  documentId: string | null;
  chatId: string | null;
  level: NavigationLevel;
}
