import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Login() {
  const supabase = useSupabaseClient()
  const handleLogin = async (provider: 'google' | 'github') => {
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
      await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    } catch (e) {
      console.error('OAuth sign-in error:', e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <button onClick={() => handleLogin('google')}>Login with Google</button>
      <button onClick={() => handleLogin('github')}>Login with GitHub</button>
    </div>
  )
}
