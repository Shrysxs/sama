import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '1rem',
        color: '#1a1a1a'
      }}>
        Welcome to Sama.dev
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        color: '#333',
        marginBottom: '2rem',
        lineHeight: 1.6
      }}>
        Discover and share AI micro SaaS tools. 
        Our platform helps you find the perfect tools to boost your productivity.
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
          fontSize: '1.1rem',
          fontWeight: 500,
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0052a3')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0066cc')}
      >
        Explore Tools
      </Link>
      
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        textAlign: 'left'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: '#1a1a1a'
        }}>
          Why Sama.dev?
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {[
            '✓ Find vetted AI tools for developers',
            '✓ Share your own tools with the community',
            '✓ Get insights on tool performance and usage'
          ].map((item, index) => (
            <li key={index} style={{
              padding: '0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
