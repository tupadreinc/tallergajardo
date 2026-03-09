import { createClient } from '@supabase/supabase-js'

// Cliente Supabase privilegiado (Service Role)
// IMPORTANTE: Nunca usar en componentes de cliente (browser). Solo en Server Actions.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Faltan credenciales de entorno para Supabase Admin (URL o SERVICE_ROLE_KEY).')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
