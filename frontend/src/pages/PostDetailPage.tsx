import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePost } from '@/hooks/usePosts';
import { CommentList } from '@/components/comments/CommentList';
import { CommentForm } from '@/components/comments/CommentForm';
import { Badge } from '@/components/ui/badge';
import { uploadService } from '@/services/upload.service';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const difficultyColor = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { data: post, isLoading } = usePost(postId!);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">Back to feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Feed</Link>
        </Button>

        {/* Post */}
        <article className="space-y-4">
          <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={`/profile/${post.userId}`} className="font-medium hover:underline">
              {post.authorName}
            </Link>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{post.courseTag}</Badge>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColor[post.difficultyLevel]}`}
            >
              {post.difficultyLevel}
            </span>
            {post.aiEnhanced && (
              <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-semibold">
                ✨ AI enhanced
              </span>
            )}
          </div>

          {post.imageUrl && (
            <div className="overflow-hidden rounded-lg border">
              <img
                src={uploadService.resolve(post.imageUrl)}
                alt={post.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </article>

        <Separator />

        {/* Comments */}
        <section className="space-y-4">
          <h2 className="font-semibold text-sm">
            Comments ({post.commentsCount})
          </h2>
          <CommentForm postId={post._id} />
          <CommentList postId={post._id} />
        </section>
      </div>
    </div>
  );
}
