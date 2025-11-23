import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AIFeedbackPanelProps {
  questionText: string;
  userAnswer: string;
  wordLimit?: number;
  helperText?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

interface Analysis {
  completeness_score: number;
  quality_score: number;
  strengths: string[];
  improvements: string[];
  tone_feedback: string;
  structure_feedback: string;
  key_missing_elements: string[];
  wordCount: number;
  charCount: number;
  wordLimit?: number;
  isOverLimit: boolean;
}

export const AIFeedbackPanel = ({ 
  questionText, 
  userAnswer, 
  wordLimit,
  helperText,
  onAnalysisComplete 
}: AIFeedbackPanelProps) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeAnswer = useCallback(async () => {
    if (!userAnswer.trim() || userAnswer.trim().length < 50) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('analyze-answer-quality', {
        body: {
          questionText,
          userAnswer,
          wordLimit,
          helperText
        }
      });

      if (funcError) throw funcError;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      onAnalysisComplete?.(data);
    } catch (err: any) {
      console.error('Error analyzing answer:', err);
      setError(err.message || 'Failed to analyze your answer. Please try again.');
      
      if (err.message.includes('Rate limit') || err.message.includes('credits')) {
        toast({
          title: "Analysis Unavailable",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [questionText, userAnswer, wordLimit, helperText, onAnalysisComplete, toast]);

  // Debounce the analysis - wait 2 seconds after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeAnswer();
    }, 2000);

    return () => clearTimeout(timer);
  }, [analyzeAnswer]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const, className: 'bg-success' };
    if (score >= 60) return { label: 'Good', variant: 'default' as const, className: 'bg-primary' };
    if (score >= 40) return { label: 'Fair', variant: 'secondary' as const };
    return { label: 'Needs Work', variant: 'destructive' as const };
  };

  if (error) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Writing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={analyzeAnswer} 
            className="w-full mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!userAnswer.trim() || userAnswer.trim().length < 50) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Writing Assistant
          </CardTitle>
          <CardDescription>
            Start writing to get real-time feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Write at least 50 characters to receive AI-powered feedback on your answer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !analysis) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            AI Writing Assistant
          </CardTitle>
          <CardDescription>Analyzing your answer...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const completenessStatus = getScoreBadge(analysis.completeness_score);
  const qualityStatus = getScoreBadge(analysis.quality_score);

  return (
    <Card className="sticky top-4 border-2 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Writing Assistant
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Real-time feedback powered by AI
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Word Count */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Word Count</span>
            <span className={analysis.isOverLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
              {analysis.wordCount} {analysis.wordLimit ? `/ ${analysis.wordLimit}` : ''} words
            </span>
          </div>
          {analysis.wordLimit && (
            <Progress 
              value={Math.min((analysis.wordCount / analysis.wordLimit) * 100, 100)} 
              className={`h-2 ${analysis.isOverLimit ? '[&>div]:bg-destructive' : ''}`}
            />
          )}
          {analysis.isOverLimit && (
            <p className="text-xs text-destructive">
              ⚠️ You've exceeded the word limit. Consider condensing your answer.
            </p>
          )}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Completeness</span>
              <Badge variant={completenessStatus.variant} className={completenessStatus.className}>
                {completenessStatus.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={analysis.completeness_score} className="h-2" />
              <span className={`text-sm font-bold ${getScoreColor(analysis.completeness_score)}`}>
                {analysis.completeness_score}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Quality</span>
              <Badge variant={qualityStatus.variant} className={qualityStatus.className}>
                {qualityStatus.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={analysis.quality_score} className="h-2" />
              <span className={`text-sm font-bold ${getScoreColor(analysis.quality_score)}`}>
                {analysis.quality_score}
              </span>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </div>
            <ul className="space-y-1.5">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-6 relative">
                  <span className="absolute left-0 top-1.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {analysis.improvements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-warning">
              <TrendingUp className="w-4 h-4" />
              Suggested Improvements
            </div>
            <ul className="space-y-2">
              {analysis.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm bg-warning/5 border-l-2 border-warning pl-3 py-2 rounded">
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Elements */}
        {analysis.key_missing_elements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Key Elements to Add
            </div>
            <ul className="space-y-1.5">
              {analysis.key_missing_elements.map((element, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-6 relative">
                  <span className="absolute left-0 top-1.5">•</span>
                  {element}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tone & Structure Feedback */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {analysis.tone_feedback && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                Tone
              </div>
              <p className="text-xs">{analysis.tone_feedback}</p>
            </div>
          )}
          {analysis.structure_feedback && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                Structure
              </div>
              <p className="text-xs">{analysis.structure_feedback}</p>
            </div>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          💡 Feedback updates automatically as you type
        </div>
      </CardContent>
    </Card>
  );
};