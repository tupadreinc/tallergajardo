import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClientManager } from './ClientManager'
import { Users } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()

  // Obtener el usuario actual (admin)
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener la data pública/básica de los perfiles de clientes
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'cliente')
    .order('full_name', { ascending: true })

  // 2. Obtener perfil admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .single()

  let clients = profiles || []
  let missingAdminKey = false
  let adminData = adminProfile ? {
    id: adminProfile.id,
    full_name: adminProfile.full_name,
    phone: adminProfile.phone || '',
    email: ''
  } : null

  // 3. Intentar obtener los correos electrónicos usando la API Admin si la llave está configurada
  try {
    const adminClient = createAdminClient()
    const { data: { users } } = await adminClient.auth.admin.listUsers()

    // Merge de email con el profile correspondiente
    const emailMap = new Map(users.map(u => [u.id, u.email]))
    clients = clients.map((c: any) => ({
      ...c,
      email: emailMap.get(c.id) || undefined
    }))

    // Asignar email del admin
    if (adminData) {
      adminData.email = emailMap.get(adminData.id) || ''
    }
  } catch (e) {
    // Si no está configurado, la UI mostrará una advertencia limpia en vez de tirar Error 500
    missingAdminKey = true
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <header className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Users className="text-emerald-500" size={28} />
            Gestión de Miembros
          </h1>
          <p className="page-subtitle">Directorio completo de clientes registrados en el taller.</p>
        </div>
      </header>

      <ClientManager initialClients={clients} missingAdminKey={missingAdminKey} adminProfile={adminData} />
    </div>
  )
}
