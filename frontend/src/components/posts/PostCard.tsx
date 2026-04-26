import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { postService } from '@/services/post.service';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { uploadService } from '@/services/upload.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EditPostDialog } from './EditPostDialog';

const difficultyColor = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

interface PostCardProps {
  post: Post;
  onDeleted?: () => void;
}

export function PostCard({ post, onDeleted }: PostCardProps) {
  const { user } = useAuth();
  const isOwner = user?._id === post.userId;

  const [liked, setLiked] = useState(post.likedBy.includes(user?._id ?? ''));
  const [likeCount, setLikeCount] = useState(post.likes);
  const [likePending, setLikePending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleLike = async () => {
    if (!user || likePending) return;
    setLikePending(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) await postService.unlikePost(post._id);
      else await postService.likePost(post._id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikePending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await postService.deletePost(post._id);
      onDeleted?.();
    } catch {
      // silently fail — parent will refetch
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link
                to={`/posts/${post._id}`}
                className="text-base font-semibold hover:underline line-clamp-2"
              >
                {post.title}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Link to={`/profile/${post.userId}`} className="hover:underline font-medium">
                  {post.authorName}
                </Link>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleDelete}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {post.imageUrl && (
            <Link to={`/posts/${post._id}`} className="block mb-3 overflow-hidden rounded-md">
              <img
                src={uploadService.resolve(post.imageUrl)}
                alt={post.title}
                className="w-full max-h-56 object-cover hover:opacity-90 transition-opacity"
              />
            </Link>
          )}
          <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline">{post.courseTag}</Badge>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColor[post.difficultyLevel]}`}
            >
              {post.difficultyLevel}
            </span>
            {post.aiEnhanced && (
              <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-semibold">
                ✨ AI
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 gap-4">
          <button
            aria-label={liked ? 'Unlike post' : 'Like post'}
            onClick={handleLike}
            disabled={!user || likePending}
            className={`flex items-center gap-1 text-sm transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </button>
          <Link
            to={`/posts/${post._id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentsCount}
          </Link>
        </CardFooter>
      </Card>

      <EditPostDialog post={post} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
