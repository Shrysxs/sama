import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Discover AI Tools & Micro-SaaS
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Find the perfect AI tools and micro-SaaS products for your workflow.
      </p>
      <div className="space-x-4">
        <Link
          href="/discover"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Browse Tools
        </Link>
        <Link
          href="/submit"
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Submit Your Tool
        </Link>
      </div>
    </div>
  );
}
