import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApplicationProgressProps {
  grantName: string;
  totalQuestions: number;
  answeredQuestions: number;
  readyQuestions: number;
  deadline?: string;
}

export function ApplicationProgress({
  grantName,
  totalQuestions,
  answeredQuestions,
  readyQuestions,
  deadline
}: ApplicationProgressProps) {
  const completionPercentage = totalQuestions > 0 
    ? Math.round((readyQuestions / totalQuestions) * 100)
    : 0;

  const inProgressPercentage = totalQuestions > 0 
    ? Math.round(((answeredQuestions - readyQuestions) / totalQuestions) * 100)
    : 0;

  const getStatusBadge = () => {
    if (completionPercentage === 100) {
      return <Badge className="bg-green-500">Complete</Badge>;
    } else if (answeredQuestions > 0) {
      return <Badge variant="secondary">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const milestones = [
    { label: 'Started', threshold: 0, completed: answeredQuestions > 0 },
    { label: '25% Done', threshold: 25, completed: completionPercentage >= 25 },
    { label: '50% Done', threshold: 50, completed: completionPercentage >= 50 },
    { label: '75% Done', threshold: 75, completed: completionPercentage >= 75 },
    { label: 'Complete', threshold: 100, completed: completionPercentage === 100 }
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{grantName}</h3>
              {deadline && (
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {new Date(deadline).toLocaleDateString()}
                </p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Circle className="h-3 w-3" />
                <span className="text-xs">Total</span>
              </div>
              <p className="text-lg font-bold">{totalQuestions}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">In Progress</span>
              </div>
              <p className="text-lg font-bold">{answeredQuestions - readyQuestions}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-xs">Ready</span>
              </div>
              <p className="text-lg font-bold">{readyQuestions}</p>
            </div>
          </div>

          {/* Milestones */}
          <div className="pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-3">Milestones</p>
            <div className="flex items-center justify-between">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      milestone.completed
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 text-muted-foreground text-center max-w-[60px]">
                    {milestone.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
