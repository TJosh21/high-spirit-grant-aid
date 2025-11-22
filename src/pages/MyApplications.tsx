import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle, AlertCircle, FileText, Target, TrendingUp } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { ApplicationProgress } from '@/components/ApplicationProgress';
import { BulkOperations } from '@/components/BulkOperations';

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApps, setSelectedApps] = useState<any[]>([]);

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
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <BulkOperations
        selectedApplications={selectedApps}
        onClearSelection={() => setSelectedApps([])}
        onRefresh={loadApplications}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">My Applications</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Track your progress on grant applications
          </p>
        </div>

        {applications.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Active Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-primary">{applications.length}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Completed Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-accent">
                  {applications.reduce((sum, app) => sum + app.completedQuestions, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card sm:col-span-2 md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Average Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-primary">
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
              const answeredQuestions = app.answers.filter((a: any) => a.status !== 'not_started').length;
              const isSelected = selectedApps.some(selected => selected.grant_id === app.grant.id);
              
              return (
                <div key={app.grant.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedApps([...selectedApps, {
                            id: app.grant.id,
                            grant_id: app.grant.id,
                            status: app.answers[0]?.status || 'not_started',
                            grants: app.grant
                          }]);
                        } else {
                          setSelectedApps(selectedApps.filter(s => s.grant_id !== app.grant.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <ApplicationProgress
                        grantName={app.grant.name}
                        totalQuestions={app.totalQuestions}
                        answeredQuestions={answeredQuestions}
                        readyQuestions={app.completedQuestions}
                        deadline={app.grant.deadline}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {app.answers.map((answer: any, index: number) => (
                      <Link
                        key={answer.id}
                        to={`/answer/${app.grant.slug}/${answer.question_id}`}
                        className="flex items-start gap-3 rounded-xl border border-border p-3 md:p-4 transition-all hover:bg-secondary hover:shadow-card"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(answer.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Question {index + 1}</p>
                          <p className="line-clamp-2 text-xs md:text-sm font-medium text-foreground">
                            {answer.question_text_snapshot}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No applications started yet"
            description="Browse available grants and start your first application to access funding opportunities"
            actionLabel="Browse Grants"
            onAction={() => navigate('/grants')}
          />
        )}
      </div>
    </div>
  );
}
