'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDailySettings(formData: FormData) {
  const supabase = await createClient()

  const date = formData.get('date') as string
  const max_capacity = Number(formData.get('max_capacity'))
  const start_time = formData.get('start_time') as string || null
  const end_time = formData.get('end_time') as string || null
  const lunch_start_time = formData.get('lunch_start_time') as string || null
  const lunch_end_time = formData.get('lunch_end_time') as string || null
  const is_working_day = formData.get('is_working_day') === 'on'

  if (!date) return { error: 'La fecha es obligatoria.' }

  const { error } = await supabase
    .from('daily_settings')
    .upsert({
      date,
      max_capacity,
      start_time,
      end_time,
      lunch_start_time,
      lunch_end_time,
      is_working_day
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function saveGlobalSettings(formData: FormData) {
  const supabase = await createClient()

  const block_sundays = formData.get('block_sundays') === 'on'

  // Using a dummy date to store global configuration in daily_settings
  const globalSettingDate = '2000-01-01'

  const { error } = await supabase
    .from('daily_settings')
    .upsert({
      date: globalSettingDate,
      is_working_day: !block_sundays, // if blocked, is_working_day is false
      max_capacity: 0, // Not used but required
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}
