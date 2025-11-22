import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export default function OrganizationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (user) {
      loadOrganization();
    }
  }, [user]);

  const loadOrganization = async () => {
    try {
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user?.id)
        .single();

      if (memberData) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', memberData.organization_id)
          .single();

        if (orgData) {
          setOrganization(orgData);
          setOrgName(orgData.name);
        }
      }
    } catch (error) {
      console.error('Error loading organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!organization || !orgName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgName })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Organization settings have been updated successfully.',
      });

      loadOrganization();
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-3xl font-bold">No Organization</h1>
            <p className="mb-8 text-muted-foreground">
              You need to be part of an organization to access settings.
            </p>
            <Button onClick={() => navigate('/team')}>Go to Team</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/team')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">
              Manage your organization details and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Update your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your organization name"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Customize your organization's appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline" disabled>
                        Upload Logo (Coming Soon)
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Brand Color</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        type="color"
                        className="h-12 w-12 cursor-pointer"
                        defaultValue="#6366f1"
                        disabled
                      />
                      <span className="text-sm text-muted-foreground">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Advanced configuration options for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Organization ID</Label>
                    <Input
                      value={organization.id}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use this ID for API integrations
                    </p>
                  </div>

                  <div>
                    <Label>Created</Label>
                    <Input
                      value={new Date(organization.created_at).toLocaleDateString()}
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
