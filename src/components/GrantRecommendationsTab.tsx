import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface GrantRecommendation {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  amount_max?: number;
  currency?: string;
  deadline?: string;
  match_score: number;
  success_probability: number;
  combined_score: number;
  reasoning?: string;
  key_strengths?: string[];
  considerations?: string[];
}

interface GrantRecommendationsTabProps {
  recommendations: GrantRecommendation[];
  loading: boolean;
  favorites: Set<string>;
  onFavoriteToggle: (grantId: string) => void;
}

export function GrantRecommendationsTab({
  recommendations,
  loading,
  favorites,
  onFavoriteToggle,
}: GrantRecommendationsTabProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="No AI recommendations yet"
        description="Complete your profile to get personalized grant recommendations with success probability scores"
        icon={Sparkles}
        actionLabel="Complete Profile"
        onAction={() => window.location.href = '/profile'}
      />
    );
  }

  return (
    <>
      <div className="mb-6">
        <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2">
            These grants are ranked by AI based on your success probability and match quality.
          </AlertDescription>
        </Alert>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((grant) => (
          <Card key={grant.id} className="relative overflow-hidden border-primary/20 hover:shadow-lg transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-lg line-clamp-2">
                  <Link to={`/grants/${grant.slug}`} className="hover:text-primary">
                    {grant.name}
                  </Link>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFavoriteToggle(grant.id)}
                  className="shrink-0"
                >
                  <Heart className={`h-4 w-4 ${favorites.has(grant.id) ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {grant.success_probability}% Win Rate
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  Match: {grant.match_score}%
                </Badge>
                <Badge variant="outline">
                  Score: {grant.combined_score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="line-clamp-2">
                {grant.short_description}
              </CardDescription>
              
              {grant.reasoning && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-foreground/80">{grant.reasoning}</p>
                </div>
              )}

              {grant.key_strengths && grant.key_strengths.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-status-success">Key Strengths:</p>
                  {grant.key_strengths.map((strength, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">✓ {strength}</p>
                  ))}
                </div>
              )}

              {grant.considerations && grant.considerations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-status-warning">Considerations:</p>
                  {grant.considerations.map((consideration, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">⚠ {consideration}</p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                {grant.amount_max && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Up to {grant.currency} {grant.amount_max.toLocaleString()}</span>
                  </div>
                )}
                {grant.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(grant.deadline), 'MMM dd')}</span>
                  </div>
                )}
              </div>

              <Button asChild className="w-full mt-2">
                <Link to={`/grants/${grant.slug}`}>
                  View Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
