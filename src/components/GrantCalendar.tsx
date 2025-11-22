import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { format, isSameDay, isWithinInterval, addDays } from 'date-fns';
import { motion } from 'framer-motion';

interface Grant {
  id: string;
  name: string;
  deadline: string;
  amount_min?: number;
  amount_max?: number;
  currency?: string;
}

interface GrantCalendarProps {
  grants: Grant[];
}

export function GrantCalendar({ grants }: GrantCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get grants with deadlines
  const grantsWithDeadlines = grants.filter(g => g.deadline);

  // Get upcoming deadlines (next 30 days)
  const upcomingDeadlines = grantsWithDeadlines.filter(g => {
    const deadline = new Date(g.deadline);
    const today = new Date();
    return isWithinInterval(deadline, {
      start: today,
      end: addDays(today, 30)
    });
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Get grants for selected date
  const grantsForSelectedDate = selectedDate 
    ? grantsWithDeadlines.filter(g => isSameDay(new Date(g.deadline), selectedDate))
    : [];

  // Highlight dates with deadlines
  const datesWithDeadlines = grantsWithDeadlines.map(g => new Date(g.deadline));

  const formatAmount = (grant: Grant) => {
    const currency = grant.currency || 'USD';
    if (grant.amount_min && grant.amount_max) {
      return `${currency} ${grant.amount_min.toLocaleString()} - ${grant.amount_max.toLocaleString()}`;
    } else if (grant.amount_max) {
      return `Up to ${currency} ${grant.amount_max.toLocaleString()}`;
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Grant Deadlines Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border p-3"
              modifiers={{
                deadline: datesWithDeadlines
              }}
              modifiersStyles={{
                deadline: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))'
                }
              }}
            />
          </div>

          {/* Upcoming Deadlines */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Upcoming Deadlines (30 days)
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((grant, index) => (
                    <motion.div
                      key={grant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{grant.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(grant.deadline), 'MMM dd, yyyy')}
                          </p>
                          {formatAmount(grant) && (
                            <p className="text-xs text-primary font-medium mt-1">
                              {formatAmount(grant)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {Math.ceil((new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No upcoming deadlines in the next 30 days
                  </p>
                )}
              </div>
            </div>

            {/* Selected Date Grants */}
            {selectedDate && grantsForSelectedDate.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                <div className="space-y-2">
                  {grantsForSelectedDate.map((grant) => (
                    <div
                      key={grant.id}
                      className="p-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <p className="font-medium text-sm">{grant.name}</p>
                      {formatAmount(grant) && (
                        <p className="text-xs text-primary font-medium mt-1">
                          {formatAmount(grant)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
