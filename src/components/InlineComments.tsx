import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Reply, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface InlineCommentsProps {
  answerId: string;
  section: string;
}

export function InlineComments({ answerId, section }: InlineCommentsProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments:${answerId}:${section}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answer_inline_comments',
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
  }, [answerId, section]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('answer_inline_comments')
      .select(`
        *,
        user:profiles!user_id(name, email)
      `)
      .eq('answer_id', answerId)
      .eq('section', section)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data || []);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Extract mentions (@username)
    const mentions = newComment.match(/@\w+/g) || [];
    const mentionedUserIds: string[] = [];

    const { error } = await supabase
      .from('answer_inline_comments')
      .insert({
        answer_id: answerId,
        user_id: user.id,
        section,
        comment_text: newComment,
        mentioned_users: mentionedUserIds,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
      return;
    }

    setNewComment('');
    toast({
      title: 'Comment added',
      description: 'Your comment has been posted',
    });
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('answer_inline_comments')
      .insert({
        answer_id: answerId,
        user_id: user.id,
        section,
        comment_text: replyText,
        parent_comment_id: parentId,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reply',
        variant: 'destructive',
      });
      return;
    }

    setReplyText('');
    setReplyingTo(null);
  };

  const handleResolve = async (commentId: string, resolved: boolean) => {
    const { error } = await supabase
      .from('answer_inline_comments')
      .update({ resolved })
      .eq('id', commentId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const renderComment = (comment: any, isReply = false) => {
    const replies = comments.filter(c => c.parent_comment_id === comment.id);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.user?.name || 'Unknown'}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              {comment.resolved && (
                <Badge variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              {!comment.parent_comment_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResolve(comment.id, !comment.resolved)}
                >
                  {comment.resolved ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Unresolve
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Resolve
                    </>
                  )}
                </Button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="flex gap-2 mt-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px]"
                />
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => handleReply(comment.id)}>
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {replies.length > 0 && (
              <div className="space-y-2">
                {replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-4 w-4" />
          {topLevelComments.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {topLevelComments.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[500px] overflow-y-auto" align="start">
        <div className="space-y-4">
          <h3 className="font-semibold">Comments</h3>

          <div className="space-y-4">
            {topLevelComments.map(comment => renderComment(comment))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (use @ to mention)"
              className="min-h-[80px]"
            />
            <Button onClick={handleAddComment} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}