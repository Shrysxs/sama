import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  slug: string;
  pricing_model: 'FREE' | 'FREEMIUM' | 'PAID' | 'USAGE_BASED';
  price_amount?: number;
  price_currency?: string;
  average_rating: number;
  usage_count: number;
  review_count: number;
  category: {
    name: string;
    slug: string;
  };
  owner: {
    name: string;
    verified: boolean;
  };
  tags: string[];
  tech_stack: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SearchResult {
  tools: Tool[];
  total_count: number;
  page: number;
  per_page: number;
}

interface SearchFilters {
  category?: string;
  pricing_model?: string;
  sort_by: string;
  sort_order: string;
}

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  useEffect(() => {
    fetchCategories();
    performSearch();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.pricing_model) {
        params.append('pricing_model', filters.pricing_model);
      }
      // Rating filter removed for now
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const response = await fetch(`/api/tools?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      }
    } catch (error) {
      console.error('Error searching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">Sama</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Submit Tool
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover AI Micro SaaS Tools
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find the perfect AI-powered tools to boost your productivity. 
            Curated, trusted, and ready to integrate into your workflow.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for AI tools, features, or use cases..."
                className="w-full px-4 py-3 pl-12 pr-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Model */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing</h4>
                <div className="space-y-2">
                  {(['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'PAY_PER_USE', 'ONE_TIME'] as PricingModel[]).map(model => (
                    <label key={model} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.pricing_model?.includes(model) || false}
                        onChange={(e) => {
                          const current = filters.pricing_model || [];
                          if (e.target.checked) {
                            handleFilterChange('pricing_model', [...current, model]);
                          } else {
                            handleFilterChange('pricing_model', current.filter(m => m !== model));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {model.toLowerCase().replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <select
                  value={filters.rating_min || ''}
                  onChange={(e) => handleFilterChange('rating_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full border-gray-300 rounded-md text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split('-');
                    handleFilterChange('sort_by', sort_by);
                    handleFilterChange('sort_order', sort_order);
                  }}
                  className="w-full border-gray-300 rounded-md text-sm"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="usage_count-desc">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching tools...</p>
              </div>
            ) : searchResult ? (
              <>
                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    {searchResult.total_count} tools found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResult.tools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>

                {/* Pagination */}
                {searchResult.total_count > searchResult.per_page && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* Add pagination controls here */}
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No tools found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const getPricingLabel = (model: PricingModel) => {
    switch (model) {
      case 'FREE': return 'Free';
      case 'FREEMIUM': return 'Freemium';
      case 'SUBSCRIPTION': return 'Subscription';
      case 'PAY_PER_USE': return 'Pay per Use';
      case 'ONE_TIME': return 'One-time';
      default: return model;
    }
  };

  const getPricingColor = (model: PricingModel) => {
    switch (model) {
      case 'FREE': return 'bg-green-100 text-green-800';
      case 'FREEMIUM': return 'bg-blue-100 text-blue-800';
      case 'SUBSCRIPTION': return 'bg-purple-100 text-purple-800';
      case 'PAY_PER_USE': return 'bg-yellow-100 text-yellow-800';
      case 'ONE_TIME': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/tools/${tool.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {tool.logo_url ? (
                <img
                  src={tool.logo_url}
                  alt={`${tool.name} logo`}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-600">{tool.tagline}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPricingColor(tool.pricing_model)}`}>
              {getPricingLabel(tool.pricing_model)}
            </span>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {tool.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {tool.rating_count > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{tool.rating_average.toFixed(1)}</span>
                </div>
              )}
              <span>{tool.view_count} views</span>
            </div>

            {tool.category && (
              <span className="text-xs text-gray-500">
                {tool.category.icon} {tool.category.name}
              </span>
            )}
          </div>

          {tool.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tool.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{tool.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
