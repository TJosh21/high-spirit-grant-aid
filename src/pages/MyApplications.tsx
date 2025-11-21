import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle, FileText } from 'lucide-react';

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
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track your progress on grant applications
          </p>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((app) => (
              <Card key={app.grant.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link to={`/grants/${app.grant.slug}`}>
                        <CardTitle className="text-xl hover:text-primary">
                          {app.grant.name}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-1">
                        {app.grant.short_description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {app.completedQuestions} of {app.totalQuestions} complete
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress 
                      value={app.totalQuestions > 0 ? (app.completedQuestions / app.totalQuestions) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Questions:</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {app.answers.map((answer: any) => (
                        <Link
                          key={answer.id}
                          to={`/answer/${app.grant.slug}/${answer.question_id}`}
                          className="flex items-center space-x-2 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                        >
                          {getStatusIcon(answer.status)}
                          <span className="line-clamp-1 flex-1 text-sm">
                            {answer.question_text_snapshot}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">No applications started yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Browse available grants and start your first application
              </p>
              <Link to="/grants">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
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
