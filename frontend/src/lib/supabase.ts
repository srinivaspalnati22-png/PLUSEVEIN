import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wxucgspsyekiwbxjjrnw.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dWNnc3BzeWVraXdieGpqcm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzkyMDAsImV4cCI6MjEwMTY1NTIwMH0.4KO5Ru2TtfcWTpjHlyAbgLeAjlC1Bf8REl-r05lhnOQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
