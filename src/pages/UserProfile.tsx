import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Building2, 
  MapPin, 
  Briefcase,
  Save,
  Loader2,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';

interface ProfileData {
  name: string;
  email: string;
  business_name: string | null;
  business_industry: string | null;
  business_description: string | null;
  annual_revenue_range: string | null;
  state_region: string | null;
  country: string | null;
  years_in_business: number | null;
  is_woman_owned: boolean;
  is_minority_owned: boolean;
}

const INDUSTRIES = [
  'Technology',
  'Retail',
  'Food & Beverage',
  'Healthcare',
  'Manufacturing',
  'Professional Services',
  'Construction',
  'Education',
  'Arts & Entertainment',
  'Agriculture',
  'Transportation',
  'Real Estate',
  'Other'
];

const REVENUE_RANGES = [
  { value: 'under25k', label: 'Under $25,000' },
  { value: '25k-100k', label: '$25,000 - $100,000' },
  { value: '100k-500k', label: '$100,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1 million' },
  { value: '1m-plus', label: 'Over $1 million' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          business_name: profile.business_name,
          business_industry: profile.business_industry,
          business_description: profile.business_description,
          annual_revenue_range: profile.annual_revenue_range,
          state_region: profile.state_region,
          country: profile.country,
          years_in_business: profile.years_in_business,
          is_woman_owned: profile.is_woman_owned,
          is_minority_owned: profile.is_minority_owned,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile saved');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <MobileLayout>
      <AppHeader showAuth={false} />
      
      <div className="px-4 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                value={profile?.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Name</label>
              <Input
                value={profile?.business_name || ''}
                onChange={(e) => updateField('business_name', e.target.value)}
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select 
                value={profile?.business_industry || ''} 
                onValueChange={(v) => updateField('business_industry', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Business Description</label>
              <Textarea
                value={profile?.business_description || ''}
                onChange={(e) => updateField('business_description', e.target.value)}
                placeholder="Briefly describe your business..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Annual Revenue</label>
              <Select 
                value={profile?.annual_revenue_range || ''} 
                onValueChange={(v) => updateField('annual_revenue_range', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Years in Business</label>
              <Input
                type="number"
                value={profile?.years_in_business || ''}
                onChange={(e) => updateField('years_in_business', parseInt(e.target.value) || null)}
                placeholder="0"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select 
                value={profile?.state_region || ''} 
                onValueChange={(v) => updateField('state_region', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Business Certifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Business Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Woman-Owned Business</label>
              <Button
                variant={profile?.is_woman_owned ? "default" : "outline"}
                size="sm"
                onClick={() => updateField('is_woman_owned', !profile?.is_woman_owned)}
              >
                {profile?.is_woman_owned ? 'Yes' : 'No'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Minority-Owned Business</label>
              <Button
                variant={profile?.is_minority_owned ? "default" : "outline"}
                size="sm"
                onClick={() => updateField('is_minority_owned', !profile?.is_minority_owned)}
              >
                {profile?.is_minority_owned ? 'Yes' : 'No'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>

        <div className="h-4" />
      </div>
    </MobileLayout>
  );
};

export default UserProfile;
