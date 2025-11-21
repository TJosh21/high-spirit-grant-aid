import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Save, Mail, Shield } from 'lucide-react';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alertEmails, setAlertEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [rateLimitThreshold, setRateLimitThreshold] = useState(45);
  const [unusualPatternThreshold, setUnusualPatternThreshold] = useState(100);
  const [settingsId, setSettingsId] = useState<string>('');

  useEffect(() => {
    checkAdminAndLoadSettings();
  }, [user]);

  const checkAdminAndLoadSettings = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      if (!roleData) {
        navigate('/home');
        return;
      }

      setIsAdmin(true);
      await loadSettings();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/home');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettingsId(data.id);
        setAlertEmails(data.alert_emails || []);
        setRateLimitThreshold(data.rate_limit_threshold);
        setUnusualPatternThreshold(data.unusual_pattern_threshold);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    const email = newEmail.trim();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (alertEmails.includes(email)) {
      toast({
        title: 'Duplicate Email',
        description: 'This email is already in the list',
        variant: 'destructive',
      });
      return;
    }

    setAlertEmails([...alertEmails, email]);
    setNewEmail('');
  };

  const removeEmail = (emailToRemove: string) => {
    setAlertEmails(alertEmails.filter(email => email !== emailToRemove));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('admin_settings')
        .update({
          alert_emails: alertEmails,
          rate_limit_threshold: rateLimitThreshold,
          unusual_pattern_threshold: unusualPatternThreshold,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId);

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Alert settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold text-primary">Admin Settings</h1>
          </div>
          <p className="text-muted-foreground text-lg">Configure monitoring alerts and thresholds</p>
        </div>

        <div className="space-y-6">
          {/* Email Alerts Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Mail className="w-5 h-5 text-accent" />
                Alert Email Addresses
              </CardTitle>
              <CardDescription>
                Add admin email addresses to receive monitoring alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                  />
                </div>
                <Button onClick={addEmail} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {alertEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No email addresses configured</p>
                  <p className="text-sm">Add an email address to receive alerts</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {alertEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-2 py-2 px-3">
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thresholds Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Alert Thresholds</CardTitle>
              <CardDescription>
                Configure when alerts should be triggered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rateLimit">
                  Rate Limit Warning Threshold
                  <span className="text-muted-foreground ml-2 font-normal">
                    (trigger alert when user reaches this % of limit)
                  </span>
                </Label>
                <Input
                  id="rateLimit"
                  type="number"
                  min="1"
                  max="50"
                  value={rateLimitThreshold}
                  onChange={(e) => setRateLimitThreshold(parseInt(e.target.value) || 45)}
                />
                <p className="text-sm text-muted-foreground">
                  Alert will be sent when a user reaches {rateLimitThreshold} requests per hour
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unusualPattern">
                  Unusual Pattern Threshold
                  <span className="text-muted-foreground ml-2 font-normal">
                    (total requests per hour to trigger system-wide alert)
                  </span>
                </Label>
                <Input
                  id="unusualPattern"
                  type="number"
                  min="50"
                  max="1000"
                  value={unusualPatternThreshold}
                  onChange={(e) => setUnusualPatternThreshold(parseInt(e.target.value) || 100)}
                />
                <p className="text-sm text-muted-foreground">
                  Alert will be sent when total requests exceed {unusualPatternThreshold} per hour
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving || alertEmails.length === 0}
              size="lg"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-primary">Alert Types:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong className="text-foreground">Rate Limit:</strong> Triggered when a user exceeds the configured threshold</li>
                <li>• <strong className="text-foreground">Unusual Pattern:</strong> Triggered for suspicious activity like sudden spikes or coordinated abuse</li>
                <li>• <strong className="text-foreground">Security:</strong> Triggered for potential security issues or threats</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
