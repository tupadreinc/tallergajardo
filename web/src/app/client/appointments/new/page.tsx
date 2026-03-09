import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format, addDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { InteractiveAppointmentForm } from './InteractiveAppointmentForm'

const TIMEZONE = 'America/Santiago'

export default async function NewAppointmentPage() {
  const todayZoned = toZonedTime(new Date(), TIMEZONE)
  const todayStr = format(todayZoned, 'yyyy-MM-dd')
  const maxDateStr = format(addDays(todayZoned, 30), 'yyyy-MM-dd') // allowed to book up to 30 days ahead

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-2xl mx-auto mt-4">
      <header className="page-header mb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/client/dashboard" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Agendar Mantención</h1>
            <p className="page-subtitle">Elige el momento ideal para ingresar tu vehículo.</p>
          </div>
        </div>
      </header>

      <div className="glass-panel p-6 sm:p-8">
         <InteractiveAppointmentForm todayStr={todayStr} maxDateStr={maxDateStr} />
      </div>
    </div>
  )
}
