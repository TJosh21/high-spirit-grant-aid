import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, ArrowLeft, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

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
        <Card className="mb-6">
          <CardHeader>
            <div className="mb-4 flex flex-wrap gap-2">
              {grant.target_audience_tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {grant.industry_tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-3xl">{grant.name}</CardTitle>
            <CardDescription className="text-base">{grant.short_description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {grant.long_description && (
              <div>
                <h3 className="mb-2 font-semibold">About This Grant</h3>
                <p className="text-muted-foreground">{grant.long_description}</p>
              </div>
            )}

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold text-accent">
                  {grant.amount_min && grant.amount_max
                    ? `$${grant.amount_min.toLocaleString()} - $${grant.amount_max.toLocaleString()}`
                    : 'Varies'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sponsor</p>
                <p className="text-lg font-semibold">{grant.sponsor_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-lg font-semibold">{grant.sponsor_type || 'N/A'}</p>
              </div>
              {grant.deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-lg font-semibold">
                    {new Date(grant.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {grant.website_url && (
              <Button asChild variant="outline">
                <a href={grant.website_url} target="_blank" rel="noopener noreferrer">
                  Visit Grant Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Application Questions */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Application Questions</h2>
          
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Link key={question.id} to={`/answer/${grant.slug}/${question.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            {question.word_limit && (
                              <Badge variant="secondary">{question.word_limit} words max</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{question.question_text}</CardTitle>
                          {question.helper_text && (
                            <CardDescription className="mt-2">
                              {question.helper_text}
                            </CardDescription>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          {getStatusIcon(getAnswerStatus(question.id))}
                          <span className="text-sm font-medium">
                            {getStatusText(getAnswerStatus(question.id))}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No questions available for this grant yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
