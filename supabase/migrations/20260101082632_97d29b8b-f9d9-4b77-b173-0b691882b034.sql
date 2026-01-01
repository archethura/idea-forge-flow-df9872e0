-- =============================================
-- BASEFIRE STUDIO: Database Schema Migration
-- =============================================

-- 1. Create VENTURES table (top-level container)
CREATE TABLE public.ventures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  prime_directive TEXT,
  icon TEXT DEFAULT '🔥',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ventures
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;

-- RLS policies for ventures
CREATE POLICY "Users can view their own ventures" ON public.ventures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own ventures" ON public.ventures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ventures" ON public.ventures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ventures" ON public.ventures FOR DELETE USING (auth.uid() = user_id);

-- 2. Add venture_id to spaces table (Space now belongs to Venture)
-- Rename 'spaces' conceptually to represent both Space and World levels
ALTER TABLE public.spaces ADD COLUMN venture_id UUID REFERENCES public.ventures(id) ON DELETE CASCADE;
ALTER TABLE public.spaces ADD COLUMN parent_space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.spaces ADD COLUMN level TEXT DEFAULT 'space' CHECK (level IN ('space', 'world'));

-- 3. Create ORE table (harvested content from Exchange)
CREATE TABLE public.ore (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  source_comment_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  source_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  refined_text TEXT NOT NULL,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ore
ALTER TABLE public.ore ENABLE ROW LEVEL SECURITY;

-- RLS policies for ore
CREATE POLICY "Users can view ore in their folders" ON public.ore FOR SELECT USING (owns_folder(folder_id));
CREATE POLICY "Users can create ore in their folders" ON public.ore FOR INSERT WITH CHECK (owns_folder(folder_id));
CREATE POLICY "Users can update ore in their folders" ON public.ore FOR UPDATE USING (owns_folder(folder_id));
CREATE POLICY "Users can delete ore in their folders" ON public.ore FOR DELETE USING (owns_folder(folder_id));

-- 4. Create INGOTS table (refined thoughts from ore)
CREATE TABLE public.ingots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ore_id UUID REFERENCES public.ore(id) ON DELETE SET NULL,
  outline_id UUID REFERENCES public.outlines(id) ON DELETE CASCADE,
  pure_concept TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ingots
ALTER TABLE public.ingots ENABLE ROW LEVEL SECURITY;

-- RLS policies for ingots
CREATE POLICY "Users can view ingots in their outlines" ON public.ingots FOR SELECT USING (owns_outline(outline_id));
CREATE POLICY "Users can create ingots in their outlines" ON public.ingots FOR INSERT WITH CHECK (owns_outline(outline_id));
CREATE POLICY "Users can update ingots in their outlines" ON public.ingots FOR UPDATE USING (owns_outline(outline_id));
CREATE POLICY "Users can delete ingots in their outlines" ON public.ingots FOR DELETE USING (owns_outline(outline_id));

-- 5. Add "is_ripe" flag to chat_messages for harvesting
ALTER TABLE public.chat_messages ADD COLUMN is_ripe BOOLEAN DEFAULT false;

-- 6. Add governor settings to documents (for Studio)
ALTER TABLE public.documents ADD COLUMN governor_settings JSONB DEFAULT '{}';

-- 7. Update deliverables to be "statues" with slab references
ALTER TABLE public.deliverables ADD COLUMN slab_ids UUID[] DEFAULT '{}';

-- 8. Create updated_at triggers for new tables
CREATE TRIGGER update_ventures_updated_at BEFORE UPDATE ON public.ventures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ore_updated_at BEFORE UPDATE ON public.ore FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ingots_updated_at BEFORE UPDATE ON public.ingots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create ownership function for ventures
CREATE OR REPLACE FUNCTION public.owns_venture(venture_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ventures WHERE id = venture_uuid AND user_id = auth.uid()
  )
$$;