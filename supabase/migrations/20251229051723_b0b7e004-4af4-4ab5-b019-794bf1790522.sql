-- Create enum types
CREATE TYPE public.content_type AS ENUM ('idea', 'note', 'research', 'chat');
CREATE TYPE public.deliverable_status AS ENUM ('draft', 'in-progress', 'completed');

-- SPACES: Top-level container (a wing of thought)
CREATE TABLE public.spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FOLDERS: Folders = Tags (bidirectional)
CREATE TABLE public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#F59E0B',
    icon TEXT DEFAULT '📁',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CHATS: Live inside folders, auto-tagged
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CHAT MESSAGES: Individual messages in a chat
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    references_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTES: Live in folders with tags
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    type public.content_type NOT NULL DEFAULT 'note',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTE TAGS: Many-to-many relationship (notes can have multiple folder tags)
CREATE TABLE public.note_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    UNIQUE(note_id, folder_id)
);

-- OUTLINES: Nested inside folders
CREATE TABLE public.outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POINTS: Nestable points within outlines
CREATE TABLE public.points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outline_id UUID NOT NULL REFERENCES public.outlines(id) ON DELETE CASCADE,
    parent_point_id UUID REFERENCES public.points(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DOCUMENTS: Nested inside outlines
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outline_id UUID NOT NULL REFERENCES public.outlines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status public.deliverable_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CARDS: Content containers within documents
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    source_point_id UUID REFERENCES public.points(id) ON DELETE SET NULL,
    parent_card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DELIVERABLES: Compiled output from documents
CREATE TABLE public.deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    compiled_content TEXT,
    format TEXT DEFAULT 'markdown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SPACES (user owns their spaces)
CREATE POLICY "Users can view their own spaces" ON public.spaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own spaces" ON public.spaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spaces" ON public.spaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own spaces" ON public.spaces FOR DELETE USING (auth.uid() = user_id);

-- Helper function to check space ownership (for cascading)
CREATE OR REPLACE FUNCTION public.owns_space(space_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.spaces WHERE id = space_uuid AND user_id = auth.uid()
  )
$$;

-- RLS Policies for FOLDERS
CREATE POLICY "Users can view folders in their spaces" ON public.folders FOR SELECT USING (public.owns_space(space_id));
CREATE POLICY "Users can create folders in their spaces" ON public.folders FOR INSERT WITH CHECK (public.owns_space(space_id));
CREATE POLICY "Users can update folders in their spaces" ON public.folders FOR UPDATE USING (public.owns_space(space_id));
CREATE POLICY "Users can delete folders in their spaces" ON public.folders FOR DELETE USING (public.owns_space(space_id));

-- Helper function to check folder ownership
CREATE OR REPLACE FUNCTION public.owns_folder(folder_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folders f
    JOIN public.spaces s ON f.space_id = s.id
    WHERE f.id = folder_uuid AND s.user_id = auth.uid()
  )
$$;

-- RLS Policies for CHATS
CREATE POLICY "Users can view chats in their folders" ON public.chats FOR SELECT USING (public.owns_folder(folder_id));
CREATE POLICY "Users can create chats in their folders" ON public.chats FOR INSERT WITH CHECK (public.owns_folder(folder_id));
CREATE POLICY "Users can update chats in their folders" ON public.chats FOR UPDATE USING (public.owns_folder(folder_id));
CREATE POLICY "Users can delete chats in their folders" ON public.chats FOR DELETE USING (public.owns_folder(folder_id));

-- Helper function to check chat ownership
CREATE OR REPLACE FUNCTION public.owns_chat(chat_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chats c
    JOIN public.folders f ON c.folder_id = f.id
    JOIN public.spaces s ON f.space_id = s.id
    WHERE c.id = chat_uuid AND s.user_id = auth.uid()
  )
$$;

-- RLS Policies for CHAT MESSAGES
CREATE POLICY "Users can view messages in their chats" ON public.chat_messages FOR SELECT USING (public.owns_chat(chat_id));
CREATE POLICY "Users can create messages in their chats" ON public.chat_messages FOR INSERT WITH CHECK (public.owns_chat(chat_id));
CREATE POLICY "Users can delete messages in their chats" ON public.chat_messages FOR DELETE USING (public.owns_chat(chat_id));

-- RLS Policies for NOTES
CREATE POLICY "Users can view notes in their folders" ON public.notes FOR SELECT USING (public.owns_folder(folder_id));
CREATE POLICY "Users can create notes in their folders" ON public.notes FOR INSERT WITH CHECK (public.owns_folder(folder_id));
CREATE POLICY "Users can update notes in their folders" ON public.notes FOR UPDATE USING (public.owns_folder(folder_id));
CREATE POLICY "Users can delete notes in their folders" ON public.notes FOR DELETE USING (public.owns_folder(folder_id));

-- Helper function to check note ownership
CREATE OR REPLACE FUNCTION public.owns_note(note_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes n
    JOIN public.folders f ON n.folder_id = f.id
    JOIN public.spaces s ON f.space_id = s.id
    WHERE n.id = note_uuid AND s.user_id = auth.uid()
  )
$$;

-- RLS Policies for NOTE_TAGS
CREATE POLICY "Users can view note tags" ON public.note_tags FOR SELECT USING (public.owns_note(note_id));
CREATE POLICY "Users can create note tags" ON public.note_tags FOR INSERT WITH CHECK (public.owns_note(note_id) AND public.owns_folder(folder_id));
CREATE POLICY "Users can delete note tags" ON public.note_tags FOR DELETE USING (public.owns_note(note_id));

-- RLS Policies for OUTLINES
CREATE POLICY "Users can view outlines in their folders" ON public.outlines FOR SELECT USING (public.owns_folder(folder_id));
CREATE POLICY "Users can create outlines in their folders" ON public.outlines FOR INSERT WITH CHECK (public.owns_folder(folder_id));
CREATE POLICY "Users can update outlines in their folders" ON public.outlines FOR UPDATE USING (public.owns_folder(folder_id));
CREATE POLICY "Users can delete outlines in their folders" ON public.outlines FOR DELETE USING (public.owns_folder(folder_id));

-- Helper function to check outline ownership
CREATE OR REPLACE FUNCTION public.owns_outline(outline_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.outlines o
    JOIN public.folders f ON o.folder_id = f.id
    JOIN public.spaces s ON f.space_id = s.id
    WHERE o.id = outline_uuid AND s.user_id = auth.uid()
  )
$$;

-- RLS Policies for POINTS
CREATE POLICY "Users can view points in their outlines" ON public.points FOR SELECT USING (public.owns_outline(outline_id));
CREATE POLICY "Users can create points in their outlines" ON public.points FOR INSERT WITH CHECK (public.owns_outline(outline_id));
CREATE POLICY "Users can update points in their outlines" ON public.points FOR UPDATE USING (public.owns_outline(outline_id));
CREATE POLICY "Users can delete points in their outlines" ON public.points FOR DELETE USING (public.owns_outline(outline_id));

-- RLS Policies for DOCUMENTS
CREATE POLICY "Users can view documents in their outlines" ON public.documents FOR SELECT USING (public.owns_outline(outline_id));
CREATE POLICY "Users can create documents in their outlines" ON public.documents FOR INSERT WITH CHECK (public.owns_outline(outline_id));
CREATE POLICY "Users can update documents in their outlines" ON public.documents FOR UPDATE USING (public.owns_outline(outline_id));
CREATE POLICY "Users can delete documents in their outlines" ON public.documents FOR DELETE USING (public.owns_outline(outline_id));

-- Helper function to check document ownership
CREATE OR REPLACE FUNCTION public.owns_document(doc_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.documents d
    JOIN public.outlines o ON d.outline_id = o.id
    JOIN public.folders f ON o.folder_id = f.id
    JOIN public.spaces s ON f.space_id = s.id
    WHERE d.id = doc_uuid AND s.user_id = auth.uid()
  )
$$;

-- RLS Policies for CARDS
CREATE POLICY "Users can view cards in their documents" ON public.cards FOR SELECT USING (public.owns_document(document_id));
CREATE POLICY "Users can create cards in their documents" ON public.cards FOR INSERT WITH CHECK (public.owns_document(document_id));
CREATE POLICY "Users can update cards in their documents" ON public.cards FOR UPDATE USING (public.owns_document(document_id));
CREATE POLICY "Users can delete cards in their documents" ON public.cards FOR DELETE USING (public.owns_document(document_id));

-- RLS Policies for DELIVERABLES
CREATE POLICY "Users can view deliverables from their documents" ON public.deliverables FOR SELECT USING (public.owns_document(document_id));
CREATE POLICY "Users can create deliverables from their documents" ON public.deliverables FOR INSERT WITH CHECK (public.owns_document(document_id));
CREATE POLICY "Users can delete deliverables from their documents" ON public.deliverables FOR DELETE USING (public.owns_document(document_id));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_outlines_updated_at BEFORE UPDATE ON public.outlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_points_updated_at BEFORE UPDATE ON public.points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_folders_space_id ON public.folders(space_id);
CREATE INDEX idx_chats_folder_id ON public.chats(folder_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_folder_id ON public.note_tags(folder_id);
CREATE INDEX idx_outlines_folder_id ON public.outlines(folder_id);
CREATE INDEX idx_points_outline_id ON public.points(outline_id);
CREATE INDEX idx_points_parent_id ON public.points(parent_point_id);
CREATE INDEX idx_documents_outline_id ON public.documents(outline_id);
CREATE INDEX idx_cards_document_id ON public.cards(document_id);
CREATE INDEX idx_cards_parent_id ON public.cards(parent_card_id);
CREATE INDEX idx_deliverables_document_id ON public.deliverables(document_id);