'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendNewAppointmentToAdmin } from '@/lib/email'

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
    .select('max_capacity, is_working_day, start_time, end_time, date')
    .in('date', [date, '2000-01-01'])

  const dateSettings = settings?.find(s => s.date !== '2000-01-01')
  const globalSettings = settings?.find(s => s.date === '2000-01-01')

  const isSunday = new Date(date).getUTCDay() === 0
  const blockSundays = globalSettings ? !globalSettings.is_working_day : false
  if (isSunday && blockSundays) {
    return { error: 'El taller no atiende los domingos.' }
  }

  const maxCapacity = dateSettings?.max_capacity ?? 8
  const isWorking = dateSettings?.is_working_day ?? true

  if (!isWorking || maxCapacity === 0) {
    return { error: 'El taller no recibe vehículos en la fecha seleccionada.' }
  }

  // Calculate capacity per hour slot (Dynamic)
  const startStr = dateSettings?.start_time ? dateSettings.start_time.substring(0, 5) : "09:00"
  const endStr = dateSettings?.end_time ? dateSettings.end_time.substring(0, 5) : "18:00"

  const startHour = parseInt(startStr.split(':')[0], 10)
  let endHour = parseInt(endStr.split(':')[0], 10)
  if (endStr.endsWith(':30') || endStr.endsWith(':59') || parseInt(endStr.split(':')[1], 10) > 0) {
    endHour += 1;
  }
  const totalHours = Math.max(1, endHour - startHour)
  const capacityPerHour = Math.ceil(maxCapacity / totalHours)

  // Validate total day capacity
  const { count: bookedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .in('status', ['pending', 'completed', 'confirmed'])

  if (bookedCount !== null && bookedCount >= maxCapacity) {
    return { error: 'No hay cupos disponibles. La agenda está llena para este día.' }
  }

  // Validate slot capacity
  const { count: slotBookedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .eq('time', time)
    .in('status', ['pending', 'completed', 'confirmed'])

  if (slotBookedCount !== null && slotBookedCount >= capacityPerHour) {
    return { error: 'Este cupo horario alcanzó su límite de vehículos. Selecciona otro.' }
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
    return { error: error.message }
  }

  // Notificar al admin por email
  try {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (adminProfile) {
      const { data: adminEmail } = await supabase.rpc('get_user_email', { user_id: adminProfile.id })
      if (adminEmail) {
        await sendNewAppointmentToAdmin(
          adminEmail,
          clientProfile?.full_name || 'Cliente',
          date,
          time
        )
      }
    }
  } catch (emailError) {
    // No bloquear el flujo si falla el email
    console.error('Error enviando notificación al admin:', emailError)
  }

  revalidatePath('/client/dashboard')
  redirect('/client/dashboard')
}

export async function getAvailableHours(date: string) {
  try {
    const supabase = await createClient()

    // Check Settings / Capacity + Global
    const { data: settings } = await supabase
      .from('daily_settings')
      .select('max_capacity, is_working_day, start_time, end_time, lunch_start_time, lunch_end_time, date')
      .in('date', [date, '2000-01-01'])

    const dateSettings = settings?.find(s => s.date !== '2000-01-01')
    const globalSettings = settings?.find(s => s.date === '2000-01-01')

    const isSunday = new Date(date).getUTCDay() === 0
    const blockSundays = globalSettings ? !globalSettings.is_working_day : false

    if (isSunday && blockSundays) {
      return {
        error: 'El taller no atiende los domingos.',
        lockedTimes: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        hiddenTimes: [],
        timeSlots: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(t => t.substring(0, 5))
      }
    }

    const maxCapacity = dateSettings?.max_capacity ?? 8
    const isWorking = dateSettings?.is_working_day ?? true

    if (!isWorking || maxCapacity === 0) {
      // NOTE: Si no atiende, no retornamos un error destructivo que rompa el form.
      // Simplemente retornamos el día como deshabilitado pero con todos los slots.
      // Así el form del cliente se bloquea por capacidad, pero el administrador puede verlo y forzarlo
      // gracias al bypass visual.
      return {
        error: 'El taller no recibe vehículos regulares en la fecha seleccionada.',
        lockedTimes: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        hiddenTimes: [],
        timeSlots: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(t => t.substring(0, 5))
      }
    }

    const startStr = dateSettings?.start_time ? dateSettings.start_time.substring(0, 5) : "09:00"
    const endStr = dateSettings?.end_time ? dateSettings.end_time.substring(0, 5) : "18:00"
    const lunchStartStr = dateSettings?.lunch_start_time ? dateSettings.lunch_start_time.substring(0, 5) : null
    const lunchEndStr = dateSettings?.lunch_end_time ? dateSettings.lunch_end_time.substring(0, 5) : null

    const startHour = parseInt(startStr.split(':')[0], 10)
    let endHour = parseInt(endStr.split(':')[0], 10)
    if (endStr.endsWith(':30') || endStr.endsWith(':59') || parseInt(endStr.split(':')[1], 10) > 0) {
      endHour += 1;
    }
    const totalHours = Math.max(1, endHour - startHour)
    const capacityPerHour = Math.ceil(maxCapacity / totalHours)

    // Generate dynamic slots based on start and end hours (max bounds)
    const allTimeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

    // Fetch specifically the occupied times for that date (regardless of user, but only pending/completed/confirmed)
    const { data: bookedTimes, error } = await supabase
      .from('appointments')
      .select('time')
      .eq('date', date)
      .in('status', ['pending', 'completed', 'confirmed']) // Cancelled times are free again

    if (error) {
      console.error("Error validando horas", error)
      return { error: 'Error recargando disponibilidad.', lockedTimes: [], hiddenTimes: [], timeSlots: [] }
    }

    // Check if total day is full
    if (bookedTimes.length >= maxCapacity) {
      // Retornar error amistoso y enviar todos los slots como locked para apagar los botones
      return {
        error: 'No hay cupos disponibles. La agenda está llena para este día.',
        lockedTimes: allTimeSlots,
        hiddenTimes: [],
        timeSlots: allTimeSlots.map(t => t.substring(0, 5))
      }
    }

    // Count bookings per slot
    const bookingsCountPerSlot: Record<string, number> = {}
    bookedTimes.forEach(row => {
      const slot = row.time.substring(0, 5) + ':00'
      bookingsCountPerSlot[slot] = (bookingsCountPerSlot[slot] || 0) + 1
    })

    const lockedTimes: string[] = []

    // Lock slots that reached capacity
    Object.entries(bookingsCountPerSlot).forEach(([slot, count]) => {
      if (count >= capacityPerHour) {
        lockedTimes.push(slot)
      }
    })

    const hiddenTimes: string[] = []

    // Incorporate start, end, and lunch times
    allTimeSlots.forEach(slot => {
      // Validar si el slot está antes del inicio o en/después del fin
      if (slot < startStr || slot >= endStr) {
        hiddenTimes.push(`${slot}`)
      }

      // Validar si el slot cae en horario de colación
      if (lunchStartStr && lunchEndStr) {
        if (slot >= lunchStartStr && slot < lunchEndStr) {
          hiddenTimes.push(`${slot}`)
        }
      }
    })

    // Prepare timeSlots to send to frontend (only visual logic needed)
    // Send standard format like "09:00", "10:00" ...
    const generatedTimeSlots = allTimeSlots.map(t => t.substring(0, 5))

    return { lockedTimes, hiddenTimes, timeSlots: generatedTimeSlots }

  } catch (error: any) {
    return { error: error.message || 'Error inesperado consultando disponibilidad.', lockedTimes: [], hiddenTimes: [], timeSlots: [] }
  }
}
