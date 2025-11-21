import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle, FileText, Target, TrendingUp } from 'lucide-react';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      // Get all grants user has started
      const { data: answers } = await supabase
        .from('answers')
        .select('*, grants(*), questions(*)')
        .eq('user_id', user?.id);

      if (answers) {
        // Group by grant
        const grantMap = new Map();
        answers.forEach((answer: any) => {
          const grantId = answer.grant_id;
          if (!grantMap.has(grantId)) {
            grantMap.set(grantId, {
              grant: answer.grants,
              answers: [],
            });
          }
          grantMap.get(grantId).answers.push(answer);
        });

        // Get total questions for each grant
        const grantIds = Array.from(grantMap.keys());
        const { data: allQuestions } = await supabase
          .from('questions')
          .select('grant_id')
          .in('grant_id', grantIds)
          .eq('is_active', true);

        const questionCounts = new Map();
        allQuestions?.forEach((q: any) => {
          questionCounts.set(q.grant_id, (questionCounts.get(q.grant_id) || 0) + 1);
        });

        const appsArray = Array.from(grantMap.entries()).map(([grantId, data]) => ({
          grant: data.grant,
          answers: data.answers,
          totalQuestions: questionCounts.get(grantId) || 0,
          completedQuestions: data.answers.filter((a: any) => a.status === 'ready').length,
        }));

        setApplications(appsArray);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-status-success" />;
      case 'needs_clarification':
        return <AlertCircle className="h-4 w-4 text-status-warning" />;
      case 'in_progress':
        return <Circle className="h-4 w-4 text-status-info" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">My Applications</h1>
          <p className="text-muted-foreground text-lg">
            Track your progress on grant applications
          </p>
        </div>

        {applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Active Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{applications.length}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Questions Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {applications.reduce((sum, app) => sum + app.completedQuestions, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Avg Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(
                    applications.reduce((sum, app) => 
                      sum + (app.totalQuestions > 0 ? (app.completedQuestions / app.totalQuestions) * 100 : 0), 0
                    ) / applications.length
                  )}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((app) => {
              const progress = app.totalQuestions > 0 ? (app.completedQuestions / app.totalQuestions) * 100 : 0;
              
              return (
                <Card key={app.grant.id} className="shadow-card hover:shadow-card-hover transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link to={`/grants/${app.grant.slug}`}>
                          <CardTitle className="text-2xl hover:text-primary transition-colors mb-2">
                            {app.grant.name}
                          </CardTitle>
                        </Link>
                        <CardDescription className="text-base">
                          {app.grant.short_description}
                        </CardDescription>
                        {app.grant.amount_min && app.grant.amount_max && (
                          <p className="text-accent font-semibold mt-2">
                            ${app.grant.amount_min.toLocaleString()} - ${app.grant.amount_max.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={progress === 100 ? "default" : "outline"} 
                        className={`${progress === 100 ? 'bg-green-600' : ''} gap-2 px-3 py-1`}
                      >
                        {app.completedQuestions} of {app.totalQuestions}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Progress</span>
                        <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-3"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-primary">Application Questions:</p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {app.answers.map((answer: any, index: number) => (
                          <Link
                            key={answer.id}
                            to={`/answer/${app.grant.slug}/${answer.question_id}`}
                            className="flex items-start gap-3 rounded-xl border border-border p-4 transition-all hover:bg-secondary hover:shadow-card"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getStatusIcon(answer.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">Question {index + 1}</p>
                              <p className="line-clamp-2 text-sm font-medium text-foreground">
                                {answer.question_text_snapshot}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-20" />
              <p className="mb-2 text-xl font-bold text-primary">No applications started yet</p>
              <p className="mb-6 text-muted-foreground max-w-md mx-auto">
                Browse available grants and start your first application to access funding opportunities for your business
              </p>
              <Link to="/grants">
                <button className="rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-card">
                  Browse Grants
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
