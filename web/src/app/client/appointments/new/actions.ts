'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAppointment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const date = formData.get('date') as string
  const time = formData.get('time') as string

  if (!date || !time) return { error: 'Debes seleccionar fecha y hora.' }

  // Check Settings / Capacity
  const { data: settings } = await supabase
    .from('daily_settings')
    .select('max_capacity, is_working_day')
    .eq('date', date)
    .single()

  const maxCapacity = settings?.max_capacity ?? 8
  const isWorking = settings?.is_working_day ?? true

  if (!isWorking || maxCapacity === 0) {
    return { error: 'El taller no recibe vehículos en la fecha seleccionada.' }
  }

  // Count existing appointments for this date
  const { count: bookedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)

  if (bookedCount !== null && bookedCount >= maxCapacity) {
    return { error: 'No hay cupos disponibles. La agenda está llena para este día.' }
  }

  // Insert appointment
  const { error } = await supabase
    .from('appointments')
    .insert({
      client_id: user.id,
      date,
      time,
      status: 'pending'
    })

  if (error) {
    if (error.code === '23505') return { error: 'Ese cupo horario acaba de ser ocupado por alguien más.' }
    return { error: error.message }
  }


  revalidatePath('/client/dashboard')
  redirect('/client/dashboard')
}

export async function getAvailableHours(date: string) {
  try {
    const supabase = await createClient()

    // Check Settings / Capacity
    const { data: settings } = await supabase
      .from('daily_settings')
      .select('max_capacity, is_working_day, start_time, end_time, lunch_start_time, lunch_end_time')
      .eq('date', date)
      .single()

    const maxCapacity = settings?.max_capacity ?? 8
    const isWorking = settings?.is_working_day ?? true

    if (!isWorking || maxCapacity === 0) {
      return { error: 'El taller no recibe vehículos en la fecha seleccionada.', lockedTimes: [] }
    }

    // Fetch specifically the occupied times for that date (regardless of user, but only pending/completed/confirmed)
    const { data: bookedTimes, error } = await supabase
      .from('appointments')
      .select('time')
      .eq('date', date)
      .in('status', ['pending', 'completed', 'confirmed']) // Cancelled times are free again

    if (error) {
      console.error("Error validando horas", error)
      return { error: 'Error recargando disponibilidad.', lockedTimes: [], hiddenTimes: [] }
    }

    // Check if total day is full (e.g > 8 cars)
    if (bookedTimes.length >= maxCapacity) {
      return { error: 'No hay cupos disponibles. La agenda está llena para este día.', lockedTimes: [], hiddenTimes: [] }
    }

    const lockedTimes = bookedTimes.map(row => row.time.substring(0, 5) + ':00') // normalize just in case
    const hiddenTimes: string[] = []

    // Incorporate start, end, and lunch times
    const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    const startStr = settings?.start_time ? settings.start_time.substring(0, 5) : "09:00"
    const endStr = settings?.end_time ? settings.end_time.substring(0, 5) : "18:00"
    const lunchStartStr = settings?.lunch_start_time ? settings.lunch_start_time.substring(0, 5) : null
    const lunchEndStr = settings?.lunch_end_time ? settings.lunch_end_time.substring(0, 5) : null

    allTimeSlots.forEach(slot => {
      // Validar si el slot está antes del inicio o en/después del fin
      if (slot < startStr || slot >= endStr) {
        hiddenTimes.push(`${slot}:00`)
      }

      // Validar si el slot cae en horario de colación
      if (lunchStartStr && lunchEndStr) {
        if (slot >= lunchStartStr && slot < lunchEndStr) {
          hiddenTimes.push(`${slot}:00`)
        }
      }
    })

    return { lockedTimes, hiddenTimes }

  } catch (error: any) {
    return { error: error.message || 'Error inesperado consultando disponibilidad.', lockedTimes: [] }
  }
}
