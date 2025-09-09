-- Database functions for Sama.dev platform

-- Function to increment tool usage count
CREATE OR REPLACE FUNCTION increment_tool_usage(tool_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE tools 
    SET usage_count = usage_count + increment_by
    WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular tags
CREATE OR REPLACE FUNCTION get_popular_tags(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(name TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(tags) as name,
        COUNT(*) as count
    FROM tools 
    WHERE status = 'APPROVED' AND visibility = 'PUBLIC'
    GROUP BY unnest(tags)
    ORDER BY count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular tech stack
CREATE OR REPLACE FUNCTION get_popular_tech_stack(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(tech TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(tech_stack) as tech,
        COUNT(*) as count
    FROM tools 
    WHERE status = 'APPROVED' AND visibility = 'PUBLIC'
    GROUP BY unnest(tech_stack)
    ORDER BY count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user reputation score
CREATE OR REPLACE FUNCTION calculate_user_reputation(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO total_points
    FROM reputation_events
    WHERE user_id = calculate_user_reputation.user_id;
    
    -- Update the user's reputation score
    UPDATE profiles 
    SET reputation_score = total_points
    WHERE id = user_id;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Function to add reputation points
CREATE OR REPLACE FUNCTION add_reputation_points(
    user_id UUID,
    event_type TEXT,
    points INTEGER,
    description TEXT DEFAULT NULL,
    metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO reputation_events (user_id, event_type, points, description, metadata)
    VALUES (user_id, event_type, points, description, metadata);
    
    -- Recalculate user reputation
    PERFORM calculate_user_reputation(user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get tool analytics summary
CREATE OR REPLACE FUNCTION get_tool_analytics_summary(
    tool_id UUID,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_views BIGINT,
    total_clicks BIGINT,
    total_api_calls BIGINT,
    total_signups BIGINT,
    total_purchases BIGINT,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE event_type = 'VIEW') as total_views,
        COUNT(*) FILTER (WHERE event_type = 'CLICK') as total_clicks,
        COUNT(*) FILTER (WHERE event_type = 'API_CALL') as total_api_calls,
        COUNT(*) FILTER (WHERE event_type = 'SIGNUP') as total_signups,
        COUNT(*) FILTER (WHERE event_type = 'PURCHASE') as total_purchases,
        COUNT(DISTINCT user_id) as unique_users
    FROM tool_analytics
    WHERE tool_analytics.tool_id = get_tool_analytics_summary.tool_id
    AND created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's API usage for billing
CREATE OR REPLACE FUNCTION get_user_api_usage_for_billing(
    user_id UUID,
    tool_id UUID,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
    total_requests BIGINT,
    total_billing_amount DECIMAL(10,4),
    endpoint_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(request_count) as total_requests,
        SUM(billing_amount) as total_billing_amount,
        jsonb_object_agg(
            endpoint, 
            jsonb_build_object(
                'requests', SUM(request_count),
                'amount', SUM(billing_amount)
            )
        ) as endpoint_breakdown
    FROM api_usage
    WHERE api_usage.user_id = get_user_api_usage_for_billing.user_id
    AND api_usage.tool_id = get_user_api_usage_for_billing.tool_id
    AND created_at BETWEEN start_date AND end_date
    GROUP BY api_usage.user_id, api_usage.tool_id;
END;
$$ LANGUAGE plpgsql;

-- Function to search tools with full-text search
CREATE OR REPLACE FUNCTION search_tools(
    search_query TEXT DEFAULT NULL,
    category_filter UUID DEFAULT NULL,
    pricing_filters TEXT[] DEFAULT NULL,
    tech_stack_filters TEXT[] DEFAULT NULL,
    min_rating DECIMAL DEFAULT NULL,
    sort_column TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'desc',
    page_offset INTEGER DEFAULT 0,
    page_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    slug TEXT,
    tagline TEXT,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    demo_url TEXT,
    category_id UUID,
    tags TEXT[],
    tech_stack TEXT[],
    pricing_model TEXT,
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    view_count INTEGER,
    usage_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    owner_name TEXT,
    owner_avatar_url TEXT,
    category_name TEXT,
    category_icon TEXT
) AS $$
DECLARE
    query_sql TEXT;
BEGIN
    query_sql := '
        SELECT 
            t.id, t.name, t.slug, t.tagline, t.description, t.logo_url, t.website_url, t.demo_url,
            t.category_id, t.tags, t.tech_stack, t.pricing_model, t.rating_average, t.rating_count,
            t.view_count, t.usage_count, t.created_at,
            p.name as owner_name, p.avatar_url as owner_avatar_url,
            c.name as category_name, c.icon as category_icon
        FROM tools t
        LEFT JOIN profiles p ON t.owner_id = p.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.status = ''APPROVED'' AND t.visibility = ''PUBLIC''
    ';
    
    -- Add search condition
    IF search_query IS NOT NULL AND search_query != '' THEN
        query_sql := query_sql || ' AND t.search_vector @@ plainto_tsquery(''english'', ''' || search_query || ''')';
    END IF;
    
    -- Add category filter
    IF category_filter IS NOT NULL THEN
        query_sql := query_sql || ' AND t.category_id = ''' || category_filter || '''';
    END IF;
    
    -- Add pricing filter
    IF pricing_filters IS NOT NULL AND array_length(pricing_filters, 1) > 0 THEN
        query_sql := query_sql || ' AND t.pricing_model = ANY(''' || pricing_filters::text || ''')';
    END IF;
    
    -- Add tech stack filter
    IF tech_stack_filters IS NOT NULL AND array_length(tech_stack_filters, 1) > 0 THEN
        query_sql := query_sql || ' AND t.tech_stack && ''' || tech_stack_filters::text || '''';
    END IF;
    
    -- Add rating filter
    IF min_rating IS NOT NULL THEN
        query_sql := query_sql || ' AND t.rating_average >= ' || min_rating;
    END IF;
    
    -- Add sorting
    IF sort_column = 'relevance' AND search_query IS NOT NULL THEN
        query_sql := query_sql || ' ORDER BY ts_rank(t.search_vector, plainto_tsquery(''english'', ''' || search_query || ''')) DESC';
    ELSE
        query_sql := query_sql || ' ORDER BY t.' || sort_column || ' ' || sort_direction;
    END IF;
    
    -- Add pagination
    query_sql := query_sql || ' LIMIT ' || page_limit || ' OFFSET ' || page_offset;
    
    RETURN QUERY EXECUTE query_sql;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to award reputation points for tool actions
CREATE OR REPLACE FUNCTION award_tool_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Award points for publishing a tool
    IF TG_OP = 'UPDATE' AND OLD.status != 'APPROVED' AND NEW.status = 'APPROVED' THEN
        PERFORM add_reputation_points(
            NEW.owner_id,
            'TOOL_PUBLISHED',
            50,
            'Tool "' || NEW.name || '" was approved and published'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to award reputation points for reviews
CREATE OR REPLACE FUNCTION award_review_reputation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Award points to reviewer
        PERFORM add_reputation_points(
            NEW.user_id,
            CASE WHEN NEW.rating >= 4 THEN 'POSITIVE_REVIEW' ELSE 'NEGATIVE_REVIEW' END,
            CASE WHEN NEW.rating >= 4 THEN 10 ELSE 5 END,
            'Left a review for a tool'
        );
        
        -- Award points to tool owner for receiving reviews
        PERFORM add_reputation_points(
            (SELECT owner_id FROM tools WHERE id = NEW.tool_id),
            CASE WHEN NEW.rating >= 4 THEN 'POSITIVE_REVIEW' ELSE 'NEGATIVE_REVIEW' END,
            CASE WHEN NEW.rating >= 4 THEN 5 ELSE -2 END,
            'Received a review for their tool'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER tool_reputation_trigger 
    AFTER UPDATE ON tools 
    FOR EACH ROW EXECUTE FUNCTION award_tool_reputation();

CREATE TRIGGER review_reputation_trigger 
    AFTER INSERT ON tool_reviews 
    FOR EACH ROW EXECUTE FUNCTION award_review_reputation();
