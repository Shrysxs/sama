import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { GetServerSideProps } from 'next';
import type { User } from '@supabase/supabase-js';
import { Tool, Subscription } from '@/types';

type Props = { 
  user: User;
  initialTools: Tool[];
  initialSubscriptions: Subscription[];
};

type UserMetadata = { full_name?: string; avatar_url?: string };

export default function DashboardPage({ user, initialTools, initialSubscriptions }: Props) {
  const supabase = useSupabaseClient();
  const [tools] = useState<Tool[]>(initialTools);
  const [subscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [activeTab, setActiveTab] = useState<'tools' | 'subscriptions' | 'analytics'>('tools');
  const [analytics, setAnalytics] = useState<any>(null);
  
  const userEmail = user.email ?? null;
  const meta = user.user_metadata as UserMetadata | undefined;
  const avatarUrl = meta?.avatar_url ?? null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Ensure a profile row exists for the signed-in user
  useEffect(() => {
    const ensureProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!data) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: (user.user_metadata as UserMetadata)?.full_name ?? '',
          avatar_url: (user.user_metadata as UserMetadata)?.avatar_url ?? ''
        });
      }
    };
    ensureProfile();
  }, [supabase, user]);

  const fetchAnalytics = useCallback(async () => {
    if (tools.length === 0) return;
    try {
      const analyticsData = await Promise.all(
        tools.map(async (tool) => {
          const res = await fetch(`/api/analytics/${tool.id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return { toolId: tool.id, toolName: tool.name, ...data };
        })
      );
      const cleaned = analyticsData.filter(Boolean);
      setAnalytics(cleaned);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [tools]);

  useEffect(() => {
    if (activeTab !== 'analytics') return;
    // Avoid re-fetching if already loaded for current tools set
    if (analytics && Array.isArray(analytics) && analytics.length > 0) return;
    fetchAnalytics();
  }, [activeTab, fetchAnalytics, analytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                href="/discover"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Discover
              </Link>
              <Link
                href="/submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Submit Tool
              </Link>
              <div className="flex items-center space-x-3">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      {userEmail?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your tools, track performance, and grow your micro SaaS business.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tools</p>
                <p className="text-2xl font-semibold text-gray-900">{tools.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tools.filter(t => t.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tools.reduce((sum, tool) => sum + tool.view_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tools.length > 0 
                    ? (tools.reduce((sum, tool) => sum + tool.rating_average, 0) / tools.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'tools', name: 'My Tools', icon: '🛠️' },
                { id: 'subscriptions', name: 'Subscriptions', icon: '💳' },
                { id: 'analytics', name: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'tools' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Your Tools</h2>
                  <Link
                    href="/submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Add New Tool
                  </Link>
                </div>

                {tools.length > 0 ? (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <div key={tool.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {tool.logo_url ? (
                              <Image
                                src={tool.logo_url}
                                alt={`${tool.name} logo`}
                                width={48}
                                height={48}
                                className="rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-lg font-medium text-gray-500">
                                  {tool.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{tool.name}</h3>
                              <p className="text-sm text-gray-600">{tool.tagline}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>{tool.view_count} views</span>
                                <span>{tool.usage_count} uses</span>
                                {tool.rating_count > 0 && (
                                  <span>⭐ {tool.rating_average.toFixed(1)} ({tool.rating_count})</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tool.status)}`}>
                              {tool.status.replace('_', ' ')}
                            </span>
                            <Link
                              href={`/tools/${tool.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </Link>
                            <Link
                              href={`/tools/${tool.id}/edit`}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tools yet</h3>
                    <p className="text-gray-600 mb-6">Get started by submitting your first AI micro SaaS tool.</p>
                    <Link
                      href="/submit"
                      className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
                    >
                      Submit Your First Tool
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Your Subscriptions</h2>
                {subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{subscription.tool?.name}</h3>
                            <p className="text-sm text-gray-600">
                              Status: <span className="capitalize">{subscription.status.toLowerCase()}</span>
                            </p>
                            {subscription.current_period_end && (
                              <p className="text-sm text-gray-600">
                                Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/tools/${subscription.tool_id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Tool
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No active subscriptions</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Analytics Overview</h2>
                {analytics ? (
                  <div className="space-y-6">
                    {analytics.map((data: any) => (
                      <div key={data.toolId} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-4">{data.toolName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-blue-600">{data.total_views || 0}</p>
                            <p className="text-sm text-gray-600">Views</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-green-600">{data.total_clicks || 0}</p>
                            <p className="text-sm text-gray-600">Clicks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-purple-600">{data.total_api_calls || 0}</p>
                            <p className="text-sm text-gray-600">API Calls</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-yellow-600">{data.total_signups || 0}</p>
                            <p className="text-sm text-gray-600">Signups</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-red-600">{data.total_purchases || 0}</p>
                            <p className="text-sm text-gray-600">Purchases</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Loading analytics...</p>
                  </div>
                )}
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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  return {
    props: {
      user: session.user,
      initialTools: [],
      initialSubscriptions: [],
    },
  };
};