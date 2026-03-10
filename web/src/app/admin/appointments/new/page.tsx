import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, UserPlus, Save, Users, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { AdminAppointmentForm } from './AdminAppointmentForm'

export const dynamic = 'force-dynamic'

export default async function NewAdminAppointmentPage() {
    const supabase = await createClient()

    const { data: clients } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('role', 'cliente')
        .order('full_name', { ascending: true })

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-2xl mx-auto mt-4">
            <header className="page-header mb-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title flex items-center gap-3">
                            <Calendar className="text-accent-primary" size={28} />
                            Agendar Manualmente
                        </h1>
                        <p className="page-subtitle">Asigna un bloque de horario para un cliente específico.</p>
                    </div>
                </div>
            </header>

            <div className="glass-panel p-6 sm:p-8">
                <AdminAppointmentForm clients={clients || []} />
            </div>
        </div>
    )
}
