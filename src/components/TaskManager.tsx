import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
};

type Props = {
  answerId: string;
};

export function TaskManager({ answerId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadTasks();
  }, [answerId]);

  const loadTasks = async () => {
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('answer_id', answerId)
        .order('created_at', { ascending: false });

      if (data) {
        // Fetch assigned user profiles
        const tasksWithProfiles = await Promise.all(
          data.map(async (task) => {
            if (task.assigned_to) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', task.assigned_to)
                .single();

              return { 
                ...task, 
                status: task.status as 'pending' | 'in_progress' | 'completed',
                priority: task.priority as 'low' | 'medium' | 'high',
                profiles: profile 
              };
            }
            return {
              ...task,
              status: task.status as 'pending' | 'in_progress' | 'completed',
              priority: task.priority as 'low' | 'medium' | 'high',
            };
          })
        );

        setTasks(tasksWithProfiles);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!title.trim()) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          answer_id: answerId,
          user_id: user?.id!,
          title,
          description: description || null,
          priority,
          due_date: dueDate || null,
        });

      if (error) throw error;

      toast({
        title: 'Task created',
        description: 'New task has been added.',
      });

      resetForm();
      setDialogOpen(false);
      loadTasks();
    } catch (error: any) {
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      loadTasks();
    } catch (error: any) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Task deleted',
        description: 'Task has been removed.',
      });

      loadTasks();
    } catch (error: any) {
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setEditingTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
            <CardDescription>
              Manage checklist items and to-dos for this application
            </CardDescription>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a task or checklist item for this application
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button onClick={createTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tasks yet. Create your first task to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={(checked) => {
                    updateTaskStatus(
                      task.id,
                      checked ? 'completed' : 'pending'
                    );
                  }}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                    
                    <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    
                    {task.due_date && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.due_date)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
