'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateRepairCost(appointmentId: string, formData: FormData) {
  const supabase = await createClient()
  const cost = formData.get('repair_cost')
  const status = formData.get('status')
  
  if (cost === null || status === null) return { error: 'Faltan datos.' }
  
  const { error } = await supabase
    .from('appointments')
    .update({ repair_cost: Number(cost), status: status as string })
    .eq('id', appointmentId)

  if (error) return { error: error.message }
  
  // Invalidar TODO el cache para que dashboard (con cualquier ?date=) y agendados reflejen el cambio
  revalidatePath('/', 'layout')
  redirect(`/admin/appointments/${appointmentId}`)
}

export async function addRequiredPart(appointmentId: string, formData: FormData) {
  const supabase = await createClient()
  const partName = formData.get('part_name')
  const instructions = formData.get('instructions')
  
  if (!partName) return { error: 'El nombre del repuesto es obligatorio.' }
  
  const { error } = await supabase
    .from('required_parts')
    .insert({
      appointment_id: appointmentId,
      part_name: partName as string,
      instructions: instructions as string
    })

  if (error) return { error: error.message }
  
  revalidatePath(`/admin/appointments/${appointmentId}`)
  return { success: true }
}

export async function deleteRequiredPart(appointmentId: string, partId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('required_parts')
    .delete()
    .eq('id', partId)

  if (error) return { error: error.message }
  
  revalidatePath(`/admin/appointments/${appointmentId}`)
  return { success: true }
}
