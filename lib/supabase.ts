import { createClient } from "@supabase/supabase-js"

// Create a singleton Supabase client for the browser
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseBrowserClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabaseClient
}

// Create a Supabase client for server-side operations
export const getSupabaseServerClient = () => {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}
