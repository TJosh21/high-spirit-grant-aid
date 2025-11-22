-- Create activity logs table for timeline tracking
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'created', 'updated', 'completed', 'commented', etc.
  activity_description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table for collaboration
CREATE TABLE public.answer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.answer_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view activity logs for their org answers"
  ON public.activity_logs FOR SELECT
  USING (
    answer_id IN (
      SELECT id FROM public.answers 
      WHERE organization_id IS NOT NULL 
      AND is_org_member(auth.uid(), organization_id)
    )
  );

CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for answer_comments
CREATE POLICY "Users can view comments on their answers"
  ON public.answer_comments FOR SELECT
  USING (
    answer_id IN (
      SELECT id FROM public.answers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can view comments on org answers"
  ON public.answer_comments FOR SELECT
  USING (
    answer_id IN (
      SELECT id FROM public.answers 
      WHERE organization_id IS NOT NULL 
      AND is_org_member(auth.uid(), organization_id)
    )
  );

CREATE POLICY "Users can insert comments on accessible answers"
  ON public.answer_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (
      answer_id IN (SELECT id FROM public.answers WHERE user_id = auth.uid())
      OR
      answer_id IN (
        SELECT id FROM public.answers 
        WHERE organization_id IS NOT NULL 
        AND is_org_member(auth.uid(), organization_id)
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.answer_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.answer_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_answer_id ON public.activity_logs(answer_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_answer_comments_answer_id ON public.answer_comments(answer_id);
CREATE INDEX idx_answer_comments_parent_id ON public.answer_comments(parent_comment_id);

-- Add trigger for updated_at on comments
CREATE TRIGGER update_answer_comments_updated_at
  BEFORE UPDATE ON public.answer_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log activity automatically on answer changes
CREATE OR REPLACE FUNCTION public.log_answer_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, grant_id, answer_id, activity_type, activity_description)
    VALUES (NEW.user_id, NEW.grant_id, NEW.id, 'created', 'Started working on application');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO public.activity_logs (user_id, grant_id, answer_id, activity_type, activity_description, metadata)
      VALUES (
        NEW.user_id, 
        NEW.grant_id, 
        NEW.id, 
        'status_changed', 
        'Status changed to ' || NEW.status,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    
    IF OLD.user_rough_answer IS DISTINCT FROM NEW.user_rough_answer THEN
      INSERT INTO public.activity_logs (user_id, grant_id, answer_id, activity_type, activity_description)
      VALUES (NEW.user_id, NEW.grant_id, NEW.id, 'updated', 'Updated draft answer');
    END IF;
    
    IF OLD.ai_polished_answer IS DISTINCT FROM NEW.ai_polished_answer THEN
      INSERT INTO public.activity_logs (user_id, grant_id, answer_id, activity_type, activity_description)
      VALUES (NEW.user_id, NEW.grant_id, NEW.id, 'ai_polished', 'AI generated polished answer');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic activity logging
CREATE TRIGGER answer_activity_logger
  AFTER INSERT OR UPDATE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_answer_activity();