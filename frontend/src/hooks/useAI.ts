import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useStudyTips() {
  return useMutation({
    mutationFn: ({ topic, context }: { topic: string; context?: string }) =>
      aiService.getStudyTips(topic, context),
  });
}

export function useEnhanceContent() {
  return useMutation({
    mutationFn: (content: string) => aiService.enhanceContent(content),
  });
}

export function useSuggestTags() {
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      aiService.suggestTags(title, content),
  });
}
