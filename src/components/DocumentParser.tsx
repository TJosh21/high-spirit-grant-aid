import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DocumentParserProps {
  questions: any[];
  onAnswersExtracted: (matches: any[]) => void;
}

export function DocumentParser({ questions, onAnswersExtracted }: DocumentParserProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or Word document',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          category: 'grant_application',
        })
        .select()
        .single();

      if (docError) throw docError;

      setUploadedDoc(document);
      toast({
        title: 'File uploaded',
        description: 'Document uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadedDoc) return;

    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-grant-document', {
        body: {
          documentId: uploadedDoc.id,
          questions: questions,
        },
      });

      if (error) throw error;

      toast({
        title: 'Parsing complete!',
        description: `Found ${data.matches.length} matching answers`,
      });

      onAnswersExtracted(data.matches);
    } catch (error: any) {
      console.error('Error parsing document:', error);
      toast({
        title: 'Parsing failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setParsing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Import from Existing Application
        </CardTitle>
        <CardDescription>
          Upload a previous grant application (PDF or Word) to automatically extract answers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading || parsing}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload" className="flex-1">
              <Button
                variant="outline"
                disabled={uploading || parsing}
                className="w-full"
                asChild
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadedDoc ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {uploadedDoc.file_name}
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Choose File
                    </>
                  )}
                </span>
              </Button>
            </label>
            {uploadedDoc && (
              <Button
                onClick={handleParse}
                disabled={parsing}
              >
                {parsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Extract Answers'
                )}
              </Button>
            )}
          </div>

          {parsing && (
            <div className="space-y-2">
              <Progress value={50} />
              <p className="text-sm text-muted-foreground text-center">
                AI is analyzing your document...
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              PDF Support
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Word Support
            </Badge>
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              AI-Powered Matching
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}