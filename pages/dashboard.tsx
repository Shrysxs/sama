import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };
    getUser();
  }, [supabase]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      {userEmail ? <p>Welcome, {userEmail}!</p> : <p>Loading user info...</p>}
    </div>
  );
}