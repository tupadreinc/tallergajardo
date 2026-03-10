'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendWelcomeEmail } from '@/lib/email'

export async function createClientUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  if (!email || !password || !fullName) {
    return { error: "Nombre completo, email y contraseña son obligatorios." }
  }

  try {
    const adminAuthClient = createAdminClient()

    // Create User in Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || null
      }
    })

    if (authError || !authData.user) {
      console.error("Fallo admin.createUser:", authError?.message)
      return { error: 'No se pudo crear el usuario en Auth: ' + (authError?.message || 'Error desconocido') }
    }

    // Enviar email de bienvenida con credenciales
    try {
      await sendWelcomeEmail(email, fullName, password)
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError)
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/clients')

  } catch (error: any) {
    console.error("Error inesperado en createClientUser:", error)
    return { error: "Error inesperado: " + error.message }
  }

  redirect('/admin/dashboard')
}
