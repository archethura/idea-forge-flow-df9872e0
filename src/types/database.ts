// =============================================
// BASEFIRE STUDIO: Database Types
// =============================================

export type ContentType = 'idea' | 'note' | 'research' | 'chat';
export type DeliverableStatus = 'draft' | 'in-progress' | 'completed';
export type SpaceLevel = 'space' | 'world';

// =============================================
// I. THE MACRO CONTEXT (Containers)
// =============================================

// Venture: The "Prime Mover" - overarching mission
export interface Venture {
  id: string;
  user_id: string;
  name: string;
  prime_directive: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Space: Thematic domain (e.g., Marketing, Engineering)
// World: Specific project planet (child of Space)
export interface Space {
  id: string;
  user_id: string;
  venture_id: string | null;
  parent_space_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  level: SpaceLevel;
  created_at: string;
  updated_at: string;
}

// Folder: Container within a World (maps to views)
export interface Folder {
  id: string;
  space_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// II. THE INTERACTION LAYER: THE MINE (Exchange)
// =============================================

// Chat: A Post/Topic in the Exchange
export interface Chat {
  id: string;
  folder_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// ChatMessage: Comments within a Chat (the "Scrap")
export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  references_ids: string[];
  is_ripe: boolean;
  created_at: string;
}

// Note: Quick capture content
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

// =============================================
// III. THE EXTRACTION LAYER: THE REFINERY (Warehouse)
// =============================================

// Ore: "Roughly Organized Synthesis" - harvested from Exchange
export interface Ore {
  id: string;
  folder_id: string;
  source_comment_id: string | null;
  source_note_id: string | null;
  refined_text: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// IV. THE INDUSTRIAL LAYER: THE FACTORY
// =============================================

// Outline: A "Slab" - structural sequence of Ingots
export interface Outline {
  id: string;
  folder_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Point: Structural element within an Outline
export interface Point {
  id: string;
  outline_id: string;
  parent_point_id: string | null;
  text: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Ingot: A "Thought" - pure refined packet of information
export interface Ingot {
  id: string;
  ore_id: string | null;
  outline_id: string;
  pure_concept: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// V. THE MANIFESTATION LAYER: THE STUDIO
// =============================================

// Governor Settings: Intent (Tone, Goal, Audience)
export interface GovernorSettings {
  tone?: string;
  goal?: string;
  audience?: string;
  style?: string;
}

// Document: Mounted Slab on a Pedestal
export interface Document {
  id: string;
  outline_id: string;
  title: string;
  status: DeliverableStatus;
  governor_settings: GovernorSettings;
  created_at: string;
  updated_at: string;
}

// Card: Content blocks within a Document
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

// Deliverable: The "Statue" - final polished work
export interface Deliverable {
  id: string;
  document_id: string;
  title: string;
  compiled_content: string | null;
  format: string;
  slab_ids: string[];
  created_at: string;
}

// =============================================
// Extended Types with Relations
// =============================================

export interface VentureWithSpaces extends Venture {
  spaces?: Space[];
}

export interface SpaceWithWorlds extends Space {
  worlds?: Space[];
}

export interface FolderWithCounts extends Folder {
  notes_count?: number;
  chats_count?: number;
  outlines_count?: number;
  ore_count?: number;
}

export interface PointWithChildren extends Point {
  children?: PointWithChildren[];
}

export interface CardWithChildren extends Card {
  children?: CardWithChildren[];
  source_point?: Point;
}

export interface OreWithSource extends Ore {
  source_comment?: ChatMessage;
  source_note?: Note;
}

export interface IngotWithOre extends Ingot {
  ore?: Ore;
}

// =============================================
// Navigation Context
// =============================================

// The 4 Views within a World
export type WorldView = 'exchange' | 'warehouse' | 'factory' | 'studio';

// Navigation levels in hierarchy
export type NavigationLevel = 'venture' | 'space' | 'world' | 'exchange' | 'warehouse' | 'factory' | 'studio';

export interface NavigationState {
  ventureId: string | null;
  spaceId: string | null;
  worldId: string | null;
  folderId: string | null;
  outlineId: string | null;
  documentId: string | null;
  chatId: string | null;
  view: WorldView | null;
  level: NavigationLevel;
}

// AI Persona based on current view
export type AiPersona = 'observer' | 'farmer' | 'metallurgist' | 'sculptor';

export const VIEW_TO_PERSONA: Record<WorldView, AiPersona> = {
  exchange: 'observer',
  warehouse: 'farmer',
  factory: 'metallurgist',
  studio: 'sculptor',
};
