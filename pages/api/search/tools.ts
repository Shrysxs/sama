import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerClient({ req, res });

  try {
    const {
      q = '',
      category,
      pricing_model,
      min_rating = 0,
      max_rating = 5,
      tech_stack,
      tags,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      per_page = 20,
      featured_only = false
    } = req.query;

    const pageNum = parseInt(page as string);
    const perPage = Math.min(parseInt(per_page as string), 50);
    const from = (pageNum - 1) * perPage;
    const to = from + perPage - 1;

    // Build the query
    let query = supabase
      .from('tools')
      .select(`
        *,
        category:categories(id, name, slug),
        owner:profiles(id, name, avatar_url, verified),
        media:tool_media(id, type, url, alt_text),
        reviews:tool_reviews(rating),
        _count:tool_analytics(count)
      `, { count: 'exact' });

    // Apply filters
    if (q) {
      // Use Supabase's full-text search
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (pricing_model) {
      query = query.eq('pricing_model', pricing_model);
    }

    if (tech_stack) {
      const techArray = Array.isArray(tech_stack) ? tech_stack : [tech_stack];
      query = query.overlaps('tech_stack', techArray);
    }

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      query = query.overlaps('tags', tagsArray);
    }

    if (featured_only === 'true') {
      query = query.eq('featured', true);
    }

    // Apply rating filter (we'll calculate this from reviews)
    query = query.gte('average_rating', parseFloat(min_rating as string));
    query = query.lte('average_rating', parseFloat(max_rating as string));

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'name', 'average_rating', 'usage_count'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'created_at';
    const sortDirection = sort_order === 'asc' ? { ascending: true } : { ascending: false };

    query = query.order(sortField, sortDirection);

    // Apply pagination
    query = query.range(from, to);

    const { data: tools, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      return res.status(500).json({ error: 'Search failed' });
    }

    // Process the results to include computed fields
    const processedTools = tools?.map(tool => ({
      ...tool,
      review_count: tool.reviews?.length || 0,
      average_rating: tool.reviews?.length > 0 
        ? tool.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / tool.reviews.length 
        : 0,
      analytics_count: tool._count?.length || 0
    })) || [];

    // Get search suggestions if query is provided
    let suggestions = [];
    if (q && processedTools.length < 5) {
      const { data: suggestionData } = await supabase
        .from('tools')
        .select('name, tags')
        .or(`name.ilike.%${q}%,tags.cs.{${q}}`)
        .limit(5);

      suggestions = suggestionData?.map(tool => ({
        name: tool.name,
        tags: tool.tags
      })) || [];
    }

    // Get popular tags and tech stack for faceted search
    const { data: popularTags } = await supabase.rpc('get_popular_tags', { limit_count: 20 });
    const { data: popularTech } = await supabase.rpc('get_popular_tech_stack', { limit_count: 20 });

    return res.status(200).json({
      tools: processedTools,
      total_count: count || 0,
      page: pageNum,
      per_page: perPage,
      suggestions,
      facets: {
        popular_tags: popularTags || [],
        popular_tech: popularTech || []
      },
      query_info: {
        query: q,
        filters_applied: {
          category: category || null,
          pricing_model: pricing_model || null,
          tech_stack: tech_stack || null,
          tags: tags || null,
          rating_range: [min_rating, max_rating]
        }
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
