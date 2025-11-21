import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  question_text: string;
  order_index: number;
}

interface Answer {
  question_id: string;
  status: 'not_started' | 'in_progress' | 'needs_clarification' | 'ready';
  ai_polished_answer: string | null;
}

interface ApplicationProgressProps {
  questions: Question[];
  answers: Answer[];
}

export function ApplicationProgress({ questions, answers }: ApplicationProgressProps) {
  const sortedQuestions = [...questions].sort((a, b) => a.order_index - b.order_index);
  
  const getQuestionStatus = (questionId: string) => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer?.status || 'not_started';
  };

  const getAnswerCount = () => {
    const completed = answers.filter(a => 
      a.status === 'ready' && a.ai_polished_answer
    ).length;
    return { completed, total: questions.length };
  };

  const { completed, total } = getAnswerCount();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'needs_clarification':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-600">Complete</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-blue-600 text-blue-600">In Progress</Badge>;
      case 'needs_clarification':
        return <Badge variant="outline" className="border-yellow-600 text-yellow-600">Needs Review</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">Application Progress</h3>
            <p className="text-sm text-muted-foreground">
              {completed} of {total} questions completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{percentage}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {sortedQuestions.map((question, index) => {
          const status = getQuestionStatus(question.id);
          
          return (
            <div
              key={question.id}
              className="bg-card rounded-xl p-4 border border-border hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Question {index + 1}
                        </span>
                        {getStatusBadge(status)}
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {question.question_text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Status Guide
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-foreground">Needs Review</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-foreground">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
