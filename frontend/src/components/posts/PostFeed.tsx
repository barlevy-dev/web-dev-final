import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { PostFilters } from '@/services/post.service';
import { usePosts } from '@/hooks/usePosts';
import { useFeedSocket } from '@/hooks/useFeedSocket';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PostFeedProps {
  filters?: PostFilters;
}

export function PostFeed({ filters = {} }: PostFeedProps) {
  const queryClient = useQueryClient();
  useFeedSocket();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    usePosts(filters);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const handleDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-destructive py-10">
        Failed to load posts. Check your connection.
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-16">
        No posts yet. Be the first to share something!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
      ))}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
