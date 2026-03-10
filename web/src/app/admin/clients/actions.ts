'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendWelcomeEmail } from '@/lib/email'

export async function createClientMember(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password || !fullName) {
      return { error: "Nombre completo, email y contraseña son obligatorios." }
    }

    const adminAuthClient = createAdminClient()

    // 1. Crear el usuario en Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Forzamos confirmación sin mandar correo si es creado por el admin
      user_metadata: {
        full_name: fullName,
        phone: phone,
      }
    })

    if (authError || !authData.user) {
      return { error: authError?.message || "Error al registrar cliente en Supabase Auth." }
    }

    // Enviar email de bienvenida con credenciales
    try {
      await sendWelcomeEmail(email, fullName, password)
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError)
    }

    revalidatePath('/admin/clients')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error inesperado al crear cliente." }
  }
}

export async function updateClientMember(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!id || !email || !fullName) {
      return { error: "ID, Nombre y Email son obligatorios para actualizar." }
    }

    const adminAuthClient = createAdminClient()

    // 1. Actualizar datos en Auth (Correo y/o Password)
    const authUpdatePayload: any = { email }
    if (password && password.length >= 6) {
      authUpdatePayload.password = password
    }

    const { error: authError } = await adminAuthClient.auth.admin.updateUserById(
      id,
      authUpdatePayload
    )

    if (authError) {
      return { error: authError.message }
    }

    // 2. Actualizar metadatos en Profiles
    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null
      })
      .eq('id', id)

    if (profileError) {
      return { error: profileError.message }
    }

    revalidatePath('/admin/clients')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al actualizar." }
  }
}

export async function deleteClientMember(formData: FormData) {
  try {
    const id = formData.get('id') as string

    if (!id) return { error: "ID no provisto." }

    const adminAuthClient = createAdminClient()

    // Al eliminar el usuario en Auth, la tabla profiles
    // lo eliminará en cascada porque configuramos ON DELETE CASCADE.
    const { error } = await adminAuthClient.auth.admin.deleteUser(id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/clients')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error inesperado borrando cliente." }
  }
}

export async function updateAdminProfile(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!fullName || !email) {
      return { error: "Nombre y email son obligatorios." }
    }

    const adminAuthClient = createAdminClient()

    // Obtener el admin actual
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado." }

    // Verificar que es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: "No autorizado. Solo el admin puede modificar su perfil." }
    }

    // Actualizar Auth (email + password si se proporcionó)
    const authUpdate: any = { email }
    if (password && password.length >= 6) {
      authUpdate.password = password
    }

    const { error: authError } = await adminAuthClient.auth.admin.updateUserById(user.id, authUpdate)
    if (authError) {
      return { error: "Error actualizando credenciales: " + authError.message }
    }

    // Actualizar perfil
    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null
      })
      .eq('id', user.id)

    if (profileError) {
      return { error: "Error actualizando perfil: " + profileError.message }
    }

    revalidatePath('/admin/clients')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error inesperado actualizando perfil." }
  }
}
