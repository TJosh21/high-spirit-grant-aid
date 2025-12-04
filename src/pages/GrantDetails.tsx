import { useEffect, useState, useRef } from 'react';
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
  Building2,
  ExternalLink,
  Bookmark,
  Tag,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
  Check,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import { GrantDetailLoading } from '@/components/LoadingScreen';

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
  { value: 'saved', label: 'Saved', icon: Bookmark },
  { value: 'planning', label: 'Planning to Apply', icon: Clock },
  { value: 'applied', label: 'Applied', icon: CheckCircle2 },
  { value: 'awarded', label: 'Awarded', icon: CheckCircle2 },
  { value: 'rejected', label: 'Rejected', icon: CheckCircle2 },
  { value: 'not_eligible', label: 'Not Eligible', icon: CheckCircle2 },
];

const GrantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [userGrant, setUserGrant] = useState<UserGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const trackingRef = useRef<HTMLDivElement>(null);

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
        toast.success('Grant saved to My Grants');
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

  const scrollToTracking = () => {
    trackingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: grant?.name || 'Grant Opportunity',
      text: `Check out this grant: ${grant?.name} - ${formatAmountFull(grant?.amount_min || null, grant?.amount_max || null)}`,
      url: shareUrl,
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const formatAmountFull = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Amount varies';
    if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return `From $${min?.toLocaleString()}`;
  };

  const formatAmountShort = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Varies';
    if (min && max) return `$${(min/1000).toFixed(0)}k–$${(max/1000).toFixed(0)}k`;
    if (max) return `Up to $${max >= 1000 ? `${(max/1000).toFixed(0)}k` : max.toLocaleString()}`;
    return `From $${min?.toLocaleString()}`;
  };

  const getDeadlineInfo = (deadline: string | null) => {
    if (!deadline) return { label: 'Rolling', days: null, isOpen: true };
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const date = new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { 
      label: date, 
      days, 
      isOpen: days > 0,
      daysLabel: days <= 0 ? 'Expired' : `${days} days left`
    };
  };

  // Format description into bullet points if it's long
  const formatDescription = (text: string) => {
    if (!text) return [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 3) {
      return sentences.slice(0, 6).map(s => s.trim());
    }
    return null;
  };

  if (loading) return <GrantDetailLoading />;
  if (!grant) return <div className="p-4">Grant not found</div>;

  const deadlineInfo = getDeadlineInfo(grant.deadline);
  const categoryLabel = [
    grant.industry_tags?.[0],
    grant.geography_tags?.[0]
  ].filter(Boolean).join(' · ');
  const descriptionBullets = formatDescription(grant.long_description || grant.short_description || '');
  const allTags = [
    ...(grant.industry_tags || []),
    ...(grant.geography_tags || []),
    ...(grant.target_audience_tags || []),
    ...(grant.business_stage_tags || [])
  ];

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-5 md:space-y-6 max-w-4xl mx-auto pb-32 md:pb-8">
        {/* Back Button & Share */}
        <div className="flex items-center justify-between">
          <Link to="/grants">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to Grants
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="gap-2 rounded-full border-border/60"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>

        {/* Header Card */}
        <Card className="overflow-hidden shadow-premium rounded-3xl border-0">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Grant Info */}
              <div className="flex-1 p-6 md:p-8 lg:p-10">
                {categoryLabel && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold mb-4 rounded-full px-4 py-1.5">
                    {categoryLabel}
                  </Badge>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 font-display leading-tight">
                  {grant.name}
                </h1>
                <div className="space-y-3">
                  <p className="text-muted-foreground flex items-center gap-3 text-base md:text-lg">
                    <Building2 className="h-5 w-5 flex-shrink-0 text-primary/60" />
                    {grant.sponsor_name}
                  </p>
                  {grant.geography_tags?.[0] && (
                    <p className="text-muted-foreground flex items-center gap-3 text-sm md:text-base">
                      <MapPin className="h-5 w-5 flex-shrink-0 text-primary/60" />
                      {grant.geography_tags[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side - Key Metrics */}
              <div 
                className="md:w-80 p-6 md:p-8 lg:p-10 border-t md:border-t-0 md:border-l border-border/20"
                style={{ background: 'linear-gradient(180deg, hsl(220 33% 98%) 0%, hsl(220 33% 95%) 100%)' }}
              >
                <div className="space-y-6">
                  {/* Amount */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Grant Amount</p>
                    <p className="text-3xl md:text-4xl font-bold text-accent font-display">
                      {formatAmountFull(grant.amount_min, grant.amount_max)}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Deadline</p>
                    <Badge className={`${deadlineInfo.isOpen ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'} border-0 px-4 py-2 rounded-full text-sm font-semibold`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {deadlineInfo.label}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Status</p>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${deadlineInfo.isOpen ? 'bg-status-success animate-pulse' : 'bg-destructive'}`} />
                      <span className={`text-base font-bold ${deadlineInfo.isOpen ? 'text-status-success' : 'text-destructive'}`}>
                        {deadlineInfo.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About this Grant */}
        <Card className="shadow-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2 text-primary">
              <Info className="h-5 w-5 text-primary" />
              About this Grant
            </CardTitle>
          </CardHeader>
          <CardContent>
            {descriptionBullets ? (
              <ul className="space-y-3">
                {descriptionBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{bullet}.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {grant.long_description || grant.short_description || 'No description available.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Eligibility Tags */}
        {allTags.length > 0 && (
          <Card className="shadow-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2 text-primary">
                <Tag className="h-5 w-5 text-primary" />
                Eligibility Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {grant.industry_tags?.map(tag => (
                  <Badge key={tag} className="bg-primary/10 text-primary border-0 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
                {grant.geography_tags?.map(tag => (
                  <Badge key={tag} className="bg-accent/15 text-accent-foreground border-0 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
                {grant.target_audience_tags?.map(tag => (
                  <Badge key={tag} className="bg-status-success/15 text-status-success border-0 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
                {grant.business_stage_tags?.map(tag => (
                  <Badge key={tag} className="bg-status-info/15 text-status-info border-0 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Track This Grant */}
        <div ref={trackingRef}>
          <Card className="shadow-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2 text-primary">
                <Bookmark className="h-5 w-5 text-accent" />
                Track This Grant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {user ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-primary">Application Status</label>
                    <Select 
                      value={userGrant?.status || ''} 
                      onValueChange={(v) => handleSaveGrant(v)}
                      disabled={saving}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-card border-border/60">
                        <SelectValue placeholder="Select a status..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <opt.icon className="h-4 w-4" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {userGrant && (
                    <div>
                      <label className="text-sm font-medium mb-2 block text-primary">Your Notes</label>
                      <Textarea
                        placeholder="Add notes about this grant..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="rounded-xl resize-none border-border/60"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {userGrant && (
                      <Button 
                        variant="ghost" 
                        onClick={handleRemoveGrant}
                        disabled={saving}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remove from list
                      </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {userGrant && (
                        <Button 
                          onClick={() => handleSaveGrant(userGrant.status)}
                          disabled={saving}
                          className="rounded-xl"
                        >
                          Save Notes
                        </Button>
                      )}
                      {!userGrant && (
                        <Button 
                          onClick={() => handleSaveGrant('saved')}
                          disabled={saving}
                          className="gap-2 rounded-xl bg-accent text-primary hover:bg-accent-hover"
                        >
                          <Bookmark className="h-4 w-4" />
                          Save to My Grants
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Sign in to track this grant</p>
                  <Link to="/auth">
                    <Button className="rounded-xl">Sign In</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* External Links */}
        {(grant.application_link || grant.website_url) && (
          <Card className="shadow-card rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                {grant.application_link && (
                  <a 
                    href={grant.application_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full gap-2 rounded-xl bg-primary hover:bg-primary-hover">
                      <ExternalLink className="h-4 w-4" />
                      Apply Now
                    </Button>
                  </a>
                )}
                {grant.website_url && (
                  <a 
                    href={grant.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full gap-2 rounded-xl border-border/60">
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border/50 p-4 safe-area-bottom shadow-premium">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary truncate">
              {formatAmountShort(grant.amount_min, grant.amount_max)} · {grant.industry_tags?.[0] || 'Grant'}
            </p>
            <p className="text-xs text-muted-foreground">
              {deadlineInfo.isOpen ? deadlineInfo.daysLabel : 'Closed'}
            </p>
          </div>
          <Button 
            onClick={scrollToTracking}
            className="rounded-xl bg-accent text-primary hover:bg-accent-hover gap-2 flex-shrink-0"
          >
            <Bookmark className="h-4 w-4" />
            Track Grant
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default GrantDetails;
