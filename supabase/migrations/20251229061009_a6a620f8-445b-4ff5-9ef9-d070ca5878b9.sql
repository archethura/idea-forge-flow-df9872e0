-- Add ai_lock column to cards table for the blueprint
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS ai_lock boolean NOT NULL DEFAULT false;