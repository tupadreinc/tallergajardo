'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  // Setting emailRedirectTo sometimes throws URL Not Allowed if not explicitly configured in Supabase.
  // By default Supabase redirects to its SITE_URL configured in the dashboard.
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    })

    if (error) {
      console.error('Registration Error:', error.message)
      return { error: error.message }
    }
  } catch (err: any) {
    console.error('Server Action Catch:', err.message)
    return { error: "Ocurrió un error inesperado al contactar con el servidor." }
  }

  // We manually attempt to insert into profiles. This depends if supabase auto-confirms or not.
  // If email confirmation is ON, Supabase doesn't fully create the user until confirmed.
  // Instead, the best practice is using a Postgres Trigger on auth.users -> profiles
  // For the sake of this code, we just redirect the user to check their email.
  redirect('/register/success')
}
