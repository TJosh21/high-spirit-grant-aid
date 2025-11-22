-- Add outcome tracking and DocuSign integration to answers table
ALTER TABLE public.answers 
ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN ('pending', 'successful', 'rejected')),
ADD COLUMN IF NOT EXISTS docusign_envelope_id text,
ADD COLUMN IF NOT EXISTS estimated_completion_minutes integer;

-- Add index for outcome queries
CREATE INDEX IF NOT EXISTS idx_answers_outcome ON public.answers(outcome);

-- Add estimated time to questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS estimated_minutes integer;