import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Home() {
  const session = useSession()
  const router = useRouter()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (session) {
      router.replace('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({ provider })
  }

  return (
    <div className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen grid place-items-center p-8`}>
      <main className="flex flex-col gap-4 items-center text-center max-w-xl">
        <Image className="dark:invert" src="/next.svg" alt="Sama" width={140} height={30} />
        <h1 className="text-3xl font-semibold">Sama</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Build tools fast. Validate faster. Sign in to start building.
        </p>
        <div className="flex gap-3 mt-4">
          <button className="rounded-md border px-4 py-2" onClick={() => handleLogin('github')}>Sign in with GitHub</button>
          <button className="rounded-md border px-4 py-2" onClick={() => handleLogin('google')}>Sign in with Google</button>
        </div>
      </main>
    </div>
  )
}
