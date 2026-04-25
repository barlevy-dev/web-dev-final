import { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useStudyTips } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function StudyTipsDialog() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [tips, setTips] = useState<string | null>(null);
  const studyTips = useStudyTips();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    const result = await studyTips.mutateAsync({ topic: topic.trim(), context: context.trim() || undefined });
    setTips(result);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTips(null);
      setTopic('');
      setContext('');
      studyTips.reset();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="fixed bottom-6 right-6 gap-2 shadow-lg z-40"
        >
          <Lightbulb className="h-4 w-4" />
          Study Tips
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Study Tips</DialogTitle>
        </DialogHeader>

        {!tips ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic *</label>
              <Input
                placeholder="e.g. Binary search trees"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Context (optional)</label>
              <Input
                placeholder="e.g. Preparing for midterm exam"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            {studyTips.isError && (
              <p className="text-sm text-destructive">Failed to generate tips. Try again.</p>
            )}
            <Button type="submit" className="w-full" disabled={!topic.trim() || studyTips.isPending}>
              {studyTips.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                'Get Study Tips'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {tips}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setTips(null); studyTips.reset(); }}
            >
              Ask another topic
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
