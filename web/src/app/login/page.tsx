'use client'

import { useState } from 'react'
import { login } from './actions'
import { Wrench, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await login(formData)

    // Result only returns if error, otherwise it redirects
    if (result?.error) {
      setError("Credenciales incorrectas o error en el servidor.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white text-gray-900">
      <div className="max-w-md w-full p-8 flex flex-col items-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
        <div className="mb-8 w-full flex justify-center">
          <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-20 md:h-16 w-auto object-contain rounded border border-white/5 shadow-sm" onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x150/ffffff/000000?text=Logo+Aqui'
          }} />
        </div>

        <h1 className="text-2xl font-display font-bold mb-2">Portal de Taller</h1>
        <p className="text-gray-500 mb-8 text-center text-sm">Ingresa con tus credenciales para agendar o gestionar reparaciones.</p>

        <form action={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all duration-300"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all duration-300"
              placeholder="••••••••"
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
            className="cta-button w-full justify-center py-3.5 rounded-xl group relative overflow-hidden disabled:opacity-70"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm w-full">
          <span className="text-gray-500">¿No tienes cuenta?</span>{' '}
          <Link href="/register" className="text-accent-primary font-semibold hover:underline transition-all">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
