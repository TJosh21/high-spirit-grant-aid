-- Create table for tracking AI API usage and rate limiting
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  request_size INTEGER,
  response_size INTEGER
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage logs
CREATE POLICY "Users can view their own AI usage logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for efficient rate limit queries (checking last hour of usage)
CREATE INDEX idx_ai_usage_logs_user_created 
  ON public.ai_usage_logs(user_id, created_at DESC);

-- Add trigger for updated_at on profiles if needed for usage tracking
COMMENT ON TABLE public.ai_usage_logs IS 'Tracks AI API usage for rate limiting and analytics';