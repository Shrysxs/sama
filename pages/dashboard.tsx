import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // If no session after hydration, redirect to landing for MVP protection
    if (session === null) {
      router.replace('/');
      return;
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      const meta = user?.user_metadata as { avatar_url?: string } | undefined;
      setAvatarUrl(meta?.avatar_url ?? null);
    };
    getUser();
  }, [supabase, session, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      {userEmail ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" width={40} height={40} style={{ borderRadius: '50%' }} />
          ) : null}
          <p>Welcome, {userEmail}!</p>
          <button onClick={handleLogout} style={{ marginLeft: 'auto', padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6 }}>Log out</button>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed #ccc', borderRadius: 8 }}>
        <p>Tool Builder UI placeholder</p>
      </div>
    </div>
  );
}