-- Enable realtime for grants table to trigger notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.grants;