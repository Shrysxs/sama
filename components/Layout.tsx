import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/"><strong>Sama.dev</strong></Link>
          <span style={{ opacity: 0.4 }}>|</span>
          <Link href="/discover">Discover</Link>
          <Link href="/submit">Submit</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid #e5e5e5', padding: '12px 16px', textAlign: 'center' }}>
        <small>© {new Date().getFullYear()} Sama.dev</small>
      </footer>
    </div>
  );
}
