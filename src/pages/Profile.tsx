import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Bell, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ProfileCompletionTracker } from '@/components/ProfileCompletionTracker';
import { GrantSuccessTips } from '@/components/GrantSuccessTips';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_deadline_reminders: true,
    email_status_updates: true,
    email_new_grants: false,
    push_deadline_reminders: true,
    push_status_updates: true,
  });

  const industries = [
    'Technology',
    'Retail',
    'Food & Beverage',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Construction',
    'Professional Services',
    'Arts & Entertainment',
    'Other',
  ];

  const revenueRanges = [
    'Less than $50,000',
    '$50,000 - $250,000',
    '$250,000 - $1,000,000',
    '$1,000,000 - $5,000,000',
    'More than $5,000,000',
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setProfile(data);

      // Load notification preferences from localStorage
      const savedPrefs = localStorage.getItem('notificationPreferences');
      if (savedPrefs) {
        setNotificationPrefs(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user?.id);

      if (error) throw error;

      // Save notification preferences to localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefs));

      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold text-primary">Profile Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account and business information
          </p>
        </div>

        {/* Profile Completion Tracker */}
        <div className="mb-6">
          <ProfileCompletionTracker profile={profile} />
        </div>

        {/* Grant Success Tips */}
        <div className="mb-6">
          <GrantSuccessTips />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl">Business Profile</CardTitle>
                <CardDescription className="text-sm md:text-base">Update your business details for better grant matching</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={profile?.business_name || ''}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_industry">Industry</Label>
              <Select
                value={profile?.business_industry || ''}
                onValueChange={(value) => setProfile({ ...profile, business_industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                value={profile?.business_description || ''}
                onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="years_in_business">Years in Business</Label>
                <Input
                  id="years_in_business"
                  type="number"
                  min="0"
                  value={profile?.years_in_business || ''}
                  onChange={(e) => setProfile({ ...profile, years_in_business: parseInt(e.target.value) || null })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state_region">State/Region</Label>
                <Input
                  id="state_region"
                  value={profile?.state_region || ''}
                  onChange={(e) => setProfile({ ...profile, state_region: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_revenue_range">Annual Revenue Range</Label>
              <Select
                value={profile?.annual_revenue_range || ''}
                onValueChange={(value) => setProfile({ ...profile, annual_revenue_range: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  {revenueRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Business Ownership</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_minority_owned"
                  checked={profile?.is_minority_owned || false}
                  onCheckedChange={(checked) =>
                    setProfile({ ...profile, is_minority_owned: checked })
                  }
                />
                <label
                  htmlFor="is_minority_owned"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Minority-owned business
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_woman_owned"
                  checked={profile?.is_woman_owned || false}
                  onCheckedChange={(checked) =>
                    setProfile({ ...profile, is_woman_owned: checked })
                  }
                />
                <label
                  htmlFor="is_woman_owned"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Woman-owned business
                </label>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                </div>
              </div>

              <div className="space-y-4 pl-2">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-medium">Email Notifications</Label>
                  </div>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email_deadline_reminders"
                        checked={notificationPrefs.email_deadline_reminders}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs({ ...notificationPrefs, email_deadline_reminders: !!checked })
                        }
                      />
                      <label htmlFor="email_deadline_reminders" className="text-sm cursor-pointer">
                        Grant deadline reminders (3 days before)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email_status_updates"
                        checked={notificationPrefs.email_status_updates}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs({ ...notificationPrefs, email_status_updates: !!checked })
                        }
                      />
                      <label htmlFor="email_status_updates" className="text-sm cursor-pointer">
                        Application status updates
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email_new_grants"
                        checked={notificationPrefs.email_new_grants}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs({ ...notificationPrefs, email_new_grants: !!checked })
                        }
                      />
                      <label htmlFor="email_new_grants" className="text-sm cursor-pointer">
                        New grant opportunities matching your profile
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-medium">Push Notifications</Label>
                  </div>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="push_deadline_reminders"
                        checked={notificationPrefs.push_deadline_reminders}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs({ ...notificationPrefs, push_deadline_reminders: !!checked })
                        }
                      />
                      <label htmlFor="push_deadline_reminders" className="text-sm cursor-pointer">
                        Grant deadline reminders
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="push_status_updates"
                        checked={notificationPrefs.push_status_updates}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs({ ...notificationPrefs, push_status_updates: !!checked })
                        }
                      />
                      <label htmlFor="push_status_updates" className="text-sm cursor-pointer">
                        Application status updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="w-full mt-6"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
