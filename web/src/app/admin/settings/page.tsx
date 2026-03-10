import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, CalendarDays, Settings, Save } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { saveDailySettings, saveGlobalSettings } from './actions'

const TIMEZONE = 'America/Santiago'

export default async function AdminSettingsPage(props: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await props.searchParams
  const supabase = await createClient()

  const todayZoned = toZonedTime(new Date(), TIMEZONE)
  const defaultDateStr = format(todayZoned, 'yyyy-MM-dd')

  const selectedDate = date || defaultDateStr

  // Fetch settings for the specified date
  const { data: settings } = await supabase
    .from('daily_settings')
    .select('*')
    .eq('date', selectedDate)
    .single()

  // Fetch global settings (stored in 2000-01-01)
  const { data: globalSettings } = await supabase
    .from('daily_settings')
    .select('is_working_day')
    .eq('date', '2000-01-01')
    .single()

  const blockSundays = globalSettings ? !globalSettings.is_working_day : false

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-3xl mx-auto mt-4">
      <header className="page-header mb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Configuración del Calendario</h1>
            <p className="page-subtitle">Gestiona la capacidad y horarios laborales por día.</p>
          </div>
        </div>
      </header>

      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10">
            <CalendarDays className="text-accent-primary" size={20} />
            <h2 className="font-display font-semibold text-lg">Seleccionar Fecha a Configurar</h2>
          </div>

          <form action="" method="GET" className="flex items-center gap-4 mb-4">
            <input
              type="date" name="date"
              defaultValue={selectedDate}
              min={defaultDateStr}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary flex-1"
            />
            <button type="submit" className="cta-button py-3">Cargar Día</button>
          </form>
        </div>

        <form action={async (fd) => {
          'use server'
          await saveDailySettings(fd)
        }} className="flex flex-col gap-6 mt-6">
          <input type="hidden" name="date" value={selectedDate} />

          <div className="flex items-center gap-2 pb-4 border-b border-white/10">
            <Settings className="text-warning" size={20} />
            <h2 className="font-display font-semibold text-lg">Ajustes para {format(new Date(selectedDate), 'dd/MM/yyyy')}</h2>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 w-fit">
            <label className="text-sm font-semibold text-text-secondary cursor-pointer flex items-center gap-3">
              <input
                type="checkbox" name="is_working_day"
                defaultChecked={settings ? settings.is_working_day : true}
                className="w-5 h-5 accent-accent-primary"
              />
              Día Laboral Activo
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1">Capacidad Máxima (Cupos)</label>
              <input
                name="max_capacity" type="number" min="0" required
                defaultValue={settings?.max_capacity ?? 8}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1">Hora Inicio</label>
              <input
                name="start_time" type="time" required
                defaultValue={settings?.start_time?.substring(0, 5) ?? '09:00'}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1">Hora Fin</label>
              <input
                name="end_time" type="time" required
                defaultValue={settings?.end_time?.substring(0, 5) ?? '18:00'}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pb-6 border-b border-white/10">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1">Inicio Colación (Opcional)</label>
              <input
                name="lunch_start_time" type="time"
                defaultValue={settings?.lunch_start_time?.substring(0, 5) ?? ''}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1">Fin Colación (Opcional)</label>
              <input
                name="lunch_end_time" type="time"
                defaultValue={settings?.lunch_end_time?.substring(0, 5) ?? ''}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" className="cta-button py-3 px-8 rounded-xl bg-success hover:bg-success/80 border-none shadow-lg shadow-success/20">
              <Save size={18} />
              <span>Guardar Configuración Especial</span>
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-6 sm:p-8 mt-2">
        <form action={async (fd) => {
          'use server'
          await saveGlobalSettings(fd)
        }} className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10">
            <Settings className="text-warning" size={20} />
            <h2 className="font-display font-semibold text-lg">Configuración Global</h2>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 w-fit">
            <label className="text-sm font-semibold text-text-secondary cursor-pointer flex items-center gap-3">
              <input
                type="checkbox" name="block_sundays"
                defaultChecked={blockSundays}
                className="w-5 h-5 accent-accent-primary"
              />
              Bloquear agendamiento todos los Domingos
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" className="cta-button py-3 px-8 rounded-xl bg-success hover:bg-success/80 border-none shadow-lg shadow-success/20">
              <Save size={18} />
              <span>Guardar Global</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
