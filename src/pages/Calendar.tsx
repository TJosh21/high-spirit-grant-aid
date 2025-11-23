import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GrantCalendar } from "@/components/GrantCalendar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Calendar() {
  const { data: grants, isLoading, error } = useQuery({
    queryKey: ['calendar-grants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'open')
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal>
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-3xl -z-10" />
              <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8 rounded-2xl border border-primary/10">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Grant Calendar
                </h1>
                <p className="text-lg text-muted-foreground">
                  Visualize all grant deadlines and upcoming opportunities 📅✨
                </p>
              </div>
            </div>
          </ScrollReveal>

          {error && (
            <ScrollReveal delay={0.1}>
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load grant calendar. Please try again later.
                </AlertDescription>
              </Alert>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.2}>
            {grants && grants.length > 0 ? (
              <GrantCalendar grants={grants} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Deadlines</AlertTitle>
                <AlertDescription>
                  There are currently no grants with deadlines scheduled.
                </AlertDescription>
              </Alert>
            )}
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  );
}
