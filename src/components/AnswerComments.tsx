import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Reply, Trash2, Edit2, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Comment = {
  id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id: string | null;
  profiles?: {
    name: string;
    email: string;
  };
  replies?: Comment[];
};

type Props = {
  answerId: string;
};

export function AnswerComments({ answerId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
    
    // Subscribe to real-time comment updates
    const channel = supabase
      .channel('answer_comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answer_comments',
          filter: `answer_id=eq.${answerId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [answerId]);

  const loadComments = async () => {
    try {
      const { data } = await supabase
        .from('answer_comments')
        .select('*')
        .eq('answer_id', answerId)
        .order('created_at', { ascending: true });

      if (data) {
        // Fetch profiles separately
        const commentsWithProfiles = await Promise.all(
          data.map(async (comment) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', comment.user_id)
              .single();

            return {
              ...comment,
              profiles: profile,
            };
          })
        );

        // Organize comments into threads
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];

        // First pass: create map
        commentsWithProfiles.forEach((comment) => {
          commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: organize into threads
        commentsWithProfiles.forEach((comment) => {
          const commentWithReplies = commentMap.get(comment.id)!;
          if (comment.parent_comment_id) {
            const parent = commentMap.get(comment.parent_comment_id);
            if (parent) {
              parent.replies = parent.replies || [];
              parent.replies.push(commentWithReplies);
            }
          } else {
            rootComments.push(commentWithReplies);
          }
        });

        setComments(rootComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('answer_comments')
        .insert({
          answer_id: answerId,
          user_id: user?.id!,
          comment_text: newComment,
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id!,
        answer_id: answerId,
        activity_type: 'commented',
        activity_description: 'Added a comment',
      });

      setNewComment('');
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added.',
      });
    } catch (error: any) {
      toast({
        title: 'Error posting comment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const postReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('answer_comments')
        .insert({
          answer_id: answerId,
          user_id: user?.id!,
          parent_comment_id: parentId,
          comment_text: replyText,
        });

      if (error) throw error;

      setReplyText('');
      setReplyingTo(null);
      toast({
        title: 'Reply posted',
        description: 'Your reply has been added.',
      });
    } catch (error: any) {
      toast({
        title: 'Error posting reply',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('answer_comments')
        .update({ comment_text: editText })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditText('');
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating comment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('answer_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Comment deleted',
        description: 'The comment has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = comment.user_id === user?.id;
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mt-4'}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {comment.profiles?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-sm">{comment.profiles?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                </div>
                {isOwner && !isEditing && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditText(comment.comment_text);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateComment(comment.id)}
                      disabled={submitting}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
              )}
            </div>
            
            {!isReply && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => postReply(comment.id)}
                    disabled={submitting || !replyText.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-2">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
        <CardDescription>
          Collaborate with your team on this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* New comment input */}
        <div className="space-y-3 mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
          />
          <Button
            onClick={postComment}
            disabled={submitting || !newComment.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
