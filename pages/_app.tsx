import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { AppProps } from "next/app";
import { useEffect, useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import '@/styles/globals.css'

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  // Create the Supabase client only on the client to avoid SSR/build env requirements
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createPagesBrowserClient> | null>(null)
  useEffect(() => {
    setSupabaseClient(createPagesBrowserClient())
  }, [])

  return (
    supabaseClient ? (
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    ) : (
      <Component {...pageProps} />
    )
  )
}

export default MyApp
