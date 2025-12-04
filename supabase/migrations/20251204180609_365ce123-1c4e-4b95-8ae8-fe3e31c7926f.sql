-- Create user_grants table for tracking grant applications
CREATE TABLE IF NOT EXISTS public.user_grants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  grant_id uuid NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'planning', 'applied', 'awarded', 'not_eligible', 'rejected')),
  notes text,
  last_updated_by_user_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, grant_id)
);

-- Enable RLS
ALTER TABLE public.user_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tracked grants"
ON public.user_grants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracked grants"
ON public.user_grants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked grants"
ON public.user_grants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked grants"
ON public.user_grants FOR DELETE
USING (auth.uid() = user_id);

-- Create ai_coaching_sessions table for AI answer coach
CREATE TABLE IF NOT EXISTS public.ai_coaching_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  grant_id uuid REFERENCES public.grants(id) ON DELETE SET NULL,
  original_question text NOT NULL,
  user_rough_answer text NOT NULL,
  ai_polished_answer text,
  suggestions text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own coaching sessions"
ON public.ai_coaching_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching sessions"
ON public.ai_coaching_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching sessions"
ON public.ai_coaching_sessions FOR DELETE
USING (auth.uid() = user_id);