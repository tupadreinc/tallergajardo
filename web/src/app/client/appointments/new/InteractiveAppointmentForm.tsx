'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { getAvailableHours } from './actions'

type Props = {
  todayStr: string
  maxDateStr: string
}

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export function InteractiveAppointmentForm({ todayStr, maxDateStr }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  
  const [unavailableHours, setUnavailableHours] = useState<string[]>([])
  const [isLoadingHours, setIsLoadingHours] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Effect to fetch available hours when date changes
  useEffect(() => {
    if (!selectedDate) {
      setUnavailableHours([])
      return
    }

    async function fetchHours() {
      setIsLoadingHours(true)
      setSelectedTime('') // Reset time when date changes
      
      const { lockedTimes, error } = await getAvailableHours(selectedDate)
      
      if (error) {
        setErrorMsg(error)
        setUnavailableHours(timeSlots) // Bloquea todo si hay error (ej. cupo maximo o feriado)
      } else {
        setErrorMsg(null)
        setUnavailableHours(lockedTimes || [])
      }
      
      setIsLoadingHours(false)
    }

    fetchHours()
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('date', selectedDate)
    formData.append('time', selectedTime)

    // Dynamic import to avoid circular dependencies if any in client component
    const { createClientAppointment } = await import('./actions')
    
    // Si res.error no viene es porque el Action redirigió con success
    const res = await createClientAppointment(formData)
    
    if (res?.error) {
       setErrorMsg(res.error)
       setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
           <AlertCircle size={16} />
           <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
           <CalendarDays className="text-accent-primary" size={20} />
           <h2 className="font-display font-semibold text-lg text-slate-900">1. Selecciona el Día</h2>
        </div>
        <p className="text-sm text-text-muted mb-2">Solo disponible de Lunes a Viernes entre las fechas permitidas. Cupos sujetos a validación de taller.</p>
        
        <input 
          type="date" name="date" required
          min={todayStr}
          max={maxDateStr}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary w-full md:w-1/2 transition-colors cursor-pointer"
        />
      </div>

      <div className={`flex flex-col gap-4 transition-opacity duration-300 ${!selectedDate ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
           <div className="flex items-center gap-2">
             <Clock className="text-warning" size={20} />
             <h2 className="font-display font-semibold text-lg text-slate-900">2. Hora de Ingreso</h2>
           </div>
           {isLoadingHours && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
        </div>
        
        {!selectedDate && (
          <p className="text-sm text-amber-600">Por favor, selecciona primero un día calendario arriba.</p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {timeSlots.map((time) => {
            const isLocked = unavailableHours.includes(`${time}:00`) || unavailableHours.includes(time)
            
            return (
              <label key={time} className={`relative ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input 
                  type="radio" 
                  name="time" 
                  value={`${time}:00`} 
                  className="peer sr-only" 
                  required 
                  disabled={isLocked}
                  checked={selectedTime === `${time}:00`}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
                <div className={`
                  rounded-xl border py-3 text-center text-sm font-medium transition-all
                  ${isLocked 
                    ? 'border-red-100 bg-red-50 text-red-300' 
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 peer-checked:border-accent-primary peer-checked:bg-emerald-500/10 peer-checked:text-accent-primary'}
                `}>
                  {time}
                </div>
                {isLocked && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center border border-white">
                    <span className="text-[10px] text-red-500 font-bold">×</span>
                  </div>
                )}
              </label>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className="cta-button py-3 px-8 rounded-xl bg-success hover:bg-success/80 border-none shadow-lg shadow-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          <span>{isSubmitting ? 'Buscando cupo...' : 'Confirmar Reserva'}</span>
        </button>
      </div>
    </form>
  )
}
