-- Create admin settings table for alert configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_emails TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_threshold INTEGER NOT NULL DEFAULT 45,
  unusual_pattern_threshold INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage settings
CREATE POLICY "Admins can manage settings"
  ON public.admin_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.admin_settings (alert_emails, rate_limit_threshold, unusual_pattern_threshold)
VALUES ('{}', 45, 100)
ON CONFLICT DO NOTHING;

-- Create alerts log table to track sent alerts
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  user_id UUID,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all alerts
CREATE POLICY "Admins can view all alerts"
  ON public.alert_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient queries
CREATE INDEX idx_alert_logs_type_sent ON public.alert_logs(alert_type, sent_at DESC);