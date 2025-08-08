import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Login() {
  const supabase = useSupabaseClient()
  const handleLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({ provider })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <button onClick={() => handleLogin('google')}>Login with Google</button>
      <button onClick={() => handleLogin('github')}>Login with GitHub</button>
    </div>
  )
}
