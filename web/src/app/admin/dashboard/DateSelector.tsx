'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar as CalendarIcon } from 'lucide-react'

export function DateSelector({ currentDate }: { currentDate: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (newDate) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('date', newDate)
      router.push(`?${params.toString()}`)
    } else {
      router.push('?')
    }
  }

  return (
    <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full text-text-secondary border border-slate-200">
      <CalendarIcon size={16} className="mr-2 text-emerald-600" />
      <input 
        type="date" 
        value={currentDate} 
        onChange={handleDateChange}
        className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
      />
    </div>
  )
}
