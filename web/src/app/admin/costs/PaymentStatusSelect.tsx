'use client'

import { useTransition } from 'react'
import { updatePaymentStatus } from './actions'

interface Props {
  appointmentId: string
  currentStatus: string
}

export function PaymentStatusSelect({ appointmentId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    startTransition(async () => {
      await updatePaymentStatus(appointmentId, newStatus)
    })
  }

  const baseClasses = "text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none transition-colors cursor-pointer appearance-none text-center"
  
  const statusClasses = 
    currentStatus === 'pagado' 
      ? `bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100`
      : `bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100`

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus || 'por_pagar'}
        onChange={handleChange}
        disabled={isPending}
        className={`${baseClasses} ${statusClasses} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="pagado">Pagado</option>
        <option value="por_pagar">Por Pagar</option>
      </select>
    </div>
  )
}
