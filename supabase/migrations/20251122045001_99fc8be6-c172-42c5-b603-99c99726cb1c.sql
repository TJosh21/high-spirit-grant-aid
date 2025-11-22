-- Enable realtime for answers table (for application updates)
ALTER TABLE public.answers REPLICA IDENTITY FULL;

-- Add answers table to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;