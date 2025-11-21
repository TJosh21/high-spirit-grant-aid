-- Add foreign key relationship from ai_usage_logs to profiles
-- This allows us to join and get user information
ALTER TABLE public.ai_usage_logs
  ADD CONSTRAINT ai_usage_logs_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;