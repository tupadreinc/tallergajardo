import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Wrench, ChevronRight, Settings, LogOut, Clock, Plus } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'
import Link from 'next/link'
import { DateSelector } from './DateSelector'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TIMEZONE = 'America/Santiago'

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  noStore()
  const supabase = await createClient()

  const resolvedSearchParams = await searchParams
  const todayZoned = toZonedTime(new Date(), TIMEZONE)
  const startDateStr = resolvedSearchParams.date || format(todayZoned, 'yyyy-MM-dd')

  // Fetch appointments for the 3-day range
  const { data: allAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles:client_id (full_name, phone)
    `)
    .gte('date', startDateStr)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  // Group appointments by date
  const groupedByDate: Record<string, typeof allAppointments> = {}

  allAppointments?.forEach((app) => {
    if (!groupedByDate[app.date]) groupedByDate[app.date] = []
    groupedByDate[app.date]!.push(app)
  })

  const totalAppointments = allAppointments?.length || 0

  // Fetch total clients
  const { count: clientsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'cliente')

  // Status badge helper
  const statusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'confirmed': return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'confirmed': return 'Confirmada'
      case 'cancelled': return 'Cancelada'
      default: return 'Pendiente'
    }
  }

  const clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  })

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <header className="page-header mb-6 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center text-center w-full">
          <h1 className="page-title uppercase text-[2.1rem] md:text-[3rem] leading-tight mt-2">ADMIN DASHBOARD</h1>
          <p className="page-subtitle">Resumen diario y control de operaciones del Taller.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-4 mt-4">
          <div className="flex items-center justify-center gap-3">
            <Link href="/admin/clients/new" className="cta-button shadow-sm px-8">
              <Users size={18} />
              <span>Nuevo Cliente</span>
            </Link>
            <Link href="/admin/settings" className="bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 rounded-xl p-2.5 transition-colors flex-shrink-0" title="Configuración">
              <Settings size={20} />
            </Link>
          </div>
          <form action={logout}>
            <button type="submit" className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl px-8 py-2.5 transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-sm" title="Cerrar Sesión">
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-2">
              <Calendar size={20} />
            </div>
            <span className="text-text-muted text-sm font-medium uppercase tracking-wide">Citas Registradas</span>
          </div>
          <span className="text-4xl font-display font-bold text-slate-900">{totalAppointments}</span>
        </div>

        <div className="glass-panel p-6 flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success mb-2">
              <Users size={20} />
            </div>
            <span className="text-text-muted text-sm font-medium uppercase tracking-wide">Clientes Activos</span>
          </div>
          <span className="text-4xl font-display font-bold text-slate-900">{clientsCount || 0}</span>
        </div>
      </section>

      {/* Multi-day Appointments */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Wrench className="text-accent-primary" size={20} />
              <h2 className="font-display font-semibold text-xl">Agenda de Mantenciones</h2>
            </div>
            <Link
              href="/admin/appointments/new"
              className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors font-medium text-sm"
              title="Agendar Manualmente"
            >
              <Plus size={16} />
              <span>Agregar Mantención</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <DateSelector currentDate={startDateStr} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {Object.entries(groupedByDate).map(([dateStr, dayAppointments]) => {
            const dateObj = new Date(`${dateStr}T12:00:00`)
            const isToday = dateStr === format(todayZoned, 'yyyy-MM-dd')
            const dayLabel = isToday
              ? 'Hoy'
              : format(dateObj, "EEEE", { locale: es })

            return (
              <div key={dateStr} className="flex flex-col gap-2">
                {/* Day Header */}
                <div className="flex items-center gap-3 px-1">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${isToday ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    <Calendar size={14} />
                    <span className="capitalize">{dayLabel}</span>
                  </div>
                  <span className="text-sm text-text-muted font-medium">
                    {format(dateObj, "dd 'de' MMMM", { locale: es })}
                  </span>
                  <span className="text-xs text-text-muted ml-auto">
                    {dayAppointments?.length || 0} cita{(dayAppointments?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Day Card */}
                <div className="glass-panel overflow-hidden border-slate-100">
                  {dayAppointments && dayAppointments.length > 0 ? (
                    <div className="divide-y divide-slate-100 flex flex-col w-full">
                      {dayAppointments.map((app: any) => (
                        <Link key={app.id} href={`/admin/appointments/${app.id}`} className="p-4 sm:p-5 flex flex-row items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center">
                              <Clock size={14} className="text-slate-400 mb-0.5" />
                              <span className="text-xs text-slate-700 font-bold">{app.time.substring(0, 5)}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate">{app.profiles?.full_name}</h4>
                              <span className="text-sm text-text-muted mt-0.5">{app.profiles?.phone || 'Sin número'}</span>
                              <div className="flex flex-col gap-1 mt-1.5">
                                {app.repair_cost > 0 && (
                                  <p className="text-sm font-bold text-slate-800">
                                    Costo: {clpFormatter.format(app.repair_cost)}
                                  </p>
                                )}
                                {app.repair_description && (
                                  <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                                    <span className="font-medium text-slate-700">Detalle:</span> {app.repair_description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle(app.status)}`}>
                              {statusLabel(app.status)}
                            </span>
                            <span className={`sm:hidden text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusStyle(app.status)}`}>
                              {statusLabel(app.status)}
                            </span>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-text-secondary">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center opacity-60">
                      <Calendar className="text-slate-300 mb-2" size={24} />
                      <p className="text-text-secondary text-sm font-medium">Sin reservas agendadas.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section >
    </div >
  )
}
