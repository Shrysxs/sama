import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { GetServerSideProps } from 'next';
import type { User } from '@supabase/supabase-js';

type Props = { user: User };

export default function DashboardPage({ user }: Props) {
  const supabase = useSupabaseClient();
  const userEmail = user.email ?? null;
  const meta = user.user_metadata as { avatar_url?: string } | undefined;
  const avatarUrl = meta?.avatar_url ?? null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // A hard redirect avoids any stale state
    window.location.href = '/';
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
    },
  };
};