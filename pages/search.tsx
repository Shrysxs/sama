import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  slug: string;
  pricing_model: string;
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

interface SearchResult {
  tools: Tool[];
  total_count: number;
  page: number;
  per_page: number;
  facets?: {
    popular_tags: Array<{ tag_name: string; usage_count: number }>;
    popular_tech: Array<{ tech_name: string; usage_count: number }>;
  };
}

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    pricing_model: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1
  });

  const searchTools = async (searchQuery: string, searchFilters: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...searchFilters,
        page: searchFilters.page.toString()
      });

      const response = await fetch(`/api/search/tools?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { q, category, pricing_model, sort_by, sort_order, page } = router.query;
    
    if (q) {
      setQuery(q as string);
      setFilters({
        category: (category as string) || '',
        pricing_model: (pricing_model as string) || '',
        sort_by: (sort_by as string) || 'created_at',
        sort_order: (sort_order as string) || 'desc',
        page: parseInt((page as string) || '1')
      });
      
      searchTools(q as string, {
        category: category || '',
        pricing_model: pricing_model || '',
        sort_by: sort_by || 'created_at',
        sort_order: sort_order || 'desc',
        page: parseInt((page as string) || '1')
      });
    }
  }, [router.query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const newFilters = { ...filters, page: 1 };
      router.push({
        pathname: '/search',
        query: { q: query, ...newFilters }
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    router.push({
      pathname: '/search',
      query: { q: query, ...newFilters }
    });
  };

  const renderPricingBadge = (tool: Tool) => {
    const colors = {
      FREE: 'bg-green-100 text-green-800',
      FREEMIUM: 'bg-blue-100 text-blue-800',
      PAID: 'bg-purple-100 text-purple-800',
      USAGE_BASED: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tool.pricing_model as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {tool.pricing_model}
        {tool.price_amount && ` $${tool.price_amount}`}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search AI tools..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Pricing Model Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Model
                </label>
                <select
                  value={filters.pricing_model}
                  onChange={(e) => handleFilterChange('pricing_model', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="FREE">Free</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">Paid</option>
                  <option value="USAGE_BASED">Usage Based</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Newest</option>
                  <option value="average_rating">Rating</option>
                  <option value="usage_count">Popularity</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Popular Tags */}
              {results?.facets?.popular_tags && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.facets.popular_tags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.tag_name}
                        onClick={() => setQuery(tag.tag_name)}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                      >
                        {tag.tag_name} ({tag.usage_count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : results ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Found {results.total_count} tools
                    {query && ` for "${query}"`}
                  </p>
                </div>

                <div className="grid gap-6">
                  {results.tools.map((tool) => (
                    <div key={tool.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <Link href={`/tools/${tool.slug}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                            {tool.name}
                          </Link>
                          <p className="text-gray-600 mt-2">{tool.description}</p>
                        </div>
                        {renderPricingBadge(tool)}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>⭐ {tool.average_rating.toFixed(1)} ({tool.review_count} reviews)</span>
                          <span>👥 {tool.usage_count} users</span>
                          <span>📁 {tool.category.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">by {tool.owner.name}</span>
                          {tool.owner.verified && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </div>
                      </div>

                      {tool.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tool.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {results.total_count > results.per_page && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      {filters.page > 1 && (
                        <button
                          onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-md">
                        Page {filters.page}
                      </span>
                      {results.tools.length === results.per_page && (
                        <button
                          onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Enter a search query to find AI tools</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
