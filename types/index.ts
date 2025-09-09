// Database types for Sama.dev platform

export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  github_username?: string;
  twitter_username?: string;
  reputation_score: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  created_at: string;
}

export type ToolStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type ToolVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
export type PricingModel = 'FREE' | 'FREEMIUM' | 'SUBSCRIPTION' | 'PAY_PER_USE' | 'ONE_TIME';
export type ApiType = 'REST' | 'GraphQL' | 'WebSocket' | 'gRPC' | 'Other';
export type AuthType = 'API_KEY' | 'OAuth' | 'JWT' | 'Basic' | 'None';

export interface Tool {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url?: string;
  website_url: string;
  demo_url?: string;
  api_endpoint?: string;
  documentation_url?: string;
  github_url?: string;
  
  // Categorization
  category_id?: string;
  tags: string[];
  
  // Technical metadata
  tech_stack: string[];
  api_type?: ApiType;
  authentication_type?: AuthType;
  rate_limits?: Record<string, any>;
  
  // Pricing
  pricing_model: PricingModel;
  pricing_details?: Record<string, any>;
  stripe_product_id?: string;
  
  // Status
  status: ToolStatus;
  visibility: ToolVisibility;
  
  // Metrics
  view_count: number;
  usage_count: number;
  rating_average: number;
  rating_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Relations (populated when joined)
  owner?: Profile;
  category?: Category;
  media?: ToolMedia[];
  reviews?: ToolReview[];
}

export interface ToolMedia {
  id: string;
  tool_id: string;
  type: 'SCREENSHOT' | 'VIDEO' | 'LOGO' | 'BANNER';
  url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface ToolReview {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  verified_usage: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: Profile;
}

export interface ToolAnalytics {
  id: string;
  tool_id: string;
  user_id?: string;
  event_type: 'VIEW' | 'CLICK' | 'API_CALL' | 'SIGNUP' | 'PURCHASE';
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tool_id: string;
  stripe_subscription_id?: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  tool?: Tool;
}

export interface ApiUsage {
  id: string;
  user_id: string;
  tool_id: string;
  endpoint: string;
  request_count: number;
  response_time_ms?: number;
  status_code?: number;
  billing_amount?: number;
  created_at: string;
}

export interface ReputationEvent {
  id: string;
  user_id: string;
  event_type: 'TOOL_PUBLISHED' | 'POSITIVE_REVIEW' | 'NEGATIVE_REVIEW' | 'VERIFIED_USAGE' | 'COMMUNITY_CONTRIBUTION';
  points: number;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Collection {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  created_at: string;
  updated_at: string;
  
  // Relations
  tools?: Tool[];
  owner?: Profile;
}

// API Request/Response types
export interface CreateToolRequest {
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  demo_url?: string;
  api_endpoint?: string;
  documentation_url?: string;
  github_url?: string;
  category_id?: string;
  tags: string[];
  tech_stack: string[];
  api_type?: ApiType;
  authentication_type?: AuthType;
  pricing_model: PricingModel;
  pricing_details?: Record<string, any>;
}

export interface UpdateToolRequest extends Partial<CreateToolRequest> {
  logo_url?: string;
  status?: ToolStatus;
  visibility?: ToolVisibility;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  pricing_model?: PricingModel[];
  tech_stack?: string[];
  rating_min?: number;
  sort_by?: 'relevance' | 'rating' | 'created_at' | 'usage_count';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  tools: Tool[];
  total_count: number;
  page: number;
  per_page: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    pricing_models: Array<{ model: PricingModel; count: number }>;
    tech_stack: Array<{ tech: string; count: number }>;
  };
}

// Utility types
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'>; Update: Partial<Category> };
      tools: { Row: Tool; Insert: Omit<Tool, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Tool> };
      tool_media: { Row: ToolMedia; Insert: Omit<ToolMedia, 'id' | 'created_at'>; Update: Partial<ToolMedia> };
      tool_reviews: { Row: ToolReview; Insert: Omit<ToolReview, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ToolReview> };
      tool_analytics: { Row: ToolAnalytics; Insert: Omit<ToolAnalytics, 'id' | 'created_at'>; Update: Partial<ToolAnalytics> };
      subscriptions: { Row: Subscription; Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Subscription> };
      api_usage: { Row: ApiUsage; Insert: Omit<ApiUsage, 'id' | 'created_at'>; Update: Partial<ApiUsage> };
      reputation_events: { Row: ReputationEvent; Insert: Omit<ReputationEvent, 'id' | 'created_at'>; Update: Partial<ReputationEvent> };
      collections: { Row: Collection; Insert: Omit<Collection, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Collection> };
    };
  };
};