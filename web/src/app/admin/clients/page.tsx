import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClientManager } from './ClientManager'
import { Users } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  // 1. Obtener la data pública/básica de los perfiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'cliente')
    .order('full_name', { ascending: true })

  let clients = profiles || []
  let missingAdminKey = false

  // 2. Intentar obtener los correos electrónicos usando la API Admin si la llave está configurada
  try {
    const adminClient = createAdminClient()
    const { data: { users } } = await adminClient.auth.admin.listUsers()
    
    // Merge de email con el profile correspondiente
    const emailMap = new Map(users.map(u => [u.id, u.email]))
    clients = clients.map((c: any) => ({
      ...c,
      email: emailMap.get(c.id) || undefined
    }))
  } catch (e) {
    // Si no está configurado, la UI mostrará una advertencia limpia en vez de tirar Error 500
    missingAdminKey = true
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <header className="page-header flex items-center justify-between">
        <div>
          <div className="mb-4 flex justify-center md:justify-start md:hidden">
            <img src="/taller.jpeg" alt="Mecánica Gajardo" className="h-16 w-auto object-contain rounded" />
          </div>
          <h1 className="page-title flex items-center gap-3">
             <Users className="text-emerald-500" size={28} />
             Gestión de Miembros
          </h1>
          <p className="page-subtitle">Directorio completo de clientes registrados en el taller.</p>
        </div>
      </header>
      
      <ClientManager initialClients={clients} missingAdminKey={missingAdminKey} />
    </div>
  )
}
