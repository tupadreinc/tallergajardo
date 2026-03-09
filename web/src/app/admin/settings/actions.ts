'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDailySettings(formData: FormData) {
  const supabase = await createClient()
  
  const date = formData.get('date') as string
  const max_capacity = Number(formData.get('max_capacity'))
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string
  const is_working_day = formData.get('is_working_day') === 'on'

  if (!date) return { error: 'La fecha es obligatoria.' }

  const { error } = await supabase
    .from('daily_settings')
    .upsert({
      date,
      max_capacity,
      start_time,
      end_time,
      is_working_day
    })

  if (error) return { error: error.message }
  
  revalidatePath('/admin/settings')
  return { success: true }
}
