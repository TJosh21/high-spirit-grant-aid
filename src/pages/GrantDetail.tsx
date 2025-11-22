import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, ArrowLeft, CheckCircle2, Circle, AlertCircle, FileText } from 'lucide-react';
import { ApplicationProgress } from '@/components/ApplicationProgress';

export default function GrantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [grant, setGrant] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadGrantDetails();
    }
  }, [slug]);

  const loadGrantDetails = async () => {
    try {
      // Load grant
      const { data: grantData } = await supabase
        .from('grants')
        .select('*')
        .eq('slug', slug)
        .single();

      setGrant(grantData);

      if (grantData) {
        // Load questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('grant_id', grantData.id)
          .eq('is_active', true)
          .order('order_index');

        setQuestions(questionsData || []);

        // Load user's answers
        if (user) {
          const { data: answersData } = await supabase
            .from('answers')
            .select('*')
            .eq('grant_id', grantData.id)
            .eq('user_id', user.id);

          setAnswers(answersData || []);
        }
      }
    } catch (error) {
      console.error('Error loading grant details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerStatus = (questionId: string) => {
    const answer = answers.find((a) => a.question_id === questionId);
    return answer?.status || 'not_started';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-5 w-5 text-status-success" />;
      case 'needs_clarification':
        return <AlertCircle className="h-5 w-5 text-status-warning" />;
      case 'in_progress':
        return <Circle className="h-5 w-5 text-status-info" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'needs_clarification':
        return 'Needs Clarification';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium">Grant not found</p>
              <Link to="/grants">
                <Button className="mt-4" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Grants
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/grants">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grants
          </Button>
        </Link>

        {/* Grant Header */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <div className="mb-4 flex flex-wrap gap-2">
              {grant.status === 'open' && (
                <Badge variant="gold" className="font-semibold">Open Now</Badge>
              )}
              {grant.target_audience_tags?.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {grant.industry_tags?.slice(0, 2).map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-2xl md:text-3xl mb-2">{grant.name}</CardTitle>
            <CardDescription className="text-base md:text-lg">{grant.short_description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {grant.long_description && (
              <div>
                <h3 className="mb-3 text-lg font-bold text-primary">About This Grant</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{grant.long_description}</p>
              </div>
            )}

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Funding Amount</p>
                <p className="text-xl font-bold text-accent">
                  {grant.amount_min && grant.amount_max
                    ? `$${grant.amount_min.toLocaleString()} - $${grant.amount_max.toLocaleString()}`
                    : 'Varies'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Sponsor</p>
                <p className="text-base font-semibold">{grant.sponsor_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Grant Type</p>
                <p className="text-base font-semibold">{grant.sponsor_type || 'N/A'}</p>
              </div>
              {grant.deadline && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                  <p className="text-base font-bold text-destructive">
                    {new Date(grant.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {grant.website_url && (
              <Button asChild variant="outline" size="lg">
                <a href={grant.website_url} target="_blank" rel="noopener noreferrer">
                  Visit Official Grant Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Application Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Questions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Application Questions</h2>
              {questions.length > 0 && (
                <Badge variant="default" className="gap-2 self-start sm:self-auto">
                  <FileText className="w-4 h-4" />
                  {questions.length} Questions
                </Badge>
              )}
            </div>
            
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Link key={question.id} to={`/answer/${grant.slug}/${question.id}`}>
                    <Card className="shadow-card hover:shadow-card-hover transition-all border border-border">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center flex-wrap gap-2">
                              <Badge variant="outline" className="font-medium">
                                Question {index + 1}
                              </Badge>
                              {question.word_limit && (
                                <Badge variant="secondary" className="bg-accent/10 text-accent">
                                  {question.word_limit} words max
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {getStatusText(getAnswerStatus(question.id))}
                              </span>
                            </div>
                            <CardTitle className="text-lg font-semibold text-primary mb-2">
                              {question.question_text}
                            </CardTitle>
                            {question.helper_text && (
                              <CardDescription className="text-sm">
                                {question.helper_text}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusIcon(getAnswerStatus(question.id))}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground font-medium mb-2">
                    No questions available yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Questions will be added soon for this grant
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Progress Tracker */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {questions.length > 0 ? (
                <ApplicationProgress questions={questions} answers={answers} />
              ) : (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">Get Started</CardTitle>
                    <CardDescription>
                      Complete your application to apply for this grant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Once questions are available, your progress will be tracked here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
