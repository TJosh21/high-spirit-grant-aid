import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles, Copy, Loader2, Lightbulb, AlertCircle, Save, MessageSquare, Clock, CheckSquare, History, FileSignature, Brain, FileUp, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ApplicationTimeline } from '@/components/ApplicationTimeline';
import { AnswerComments } from '@/components/AnswerComments';
import { TaskManager } from '@/components/TaskManager';
import { VersionHistory } from '@/components/VersionHistory';
import { PresenceIndicator } from '@/components/PresenceIndicator';
import { DocumentParser } from '@/components/DocumentParser';
import { ApplicationScoreCard } from '@/components/ApplicationScoreCard';
import { InlineComments } from '@/components/InlineComments';
import { TemplateSelector } from '@/components/TemplateSelector';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sendingToDocuSign, setSendingToDocuSign] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    return userRoughAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [userRoughAnswer]);

  const wordLimitStatus = useMemo(() => {
    if (!question?.word_limit) return null;
    const percentage = (wordCount / question.word_limit) * 100;
    if (percentage > 100) return { type: 'over', message: `${wordCount - question.word_limit} words over limit`, variant: 'destructive' as const };
    if (percentage > 90) return { type: 'warning', message: `${question.word_limit - wordCount} words remaining`, variant: 'default' as const };
    if (percentage < 50) return { type: 'under', message: `Consider adding ${Math.floor(question.word_limit * 0.7) - wordCount} more words`, variant: 'default' as const };
    return { type: 'good', message: `${question.word_limit - wordCount} words remaining`, variant: 'default' as const };
  }, [wordCount, question?.word_limit]);

  useEffect(() => {
    if (grantSlug && questionId) {
      loadData();
    }
  }, [grantSlug, questionId]);

  // Auto-save functionality with debouncing
  const autoSaveDraft = useCallback(async (roughAnswer: string) => {
    if (!user || !grant || !question || !roughAnswer.trim()) return;

    setAutoSaving(true);
    try {
      await saveAnswer({
        user_rough_answer: roughAnswer,
        status: answer?.status || 'in_progress',
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [user, grant, question, answer?.status]);

  // Debounced auto-save when user types
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (userRoughAnswer.trim()) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveDraft(userRoughAnswer);
      }, 2000); // Auto-save after 2 seconds of no typing
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [userRoughAnswer, autoSaveDraft]);

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

  const getSuggestions = async () => {
    if (!userRoughAnswer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please write something first to get suggestions',
        variant: 'destructive',
      });
      return;
    }

    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-grant-assistant', {
        body: {
          type: 'suggest',
          question_text: question.question_text,
          user_rough_answer: userRoughAnswer,
          word_limit: question.word_limit,
          current_word_count: wordCount,
        },
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      toast({
        title: 'Suggestions ready!',
        description: 'Review the AI suggestions below',
      });
    } catch (error: any) {
      toast({
        title: 'Error getting suggestions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingSuggestions(false);
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

      // Send notification for rough answer submission
      try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'rough_answer_submitted',
              data: {
                grantName: grant?.name || 'Unknown Grant',
                questionText: question?.question_text || 'Unknown Question',
                roughAnswer: userRoughAnswer,
                userEmail: user?.email || 'Unknown',
                timestamp: new Date().toISOString(),
                userId: user?.id,
                grantSlug: grantSlug,
                questionId: questionId,
              },
              channels: { email: true, sms: false, push: true }
            }
          });
      } catch (notifError) {
        console.error('Failed to send rough answer notification:', notifError);
      }

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

      // Send notification for polished answer generation
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'polished_answer_generated',
            data: {
              grantName: grant?.name || 'Unknown Grant',
              questionText: question?.question_text || 'Unknown Question',
              roughAnswer: userRoughAnswer,
              polishedAnswer: data.polished_answer,
              userEmail: user?.email || 'Unknown',
              timestamp: new Date().toISOString(),
              userId: user?.id,
              grantSlug: grantSlug,
              questionId: questionId,
            },
            channels: { email: true, sms: false, push: true }
          }
        });
      } catch (notifError) {
        console.error('Failed to send polished answer notification:', notifError);
      }

      toast({
        title: 'Answer polished!',
        description: 'Your professional grant answer is ready',
      });

      setSuggestions([]);
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

  const handleSendToDocuSign = async () => {
    if (!answer?.ai_polished_answer) {
      toast({
        title: 'No polished answer',
        description: 'Please polish your answer first',
        variant: 'destructive',
      });
      return;
    }

    setSendingToDocuSign(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-to-docusign', {
        body: {
          answerId: answer.id,
          grantName: grant.name,
          polishedAnswer: answer.ai_polished_answer,
        },
      });

      if (error) throw error;

      toast({
        title: 'Sent to DocuSign!',
        description: 'Your application has been sent for signing',
      });
    } catch (error: any) {
      console.error('Error sending to DocuSign:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send to DocuSign',
        variant: 'destructive',
      });
    } finally {
      setSendingToDocuSign(false);
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={`/grants/${grantSlug}`}>
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grant
          </Button>
        </Link>

        <Card className="mb-6 shadow-card">
          <CardHeader>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="outline">{grant?.name}</Badge>
              {question?.word_limit && (
                <Badge variant="secondary">
                  {question.word_limit} words max
                </Badge>
              )}
              {estimatedTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{estimatedTime} min
                </Badge>
              )}
              {difficulty && (
                <Badge 
                  variant="outline"
                  className={
                    difficulty === 'easy' ? 'border-green-500 text-green-500' :
                    difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                    difficulty === 'hard' ? 'border-orange-500 text-orange-500' :
                    'border-red-500 text-red-500'
                  }
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1).replace('_', ' ')}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl md:text-2xl">{question?.question_text}</CardTitle>
            {question?.helper_text && (
              <CardDescription className="text-sm md:text-base mt-2">{question.helper_text}</CardDescription>
            )}
            <div className="mt-4">
              <PresenceIndicator answerId={answer?.id} />
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="answer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="answer">Answer</TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="mr-2 h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="answer" className="space-y-6">
            {/* Smart Templates */}
            <TemplateSelector
              questions={[question]}
              grantId={grant?.id}
              onTemplateApplied={(templateAnswers) => {
                const match = templateAnswers.find((ta: any) => ta.questionId === question.id);
                if (match && match.templateAnswer) {
                  setUserRoughAnswer(match.templateAnswer);
                  toast({
                    title: 'Template applied!',
                    description: match.tips || 'Answer pre-filled with template',
                  });
                }
              }}
            />

            {/* Document Parser */}
            <DocumentParser 
              questions={[question]} 
              onAnswersExtracted={(matches) => {
                const match = matches.find(m => m.questionId === question.id);
                if (match && match.extractedAnswer) {
                  setUserRoughAnswer(match.extractedAnswer);
                  toast({
                    title: 'Answer imported!',
                    description: `Extracted with ${match.confidence}% confidence`,
                  });
                }
              }}
            />

            {/* Success Prediction Score */}
            {answer && (
              <ApplicationScoreCard answerId={answer.id} />
            )}

         <Card className="mb-6 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Your Rough Answer</CardTitle>
                <CardDescription className="text-base">Write your thoughts naturally - our AI will polish it into a professional grant response</CardDescription>
              </div>
              <InlineComments answerId={answer?.id} section="rough_answer" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={userRoughAnswer}
                onChange={(e) => setUserRoughAnswer(e.target.value)}
                placeholder="Write your response here naturally... Don't worry about perfect grammar or phrasing - just share your thoughts, and our AI will transform it into a professional grant answer."
                rows={10}
                className="resize-none text-base"
              />
              {autoSaving && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </div>
              )}
              {lastSaved && !autoSaving && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-muted-foreground">
                  <Save className="h-3 w-3 text-status-success" />
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {question?.word_limit && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {wordCount} / {question.word_limit} words
                      </span>
                      {wordLimitStatus && (
                        <span className={wordLimitStatus.type === 'over' ? 'text-destructive' : 'text-muted-foreground'}>
                          {wordLimitStatus.message}
                        </span>
                      )}
                    </div>
                    <Progress 
                      value={Math.min((wordCount / question.word_limit) * 100, 100)} 
                      className={wordLimitStatus?.type === 'over' ? '[&>div]:bg-destructive' : ''}
                    />
                  </div>
                )}
              </div>
            </div>

            {wordLimitStatus?.type === 'over' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your answer exceeds the word limit. Consider getting AI suggestions to optimize it.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={getSuggestions}
                disabled={loadingSuggestions || !userRoughAnswer.trim()}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {loadingSuggestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting suggestions...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get Suggestions
                  </>
                )}
              </Button>
              <Button
                onClick={handlePolish}
                disabled={aiProcessing || !userRoughAnswer.trim()}
                size="lg"
                className="flex-1"
              >
                {aiProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Polishing your answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Polish My Answer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {suggestions.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                AI Improvement Suggestions
              </CardTitle>
              <CardDescription>Consider these enhancements before polishing your answer</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {answer?.ai_polished_answer && (
          <Card className="shadow-premium border-accent/30">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <Sparkles className="mr-2 h-5 w-5 text-accent" />
                    Your Polished Answer
                  </CardTitle>
                  <CardDescription className="text-base">Professional, grant-ready response - ready to submit</CardDescription>
                </div>
                <div className="flex gap-2">
                  <InlineComments answerId={answer.id} section="polished_answer" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(answer.ai_polished_answer)}
                    className="self-start sm:self-auto"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSendToDocuSign}
                    disabled={sendingToDocuSign}
                    className="self-start sm:self-auto"
                  >
                    {sendingToDocuSign ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FileSignature className="mr-2 h-4 w-4" />
                        Send to DocuSign
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap rounded-xl bg-secondary/50 p-6 text-base leading-relaxed border border-border">
                {answer.ai_polished_answer}
              </div>
            </CardContent>
            </Card>
          )}
          </TabsContent>

          <TabsContent value="timeline">
            {answer && <ApplicationTimeline answerId={answer.id} />}
          </TabsContent>

          <TabsContent value="comments">
            {answer && <AnswerComments answerId={answer.id} />}
          </TabsContent>

          <TabsContent value="tasks">
            {answer && <TaskManager answerId={answer.id} />}
          </TabsContent>

          <TabsContent value="history">
            {answer && (
              <VersionHistory
                answerId={answer.id}
                onRestore={() => loadData()}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
