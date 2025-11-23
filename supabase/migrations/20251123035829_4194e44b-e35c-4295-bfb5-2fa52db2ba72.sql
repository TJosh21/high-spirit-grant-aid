-- Create grant_favorites table for bookmarking grants
CREATE TABLE public.grant_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, grant_id)
);

-- Enable Row Level Security
ALTER TABLE public.grant_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.grant_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
ON public.grant_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.grant_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_grant_favorites_user_id ON public.grant_favorites(user_id);
CREATE INDEX idx_grant_favorites_grant_id ON public.grant_favorites(grant_id);