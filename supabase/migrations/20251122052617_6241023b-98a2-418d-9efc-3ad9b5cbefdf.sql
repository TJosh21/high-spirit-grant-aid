-- Create tasks table for task management
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create answer versions table for version history
CREATE TABLE public.answer_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  user_rough_answer TEXT,
  ai_polished_answer TEXT,
  user_clarification TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create grant match scores table for tracking recommendations
CREATE TABLE public.grant_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER NOT NULL,
  match_reasons JSONB,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, grant_id)
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_match_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks for their answers"
  ON public.tasks FOR SELECT
  USING (
    user_id = auth.uid() OR assigned_to = auth.uid()
  );

CREATE POLICY "Org members can view tasks for org answers"
  ON public.tasks FOR SELECT
  USING (
    answer_id IN (
      SELECT id FROM public.answers 
      WHERE organization_id IS NOT NULL 
      AND is_org_member(auth.uid(), organization_id)
    )
  );

CREATE POLICY "Users can insert tasks for their answers"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their tasks"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can delete their tasks"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for answer_versions
CREATE POLICY "Users can view versions of their answers"
  ON public.answer_versions FOR SELECT
  USING (
    answer_id IN (
      SELECT id FROM public.answers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can view versions of org answers"
  ON public.answer_versions FOR SELECT
  USING (
    answer_id IN (
      SELECT id FROM public.answers 
      WHERE organization_id IS NOT NULL 
      AND is_org_member(auth.uid(), organization_id)
    )
  );

CREATE POLICY "System can insert answer versions"
  ON public.answer_versions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for grant_match_scores
CREATE POLICY "Users can view their own match scores"
  ON public.grant_match_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert match scores"
  ON public.grant_match_scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update match scores"
  ON public.grant_match_scores FOR UPDATE
  USING (true);

-- Add indexes
CREATE INDEX idx_tasks_answer_id ON public.tasks(answer_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_answer_versions_answer_id ON public.answer_versions(answer_id);
CREATE INDEX idx_answer_versions_created_at ON public.answer_versions(created_at DESC);
CREATE INDEX idx_grant_match_scores_user_id ON public.grant_match_scores(user_id);
CREATE INDEX idx_grant_match_scores_notified ON public.grant_match_scores(notified);

-- Add triggers
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create version snapshot before answer updates
CREATE OR REPLACE FUNCTION public.create_answer_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  version_num INTEGER;
BEGIN
  -- Only create version if important fields changed
  IF (OLD.user_rough_answer IS DISTINCT FROM NEW.user_rough_answer) OR
     (OLD.ai_polished_answer IS DISTINCT FROM NEW.ai_polished_answer) OR
     (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO version_num
    FROM public.answer_versions
    WHERE answer_id = OLD.id;
    
    -- Create version snapshot
    INSERT INTO public.answer_versions (
      answer_id,
      user_id,
      version_number,
      user_rough_answer,
      ai_polished_answer,
      user_clarification,
      status
    ) VALUES (
      OLD.id,
      OLD.user_id,
      version_num,
      OLD.user_rough_answer,
      OLD.ai_polished_answer,
      OLD.user_clarification,
      OLD.status
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for version history
CREATE TRIGGER answer_version_tracker
  BEFORE UPDATE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_answer_version();