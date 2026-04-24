import { api } from './api';

export const aiService = {
  getStudyTips: async (topic: string, context?: string): Promise<string> => {
    const { data } = await api.post('/api/ai/study-tips', { topic, context });
    return data.data.tips;
  },

  enhanceContent: async (content: string): Promise<string> => {
    const { data } = await api.post('/api/ai/enhance-content', { content });
    return data.data.suggestions;
  },

  suggestTags: async (title: string, content: string): Promise<string[]> => {
    const { data } = await api.post('/api/ai/suggest-tags', { title, content });
    return data.data.tags;
  },
};
