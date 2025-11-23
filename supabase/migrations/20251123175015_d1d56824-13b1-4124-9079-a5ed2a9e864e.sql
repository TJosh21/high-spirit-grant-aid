-- Add organization_id column to application_templates for team sharing
ALTER TABLE public.application_templates
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;