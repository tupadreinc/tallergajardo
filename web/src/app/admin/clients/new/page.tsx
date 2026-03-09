'use client'

import { useState } from 'react'
import { createClientUser } from './actions'
import { UserPlus, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewClientPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await createClientUser(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-2xl mx-auto mt-8">
      <header className="page-header mb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Alta de Cliente</h1>
            <p className="page-subtitle">Registrar credenciales y perfil.</p>
          </div>
        </div>
      </header>

      <div className="glass-panel p-6 sm:p-8">
        <form action={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-white/10">
            <UserPlus className="text-accent-primary" size={20} />
            <h2 className="font-display font-semibold text-lg">Datos Personales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1" htmlFor="full_name">Nombre Completo</label>
              <input 
                id="full_name" name="full_name" type="text" required 
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Juan Pérez"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1" htmlFor="phone">Teléfono (opcional)</label>
              <input 
                id="phone" name="phone" type="tel" 
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 mb-2 pb-4 border-b border-white/10">
            <h2 className="font-display font-semibold text-lg">Credenciales de Acceso</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1" htmlFor="email">Correo Electrónico</label>
              <input 
                id="email" name="email" type="email" required 
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="cliente@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary ml-1" htmlFor="password">Contraseña Inicial</label>
              <input 
                id="password" name="password" type="password" required minLength={6}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mt-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="cta-button py-3 px-8 rounded-xl disabled:opacity-70"
            >
              <Save size={18} />
              <span>{isLoading ? 'Guardando...' : 'Crear Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
