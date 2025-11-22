-- Add template system
CREATE TABLE IF NOT EXISTS public.application_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  template_data JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.application_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
ON public.application_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
ON public.application_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.application_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.application_templates FOR DELETE
USING (auth.uid() = user_id);

-- Add answer scoring and parsing
ALTER TABLE public.answers 
ADD COLUMN IF NOT EXISTS success_score INTEGER,
ADD COLUMN IF NOT EXISTS completeness_score INTEGER,
ADD COLUMN IF NOT EXISTS quality_score INTEGER,
ADD COLUMN IF NOT EXISTS predicted_success_percentage INTEGER,
ADD COLUMN IF NOT EXISTS source_document_id UUID;

-- Add inline comments with threading
CREATE TABLE IF NOT EXISTS public.answer_inline_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.answer_inline_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  section TEXT NOT NULL,
  start_position INTEGER,
  end_position INTEGER,
  mentioned_users UUID[],
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.answer_inline_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their answers"
ON public.answer_inline_comments FOR SELECT
USING (answer_id IN (
  SELECT id FROM answers WHERE user_id = auth.uid()
));

CREATE POLICY "Org members can view comments on org answers"
ON public.answer_inline_comments FOR SELECT
USING (answer_id IN (
  SELECT id FROM answers 
  WHERE organization_id IS NOT NULL 
  AND is_org_member(auth.uid(), organization_id)
));

CREATE POLICY "Users can insert comments on accessible answers"
ON public.answer_inline_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    answer_id IN (SELECT id FROM answers WHERE user_id = auth.uid())
    OR answer_id IN (
      SELECT id FROM answers 
      WHERE organization_id IS NOT NULL 
      AND is_org_member(auth.uid(), organization_id)
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON public.answer_inline_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.answer_inline_comments FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inline_comments_answer_id ON public.answer_inline_comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_inline_comments_parent ON public.answer_inline_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.application_templates(user_id);