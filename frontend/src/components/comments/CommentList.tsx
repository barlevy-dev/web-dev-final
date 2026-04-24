import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { usePostSocket } from '@/hooks/usePostSocket';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function CommentList({ postId }: { postId: string }) {
  const [page, setPage] = useState(1);
  usePostSocket(postId);

  const { data, isLoading } = useComments(postId, page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const comments = data?.comments ?? [];
  const pagination = data?.pagination;

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} postId={postId} />
      ))}
      {pagination && pagination.page < pagination.pages && (
        <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
          Load more comments
        </Button>
      )}
    </div>
  );
}
