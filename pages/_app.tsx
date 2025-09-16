import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import '../styles/globals.css';

// Initialize Inter font with specific subsets and weights
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Discover and share AI micro-SaaS tools for developers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <style jsx global>{`
        :root {
          --primary-color: #0066cc;
          --primary-hover: #0052a3;
          --text-primary: #1a1a1a;
          --text-secondary: #4a4a4a;
          --text-muted: #666;
          --border-color: #e5e5e5;
          --bg-color: #ffffff;
          --bg-secondary: #f8f9fa;
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --transition: all 0.2s ease-in-out;
        }
        
        * {
          box-sizing: border-box;
          padding: 0;
          margin: 0;
        }
        
        html,
        body {
          max-width: 100vw;
          overflow-x: hidden;
          font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 
            'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 
            'Helvetica Neue', sans-serif;
          color: var(--text-primary);
          line-height: 1.5;
          background-color: var(--bg-color);
        }
        
        a {
          color: var(--primary-color);
          text-decoration: none;
          transition: var(--transition);
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        button {
          font-family: inherit;
          cursor: pointer;
        }
        
        h1, h2, h3, h4, h5, h6 {
          line-height: 1.2;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 1rem;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Container for content */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Utility classes */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
      
      <div className={`${inter.variable} font-sans`}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </>
  );
}
