'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendStatusEmail } from '@/lib/email'

export async function updateAppointmentStatus(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const status = formData.get('status') as string
    const repairCost = formData.get('repairCost') as string

    if (!id || !status) {
      return { error: 'ID y Estado son requeridos' }
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'No autorizado. Debes iniciar sesión.' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'No autorizado. Permisos insuficientes.' }
    }
    
    const { error } = await supabase
      .from('appointments')
      .update({
         status,
         repair_cost: repairCost ? parseFloat(repairCost) : 0
      })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    // Traer cita con perfil para saber email
    const { data: updatedApp } = await supabase
      .from('appointments')
      .select('date, profiles(full_name, id)')
      .eq('id', id)
      .single()
      
    if (updatedApp?.profiles) {
       const profile = Array.isArray(updatedApp.profiles) ? updatedApp.profiles[0] : updatedApp.profiles
       if (profile) {
         // get user email from admin RPC
         const { data: userEmail } = await supabase.rpc('get_user_email', { user_id: profile.id })
         if (userEmail) {
           await sendStatusEmail(userEmail, status, updatedApp.date, profile.full_name)
         }
       }
    }

    revalidatePath('/admin/appointments')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error inesperado al actualizar la cita' }
  }
}

export async function deleteAppointment(formData: FormData) {
  try {
    const id = formData.get('id') as string
    
    if (!id) return { error: 'ID requerido' }

    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'No autorizado. Debes iniciar sesión.' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'No autorizado. Permisos insuficientes.' }
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
       return { error: error.message }
    }

    revalidatePath('/admin/appointments')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error al eliminar cita' }
  }
}
