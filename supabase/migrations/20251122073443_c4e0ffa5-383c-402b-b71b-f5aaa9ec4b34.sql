-- Drop existing organizations policies
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners and admins can update" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

-- Allow any authenticated user to create an organization
CREATE POLICY "Authenticated users can create organizations" 
ON public.organizations
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Users can view organizations they are members of
CREATE POLICY "Members can view their organizations" 
ON public.organizations
FOR SELECT 
TO authenticated
USING (is_org_member(auth.uid(), id));

-- Owners and admins can update their organization
CREATE POLICY "Owners and admins can update organization" 
ON public.organizations
FOR UPDATE 
TO authenticated
USING (get_org_role(auth.uid(), id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role]));