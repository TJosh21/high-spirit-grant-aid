import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, RotateCcw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Version = {
  id: string;
  version_number: number;
  user_rough_answer: string | null;
  ai_polished_answer: string | null;
  status: string | null;
  created_at: string;
};

type Props = {
  answerId: string;
  onRestore: (version: Version) => void;
};

export function VersionHistory({ answerId, onRestore }: Props) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [answerId]);

  const loadVersions = async () => {
    try {
      const { data } = await supabase
        .from('answer_versions')
        .select('*')
        .eq('answer_id', answerId)
        .order('version_number', { ascending: false });

      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: Version) => {
    try {
      const { error } = await supabase
        .from('answers')
        .update({
          user_rough_answer: version.user_rough_answer,
          ai_polished_answer: version.ai_polished_answer,
          status: version.status as any,
        })
        .eq('id', answerId);

      if (error) throw error;

      toast({
        title: 'Version restored',
        description: `Restored to version ${version.version_number}`,
      });

      onRestore(version);
      setDialogOpen(false);
      setSelectedVersion(null);
    } catch (error: any) {
      toast({
        title: 'Error restoring version',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'needs_clarification':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History ({versions.length})
          </CardTitle>
          <CardDescription>
            View and restore previous versions of this answer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No version history yet. Changes will be tracked automatically.
            </p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">Version {version.version_number}</p>
                      {version.status && (
                        <Badge variant={getStatusColor(version.status)} className="text-xs">
                          {version.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(version.created_at)}
                    </p>
                    {version.user_rough_answer && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {version.user_rough_answer.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVersion(version);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number}
            </DialogTitle>
            <DialogDescription>
              Created on {selectedVersion && formatDate(selectedVersion.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-4">
              {selectedVersion.user_rough_answer && (
                <div>
                  <h3 className="font-medium mb-2">Draft Answer</h3>
                  <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                    {selectedVersion.user_rough_answer}
                  </div>
                </div>
              )}
              
              {selectedVersion.ai_polished_answer && (
                <div>
                  <h3 className="font-medium mb-2">Polished Answer</h3>
                  <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                    {selectedVersion.ai_polished_answer}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedVersion && handleRestore(selectedVersion)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
