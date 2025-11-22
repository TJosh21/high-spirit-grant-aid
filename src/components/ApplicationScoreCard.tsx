import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApplicationScoreCardProps {
  answerId: string;
}

export function ApplicationScoreCard({ answerId }: ApplicationScoreCardProps) {
  const { toast } = useToast();
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState<any>(null);
  const [answer, setAnswer] = useState<any>(null);

  const loadScores = async () => {
    const { data } = await supabase
      .from('answers')
      .select('*')
      .eq('id', answerId)
      .single();

    if (data) {
      setAnswer(data);
      if (data.success_score) {
        setScores({
          completeness_score: data.completeness_score,
          quality_score: data.quality_score,
          success_score: data.success_score,
          predicted_success_percentage: data.predicted_success_percentage,
        });
      }
    }
  };

  useEffect(() => {
    loadScores();
  }, [answerId]);

  const handleScore = async () => {
    setScoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('score-application', {
        body: { answerId },
      });

      if (error) throw error;

      setScores(data);
      await loadScores();

      toast({
        title: 'Scoring complete!',
        description: 'Your application has been analyzed',
      });
    } catch (error: any) {
      console.error('Error scoring application:', error);
      toast({
        title: 'Scoring failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSuccessMessage = (percentage: number) => {
    if (percentage >= 80) return 'High likelihood of success';
    if (percentage >= 60) return 'Good chance of success';
    if (percentage >= 40) return 'Moderate chance of success';
    return 'Needs improvement';
  };

  if (!scores && !answer?.user_rough_answer) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Success Prediction
            </CardTitle>
            <CardDescription>AI-powered analysis of your application</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScore}
            disabled={scoring || !answer?.user_rough_answer}
          >
            {scoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {scores ? 'Re-score' : 'Score Now'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {scores ? (
          <div className="space-y-6">
            {/* Main prediction */}
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <div className={`text-5xl font-bold mb-2 ${getScoreColor(scores.predicted_success_percentage)}`}>
                {scores.predicted_success_percentage}%
              </div>
              <p className="text-lg text-muted-foreground">
                {getSuccessMessage(scores.predicted_success_percentage)}
              </p>
            </div>

            {/* Individual scores */}
            <div className="grid gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completeness</span>
                  <span className={`text-sm font-bold ${getScoreColor(scores.completeness_score)}`}>
                    {scores.completeness_score}%
                  </span>
                </div>
                <Progress value={scores.completeness_score} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quality</span>
                  <span className={`text-sm font-bold ${getScoreColor(scores.quality_score)}`}>
                    {scores.quality_score}%
                  </span>
                </div>
                <Progress value={scores.quality_score} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Success Score</span>
                  <span className={`text-sm font-bold ${getScoreColor(scores.success_score)}`}>
                    {scores.success_score}%
                  </span>
                </div>
                <Progress value={scores.success_score} />
              </div>
            </div>

            {/* Feedback */}
            {scores.feedback && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{scores.feedback}</p>
                
                {scores.strengths && scores.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Strengths
                    </p>
                    <ul className="space-y-1">
                      {scores.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {scores.improvements && scores.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Suggested Improvements
                    </p>
                    <ul className="space-y-1">
                      {scores.improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Get AI-powered insights about your application's success likelihood
            </p>
            <Button onClick={handleScore} disabled={!answer?.user_rough_answer}>
              Analyze Application
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}