import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Tool, CreateToolRequest, SearchFilters, SearchResult } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });

  if (req.method === 'GET') {
    return handleGetTools(req, res, supabase);
  } else if (req.method === 'POST') {
    return handleCreateTool(req, res, supabase);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetTools(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const {
      q,
      category,
      tags,
      pricing_model,
      tech_stack,
      rating_min,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      per_page = 20
    } = req.query;

    let query = supabase
      .from('tools')
      .select(`
        *,
        owner:profiles(id, name, avatar_url, verified),
        category:categories(id, name, slug, icon),
        media:tool_media(id, type, url, alt_text, sort_order)
      `)
      .eq('status', 'APPROVED')
      .eq('visibility', 'PUBLIC');

    // Text search
    if (q && typeof q === 'string') {
      query = query.textSearch('search_vector', q);
    }

    // Category filter
    if (category && typeof category === 'string') {
      query = query.eq('category_id', category);
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query = query.overlaps('tags', tagArray);
    }

    // Pricing model filter
    if (pricing_model) {
      const pricingArray = Array.isArray(pricing_model) ? pricing_model : [pricing_model];
      query = query.in('pricing_model', pricingArray);
    }

    // Tech stack filter
    if (tech_stack) {
      const techArray = Array.isArray(tech_stack) ? tech_stack : [tech_stack];
      query = query.overlaps('tech_stack', techArray);
    }

    // Rating filter
    if (rating_min && typeof rating_min === 'string') {
      query = query.gte('rating_average', parseFloat(rating_min));
    }

    // Sorting
    const sortColumn = sort_by === 'rating' ? 'rating_average' : sort_by as string;
    query = query.order(sortColumn, { ascending: sort_order === 'asc' });

    // Pagination
    const pageNum = parseInt(page as string);
    const perPage = Math.min(parseInt(per_page as string), 100);
    const from = (pageNum - 1) * perPage;
    const to = from + perPage - 1;

    query = query.range(from, to);

    const { data: tools, error, count } = await query;

    if (error) {
      console.error('Error fetching tools:', error);
      return res.status(500).json({ error: 'Failed to fetch tools' });
    }

    // Get facets for filtering
    const facets = await getFacets(supabase, { q, category, tags, pricing_model, tech_stack, rating_min });

    const result: SearchResult = {
      tools: tools || [],
      total_count: count || 0,
      page: pageNum,
      per_page: perPage,
      facets
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in handleGetTools:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCreateTool(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const toolData: CreateToolRequest = req.body;

    // Validate required fields
    if (!toolData.name || !toolData.tagline || !toolData.description || !toolData.website_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate slug from name
    const slug = toolData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const { data: existingTool } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingTool) {
      return res.status(400).json({ error: 'A tool with this name already exists' });
    }

    const { data: tool, error } = await supabase
      .from('tools')
      .insert({
        ...toolData,
        slug,
        owner_id: session.user.id,
        status: 'DRAFT',
        visibility: 'PRIVATE'
      })
      .select(`
        *,
        owner:profiles(id, name, avatar_url, verified),
        category:categories(id, name, slug, icon)
      `)
      .single();

    if (error) {
      console.error('Error creating tool:', error);
      return res.status(500).json({ error: 'Failed to create tool' });
    }

    // Track analytics event
    await supabase.from('tool_analytics').insert({
      tool_id: tool.id,
      user_id: session.user.id,
      event_type: 'SIGNUP',
      metadata: { source: 'api' }
    });

    return res.status(201).json(tool);
  } catch (error) {
    console.error('Error in handleCreateTool:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFacets(supabase: any, filters: any) {
  try {
    // Get categories with counts
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    // Get popular tags
    const { data: tagData } = await supabase
      .rpc('get_popular_tags', { limit_count: 20 });

    // Get pricing model counts
    const { data: pricingData } = await supabase
      .from('tools')
      .select('pricing_model')
      .eq('status', 'APPROVED')
      .eq('visibility', 'PUBLIC');

    // Get popular tech stack
    const { data: techData } = await supabase
      .rpc('get_popular_tech_stack', { limit_count: 20 });

    const pricingCounts = pricingData?.reduce((acc: any, tool: any) => {
      acc[tool.pricing_model] = (acc[tool.pricing_model] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      categories: categories?.map((cat: any) => ({ ...cat, count: 0 })) || [],
      tags: tagData || [],
      pricing_models: Object.entries(pricingCounts).map(([model, count]) => ({ model, count })),
      tech_stack: techData || []
    };
  } catch (error) {
    console.error('Error getting facets:', error);
    return {
      categories: [],
      tags: [],
      pricing_models: [],
      tech_stack: []
    };
  }
}
