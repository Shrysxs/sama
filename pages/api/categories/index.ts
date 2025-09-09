import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });

  if (req.method === 'GET') {
    return handleGetCategories(req, res, supabase);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetCategories(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        icon,
        parent_id,
        created_at,
        tool_count:tools(count)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error in handleGetCategories:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
