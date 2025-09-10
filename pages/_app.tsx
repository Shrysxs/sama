import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { AppProps } from "next/app";
import { useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import '@/styles/globals.css'

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const [supabaseClient] = useState(() => createPagesBrowserClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}

export default MyApp
