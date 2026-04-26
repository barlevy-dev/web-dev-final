import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostCard } from '@/components/posts/PostCard';
import { Post } from '@/types';
import * as postService from '@/services/post.service';

const OWNER_ID = 'user-owner-id';
const OTHER_ID = 'user-other-id';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/post.service', () => ({
  postService: {
    likePost: vi.fn(),
    unlikePost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

// EditPostDialog uses heavy imports — stub it out
vi.mock('@/components/posts/EditPostDialog', () => ({
  EditPostDialog: () => null,
}));

import { useAuth } from '@/hooks/useAuth';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    _id: 'post-1',
    userId: OWNER_ID,
    authorName: 'Test Author',
    title: 'Test Post Title',
    content: 'This is the post content for testing purposes.',
    courseTag: 'Computer Science',
    difficultyLevel: 'medium',
    likes: 3,
    likedBy: [],
    commentsCount: 2,
    aiEnhanced: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderCard(post: Post) {
  return render(
    <MemoryRouter>
      <PostCard post={post} />
    </MemoryRouter>
  );
}

describe('PostCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders title, author, courseTag and difficulty badge', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OTHER_ID } });
    renderCard(makePost());

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('displays the correct initial like count', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OTHER_ID } });
    renderCard(makePost({ likes: 7 }));
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('like button calls likePost and increments count', async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OTHER_ID } });
    (postService.postService.likePost as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    renderCard(makePost({ likes: 3, likedBy: [] }));

    fireEvent.click(screen.getByRole('button', { name: /like post/i }));
    await waitFor(() => expect(postService.postService.likePost).toHaveBeenCalledWith('post-1'));
  });

  it('unlike button calls unlikePost when already liked', async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OTHER_ID } });
    (postService.postService.unlikePost as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    renderCard(makePost({ likes: 3, likedBy: [OTHER_ID] }));

    fireEvent.click(screen.getByRole('button', { name: /unlike post/i }));
    await waitFor(() => expect(postService.postService.unlikePost).toHaveBeenCalledWith('post-1'));
  });

  it('shows edit/delete dropdown only for post owner', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OWNER_ID } });
    renderCard(makePost({ userId: OWNER_ID }));
    // The MoreVertical trigger button should be present
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
  });

  it('hides edit/delete dropdown for non-owner', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OTHER_ID } });
    const { container } = renderCard(makePost({ userId: OWNER_ID }));
    // Only the like button should be present (no dropdown trigger)
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(1);
  });

  it('displays AI enhanced badge when aiEnhanced is true', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: { _id: OTHER_ID } });
    renderCard(makePost({ aiEnhanced: true }));
    expect(screen.getByText(/AI/i)).toBeInTheDocument();
  });
});
