import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { GetServerSideProps } from 'next';
import type { User } from '@supabase/supabase-js';
import { Category, CreateToolRequest, PricingModel, ApiType, AuthType } from '@/types';

type Props = {
  user: User;
  categories: Category[];
};

export default function SubmitTool({ user, categories }: Props) {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateToolRequest>({
    name: '',
    tagline: '',
    description: '',
    website_url: '',
    demo_url: '',
    api_endpoint: '',
    documentation_url: '',
    github_url: '',
    category_id: '',
    tags: [],
    tech_stack: [],
    api_type: undefined,
    authentication_type: undefined,
    pricing_model: 'FREE',
    pricing_details: {}
  });

  const [tagInput, setTagInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddTechStack = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techStackInput.trim()) {
      e.preventDefault();
      const newTech = techStackInput.trim();
      if (!formData.tech_stack.includes(newTech)) {
        setFormData(prev => ({ ...prev, tech_stack: [...prev.tech_stack, newTech] }));
      }
      setTechStackInput('');
    }
  };

  const handleRemoveTechStack = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(tech => tech !== techToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const tool = await response.json();
        router.push(`/tools/${tool.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit tool');
      }
    } catch (error) {
      console.error('Error submitting tool:', error);
      alert('Failed to submit tool');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Submit Your Tool</h1>
            <p className="mt-1 text-sm text-gray-600">
              Share your AI micro SaaS with the community and start monetizing instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Tool Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AI Content Generator"
                />
              </div>

              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
                  Tagline *
                </label>
                <input
                  type="text"
                  name="tagline"
                  id="tagline"
                  required
                  value={formData.tagline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="One-line description of what your tool does"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of your tool, its features, and benefits"
                />
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category_id"
                  id="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">URLs & Links</h2>
              
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                  Website URL *
                </label>
                <input
                  type="url"
                  name="website_url"
                  id="website_url"
                  required
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourtool.com"
                />
              </div>

              <div>
                <label htmlFor="demo_url" className="block text-sm font-medium text-gray-700">
                  Demo URL
                </label>
                <input
                  type="url"
                  name="demo_url"
                  id="demo_url"
                  value={formData.demo_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://demo.yourtool.com"
                />
              </div>

              <div>
                <label htmlFor="documentation_url" className="block text-sm font-medium text-gray-700">
                  Documentation URL
                </label>
                <input
                  type="url"
                  name="documentation_url"
                  id="documentation_url"
                  value={formData.documentation_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://docs.yourtool.com"
                />
              </div>

              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                  GitHub URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  id="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Technical Details</h2>
              
              <div>
                <label htmlFor="api_endpoint" className="block text-sm font-medium text-gray-700">
                  API Endpoint
                </label>
                <input
                  type="url"
                  name="api_endpoint"
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://api.yourtool.com"
                />
              </div>

              <div>
                <label htmlFor="api_type" className="block text-sm font-medium text-gray-700">
                  API Type
                </label>
                <select
                  name="api_type"
                  id="api_type"
                  value={formData.api_type || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select API type</option>
                  <option value="REST">REST</option>
                  <option value="GraphQL">GraphQL</option>
                  <option value="WebSocket">WebSocket</option>
                  <option value="gRPC">gRPC</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="authentication_type" className="block text-sm font-medium text-gray-700">
                  Authentication Type
                </label>
                <select
                  name="authentication_type"
                  id="authentication_type"
                  value={formData.authentication_type || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select authentication type</option>
                  <option value="API_KEY">API Key</option>
                  <option value="OAuth">OAuth</option>
                  <option value="JWT">JWT</option>
                  <option value="Basic">Basic Auth</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label htmlFor="tech_stack" className="block text-sm font-medium text-gray-700">
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  onKeyDown={handleAddTechStack}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type technology and press Enter (e.g., React, Python, OpenAI)"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tech_stack.map(tech => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTechStack(tech)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Tags & Categories</h2>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type tag and press Enter (e.g., ai, automation, productivity)"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Pricing Model</h2>
              
              <div>
                <label htmlFor="pricing_model" className="block text-sm font-medium text-gray-700">
                  Pricing Model *
                </label>
                <select
                  name="pricing_model"
                  id="pricing_model"
                  required
                  value={formData.pricing_model}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="FREE">Free</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="SUBSCRIPTION">Subscription</option>
                  <option value="PAY_PER_USE">Pay per Use</option>
                  <option value="ONE_TIME">One-time Payment</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Tool'}
              </button>
            </div>
          </form>
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

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return {
    props: {
      user: session.user,
      categories: categories || [],
    },
  };
};
