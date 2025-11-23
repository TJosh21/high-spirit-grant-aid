import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileField {
  name: string;
  label: string;
  completed: boolean;
  importance: 'critical' | 'high' | 'medium';
}

interface ProfileCompletionTrackerProps {
  profile: any;
}

export const ProfileCompletionTracker = ({ profile }: ProfileCompletionTrackerProps) => {
  const navigate = useNavigate();

  const fields: ProfileField[] = [
    { name: 'business_name', label: 'Business Name', completed: !!profile?.business_name, importance: 'critical' },
    { name: 'business_industry', label: 'Industry', completed: !!profile?.business_industry, importance: 'critical' },
    { name: 'business_description', label: 'Business Description', completed: !!profile?.business_description, importance: 'high' },
    { name: 'state_region', label: 'State/Region', completed: !!profile?.state_region, importance: 'critical' },
    { name: 'country', label: 'Country', completed: !!profile?.country, importance: 'critical' },
    { name: 'years_in_business', label: 'Years in Business', completed: profile?.years_in_business !== null && profile?.years_in_business !== undefined, importance: 'high' },
    { name: 'annual_revenue_range', label: 'Annual Revenue', completed: !!profile?.annual_revenue_range, importance: 'high' },
    { name: 'is_woman_owned', label: 'Woman-Owned Status', completed: profile?.is_woman_owned !== null, importance: 'medium' },
    { name: 'is_minority_owned', label: 'Minority-Owned Status', completed: profile?.is_minority_owned !== null, importance: 'medium' },
  ];

  const completedFields = fields.filter(f => f.completed);
  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);

  const criticalIncomplete = fields.filter(f => f.importance === 'critical' && !f.completed);
  const highIncomplete = fields.filter(f => f.importance === 'high' && !f.completed);
  const mediumIncomplete = fields.filter(f => f.importance === 'medium' && !f.completed);

  const getStatusColor = () => {
    if (completionPercentage === 100) return 'text-success';
    if (completionPercentage >= 70) return 'text-primary';
    if (completionPercentage >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBadge = () => {
    if (completionPercentage === 100) return { label: 'Complete', variant: 'default' as const, className: 'bg-success' };
    if (completionPercentage >= 70) return { label: 'Almost There', variant: 'default' as const, className: 'bg-primary' };
    if (completionPercentage >= 40) return { label: 'In Progress', variant: 'secondary' as const };
    return { label: 'Needs Attention', variant: 'destructive' as const };
  };

  const status = getStatusBadge();

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Profile Completion
              <Badge variant={status.variant} className={status.className}>
                {status.label}
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete your profile for better grant matching
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className={`font-bold ${getStatusColor()}`}>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {completedFields.length} of {fields.length} fields completed
          </p>
        </div>

        {/* Missing Critical Fields */}
        {criticalIncomplete.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="w-4 h-4" />
              Critical Fields Missing
            </div>
            <ul className="space-y-1">
              {criticalIncomplete.map((field) => (
                <li key={field.name} className="flex items-center gap-2 text-sm pl-6">
                  <Circle className="w-3 h-3" />
                  {field.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing High Priority Fields */}
        {highIncomplete.length > 0 && criticalIncomplete.length === 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-warning">
              <AlertCircle className="w-4 h-4" />
              Recommended Fields
            </div>
            <ul className="space-y-1">
              {highIncomplete.map((field) => (
                <li key={field.name} className="flex items-center gap-2 text-sm pl-6">
                  <Circle className="w-3 h-3" />
                  {field.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completed Fields Preview */}
        {completionPercentage === 100 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="w-4 h-4" />
              Profile Complete!
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              Your profile is fully optimized for grant matching. Keep it updated for the best results.
            </p>
          </div>
        ) : (
          <Button 
            onClick={() => navigate('/profile')} 
            className="w-full"
            variant={criticalIncomplete.length > 0 ? 'default' : 'outline'}
          >
            Complete Profile
          </Button>
        )}

        {/* Benefits of Completion */}
        {completionPercentage < 100 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium">Why complete your profile?</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                Get personalized grant recommendations
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                Receive email alerts for matching grants
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                See your match score for each grant
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};