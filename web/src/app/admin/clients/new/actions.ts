'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientUser(formData: FormData) {
  // Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS and Auth rate limits without logging out the admin
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  // Create User in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  // Fallback to standard signUp if Admin API fails due to missing service_role key
  let userId = authData?.user?.id
  
  if (authError && !userId) {
    console.warn("Fallo admin.createUser, intentando signUp estándar (esto podría desloguear al admin):", authError.message)
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    })
    
    if (signUpError) {
      return { error: 'No se pudo crear el usuario en Auth: ' + signUpError.message }
    }
    userId = signUpData.user?.id
  }

  if (!userId) return { error: 'Error desconocido al crear usuario.' }

  // Create Profile manually if trigger doesn't exist
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    phone: phone,
    role: 'cliente'
  })

  if (profileError) {
    return { error: 'Usuario Auth creado, pero falló el perfil: ' + profileError.message }
  }

  revalidatePath('/admin/dashboard')
  redirect('/admin/dashboard')
}
