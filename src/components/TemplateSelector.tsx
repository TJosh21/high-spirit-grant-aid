import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, BookTemplate } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TemplateSelectorProps {
  questions: any[];
  grantId: string;
  onTemplateApplied: (templateAnswers: any[]) => void;
}

export function TemplateSelector({ questions, grantId, onTemplateApplied }: TemplateSelectorProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's templates
      const { data: userTemplates } = await supabase
        .from('application_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      // Get organization memberships
      const { data: orgMemberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      let allTemplates = userTemplates || [];

      // Get organization templates if user is in any organization
      if (orgMemberships && orgMemberships.length > 0) {
        const orgIds: string[] = orgMemberships.map((m: any) => m.organization_id);
        
        const { data: orgTemplates } = await supabase
          .from('application_templates')
          .select('*')
          .in('organization_id', orgIds)
          .order('usage_count', { ascending: false });

        if (orgTemplates) {
          allTemplates = [...allTemplates, ...orgTemplates];
        }
      }

      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleGenerateTemplate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template', {
        body: {
          questions,
          grantId,
        },
      });

      if (error) throw error;

      toast({
        title: 'Template generated!',
        description: 'AI has created personalized answers based on your profile',
      });

      onTemplateApplied(data.templateAnswers);

      // Save template
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user is in an organization
        const { data: orgMembership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        await supabase.from('application_templates').insert({
          user_id: user.id,
          organization_id: orgMembership?.organization_id || null,
          title: `Auto-generated Template - ${new Date().toLocaleDateString()}`,
          description: data.overallStrategy,
          template_data: data.templateAnswers,
        });

        await loadTemplates();
      }
    } catch (error: any) {
      console.error('Error generating template:', error);
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyTemplate = async (template: any) => {
    try {
      onTemplateApplied(template.template_data);

      // Increment usage count
      await supabase
        .from('application_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id);

      toast({
        title: 'Template applied!',
        description: 'Answers have been pre-filled',
      });

      setSelectedTemplate(null);
    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookTemplate className="h-5 w-5" />
          Smart Templates
        </CardTitle>
        <CardDescription>
          Use AI-powered templates based on your profile and successful applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerateTemplate}
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Template...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Template
            </>
          )}
        </Button>

        {templates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Saved Templates</h4>
            <div className="space-y-2">
              {templates.map((template) => (
                <Dialog key={template.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex-1 flex items-center justify-between">
                        <span className="truncate">{template.title}</span>
                        <div className="flex items-center gap-2">
                          {template.organization_id && (
                            <Badge variant="outline" className="text-xs">
                              Shared
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            Used {template.usage_count || 0}x
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{template.title}</DialogTitle>
                      <DialogDescription>{template.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="max-h-96 overflow-y-auto space-y-4 p-4 border rounded-lg">
                        {Array.isArray(template.template_data) && template.template_data.map((answer: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <p className="text-sm font-medium">Question {idx + 1}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {answer.templateAnswer?.slice(0, 200)}...
                            </p>
                            {answer.placeholders && answer.placeholders.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {answer.placeholders.map((ph: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {ph}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleApplyTemplate(template)}
                        className="w-full"
                      >
                        Apply This Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
