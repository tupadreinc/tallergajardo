import { createClient } from '@/lib/supabase/server'
import { DollarSign, User, Users, Calendar, TrendingUp, HandCoins } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function CostsPage() {
  const supabase = await createClient()

  // Fetch all appointments with a cost > 0
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      repair_cost,
      date,
      profiles:client_id (id, full_name, phone)
    `)
    .gt('repair_cost', 0)
    .order('date', { ascending: false })

  let totalIncome = 0;
  const clientCosts: Record<string, { total: number; name: string; phone: string }> = {}
  const dailyCosts: Record<string, number> = {}

  appointments?.forEach(app => {
    const cost = app.repair_cost || 0
    totalIncome += cost

    // Aggregating Daily Income
    if (!dailyCosts[app.date]) dailyCosts[app.date] = 0
    dailyCosts[app.date] += cost

    // Aggregating Cost per Client
    const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles
    if (profile) {
      const clientId = profile.id as string
      if (!clientCosts[clientId]) {
        clientCosts[clientId] = { 
          total: 0, 
          name: profile.full_name as string, 
          phone: (profile.phone as string) || 'Sin número' 
        }
      }
      clientCosts[clientId].total += cost
    }
  })

  // Sort by newest string dates
  const sortedDailyCosts = Object.entries(dailyCosts).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
  // Sort by highest total paid
  const sortedClientCosts = Object.values(clientCosts).sort((a, b) => b.total - a.total)

  const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-6xl mx-auto mt-4">
      <header className="page-header mb-2 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <DollarSign className="text-success" size={32} /> 
            Panel de Costos e Ingresos
          </h1>
          <p className="page-subtitle">Monitoreo financiero: resumen de cobros por cliente y métricas diarias del taller.</p>
        </div>
      </header>

      {/* Main KPI */}
      <section className="glass-panel p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
         <div className="flex flex-col relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-2 mb-2 text-success">
              <TrendingUp size={24} />
              <h3 className="font-display font-bold text-xl uppercase tracking-wide">Ingreso Histórico Total</h3>
            </div>
            <p className="text-sm text-text-muted mb-4 max-w-sm">
              Sumatoria de todos los costos de mantención registrados para las reservas históricas en el sistema.
            </p>
         </div>
         <div className="relative z-10 bg-success/10 border border-success/20 py-4 px-8 rounded-2xl flex-shrink-0 w-full md:w-auto text-center">
            <span className="text-4xl md:text-5xl font-display font-black tracking-tight text-success">
              {clpFormatter.format(totalIncome)}
            </span>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Daily Costs */}
        <section className="glass-panel p-6 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <Calendar className="text-accent-primary" size={20} />
            <h2 className="font-display font-semibold text-lg text-slate-900">Ingresos por Día</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {sortedDailyCosts.length > 0 ? (
               sortedDailyCosts.map(([dateStr, amount]) => {
                 const dateObj = new Date(`${dateStr}T12:00:00`)
                 return (
                   <div key={dateStr} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center">
                           <span className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-0.5">{format(dateObj, 'MMM', { locale: es })}</span>
                           <span className="text-sm font-black text-slate-800 leading-none">{format(dateObj, 'dd')}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="font-medium text-slate-900 capitalize">{format(dateObj, 'eeee', { locale: es })}</span>
                           <span className="text-xs text-text-muted">{format(dateObj, "dd 'de' MMMM, yyyy", { locale: es })}</span>
                        </div>
                     </div>
                     <span className="font-bold text-slate-900 text-lg">{clpFormatter.format(amount)}</span>
                   </div>
                 )
               })
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <HandCoins className="text-slate-300 mb-3" size={32} />
                  <p className="text-text-secondary text-sm font-medium">Aún no hay ingresos registrados.</p>
               </div>
            )}
          </div>
        </section>

        {/* Right Column: Client Costs */}
        <section className="glass-panel p-6 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <Users className="text-accent-primary" size={20} />
            <h2 className="font-display font-semibold text-lg text-slate-900">Mantenciones por Cliente</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {sortedClientCosts.length > 0 ? (
               sortedClientCosts.map((client, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                         {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-semibold text-slate-900 line-clamp-1">{client.name}</span>
                         <span className="text-xs text-text-muted">{client.phone}</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Pagado</span>
                      <span className="font-bold text-success text-base">{clpFormatter.format(client.total)}</span>
                   </div>
                 </div>
               ))
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <User className="text-slate-300 mb-3" size={32} />
                  <p className="text-text-secondary text-sm font-medium">Aún no hay clientes con cobros.</p>
               </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
