export interface Tool {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  website_url?: string;
  github_url?: string;
  created_at?: string;
}

export const tools: Tool[] = [
  {
    id: '1',
    name: 'AI Code Generator',
    description: 'Generate code snippets using AI based on natural language descriptions.',
    category: 'Developer Tools',
    tags: ['code', 'ai', 'productivity'],
    website_url: 'https://example.com/ai-code',
    github_url: 'https://github.com/example/ai-code',
    created_at: '2023-01-15',
  },
  {
    id: '2',
    name: 'Image Upscaler',
    description: 'Enhance image resolution using advanced AI algorithms without losing quality.',
    category: 'Design',
    tags: ['images', 'ai', 'photo-editing'],
    website_url: 'https://example.com/upscaler',
    created_at: '2023-02-20',
  },
  {
    id: '3',
    name: 'Text Summarizer',
    description: 'Automatically generate concise summaries of long articles and documents.',
    category: 'Productivity',
    tags: ['text', 'ai', 'summarization'],
    website_url: 'https://example.com/summarizer',
    created_at: '2023-03-10',
  },
];
