import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { AppProps } from "next/app";
import { supabase } from '@/utils/supabase-client'
import '@/styles/globals.css'

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}

export default MyApp
