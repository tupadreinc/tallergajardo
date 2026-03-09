'use client'

import { useState } from 'react'
import { Plus, Trash2, X, AlertCircle, Package, Calendar } from 'lucide-react'
import { createRequiredPart, deleteRequiredPart } from './actions'

type Part = {
  id: string
  part_name: string
  instructions: string | null
  required_date: string
  appointment_id: string
  appointments: {
    date: string
    profiles: {
      full_name: string
    }
  }
}

type AppointmentOption = {
  id: string
  date: string
  profiles: {
    full_name: string
  }
}

export function PartsManager({ initialParts, activeAppointments }: { initialParts: Part[], activeAppointments: AppointmentOption[] }) {
  const [parts, setParts] = useState<Part[]>(initialParts)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setError(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el repuesto "${name}" del listado de pendientes?`)) return
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteRequiredPart(formData)
    setIsLoading(false)

    if (result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)

    const res = await createRequiredPart(formData)
    if (res.error) setError(res.error)
    else setIsModalOpen(false)
    
    setIsLoading(false)
  }

  // Identificar si una pieza está vencida o es para el futuro (asumiendo TZ local simple)
  const getStatusColor = (dateStr: string) => {
    const target = new Date(dateStr)
    const today = new Date()
    today.setHours(0,0,0,0)

    if (target < today) return "text-amber-600 bg-amber-50"
    if (target.getTime() === today.getTime()) return "text-red-600 bg-red-50 font-bold"
    return "text-emerald-700 bg-emerald-50"
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="cta-button">
          <Plus size={18} />
          <span>Solicitar Repuesto</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Repuesto / Instrucción</th>
                <th className="px-6 py-4">Cliente (Cita ID)</th>
                <th className="px-6 py-4">Fecha Requerida</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">El inventario de pedidos pendientes está vacío.</td>
                </tr>
              ) : parts.map((part) => (
                <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                       <Package size={16} className="text-emerald-600"/> {part.part_name}
                    </div>
                    {part.instructions && <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{part.instructions}</div>}
                  </td>
                  <td className="px-6 py-4">
                     <span className="font-medium text-slate-900 block">{part.appointments?.profiles?.full_name || 'Desconocido'}</span>
                     <span className="text-xs text-slate-400">Reserva: {part.appointments?.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(part.required_date)}`}>
                       {new Date(part.required_date + "T12:00:00").toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 text-right">
                    <button onClick={() => handleDelete(part.id, part.part_name)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
              <X size={20} />
            </button>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-6">Nuevo Pedido de Repuesto</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Ligar a Cita Abierta</label>
                <select 
                  name="appointmentId" 
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                >
                  <option value="">Selecciona un vehículo/cliente...</option>
                  {activeAppointments.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.profiles?.full_name} - {app.date}
                    </option>
                  ))}
                </select>
                {activeAppointments.length === 0 && <span className="text-amber-600 text-xs ml-1">No hay citas activas disponibles actualmente.</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1"><Package size={14}/> Nombre del Repuesto</label>
                <input 
                  name="partName" 
                  type="text" 
                  required 
                  placeholder="Ej: Pastillas de freno cerámicas"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Límite de Fecha Requerida</label>
                <input 
                  name="requiredDate" 
                  type="date" 
                  required 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Instrucciones (Opcional)</label>
                <textarea 
                  name="instructions" 
                  rows={2}
                  placeholder="Marca específica, modelo OEM, distribuidor..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-4 flex gap-3 w-full">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                   Cancelar
                 </button>
                 <button type="submit" disabled={isLoading} className="flex-1 py-3.5 rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70">
                   {isLoading ? 'Guardando...' : 'Añadir al Inventario'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
