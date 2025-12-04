import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Globe,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';

interface Grant {
  id: string;
  name: string;
  sponsor_name: string;
  short_description: string | null;
  long_description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  application_link: string | null;
  website_url: string | null;
  industry_tags: string[];
  geography_tags: string[];
  target_audience_tags: string[];
  business_stage_tags: string[];
}

interface UserGrant {
  id: string;
  status: string;
  notes: string | null;
}

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved', color: 'bg-primary/10 text-primary' },
  { value: 'planning', label: 'Planning to Apply', color: 'bg-accent/10 text-accent' },
  { value: 'applied', label: 'Applied', color: 'bg-status-info/10 text-status-info' },
  { value: 'awarded', label: 'Awarded', color: 'bg-status-success/10 text-status-success' },
  { value: 'rejected', label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
  { value: 'not_eligible', label: 'Not Eligible', color: 'bg-muted text-muted-foreground' },
];

const GrantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [userGrant, setUserGrant] = useState<UserGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadGrant();
    }
  }, [id, user]);

  const loadGrant = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGrant(data);

      // Load user's tracking status if logged in
      if (user) {
        const { data: ugData } = await supabase
          .from('user_grants')
          .select('*')
          .eq('user_id', user.id)
          .eq('grant_id', id)
          .single();

        if (ugData) {
          setUserGrant(ugData);
          setNotes(ugData.notes || '');
        }
      }
    } catch (error) {
      console.error('Error loading grant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrant = async (status: string = 'saved') => {
    if (!user) {
      toast.error('Please sign in to save grants');
      return;
    }

    setSaving(true);
    try {
      if (userGrant) {
        // Update existing
        const { error } = await supabase
          .from('user_grants')
          .update({ 
            status, 
            notes,
            last_updated_by_user_at: new Date().toISOString()
          })
          .eq('id', userGrant.id);

        if (error) throw error;
        setUserGrant({ ...userGrant, status, notes });
        toast.success('Grant updated');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_grants')
          .insert({
            user_id: user.id,
            grant_id: id,
            status,
            notes
          })
          .select()
          .single();

        if (error) throw error;
        setUserGrant(data);
        toast.success('Grant saved');
      }
    } catch (error) {
      console.error('Error saving grant:', error);
      toast.error('Failed to save grant');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGrant = async () => {
    if (!userGrant) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_grants')
        .delete()
        .eq('id', userGrant.id);

      if (error) throw error;
      setUserGrant(null);
      setNotes('');
      toast.success('Grant removed from your list');
    } catch (error) {
      console.error('Error removing grant:', error);
      toast.error('Failed to remove grant');
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Amount varies';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return `From $${min?.toLocaleString()}`;
  };

  if (loading) return <LoadingScreen />;
  if (!grant) return <div className="p-4">Grant not found</div>;

  const daysLeft = grant.deadline 
    ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 py-4 space-y-4">
        {/* Back Button */}
        <Link to="/grants">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Grants
          </Button>
        </Link>

        {/* Grant Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">{grant.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {grant.sponsor_name}
          </p>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-semibold">
                  {formatAmount(grant.amount_min, grant.amount_max)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="text-sm font-semibold">
                  {grant.deadline 
                    ? new Date(grant.deadline).toLocaleDateString() 
                    : 'Rolling'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {daysLeft !== null && daysLeft <= 14 && daysLeft > 0 && (
          <Badge variant="destructive" className="w-full justify-center py-2">
            ⚠️ Only {daysLeft} days left to apply!
          </Badge>
        )}

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About this Grant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {grant.long_description || grant.short_description || 'No description available.'}
            </p>
          </CardContent>
        </Card>

        {/* Tags */}
        {(grant.industry_tags?.length > 0 || grant.geography_tags?.length > 0 || grant.target_audience_tags?.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Eligibility Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {grant.industry_tags?.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
              {grant.geography_tags?.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
              {grant.target_audience_tags?.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* User Tracking Section */}
        {user && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Track This Grant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select 
                  value={userGrant?.status || ''} 
                  onValueChange={(v) => handleSaveGrant(v)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userGrant && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <Textarea
                      placeholder="Add notes about this grant..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSaveGrant(userGrant.status)}
                      disabled={saving}
                      className="flex-1"
                    >
                      Save Notes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleRemoveGrant}
                      disabled={saving}
                    >
                      Remove
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          {!user && (
            <Button 
              onClick={() => handleSaveGrant('saved')}
              className="w-full gap-2"
              variant="outline"
            >
              <Bookmark className="h-4 w-4" />
              Sign in to Save
            </Button>
          )}

          {grant.application_link && (
            <Button 
              asChild
              className="w-full gap-2"
            >
              <a 
                href={grant.application_link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </a>
            </Button>
          )}

          {grant.website_url && (
            <Button 
              asChild
              variant="outline"
              className="w-full gap-2"
            >
              <a 
                href={grant.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default GrantDetails;
