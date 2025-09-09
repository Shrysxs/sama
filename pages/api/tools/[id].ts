import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { UpdateToolRequest } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGetTool(req, res, supabase, id as string);
  } else if (req.method === 'PUT') {
    return handleUpdateTool(req, res, supabase, id as string);
  } else if (req.method === 'DELETE') {
    return handleDeleteTool(req, res, supabase, id as string);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetTool(req: NextApiRequest, res: NextApiResponse, supabase: any, id: string) {
  try {
    const { data: tool, error } = await supabase
      .from('tools')
      .select(`
        *,
        owner:profiles(id, name, avatar_url, verified, bio, website, github_username),
        category:categories(id, name, slug, icon),
        media:tool_media(id, type, url, alt_text, sort_order),
        reviews:tool_reviews(
          id, rating, title, content, verified_usage, helpful_count, created_at,
          user:profiles(id, name, avatar_url, verified)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tool not found' });
      }
      console.error('Error fetching tool:', error);
      return res.status(500).json({ error: 'Failed to fetch tool' });
    }

    // Check if user can view this tool
    const { data: { session } } = await supabase.auth.getSession();
    const canView = tool.visibility === 'PUBLIC' || 
                   (session && tool.owner_id === session.user.id) ||
                   tool.status === 'APPROVED';

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Increment view count if public tool
    if (tool.visibility === 'PUBLIC' && tool.status === 'APPROVED') {
      await supabase
        .from('tools')
        .update({ view_count: tool.view_count + 1 })
        .eq('id', id);

      // Track analytics
      await supabase.from('tool_analytics').insert({
        tool_id: id,
        user_id: session?.user?.id || null,
        event_type: 'VIEW',
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        referrer: req.headers.referer
      });
    }

    return res.status(200).json(tool);
  } catch (error) {
    console.error('Error in handleGetTool:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateTool(req: NextApiRequest, res: NextApiResponse, supabase: any, id: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user owns the tool
    const { data: existingTool } = await supabase
      .from('tools')
      .select('owner_id, status')
      .eq('id', id)
      .single();

    if (!existingTool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    if (existingTool.owner_id !== session.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: UpdateToolRequest = req.body;

    // If updating name, regenerate slug
    if (updateData.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug conflicts with existing tools
      const { data: conflictingTool } = await supabase
        .from('tools')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();

      if (conflictingTool) {
        return res.status(400).json({ error: 'A tool with this name already exists' });
      }

      (updateData as any).slug = newSlug;
    }

    const { data: tool, error } = await supabase
      .from('tools')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        owner:profiles(id, name, avatar_url, verified),
        category:categories(id, name, slug, icon)
      `)
      .single();

    if (error) {
      console.error('Error updating tool:', error);
      return res.status(500).json({ error: 'Failed to update tool' });
    }

    return res.status(200).json(tool);
  } catch (error) {
    console.error('Error in handleUpdateTool:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteTool(req: NextApiRequest, res: NextApiResponse, supabase: any, id: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user owns the tool
    const { data: existingTool } = await supabase
      .from('tools')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!existingTool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    if (existingTool.owner_id !== session.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tool:', error);
      return res.status(500).json({ error: 'Failed to delete tool' });
    }

    return res.status(204).end();
  } catch (error) {
    console.error('Error in handleDeleteTool:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
