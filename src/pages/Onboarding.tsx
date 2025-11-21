import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    business_name: '',
    business_industry: '',
    business_description: '',
    years_in_business: '',
    annual_revenue_range: '',
    is_minority_owned: false,
    is_woman_owned: false,
    country: 'United States',
    state_region: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          years_in_business: parseInt(formData.years_in_business) || null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile completed!',
        description: "Let's find some grants for you.",
      });

      navigate('/home');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.business_name || !formData.business_industry)) {
      toast({
        title: 'Required fields',
        description: 'Please fill in your business name and industry',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-8">
      <Card className="w-full max-w-2xl shadow-royal">
        <CardHeader>
          <CardTitle className="text-2xl">Tell us about your business</CardTitle>
          <CardDescription>
            This helps us recommend the most relevant grants for you
          </CardDescription>
          <div className="mt-4 flex space-x-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_industry">Industry *</Label>
                  <Select
                    value={formData.business_industry}
                    onValueChange={(value) => setFormData({ ...formData, business_industry: value })}
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
                    value={formData.business_description}
                    onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                    placeholder="Briefly describe what your business does..."
                    rows={4}
                  />
                </div>

                <Button type="button" onClick={nextStep} className="w-full bg-gradient-royal">
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="years_in_business">Years in Business</Label>
                    <Input
                      id="years_in_business"
                      type="number"
                      min="0"
                      value={formData.years_in_business}
                      onChange={(e) => setFormData({ ...formData, years_in_business: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state_region">State/Region</Label>
                    <Input
                      id="state_region"
                      value={formData.state_region}
                      onChange={(e) => setFormData({ ...formData, state_region: e.target.value })}
                      placeholder="e.g., Arizona"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_revenue_range">Annual Revenue Range</Label>
                  <Select
                    value={formData.annual_revenue_range}
                    onValueChange={(value) => setFormData({ ...formData, annual_revenue_range: value })}
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
                  <Label>Business Ownership (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_minority_owned"
                      checked={formData.is_minority_owned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_minority_owned: checked as boolean })
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
                      checked={formData.is_woman_owned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_woman_owned: checked as boolean })
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

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-royal"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Setup
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
