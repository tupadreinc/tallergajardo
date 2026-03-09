import { createClient } from '@/lib/supabase/server'
import { AppointmentsManager } from './AppointmentsManager'
import { Calendar } from 'lucide-react'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  
  // Realiza fetch de las citas incluyendo los datos del dueño (perfil) mediante JOIN Foreign Key
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      time,
      status,
      repair_cost,
      profiles (full_name, phone)
    `)
    .order('date', { ascending: false })
    .order('time', { ascending: true })

  // Transformar y aplanar levemente la respuesta en caso de mapeo vacío
  const cleanAppointments = (appointments || []).map((appt: any) => ({
    ...appt,
    profiles: Array.isArray(appt.profiles) ? appt.profiles[0] : appt.profiles
  }))

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <header className="page-header flex items-center justify-between">
        <div>
          <div className="mb-4 flex justify-center md:justify-start md:hidden">
            <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-16 w-auto object-contain rounded" />
          </div>
          <h1 className="page-title flex items-center gap-3">
             <Calendar className="text-emerald-500" size={28} />
             Mantenciones Agendadas
          </h1>
          <p className="page-subtitle">Historial cronológico de todos los vehículos en el taller.</p>
        </div>
      </header>
      
      <AppointmentsManager initialAppointments={cleanAppointments} />
    </div>
  )
}
