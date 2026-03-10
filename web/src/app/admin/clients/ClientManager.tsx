'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, AlertTriangle, AlertCircle, Shield } from 'lucide-react'
import { createClientMember, updateClientMember, deleteClientMember, updateAdminProfile } from './actions'

type ClientProfile = {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
}

type AdminProfile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
} | null

export function ClientManager({ initialClients, missingAdminKey, adminProfile }: { initialClients: ClientProfile[], missingAdminKey: boolean, adminProfile: AdminProfile }) {
  const [clients, setClients] = useState<ClientProfile[]>(initialClients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Admin profile edit state
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminSuccess, setAdminSuccess] = useState(false)

  const openCreate = () => {
    setModalMode('create')
    setSelectedClient(null)
    setError(null)
    setIsModalOpen(true)
  }

  const openEdit = (client: ClientProfile) => {
    setModalMode('edit')
    setSelectedClient(client)
    setError(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al cliente ${name} y todo su historial de mantenciones?`)) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteClientMember(formData)
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
    if (modalMode === 'edit' && selectedClient) {
      formData.append('id', selectedClient.id)
      const res = await updateClientMember(formData)
      if (res.error) setError(res.error)
      else setIsModalOpen(false)
    } else {
      const res = await createClientMember(formData)
      if (res.error) setError(res.error)
      else setIsModalOpen(false)
    }

    setIsLoading(false)
  }

  async function handleAdminSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError(null)
    setAdminSuccess(false)

    const formData = new FormData(e.currentTarget)
    const res = await updateAdminProfile(formData)

    if (res.error) {
      setAdminError(res.error)
    } else {
      setAdminSuccess(true)
      setTimeout(() => {
        setIsAdminEditOpen(false)
        setAdminSuccess(false)
      }, 1500)
    }

    setAdminLoading(false)
  }

  return (
    <>
      {missingAdminKey && (
        <div className="mb-6 bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3 text-warning-800">
          <AlertTriangle className="text-warning mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-warning-900">Configuración de Seguridad Incompleta</h4>
            <p className="text-sm mt-1">No se ha establecido la variable <code>SUPABASE_SERVICE_ROLE_KEY</code>. No podrás visualizar correos electrónicos reales ni modificar/eliminar cuentas por razones de seguridad de Supabase. Añádela a tu archivo <code>.env.local</code>.</p>
          </div>
        </div>
      )}

      {/* Sección Administrador */}
      {adminProfile && (
        <div className="glass-panel p-6 mb-6 border-emerald-200/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Shield className="text-emerald-500" size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900">Administrador</h3>
                <p className="text-xs text-slate-400">Datos de tu cuenta de administrador</p>
              </div>
            </div>
            <button
              onClick={() => { setIsAdminEditOpen(true); setAdminError(null); setAdminSuccess(false) }}
              className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-sm font-medium"
              disabled={missingAdminKey}
            >
              <Edit2 size={16} />
              Editar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Nombre</p>
              <p className="text-slate-900 font-medium">{adminProfile.full_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Email</p>
              <p className="text-slate-900 font-medium">{adminProfile.email || 'No disponible'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Teléfono</p>
              <p className="text-slate-900 font-medium">{adminProfile.phone || 'Sin teléfono'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="cta-button" disabled={missingAdminKey}>
          <Plus size={18} />
          <span>Agregar Cliente</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No hay clientes registrados en el sistema.</td>
                </tr>
              ) : clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{client.full_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{client.email || 'Email oculto (Falta Role Key)'}</span>
                      <span className="text-xs text-slate-400">{client.phone || 'Sin télefono'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3 text-right">
                    <button onClick={() => openEdit(client)} className="text-emerald-600 hover:text-emerald-800 transition-colors p-1" title="Editar">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(client.id, client.full_name)} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
              {modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Nombre Completo</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  defaultValue={selectedClient?.full_name || ''}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Celular</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={selectedClient?.phone || ''}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Correo Electrónico</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={selectedClient?.email || ''}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Contraseña {modalMode === 'edit' && <span className="text-xs font-normal text-slate-400">(Dejar en blanco para no cambiar)</span>}
                </label>
                <input
                  name="password"
                  type="password"
                  required={modalMode === 'create'}
                  minLength={6}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-2 flex gap-3 w-full">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3.5 rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70">
                  {isLoading ? 'Guardando...' : 'Guardar Datos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Admin */}
      {isAdminEditOpen && adminProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsAdminEditOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Shield className="text-emerald-500" size={20} />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900">
                Editar Perfil Admin
              </h2>
            </div>

            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Nombre Completo</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  defaultValue={adminProfile.full_name}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Celular</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={adminProfile.phone}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Correo Electrónico</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={adminProfile.email}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Nueva Contraseña <span className="text-xs font-normal text-slate-400">(Dejar en blanco para no cambiar)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>

              {adminError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{adminError}</span>
                </div>
              )}

              {adminSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-lg text-sm mb-2">
                  ✅ Perfil actualizado correctamente.
                </div>
              )}

              <div className="mt-2 flex gap-3 w-full">
                <button type="button" onClick={() => setIsAdminEditOpen(false)} className="flex-1 py-3.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={adminLoading} className="flex-1 py-3.5 rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70">
                  {adminLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
