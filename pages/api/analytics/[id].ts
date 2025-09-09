import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGetAnalytics(req, res, supabase, id as string);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetAnalytics(req: NextApiRequest, res: NextApiResponse, supabase: any, toolId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user owns the tool
    const { data: tool } = await supabase
      .from('tools')
      .select('owner_id')
      .eq('id', toolId)
      .single();

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    if (tool.owner_id !== session.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date = new Date().toISOString()
    } = req.query;

    // Get analytics summary using the database function
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_tool_analytics_summary', {
        tool_id: toolId,
        start_date: start_date,
        end_date: end_date
      })
      .single();

    if (summaryError) {
      console.error('Error fetching analytics summary:', summaryError);
      return res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }

    // Get daily breakdown
    const { data: dailyData, error: dailyError } = await supabase
      .from('tool_analytics')
      .select('created_at, event_type')
      .eq('tool_id', toolId)
      .gte('created_at', start_date)
      .lte('created_at', end_date)
      .order('created_at', { ascending: true });

    if (dailyError) {
      console.error('Error fetching daily analytics:', dailyError);
      return res.status(500).json({ error: 'Failed to fetch daily analytics' });
    }

    // Process daily data into chart format
    const dailyBreakdown = dailyData?.reduce((acc: Record<string, any>, event: any) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          views: 0,
          clicks: 0,
          api_calls: 0,
          signups: 0,
          purchases: 0
        };
      }
      
      switch (event.event_type) {
        case 'VIEW':
          acc[date].views++;
          break;
        case 'CLICK':
          acc[date].clicks++;
          break;
        case 'API_CALL':
          acc[date].api_calls++;
          break;
        case 'SIGNUP':
          acc[date].signups++;
          break;
        case 'PURCHASE':
          acc[date].purchases++;
          break;
      }
      
      return acc;
    }, {}) || {};

    // Get top referrers
    const { data: referrers } = await supabase
      .from('tool_analytics')
      .select('referrer')
      .eq('tool_id', toolId)
      .gte('created_at', start_date)
      .lte('created_at', end_date)
      .not('referrer', 'is', null);

    const referrerCounts = referrers?.reduce((acc: Record<string, number>, item: any) => {
      const domain = item.referrer ? new URL(item.referrer).hostname : 'Direct';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {}) || {};

    const topReferrers = Object.entries(referrerCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    // Get API usage if applicable
    const { data: apiUsage } = await supabase
      .from('api_usage')
      .select('endpoint, request_count, created_at')
      .eq('tool_id', toolId)
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    const endpointUsage = apiUsage?.reduce((acc: Record<string, number>, usage: any) => {
      acc[usage.endpoint] = (acc[usage.endpoint] || 0) + usage.request_count;
      return acc;
    }, {}) || {};

    return res.status(200).json({
      ...(summary || {}),
      daily_breakdown: Object.values(dailyBreakdown),
      top_referrers: topReferrers,
      endpoint_usage: endpointUsage,
      period: {
        start_date,
        end_date
      }
    });
  } catch (error) {
    console.error('Error in handleGetAnalytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
