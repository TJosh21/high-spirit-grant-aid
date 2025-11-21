import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles, Copy, Loader2 } from 'lucide-react';

export default function Answer() {
  const { grantSlug, questionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [grant, setGrant] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [userRoughAnswer, setUserRoughAnswer] = useState('');
  const [userClarification, setUserClarification] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);

  useEffect(() => {
    if (grantSlug && questionId) {
      loadData();
    }
  }, [grantSlug, questionId]);

  const loadData = async () => {
    try {
      const { data: grantData } = await supabase
        .from('grants')
        .select('*')
        .eq('slug', grantSlug)
        .single();

      setGrant(grantData);

      const { data: questionData } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      setQuestion(questionData);

      if (grantData && user) {
        const { data: answerData } = await supabase
          .from('answers')
          .select('*')
          .eq('grant_id', grantData.id)
          .eq('question_id', questionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (answerData) {
          setAnswer(answerData);
          setUserRoughAnswer(answerData.user_rough_answer || '');
          setUserClarification(answerData.user_clarification || '');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (updates: any) => {
    if (!user || !grant || !question) return;

    try {
      const answerData = {
        user_id: user.id,
        grant_id: grant.id,
        question_id: question.id,
        question_text_snapshot: question.question_text,
        ...updates,
        last_updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('answers')
        .upsert(answerData, { onConflict: 'user_id,question_id' })
        .select()
        .single();

      if (error) throw error;
      setAnswer(data);
      return data;
    } catch (error: any) {
      toast({
        title: 'Error saving answer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePolish = async () => {
    if (!userRoughAnswer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please provide your rough answer first',
        variant: 'destructive',
      });
      return;
    }

    setAiProcessing(true);
    try {
      const saved = await saveAnswer({
        user_rough_answer: userRoughAnswer,
        status: 'in_progress',
      });

      const { data, error } = await supabase.functions.invoke('ai-grant-assistant', {
        body: {
          type: 'polish',
          question_text: question.question_text,
          user_rough_answer: userRoughAnswer,
          user_clarification: userClarification || null,
          word_limit: question.word_limit,
        },
      });

      if (error) throw error;

      await saveAnswer({
        user_rough_answer: userRoughAnswer,
        ai_polished_answer: data.polished_answer,
        status: 'ready',
        last_ai_run_at: new Date().toISOString(),
      });

      toast({
        title: 'Answer polished!',
        description: 'Your professional grant answer is ready',
      });

      loadData();
    } catch (error: any) {
      toast({
        title: 'Error processing',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Answer copied to clipboard',
    });
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
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link to={`/grants/${grantSlug}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grant
          </Button>
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <div className="mb-2">
              <Badge variant="outline">{grant?.name}</Badge>
              {question?.word_limit && (
                <Badge variant="secondary" className="ml-2">
                  {question.word_limit} words max
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{question?.question_text}</CardTitle>
            {question?.helper_text && (
              <CardDescription className="text-base">{question.helper_text}</CardDescription>
            )}
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
            <CardDescription>Write your thoughts - AI will help polish it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={userRoughAnswer}
              onChange={(e) => setUserRoughAnswer(e.target.value)}
              placeholder="Share your thoughts here... Don't worry about making it perfect, the AI will help polish your answer."
              rows={8}
              className="resize-none"
            />
            <Button
              onClick={handlePolish}
              disabled={aiProcessing || !userRoughAnswer.trim()}
              className="bg-gradient-royal"
            >
              {aiProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Polish with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {answer?.ai_polished_answer && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-accent" />
                  Polished Grant Answer
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(answer.ai_polished_answer)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <CardDescription>Professional, grant-ready response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap rounded-lg bg-background p-4 text-foreground">
                {answer.ai_polished_answer}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
