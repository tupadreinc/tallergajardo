'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePaymentStatus(appointmentId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ payment_status: status })
    .eq('id', appointmentId)

  if (error) {
    console.error('Error updating payment status:', error)
    throw new Error('No se pudo actualizar el estado de pago')
  }

  revalidatePath('/admin/costs')
}
