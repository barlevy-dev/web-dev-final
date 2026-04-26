import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Tag } from 'lucide-react';
import { useCreatePost } from '@/hooks/usePosts';
import { useSuggestTags } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImagePicker } from '@/components/ui/image-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  courseTag: z.string().min(1, 'Course tag is required'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']),
});

type FormValues = z.infer<typeof schema>;

interface CreatePostDialogProps {
  children: React.ReactNode;
}

export function CreatePostDialog({ children }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const createPost = useCreatePost();
  const suggestTagsMutation = useSuggestTags();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', courseTag: '', difficultyLevel: 'medium' },
  });

  const onSubmit = async (values: FormValues) => {
    await createPost.mutateAsync({ ...values, imageUrl, aiEnhanced: false });
    form.reset();
    setImageUrl(undefined);
    setOpen(false);
  };

  const handleSuggestTag = async () => {
    const title = form.getValues('title');
    const content = form.getValues('content');
    if (!title || !content) return;
    const tags = await suggestTagsMutation.mutateAsync({ title, content });
    if (tags.length > 0) form.setValue('courseTag', tags[0], { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What did you learn?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what you know…"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="courseTag"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Course tag</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1 text-blue-600"
                        onClick={handleSuggestTag}
                        disabled={suggestTagsMutation.isPending}
                      >
                        {suggestTagsMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                        Suggest
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="e.g. Data Structures" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ImagePicker value={imageUrl} onChange={setImageUrl} />

            {createPost.isError && (
              <p className="text-sm text-destructive">Failed to create post. Try again.</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || createPost.isPending}>
                {(form.formState.isSubmitting || createPost.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Publish
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
