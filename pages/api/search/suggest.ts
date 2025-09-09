import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerClient({ req, res });

  try {
    const { q = '', type = 'all' } = req.query;

    if (!q || (q as string).length < 2) {
      return res.status(200).json({
        suggestions: [],
        categories: [],
        tags: [],
        tech_stack: []
      });
    }

    const query = q as string;
    const suggestions: any = {
      tools: [],
      categories: [],
      tags: [],
      tech_stack: []
    };

    // Get tool suggestions
    if (type === 'all' || type === 'tools') {
      const { data: tools } = await supabase
        .from('tools')
        .select('id, name, description, slug')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      suggestions.tools = tools?.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description?.substring(0, 100) + '...',
        slug: tool.slug,
        type: 'tool'
      })) || [];
    }

    // Get category suggestions
    if (type === 'all' || type === 'categories') {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3);

      suggestions.categories = categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
        type: 'category'
      })) || [];
    }

    // Get tag suggestions from popular tags
    if (type === 'all' || type === 'tags') {
      const { data: popularTags } = await supabase.rpc('get_popular_tags', { limit_count: 50 });
      
      const matchingTags = popularTags?.filter((tag: any) => 
        tag.tag_name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) || [];

      suggestions.tags = matchingTags.map((tag: any) => ({
        name: tag.tag_name,
        count: tag.usage_count,
        type: 'tag'
      }));
    }

    // Get tech stack suggestions
    if (type === 'all' || type === 'tech_stack') {
      const { data: popularTech } = await supabase.rpc('get_popular_tech_stack', { limit_count: 50 });
      
      const matchingTech = popularTech?.filter((tech: any) => 
        tech.tech_name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) || [];

      suggestions.tech_stack = matchingTech.map((tech: any) => ({
        name: tech.tech_name,
        count: tech.usage_count,
        type: 'tech'
      }));
    }

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Suggestion API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
