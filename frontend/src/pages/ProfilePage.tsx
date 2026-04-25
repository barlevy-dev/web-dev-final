import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUser, useUserPosts } from '@/hooks/useUser';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { PostCard } from '@/components/posts/PostCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuth();
  const isOwnProfile = me?._id === userId;
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: profileUser, isLoading: userLoading } = useUser(userId!);
  const { data: postsData, isLoading: postsLoading } = useUserPosts(userId!, page);

  if (userLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button asChild variant="link"><Link to="/">Back to feed</Link></Button>
      </div>
    );
  }

  const posts = postsData?.posts ?? [];
  const pagination = postsData?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Feed</Link>
        </Button>

        {/* Profile header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl font-semibold">
              {profileUser.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{profileUser.username}</h1>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
            </div>
            {(profileUser.degree || profileUser.yearOfStudy) && (
              <p className="text-sm text-muted-foreground mt-1">
                {[profileUser.degree, profileUser.yearOfStudy].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Posts */}
        <section className="space-y-4">
          <h2 className="font-semibold">Posts</h2>
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDeleted={() => queryClient.invalidateQueries({ queryKey: ['userPosts', userId] })}
                />
              ))}
              {pagination && pagination.page < pagination.pages && (
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                  Load more
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {profileUser && (
        <EditProfileDialog user={profileUser} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </div>
  );
}
