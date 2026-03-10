'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function CostBreakdown({
  appointments,
  totalFormatted
}: {
  appointments: any[]
  totalFormatted: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-4xl hover:scale-105 transition-transform cursor-pointer font-display font-bold text-success break-all text-center hover:opacity-80"
      >
        {totalFormatted}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="text-sm font-semibold mb-3 text-slate-700 flex justify-between border-b pb-2">
            <span>Fecha</span>
            <span>Costo</span>
          </h4>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
            {appointments.filter(app => (app.repair_cost || 0) > 0).map(app => (
              <div key={app.id} className="flex justify-between items-center text-sm">
                <span className="text-slate-500 capitalize">
                  {format(new Date(`${app.date}T${app.time}`), 'dd MMM yyyy', { locale: es })}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatter.format(app.repair_cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
