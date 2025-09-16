import { useRouter } from 'next/router';
import Link from 'next/link';
import tools from '@/data/tools.json';

type Tool = { 
  id: string; 
  name: string; 
  description: string;
  website_url?: string;
  github_url?: string;
  category?: string;
  tags?: string[];
  created_at?: string;
};

export default function ToolDetail() {
  const router = useRouter();
  const { id } = router.query;
  const list = tools as Tool[];
  const tool = list.find(t => t.id === String(id));

  if (!tool) {
    return (
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#1a1a1a'
        }}>
          Tool Not Found
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '1.5rem',
          lineHeight: 1.6
        }}>
          The tool you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          href="/discover"
          style={{
            display: 'inline-block',
            backgroundColor: '#0066cc',
            color: 'white',
            padding: '0.8rem 1.6rem',
            borderRadius: 4,
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0052a3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0066cc')}
        >
          Browse All Tools
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <Link 
        href="/discover" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#0066cc',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          fontSize: '0.95rem'
        }}
      >
        <span style={{ marginRight: '0.5rem' }}>←</span> Back to Discover
      </Link>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              margin: '0 0 0.5rem 0',
              color: '#1a1a1a'
            }}>
              {tool.name}
            </h1>
            
            {tool.category && (
              <span style={{
                display: 'inline-block',
                backgroundColor: '#f0f7ff',
                color: '#0066cc',
                padding: '0.25rem 0.75rem',
                borderRadius: 12,
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '1rem'
              }}>
                {tool.category}
              </span>
            )}
          </div>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: '#333',
            margin: 0
          }}>
            {tool.description}
          </p>

          {(tool.website_url || tool.github_url) && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}>
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#f0f7ff',
                    color: '#0066cc',
                    padding: '0.5rem 1rem',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0efff')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f7ff')}
                >
                  <span style={{ marginRight: '0.5rem' }}>🌐</span> Visit Website
                </a>
              )}
              
              {tool.github_url && (
                <a
                  href={tool.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    padding: '0.5rem 1rem',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#eaeaea')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                >
                  <span style={{ marginRight: '0.5rem' }}>💻</span> View on GitHub
                </a>
              )}
            </div>
          )}

          {tool.tags && tool.tags.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {tool.tags.map((tag, index) => (
                  <span 
                    key={index}
                    style={{
                      backgroundColor: '#f0f0f0',
                      color: '#555',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 12,
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderTop: '1px solid #eaeaea',
        fontSize: '0.9rem',
        color: '#777'
      }}>
        <div>
          {tool.created_at && (
            <span>Added on {new Date(tool.created_at).toLocaleDateString()}</span>
          )}
        </div>
        <div>
          <Link 
            href="/discover" 
            style={{
              color: '#0066cc',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <span style={{ marginRight: '0.25rem' }}>←</span> Back to all tools
          </Link>
        </div>
      </div>
    </div>
  );
}
