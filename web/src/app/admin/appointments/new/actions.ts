'use server'

import { createClient, isAdminUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAdminAppointment(formData: FormData) {
    if (!(await isAdminUser())) return { error: 'No autorizado' }

    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    if (!client_id || !date || !time) return { error: 'Debes seleccionar cliente, fecha y hora.' }

    // Count existing appointments for this date
    const { data: settings } = await supabase
        .from('daily_settings')
        .select('max_capacity, is_working_day, start_time, end_time, date')
        .in('date', [date, '2000-01-01'])

    const dateSettings = settings?.find(s => s.date !== '2000-01-01')
    const globalSettings = settings?.find(s => s.date === '2000-01-01')

    const isSunday = new Date(date).getUTCDay() === 0
    const blockSundays = globalSettings ? !globalSettings.is_working_day : false
    if (isSunday && blockSundays) {
        return { error: 'El taller no atiende este domingo (bloqueado globalmente).' }
    }

    const maxCapacity = dateSettings?.max_capacity ?? 8
    const isWorking = dateSettings?.is_working_day ?? true

    if (!isWorking || maxCapacity === 0) {
        return { error: 'El taller tiene configurado este día como no laboral, pero como administrador puedes intentar forzarlo si actualizas la configuración primero.' }
    }

    const { count: bookedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', date)
        .in('status', ['pending', 'completed', 'confirmed'])

    if (bookedCount !== null && bookedCount >= maxCapacity) {
        return { error: 'No hay cupos disponibles según la capacidad total asignada a este día.' }
    }

    const startStr = dateSettings?.start_time ? dateSettings.start_time.substring(0, 5) : "09:00"
    const endStr = dateSettings?.end_time ? dateSettings.end_time.substring(0, 5) : "18:00"

    const startHour = parseInt(startStr.split(':')[0], 10)
    let endHour = parseInt(endStr.split(':')[0], 10)
    if (endStr.endsWith(':30') || endStr.endsWith(':59') || parseInt(endStr.split(':')[1], 10) > 0) {
        endHour += 1;
    }
    const totalHours = Math.max(1, endHour - startHour)
    const capacityPerHour = Math.ceil(maxCapacity / totalHours)

    const { count: slotBookedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', date)
        .eq('time', time)
        .in('status', ['pending', 'completed', 'confirmed'])

    if (slotBookedCount !== null && slotBookedCount >= capacityPerHour) {
        return { error: 'Este cupo horario ya alcanzó la capacidad máxima.' }
    }

    // Insert appointment
    const { error } = await supabase
        .from('appointments')
        .insert({
            client_id,
            date,
            time,
            status: 'pending' // As it's manual, we keep it pending, or we could set to confirmed.
        })

    if (error) {
        if (error.code === '23505') return { error: 'Ese cupo horario acaba de ser ocupado.' }
        return { error: error.message }
    }

    revalidatePath('/admin/dashboard')
    redirect('/admin/dashboard')
}
