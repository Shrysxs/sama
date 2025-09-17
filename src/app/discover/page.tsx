import { Suspense } from 'react';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/lib/data';

export default function DiscoverPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover AI Tools</h1>
        <p className="text-gray-600">
          Browse our collection of AI tools and micro-SaaS products
        </p>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <Suspense fallback={<div>Loading tools...</div>}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}
