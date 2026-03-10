import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, User, Calendar, Clock, DollarSign, PackagePlus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { updateRepairCost, addRequiredPart, deleteRequiredPart, deleteAppointment } from './actions'

// Use Next.js 16 dynamic route params correctly (in Server Components, params is a Promise or object based on version)
export default async function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = await createClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles:client_id (*),
      required_parts (*)
    `)
    .eq('id', id)
    .single()

  if (error || !appointment) {
    notFound()
  }

  const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
  const appDate = format(new Date(`${appointment.date}T${appointment.time}`), "dd 'de' MMMM, yyyy")

  // Bind actions mapped to void for typescript form constraints
  const updateCostAction = async (fd: FormData) => {
    'use server'
    await updateRepairCost(id, fd)
  }

  const addPartAction = async (fd: FormData) => {
    'use server'
    await addRequiredPart(id, fd)
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto mt-4">
      <header className="page-header mb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Detalle de Reserva</h1>
            <p className="page-subtitle">Gestiona costos y repuestos para esta mantención.</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Datos de la cita y costos */}
        <div className="glass-panel p-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-6 border-b border-slate-200 pb-4 text-slate-900">
            <User className="text-accent-primary" size={20} /> Información del Cliente
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-sm text-text-muted">Nombre Completo</span>
              <p className="font-medium text-slate-900 text-lg">{appointment.profiles.full_name}</p>
            </div>
            <div>
              <span className="text-sm text-text-muted">Contacto</span>
              <p className="font-medium text-slate-900">{appointment.profiles.phone || 'No registrado'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-text-muted flex items-center gap-1.5 mb-1"><Calendar size={14} /> Fecha</span>
                <p className="font-medium text-sm text-slate-900">{appDate}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-text-muted flex items-center gap-1.5 mb-1"><Clock size={14} /> Hora</span>
                <p className="font-medium text-slate-900">{appointment.time.substring(0, 5)} hrs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-6 border-b border-slate-200 pb-4 text-slate-900">
            <DollarSign className="text-success" size={20} /> Cobro y Estado
          </h2>
          <form action={updateCostAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 ml-1">Costo de Mantención (CLP)</label>
              <input
                name="repair_cost" type="number"
                defaultValue={appointment.repair_cost}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 ml-1">Estado de Cita</label>
              <select
                name="status" defaultValue={appointment.status}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none transition-colors appearance-none"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 ml-1">Detalle (Opcional)</label>
              <textarea
                name="repair_description"
                rows={2}
                placeholder="Ej: Cambio de aceite 10W40 y filtro de aire..."
                defaultValue={appointment.repair_description || ''}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
            <button className="cta-button w-full justify-center py-3 mt-2" type="submit">Actualizar Cita</button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full mt-2">
        <form action={async () => {
          'use server'
          await deleteAppointment(id)
        }}>
          <button className="cta-button w-full justify-center py-3 mt-2 !bg-red-600 hover:!bg-red-700" style={{ boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }} type="submit">
            Eliminar Reserva
          </button>
        </form>
      </div>
    </div>
  )
}
