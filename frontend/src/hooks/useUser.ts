import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateUserData } from '@/services/user.service';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: UpdateUserData) => userService.updateUser(updates),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser._id] });
    },
  });
}

export function useUserPosts(userId: string, page = 1) {
  return useQuery({
    queryKey: ['userPosts', userId, page],
    queryFn: () => userService.getUserPosts(userId, page),
    enabled: !!userId,
  });
}
