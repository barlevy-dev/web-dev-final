import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteComment } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const { user } = useAuth();
  const isOwner = user?._id === comment.userId;
  const deleteComment = useDeleteComment(postId);

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback className="text-xs">
          {comment.authorName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm mt-0.5 break-words">{comment.content}</p>
      </div>
      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
          onClick={() => deleteComment.mutate(comment._id)}
          disabled={deleteComment.isPending}
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
