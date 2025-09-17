import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  website_url?: string;
  github_url?: string;
  created_at?: string;
}

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            <Link href={`/tools/${tool.id}`} className="hover:text-indigo-600">
              {tool.name}
            </Link>
          </h3>
          {tool.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {tool.category}
            </span>
          )}
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          {tool.description.length > 100
            ? `${tool.description.substring(0, 100)}...`
            : tool.description}
        </p>
        
        {tool.tags && tool.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500">
                +{tool.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex space-x-3">
            {tool.website_url && (
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-900"
                onClick={(e) => e.stopPropagation()}
              >
                Website
              </a>
            )}
            {tool.github_url && (
              <a
                href={tool.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                Code
              </a>
            )}
          </div>
          
          {tool.created_at && (
            <span className="text-xs text-gray-500">
              {new Date(tool.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
