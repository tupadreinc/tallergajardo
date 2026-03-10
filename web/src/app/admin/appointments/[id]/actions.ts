'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendStatusEmail, sendPartRequestEmail } from '@/lib/email'

export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/admin/appointments')
}

export async function updateRepairCost(appointmentId: string, formData: FormData) {
  const supabase = await createClient()
  const cost = formData.get('repair_cost')
  const status = formData.get('status')
  const repair_description = formData.get('repair_description')

  if (cost === null || status === null) return { error: 'Faltan datos.' }

  const { error } = await supabase
    .from('appointments')
    .update({
      repair_cost: Number(cost),
      status: status as string,
      repair_description: repair_description as string || null
    })
    .eq('id', appointmentId)

  if (error) return { error: error.message }

  // Enviar correo de actualización de estado
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
        await sendStatusEmail(userEmail, status as string, appData.date, profile.full_name)
      }
    }
  }

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
        await sendPartRequestEmail(userEmail, partName as string, appData.date, profile.full_name)
      }
    }
  }

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
