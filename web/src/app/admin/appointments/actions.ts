'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const status = formData.get('status') as string
    const repairCost = formData.get('repairCost') as string

    if (!id || !status) {
      return { error: 'ID y Estado son requeridos' }
    }

    const supabase = await createClient()
    
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
