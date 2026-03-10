'use client'

import { useState } from 'react'
import { Edit2, Trash2, X, AlertCircle, CalendarClock, CheckCircle, Tag } from 'lucide-react'
import { updateAppointmentStatus, deleteAppointment } from './actions'

type Appointment = {
  id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  repair_cost: number
  profiles: {
    full_name: string
    phone: string
  }
}

export function AppointmentsManager({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  // Ordenar por fecha desc (las más recientes primero/futuras primero)
  filteredAppointments.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())

  const openEdit = (appt: Appointment) => {
    setSelectedAppt(appt)
    setError(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, date: string, clientName: string) => {
    if (!confirm(`¿Eliminar permanentemente la reserva de ${clientName} del día ${date}?`)) return
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteAppointment(formData)
    setIsLoading(false)

    if (result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedAppt) return

    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('id', selectedAppt.id)

    const res = await updateAppointmentStatus(formData)
    if (res.error) setError(res.error)
    else setIsModalOpen(false)
    
    setIsLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex w-fit items-center gap-1"><CheckCircle size={14}/> Completada</span>
      case 'confirmed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex w-fit items-center gap-1"><CalendarClock size={14}/> Confirmada</span>
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold flex w-fit items-center gap-1"><X size={14}/> Cancelada</span>
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex w-fit items-center gap-1"><CalendarClock size={14}/> Pendiente</span>
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex w-fit items-center gap-1"><CalendarClock size={14}/> Pendiente</span>
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Todas
        </button>
        <button 
          onClick={() => setFilter('confirmed')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
        >
          Confirmadas
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
        >
          Pendientes
        </button>
        <button 
          onClick={() => setFilter('completed')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
        >
          Completadas
        </button>
        <button 
          onClick={() => setFilter('cancelled')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
        >
          Canceladas
        </button>
      </div>

      <div className="glass-panel overflow-hidden border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Costo Rep.</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No se encontraron reservas en esta categoría.</td>
                </tr>
              ) : filteredAppointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{appt.date}</div>
                    <div className="text-xs text-slate-500">{appt.time.substring(0, 5)} hrs</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="font-medium text-slate-900 block">{appt.profiles?.full_name || 'Desconocido'}</span>
                     <span className="text-xs text-slate-500">{appt.profiles?.phone || 'Sin número'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(appt.status)}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">
                    {appt.repair_cost > 0 ? `$${appt.repair_cost.toLocaleString('es-CL')}` : '---'}
                  </td>
                  <td className="px-6 py-4 flex flex-col sm:flex-row justify-end gap-2 text-right">
                    <button onClick={() => openEdit(appt)} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 p-2 rounded-md transition-colors" title="Actualizar">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(appt.id, appt.date, appt.profiles?.full_name || '')} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
              <X size={20} />
            </button>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Gestionar Cita</h2>
            <p className="text-sm text-slate-500 mb-6">{selectedAppt.profiles?.full_name} • {selectedAppt.date}</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Tag size={16}/> Estado de Mantención
                </label>
                <select 
                  name="status" 
                  defaultValue={selectedAppt.status}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                >
                  <option value="pending">Pendiente (Por Confirmar)</option>
                  <option value="confirmed">Confirmada (En Taller)</option>
                  <option value="completed">Completada (Lista para Entrega)</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Costo de Reparación (CLP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-medium">$</span>
                  <input 
                    name="repairCost" 
                    type="number" 
                    min="0"
                    step="1000"
                    defaultValue={selectedAppt.repair_cost}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full font-mono"
                  />
                </div>
                <span className="text-xs text-slate-400 ml-1">Ingresa el total a cobrar sin puntos ni comas.</span>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-4 flex gap-3 w-full">
                 <button type="submit" disabled={isLoading} className="flex-1 py-3.5 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-70">
                   {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
