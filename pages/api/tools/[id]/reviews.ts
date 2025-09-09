import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { id } = req.query;

  if (req.method === 'POST') {
    return handleCreateReview(req, res, supabase, id as string);
  } else if (req.method === 'GET') {
    return handleGetReviews(req, res, supabase, id as string);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleCreateReview(req: NextApiRequest, res: NextApiResponse, supabase: any, toolId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rating, title, content } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if tool exists
    const { data: tool } = await supabase
      .from('tools')
      .select('id, owner_id')
      .eq('id', toolId)
      .single();

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Prevent users from reviewing their own tools
    if (tool.owner_id === session.user.id) {
      return res.status(400).json({ error: 'Cannot review your own tool' });
    }

    // Check if user already reviewed this tool
    const { data: existingReview } = await supabase
      .from('tool_reviews')
      .select('id')
      .eq('tool_id', toolId)
      .eq('user_id', session.user.id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this tool' });
    }

    // Create review
    const { data: review, error } = await supabase
      .from('tool_reviews')
      .insert({
        tool_id: toolId,
        user_id: session.user.id,
        rating,
        title,
        content,
        verified_usage: false // Could be enhanced with usage verification
      })
      .select(`
        *,
        user:profiles(id, name, avatar_url, verified)
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ error: 'Failed to create review' });
    }

    // Track analytics event
    await supabase.from('tool_analytics').insert({
      tool_id: toolId,
      user_id: session.user.id,
      event_type: 'SIGNUP',
      metadata: { 
        action: 'review_created',
        rating: rating
      }
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Error in handleCreateReview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetReviews(req: NextApiRequest, res: NextApiResponse, supabase: any, toolId: string) {
  try {
    const { page = 1, per_page = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const perPage = Math.min(parseInt(per_page as string), 50);
    const from = (pageNum - 1) * perPage;
    const to = from + perPage - 1;

    const { data: reviews, error, count } = await supabase
      .from('tool_reviews')
      .select(`
        *,
        user:profiles(id, name, avatar_url, verified)
      `, { count: 'exact' })
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    return res.status(200).json({
      reviews: reviews || [],
      total_count: count || 0,
      page: pageNum,
      per_page: perPage
    });
  } catch (error) {
    console.error('Error in handleGetReviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
