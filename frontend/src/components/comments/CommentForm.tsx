import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useCreateComment } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('');
  const createComment = useCreateComment(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Add a comment…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        maxLength={500}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createComment.isPending}
        >
          {createComment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post
        </Button>
      </div>
      {createComment.isError && (
        <p className="text-xs text-destructive">Failed to post comment.</p>
      )}
    </form>
  );
}
