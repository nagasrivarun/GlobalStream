import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a single supabase client for client-side usage
export const createClient = () => {
  return createClientComponentClient<Database>()
}
