import { MailCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white text-gray-900">
      <div className="max-w-md w-full p-8 flex flex-col items-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 text-center">

        <div className="bg-success/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <MailCheck className="text-success" size={36} />
        </div>

        <h1 className="text-2xl font-display font-bold mb-3">Revisa tu Correo</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Te hemos enviado un enlace de confirmación. Haz clic en él para activar tu cuenta y comenzar a agendar tus mantenciones en el Taller.
        </p>

        <Link
          href="/login"
          className="w-full justify-center py-3.5 rounded-xl flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  )
}
