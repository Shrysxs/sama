import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Tool, ToolReview } from '@/types';

type Props = {
  tool: Tool;
};

export default function ToolDetail({ tool }: Props) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  const isOwner = session?.user?.id === tool.owner_id;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      const response = await fetch(`/api/tools/${tool.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setIsReviewing(false);
        setReviewData({ rating: 5, title: '', content: '' });
        // Refresh page to show new review
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getPricingLabel = (model: string) => {
    switch (model) {
      case 'FREE': return 'Free';
      case 'FREEMIUM': return 'Freemium';
      case 'SUBSCRIPTION': return 'Subscription';
      case 'PAY_PER_USE': return 'Pay per Use';
      case 'ONE_TIME': return 'One-time Payment';
      default: return model;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/discover" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">Sama</span>
            </Link>
            <div className="flex items-center space-x-4">
              {isOwner && (
                <Link
                  href={`/tools/${tool.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Edit Tool
                </Link>
              )}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tool Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start space-x-4">
                {tool.logo_url ? (
                  <Image
                    src={tool.logo_url}
                    alt={`${tool.name} logo`}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500">
                      {tool.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                  <p className="text-xl text-gray-600 mb-4">{tool.tagline}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {tool.rating_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(tool.rating_average)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span>{tool.rating_average.toFixed(1)} ({tool.rating_count} reviews)</span>
                      </div>
                    )}
                    <span>{tool.view_count} views</span>
                    <span>{tool.usage_count} uses</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Visit Website
                </a>
                {tool.demo_url && (
                  <a
                    href={tool.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50"
                  >
                    Try Demo
                  </a>
                )}
                {tool.documentation_url && (
                  <a
                    href={tool.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50"
                  >
                    Documentation
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{tool.description}</p>
              </div>
            </div>

            {/* Screenshots/Media */}
            {tool.media && tool.media.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Screenshots</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.media
                    .filter(media => media.type === 'SCREENSHOT')
                    .map(media => (
                      <Image
                        key={media.id}
                        src={media.url}
                        alt={media.alt_text || 'Screenshot'}
                        width={400}
                        height={300}
                        className="rounded-lg border"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                {session && !isOwner && (
                  <button
                    onClick={() => setIsReviewing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {isReviewing && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 border rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                          className={`w-8 h-8 ${
                            star <= reviewData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        >
                          <svg viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={reviewData.title}
                      onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border-gray-300 rounded-md"
                      placeholder="Brief summary of your experience"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review
                    </label>
                    <textarea
                      value={reviewData.content}
                      onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full border-gray-300 rounded-md"
                      placeholder="Share your detailed experience with this tool"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReviewing(false)}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {tool.reviews && tool.reviews.length > 0 ? (
                  tool.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {review.user?.avatar_url ? (
                            <Image
                              src={review.user.avatar_url}
                              alt={review.user.name || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-500">
                                {review.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {review.user?.name || 'Anonymous'}
                            </span>
                            {review.user?.verified && (
                              <span className="text-blue-500">✓</span>
                            )}
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                          )}
                          {review.content && (
                            <p className="text-gray-700 mb-2">{review.content}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review this tool!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tool Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Information</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Pricing</span>
                  <p className="text-sm text-gray-900">{getPricingLabel(tool.pricing_model)}</p>
                </div>
                
                {tool.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <p className="text-sm text-gray-900">
                      {tool.category.icon} {tool.category.name}
                    </p>
                  </div>
                )}

                {tool.api_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">API Type</span>
                    <p className="text-sm text-gray-900">{tool.api_type}</p>
                  </div>
                )}

                {tool.authentication_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Authentication</span>
                    <p className="text-sm text-gray-900">{tool.authentication_type}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            {tool.tech_stack.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tech_stack.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Creator */}
            {tool.owner && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Created by</h3>
                <div className="flex items-center space-x-3">
                  {tool.owner.avatar_url ? (
                    <Image
                      src={tool.owner.avatar_url}
                      alt={tool.owner.name || 'Creator'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">
                        {tool.owner.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 flex items-center">
                      {tool.owner.name || 'Anonymous'}
                      {tool.owner.verified && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </p>
                    {tool.owner.bio && (
                      <p className="text-sm text-gray-600">{tool.owner.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const { id } = ctx.params!;

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

  if (error || !tool) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      tool,
    },
  };
};
