import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PostFilters as Filters } from '@/services/post.service';
import { PostFeed } from '@/components/posts/PostFeed';
import { PostFilters } from '@/components/posts/PostFilters';
import { CreatePostDialog } from '@/components/posts/CreatePostDialog';
import { StudyTipsDialog } from '@/components/ai/StudyTipsDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<Filters>({});

  const handleFiltersChange = useCallback((f: Filters) => setFilters(f), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">StudyGram</span>
          <div className="flex items-center gap-2">
            <Link to={`/profile/${user?._id}`}>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="text-xs">
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto max-w-2xl px-4 py-6 space-y-5">
        {/* Filters + New Post */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <PostFilters onFiltersChange={handleFiltersChange} />
          </div>
          <CreatePostDialog>
            <Button className="gap-2 shrink-0">
              <PlusCircle className="h-4 w-4" />
              New Post
            </Button>
          </CreatePostDialog>
        </div>

        {/* Feed */}
        <PostFeed filters={filters} />
      </main>

      {/* Floating AI button */}
      <StudyTipsDialog />
    </div>
  );
}
