'use client'

import { useState } from 'react'
import { CalendarDays, Clock, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react'
import { createAdminAppointment } from './actions'

type Client = {
    id: string
    full_name: string
    phone: string | null
}

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export function AdminAppointmentForm({ clients }: { clients: Client[] }) {
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTime, setSelectedTime] = useState<string>('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorMsg(null)

        const formData = new FormData()
        formData.append('client_id', selectedClient)
        formData.append('date', selectedDate)
        formData.append('time', selectedTime)

        const res = await createAdminAppointment(formData)

        if (res?.error) {
            setErrorMsg(res.error)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Select Client */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <User className="text-accent-primary" size={20} />
                    <h2 className="font-display font-semibold text-lg text-slate-900">1. Selecciona el Cliente</h2>
                </div>

                <select
                    name="client"
                    required
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary w-full md:w-1/2 transition-colors cursor-pointer"
                >
                    <option value="">Seleccione un cliente...</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.full_name} {client.phone ? `(${client.phone})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <CalendarDays className="text-accent-primary" size={20} />
                    <h2 className="font-display font-semibold text-lg text-slate-900">2. Selecciona el Día</h2>
                </div>

                <input
                    type="date" name="date" required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary w-full md:w-1/2 transition-colors cursor-pointer"
                />
            </div>

            <div className={`flex flex-col gap-4 transition-opacity duration-300 ${!selectedDate ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Clock className="text-warning" size={20} />
                        <h2 className="font-display font-semibold text-lg text-slate-900">3. Hora de Ingreso (Bypass Admin)</h2>
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {timeSlots.map((time) => {
                        return (
                            <label key={time} className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="time"
                                    value={`${time}:00`}
                                    className="peer sr-only"
                                    required
                                    checked={selectedTime === `${time}:00`}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                />
                                <div className="rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 peer-checked:border-accent-primary peer-checked:bg-emerald-500/10 peer-checked:text-accent-primary py-3 text-center text-sm font-medium transition-all">
                                    {time}
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={!selectedClient || !selectedDate || !selectedTime || isSubmitting}
                    className="cta-button py-3 px-8 rounded-xl bg-success hover:bg-success/80 border-none shadow-lg shadow-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    <span>{isSubmitting ? 'Guardando...' : 'Agendar Mantención'}</span>
                </button>
            </div>
        </form>
    )
}
