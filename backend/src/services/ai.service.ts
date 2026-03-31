import OpenAI from 'openai';
import { AppError } from '../middleware/error.middleware';

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError('OpenAI API key not configured', 500);
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

export const generateStudyTips = async (topic: string, context?: string): Promise<string> => {
  const openai = getOpenAIClient();

  const prompt = context
    ? `Generate helpful study tips for the topic "${topic}" with this additional context: ${context}`
    : `Generate helpful study tips for the topic "${topic}"`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are an academic tutor helping students study effectively. Provide clear, actionable study tips.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate study tips.';
};

export const enhanceContent = async (content: string): Promise<string> => {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are an academic writing assistant. Suggest improvements to make the content clearer and more informative for students.',
      },
      {
        role: 'user',
        content: `Please suggest improvements for this academic content:\n\n${content}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'Unable to enhance content.';
};

export const suggestTags = async (title: string, content: string): Promise<string[]> => {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a course categorization assistant. Based on the title and content, suggest relevant course tags. Return only a JSON array of strings.',
      },
      {
        role: 'user',
        content: `Title: ${title}\nContent: ${content}\n\nSuggest course tags as a JSON array:`,
      },
    ],
    max_tokens: 200,
    temperature: 0.5,
  });

  const response = completion.choices[0]?.message?.content || '[]';
  try {
    return JSON.parse(response);
  } catch {
    return [response.trim()];
  }
};
