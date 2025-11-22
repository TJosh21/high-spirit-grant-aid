import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Trash2, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Organization = {
  id: string;
  name: string;
  created_at: string;
};

type Member = {
  id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  user_id: string;
  profiles?: {
    name: string;
    email: string;
  };
};

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [createOrgName, setCreateOrgName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadTeamData();
    }
  }, [user]);

  const loadTeamData = async () => {
    try {
      // Check if user is part of an organization
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user?.id)
        .single();

      if (memberData) {
        // Load organization details
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', memberData.organization_id)
          .single();

        setOrganization(orgData);

        // Load all members - query separately to avoid relation issues
        const { data: membersData } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', memberData.organization_id)
          .order('created_at', { ascending: true });

        if (membersData) {
          // Fetch profile data for each member
          const membersWithProfiles = await Promise.all(
            membersData.map(async (member) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', member.user_id)
                .single();

              return {
                ...member,
                profiles: profile,
              };
            })
          );

          setMembers(membersWithProfiles as Member[]);
        }
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!createOrgName.trim()) return;

    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: createOrgName })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user?.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast({
        title: 'Organization created!',
        description: `${createOrgName} has been created successfully.`,
      });

      setDialogOpen(false);
      setCreateOrgName('');
      loadTeamData();
    } catch (error: any) {
      toast({
        title: 'Error creating organization',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !organization) return;

    try {
      // Find user by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (!profiles) {
        toast({
          title: 'User not found',
          description: 'No user exists with this email address.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: profiles.id,
          role: inviteRole,
        });

      if (error) throw error;

      toast({
        title: 'Member invited!',
        description: `${inviteEmail} has been added to your team.`,
      });

      setInviteEmail('');
      loadTeamData();
    } catch (error: any) {
      toast({
        title: 'Error inviting member',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: 'Team member has been removed successfully.',
      });

      loadTeamData();
    } catch (error: any) {
      toast({
        title: 'Error removing member',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
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
            <h1 className="mb-2 text-3xl font-bold">No Organization Yet</h1>
            <p className="mb-8 text-muted-foreground">
              Create an organization to collaborate with your team on grant applications.
            </p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-royal">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>
                    Set up a new organization to collaborate with your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={createOrgName}
                      onChange={(e) => setCreateOrgName(e.target.value)}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createOrganization}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">
            Manage your team members and collaboration settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Invite Member Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Invite Member
              </CardTitle>
              <CardDescription>Add new team members to collaborate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={inviteMember} className="w-full">
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Team Members ({members.length})
              </CardTitle>
              <CardDescription>Current members of your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{member.profiles?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.email || 'No email'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && member.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
