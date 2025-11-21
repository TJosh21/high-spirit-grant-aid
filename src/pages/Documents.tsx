import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Copy, FileText, Loader2 } from 'lucide-react';

const documentTypes = [
  {
    type: 'business_plan',
    title: 'Business Plan',
    description: 'Comprehensive overview of your business strategy and operations',
  },
  {
    type: 'executive_summary',
    title: 'Executive Summary',
    description: 'Concise summary of your business for quick review',
  },
  {
    type: 'capability_statement',
    title: 'Capability Statement',
    description: 'One-page document showcasing your business capabilities',
  },
  {
    type: 'elevator_pitch',
    title: 'Elevator Pitch',
    description: '30-second compelling description of your business',
  },
];

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const { data } = await supabase
        .from('business_documents')
        .select('*')
        .eq('user_id', user?.id);

      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (docType: string, title: string) => {
    setGenerating(docType);
    try {
      // Get user profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // For now, create a placeholder - in production this would call AI
      const placeholder = `[AI-Generated ${title}]\n\nBusiness: ${profile?.business_name || 'Your Business'}\nIndustry: ${profile?.business_industry || 'Your Industry'}\n\nThis document will be generated using AI based on your business profile and grant answers. The AI will create a professional, comprehensive ${title.toLowerCase()} tailored to your specific business needs.`;

      const { error } = await supabase
        .from('business_documents')
        .upsert([{
          user_id: user?.id!,
          doc_type: docType as any,
          title,
          ai_generated_content: placeholder,
          last_updated_at: new Date().toISOString(),
        }], { onConflict: 'user_id,doc_type' });

      if (error) throw error;

      toast({
        title: 'Document generated!',
        description: `Your ${title.toLowerCase()} is ready`,
      });

      loadDocuments();
    } catch (error: any) {
      toast({
        title: 'Error generating document',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${title} copied to clipboard`,
    });
  };

  const getDocument = (docType: string) => {
    return documents.find((d) => d.doc_type === docType);
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Business Documents</h1>
          <p className="text-muted-foreground">
            AI-generated professional documents for your business
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {documentTypes.map((docType) => {
            const doc = getDocument(docType.type);
            const isGenerating = generating === docType.type;

            return (
              <Card key={docType.type}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{docType.title}</CardTitle>
                      <CardDescription>{docType.description}</CardDescription>
                    </div>
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doc ? (
                    <>
                      <Textarea
                        value={doc.ai_generated_content || ''}
                        readOnly
                        rows={8}
                        className="resize-none bg-muted/50"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => copyToClipboard(doc.ai_generated_content, docType.title)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          onClick={() => generateDocument(docType.type, docType.title)}
                          variant="outline"
                          size="sm"
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => generateDocument(docType.type, docType.title)}
                      className="w-full bg-gradient-royal"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
