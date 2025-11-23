import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ApplicationReviewProps {
  grantId: string;
  userId: string;
}

export function ApplicationReview({ grantId, userId }: ApplicationReviewProps) {
  const { toast } = useToast();
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<any>(null);

  const handleReview = async () => {
    setReviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-application', {
        body: { grantId, userId },
      });

      if (error) throw error;

      setReview(data);

      toast({
        title: 'Review complete!',
        description: `Overall score: ${data.overallScore}/100`,
      });
    } catch (error: any) {
      console.error('Error reviewing application:', error);
      toast({
        title: 'Review failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Application Review
        </CardTitle>
        <CardDescription>
          Get comprehensive feedback on your entire application before submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleReview}
          disabled={reviewing}
          className="w-full"
          size="lg"
        >
          {reviewing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Application...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Review Application
            </>
          )}
        </Button>

        {review && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-2xl font-bold">{review.overallScore}/100</span>
              </div>
              <Progress value={review.overallScore} className="h-2" />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {review.readinessStatus === 'ready' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge variant={review.readinessStatus === 'ready' ? 'default' : 'secondary'}>
                {review.readinessStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {review.estimatedRevisionTime > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Estimated time to address feedback: {review.estimatedRevisionTime} minutes
                </AlertDescription>
              </Alert>
            )}

            {review.criticalIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Critical Issues
                </h4>
                <ul className="space-y-1">
                  {review.criticalIssues.map((issue: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-destructive">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {review.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-green-500">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.answerFeedback.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Answer Improvements</h4>
                {review.answerFeedback.map((feedback: any, i: number) => (
                  <div key={i} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Question {feedback.questionNumber}</span>
                      <Badge variant={
                        feedback.priority === 'high' ? 'destructive' :
                        feedback.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {feedback.priority}
                      </Badge>
                    </div>
                    <ul className="space-y-1">
                      {feedback.improvements.map((improvement: string, j: number) => (
                        <li key={j} className="text-sm text-muted-foreground">
                          • {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
