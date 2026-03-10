'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAdminAppointment(formData: FormData) {
    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    if (!client_id || !date || !time) return { error: 'Debes seleccionar cliente, fecha y hora.' }

    // Count existing appointments for this date
    const { data: settings } = await supabase
        .from('daily_settings')
        .select('max_capacity, is_working_day')
        .eq('date', date)
        .single()

    const maxCapacity = settings?.max_capacity ?? 8
    const isWorking = settings?.is_working_day ?? true

    if (!isWorking || maxCapacity === 0) {
        return { error: 'El taller tiene configurado este día como no laboral, pero como administrador puedes intentar forzarlo si actualizas la configuración primero.' }
    }

    const { count: bookedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', date)

    if (bookedCount !== null && bookedCount >= maxCapacity) {
        return { error: 'No hay cupos disponibles según la capacidad asignada a este día.' }
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
