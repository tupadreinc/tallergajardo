'use server'

import { createClient, isAdminUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPartRequestEmail } from '@/lib/email'

export async function createRequiredPart(formData: FormData) {
  try {
    const appointmentId = formData.get('appointmentId') as string
    const partName = formData.get('partName') as string
    const requiredDate = formData.get('requiredDate') as string
    const instructions = formData.get('instructions') as string

    if (!appointmentId || !partName || !requiredDate) {
      return { error: 'Cita, Nombre del Repuesto y Fecha Requerida son obligatorios.' }
    }

    if (!(await isAdminUser())) {
      return { error: 'No autorizado: Se requiere rol de administrador' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('required_parts')
      .insert({
        appointment_id: appointmentId,
        part_name: partName,
        required_date: requiredDate,
        instructions: instructions || null
      })

    if (error) {
      return { error: error.message }
    }

    // Enviar correo de repuesto requerido
    const { data: appData } = await supabase
      .from('appointments')
      .select('date, profiles(full_name, id)')
      .eq('id', appointmentId)
      .single()

    if (appData?.profiles) {
      const profile = Array.isArray(appData.profiles) ? appData.profiles[0] : appData.profiles
      if (profile) {
        const { data: userEmail } = await supabase.rpc('get_user_email', { user_id: profile.id })
        if (userEmail) {
          await sendPartRequestEmail(userEmail, partName, appData.date, profile.full_name)
        }
      }
    }

    revalidatePath('/admin/parts')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error inesperado al registrar el repuesto.' }
  }
}

export async function deleteRequiredPart(formData: FormData) {
  try {
    const id = formData.get('id') as string

    if (!id) return { error: 'ID requerido' }

    if (!(await isAdminUser())) {
      return { error: 'No autorizado: Se requiere rol de administrador' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('required_parts')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/parts')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error al eliminar repuesto' }
  }
}
