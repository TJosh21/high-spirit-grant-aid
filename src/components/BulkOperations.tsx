import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, Users, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';

type Application = {
  id: string;
  grant_id: string;
  status: string;
  grants?: {
    name: string;
    slug: string;
  };
};

type Props = {
  selectedApplications: Application[];
  onClearSelection: () => void;
  onRefresh: () => void;
};

export function BulkOperations({ selectedApplications, onClearSelection, onRefresh }: Props) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Fetch full details for selected applications
      const detailsPromises = selectedApplications.map(async (app) => {
        const { data: answers } = await supabase
          .from('answers')
          .select('*, questions(*)')
          .eq('grant_id', app.grant_id)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        return {
          grant: app.grants?.name || 'Unknown',
          status: app.status,
          answers: answers || [],
        };
      });

      const details = await Promise.all(detailsPromises);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['Grant Name', 'Status', 'Questions Answered', 'Completion %'],
        ...details.map((detail) => [
          detail.grant,
          detail.status,
          detail.answers.length,
          detail.answers.length > 0
            ? Math.round((detail.answers.filter(a => a.status === 'ready').length / detail.answers.length) * 100)
            : 0,
        ]),
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Individual sheets for each application
      details.forEach((detail, index) => {
        const appData = [
          ['Question', 'Your Answer', 'Status'],
          ...detail.answers.map((answer: any) => [
            answer.questions?.question_text || '',
            answer.user_rough_answer || '',
            answer.status || '',
          ]),
        ];
        const appSheet = XLSX.utils.aoa_to_sheet(appData);
        XLSX.utils.book_append_sheet(wb, appSheet, `App ${index + 1}`);
      });

      // Write file
      XLSX.writeFile(wb, `grant-applications-export-${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Export successful',
        description: `Exported ${selectedApplications.length} applications`,
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const bulkUpdateStatus = async () => {
    if (!newStatus) return;

    setUpdating(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      // Update all selected applications
      const updatePromises = selectedApplications.map(async (app) => {
        const { error } = await supabase
          .from('answers')
          .update({ status: newStatus as any })
          .eq('grant_id', app.grant_id)
          .eq('user_id', user?.id);

        if (error) throw error;
      });

      await Promise.all(updatePromises);

      toast({
        title: 'Status updated',
        description: `Updated ${selectedApplications.length} applications`,
      });

      onRefresh();
      onClearSelection();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
      setNewStatus('');
    }
  };

  if (selectedApplications.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-20 z-40 bg-card border-b shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectedApplications.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Clear
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              disabled={exporting}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>

            <div className="flex items-center gap-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Update status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="needs_clarification">Needs Review</SelectItem>
                  <SelectItem value="ready">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={bulkUpdateStatus}
                disabled={!newStatus || updating}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
