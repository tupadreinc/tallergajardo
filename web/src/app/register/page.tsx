'use client'

import { useState } from 'react'
import { signUp } from './actions'
import { UserPlus, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await signUp(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white text-gray-900">
      <div className="max-w-md w-full p-8 flex flex-col items-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 relative">
        <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="mb-8 w-full flex justify-center">
          <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-20 w-auto object-contain rounded-xl shadow-sm" onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x150/ffffff/000000?text=Logo+Aqui'
          }}/>
        </div>
        
        <h1 className="text-2xl font-display font-bold mb-2">Crear tu Cuenta</h1>
        <p className="text-gray-500 mb-8 text-center text-sm">Regístrate para agendar visitas al taller mecánico.</p>

        <form action={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="fullName">Nombre Completo</label>
            <input 
              id="fullName" name="fullName" type="text" required 
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all duration-300"
              placeholder="Ej: Laura Gómez"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="phone">Celular</label>
            <input 
              id="phone" name="phone" type="tel" 
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all duration-300"
              placeholder="+56 9 0000 0000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="email">Correo Electrónico</label>
            <input 
              id="email" name="email" type="email" required 
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all duration-300"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="password">Contraseña</label>
            <input 
              id="password" name="password" type="password" required minLength={6}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all duration-300"
              placeholder="Min. 6 caracteres"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-2 text-center animate-in slide-in-from-bottom-2 fade-in">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full justify-center py-3.5 rounded-xl group relative overflow-hidden disabled:opacity-70 bg-success hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? 'Registrando...' : 'Registrarse'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
