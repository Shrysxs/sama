# Environment configuration

This app uses Supabase and expects the following environment variables (set in local `.env.local` and in Vercel Project Settings → Environment Variables):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Notes:
- Do not access `process.env` inside React components directly. We initialize Supabase on the client in `pages/_app.tsx` using `createPagesBrowserClient()` from `@supabase/auth-helpers-nextjs`.
- Server-side API routes and `getServerSideProps` use `createPagesServerClient()` and will read cookies from the request/response.

## Local development
1) Create `.env.local` at the repo root with the variables above.
2) Install and run:
   - npm install
   - npm run dev

## Vercel deployment
- Framework preset: Next.js (Pages Router)
- Build command: npm run build (default)
- Output: .next (default)
- Environment Variables: add the two Supabase variables for the Production environment. If you also use Preview/Development, add there as needed.

After setting env vars, push to GitHub and import the repo in Vercel.
