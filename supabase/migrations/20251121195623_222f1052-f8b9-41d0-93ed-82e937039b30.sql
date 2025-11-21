-- Add admin policy to view all AI usage logs
CREATE POLICY "Admins can view all AI usage logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));