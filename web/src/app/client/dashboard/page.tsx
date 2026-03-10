import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, DollarSign, Wrench, Package, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { CostBreakdown } from './CostBreakdown'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TIMEZONE = 'America/Santiago'

export default async function ClientDashboardPage() {
  noStore()
  const supabase = await createClient()

  // user is guaranteed to exist because of middleware
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch their future appointments
  const todayZoned = toZonedTime(new Date(), TIMEZONE)
  const todayStr = format(todayZoned, 'yyyy-MM-dd')

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      required_parts (*)
    `)
    .eq('client_id', user?.id)
    .gte('date', todayStr)
    .order('date', { ascending: true })

  // Formatter for CLP
  const clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  })

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="page-header mb-6 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center text-center w-full">
          <div className="mb-2 flex justify-center">
            <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-20 md:h-16 w-auto object-contain rounded border border-white/5" />
          </div>
          <h1 className="page-title uppercase text-[2.1rem] md:text-[3rem] leading-tight">HOLA, {profile?.full_name?.split(' ')[0].toUpperCase() || 'CLIENTE'}!</h1>
          <p className="page-subtitle">Revisa el estado de tus mantenciones y servicios.</p>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-[280px] mx-auto gap-3 mt-2">
          <Link href="/client/appointments/new" className="cta-button shadow-sm flex-1 justify-center w-full">
            <Calendar size={18} />
            <span>Agendar Mantención</span>
          </Link>
          <form action={logout} className="w-full">
            <button type="submit" className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl p-2.5 transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-sm" title="Cerrar Sesión">
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Stats / Info */}
      <section className="bento-grid">
        <div className="glass-panel bento-item grid-col-8 flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-accent-primary" size={20} />
              <h3 className="font-display font-semibold text-lg">Tus Reservas Activas</h3>
            </div>

            {appointments && appointments.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                {appointments.map((app) => (
                  <div key={app.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-row items-center justify-between gap-3 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                    <div className="flex flex-col relative z-10 flex-shrink min-w-0">
                      <p className="text-base font-bold font-display text-slate-900 truncate">
                        {format(new Date(`${app.date}T${app.time}`), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <p className="text-text-secondary flex items-center gap-1.5 text-sm mt-0.5">
                        <Clock size={14} /> a las {app.time.substring(0, 5)} hrs.
                      </p>
                    </div>
                    <div className="relative z-10 flex-shrink-0">
                      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 border text-[10px] md:text-xs font-medium uppercase tracking-wider whitespace-nowrap ${app.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' :
                          app.status === 'confirmed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-700' :
                            app.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-700'
                        }`}>
                        {app.status === 'confirmed' ? 'Confirmada' : app.status === 'completed' ? 'Completada' : app.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4 h-[200px]">
                <Clock className="empty-state-icon opacity-50 mb-2" />
                <p>No tienes reservas futuras.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel bento-item grid-col-4 self-start h-fit flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-success" size={20} />
            <h3 className="font-display font-semibold text-lg">Costo Acumulado</h3>
          </div>

          {appointments && appointments.length > 0 && appointments.some(app => app.repair_cost > 0) ? (
            <CostBreakdown
              appointments={appointments}
              totalFormatted={clpFormatter.format(appointments.reduce((sum, app) => sum + (app.repair_cost || 0), 0))}
            />
          ) : (
            <div className="empty-state flex-1 border-none bg-transparent h-full px-0">
              <p className="text-sm">Costos se calcularán luego del diagnóstico en taller.</p>
            </div>
          )}
        </div>
      </section>

      {/* Required Parts Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Wrench className="text-accent-primary" size={20} />
          <h2 className="font-display font-semibold text-xl">Repuestos Requeridos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments?.flatMap(app =>
            app.required_parts?.map((part: any) => (
              <div key={part.id} className="glass-panel p-5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
                    <Package size={20} className="text-slate-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{part.part_name}</h4>
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
                    {part.instructions || 'Sin instrucciones adicionales asignadas.'}
                  </p>
                </div>
                <div className="mt-2 text-xs text-text-muted pt-3 border-t border-slate-100 flex items-center gap-1">
                  Para mantención del {format(new Date(`${app.date}T${app.time}`), 'dd/MM')} <Clock size={12} className="ml-1" /> a las {app.time.substring(0, 5)} hrs.
                </div>
              </div>
            ))
          )}

          {(!appointments || appointments.every(app => !app.required_parts || app.required_parts.length === 0)) && (
            <div className="glass-panel col-span-full py-12 flex flex-col items-center justify-center text-center opacity-70">
              <Package className="text-slate-300 mb-3" size={32} />
              <p className="text-text-secondary">El taller no ha ingresado repuestos a encargar por tu cuenta.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
