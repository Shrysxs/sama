-- Sama.dev Database Schema
-- Tool Registry and Platform Infrastructure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  github_username TEXT,
  twitter_username TEXT,
  reputation_score INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool categories for organization
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main tools registry
CREATE TABLE tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  demo_url TEXT,
  api_endpoint TEXT,
  documentation_url TEXT,
  github_url TEXT,
  
  -- Categorization
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  
  -- Technical metadata
  tech_stack TEXT[] DEFAULT '{}',
  api_type TEXT CHECK (api_type IN ('REST', 'GraphQL', 'WebSocket', 'gRPC', 'Other')),
  authentication_type TEXT CHECK (authentication_type IN ('API_KEY', 'OAuth', 'JWT', 'Basic', 'None')),
  rate_limits JSONB,
  
  -- Pricing and monetization
  pricing_model TEXT CHECK (pricing_model IN ('FREE', 'FREEMIUM', 'SUBSCRIPTION', 'PAY_PER_USE', 'ONE_TIME')),
  pricing_details JSONB,
  stripe_product_id TEXT,
  
  -- Status and visibility
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'UNLISTED')),
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', tagline), 'B') ||
    setweight(to_tsvector('english', description), 'C') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'D')
  ) STORED
);

-- Tool screenshots and media
CREATE TABLE tool_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('SCREENSHOT', 'VIDEO', 'LOGO', 'BANNER')) NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool reviews and ratings
CREATE TABLE tool_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  content TEXT,
  verified_usage BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Usage analytics and metrics
CREATE TABLE tool_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT CHECK (event_type IN ('VIEW', 'CLICK', 'API_CALL', 'SIGNUP', 'PURCHASE')) NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monetization and billing
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING')) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking for pay-per-use models
CREATE TABLE api_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  response_time_ms INTEGER,
  status_code INTEGER,
  billing_amount DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust and reputation system
CREATE TABLE reputation_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT CHECK (event_type IN ('TOOL_PUBLISHED', 'POSITIVE_REVIEW', 'NEGATIVE_REVIEW', 'VERIFIED_USAGE', 'COMMUNITY_CONTRIBUTION')) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections/Lists of tools
CREATE TABLE collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'UNLISTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE collection_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, tool_id)
);

-- Indexes for performance
CREATE INDEX idx_tools_search_vector ON tools USING GIN(search_vector);
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_owner ON tools(owner_id);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX idx_tools_rating ON tools(rating_average DESC);
CREATE INDEX idx_tool_analytics_tool_id ON tool_analytics(tool_id);
CREATE INDEX idx_tool_analytics_created_at ON tool_analytics(created_at DESC);
CREATE INDEX idx_api_usage_user_tool ON api_usage(user_id, tool_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tools: Public tools are viewable by everyone, owners can manage their tools
CREATE POLICY "Public tools are viewable by everyone" ON tools FOR SELECT USING (status = 'APPROVED' AND visibility = 'PUBLIC');
CREATE POLICY "Owners can view their own tools" ON tools FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can manage their own tools" ON tools FOR ALL USING (auth.uid() = owner_id);

-- Reviews: Users can read all reviews, but only manage their own
CREATE POLICY "Reviews are viewable by everyone" ON tool_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews" ON tool_reviews FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users can only see their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- API Usage: Users can only see their own usage
CREATE POLICY "Users can view their own API usage" ON api_usage FOR SELECT USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_reviews_updated_at BEFORE UPDATE ON tool_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tool ratings
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tools SET 
        rating_average = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM tool_reviews 
            WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM tool_reviews 
            WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
        )
    WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update tool ratings when reviews change
CREATE TRIGGER update_tool_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON tool_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_tool_rating();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
('AI & Machine Learning', 'ai-ml', 'Tools powered by artificial intelligence and machine learning', '🤖'),
('Developer Tools', 'developer-tools', 'Tools to help developers build better software', '⚡'),
('Productivity', 'productivity', 'Tools to boost personal and team productivity', '📈'),
('Content Creation', 'content-creation', 'Tools for creating and managing content', '✨'),
('Data & Analytics', 'data-analytics', 'Tools for data processing and analysis', '📊'),
('Marketing & Sales', 'marketing-sales', 'Tools for marketing automation and sales', '📢'),
('Design & Creative', 'design-creative', 'Tools for design and creative work', '🎨'),
('Communication', 'communication', 'Tools for team and customer communication', '💬'),
('Finance & Business', 'finance-business', 'Tools for financial management and business operations', '💼'),
('Education & Learning', 'education-learning', 'Tools for education and skill development', '📚');
