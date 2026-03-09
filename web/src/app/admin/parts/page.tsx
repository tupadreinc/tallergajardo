import { createClient } from '@/lib/supabase/server'
import { PartsManager } from './PartsManager'
import { Package } from 'lucide-react'

export default async function PartsPage() {
  const supabase = await createClient()
  
  // 1. Obtener listado de piezas requeridas
  const { data: rawParts } = await supabase
    .from('required_parts')
    .select(`
      id,
      part_name,
      instructions,
      required_date,
      appointment_id,
      appointments!inner (
        date,
        profiles (full_name)
      )
    `)
    .order('required_date', { ascending: true })

  // Transformar respuesta aplanando el proxy (Evita problemas typescript)
  const parts = (rawParts || []).map((part: any) => ({
    ...part,
    appointments: {
       date: part.appointments?.date,
       profiles: Array.isArray(part.appointments?.profiles) ? part.appointments.profiles[0] : part.appointments?.profiles
    }
  }))

  // 2. Obtener listado de citas activas para el "Dropdown" de creación
  const { data: rawAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      profiles (full_name)
    `)
    .eq('status', 'pending')
    .order('date', { ascending: true })

  const activeAppointments = (rawAppointments || []).map((app: any) => ({
      ...app,
      profiles: Array.isArray(app.profiles) ? app.profiles[0] : app.profiles
  }))

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <header className="page-header flex items-center justify-between">
        <div>
          <div className="mb-4 flex justify-center md:justify-start md:hidden">
            <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-16 w-auto object-contain rounded" />
          </div>
          <h1 className="page-title flex items-center gap-3">
             <Package className="text-emerald-500" size={28} />
             Inventario de Pedidos
          </h1>
          <p className="page-subtitle">Listado de repuestos requeridos para las mantenciones en espera.</p>
        </div>
      </header>
      
      <PartsManager initialParts={parts} activeAppointments={activeAppointments} />
    </div>
  )
}
