-- ==========================================
-- HABILITAR RLS Y CREAR POLÍTICAS DE SEGURIDAD (CORREGIDO)
-- ==========================================

-- 1. Helper Function para verificar si el usuario es Admin
-- SECURITY DEFINER asegura que se ejecute con privilegios de dueño bypassando RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1.1 Helper Function para obtener el email de un usuario (usado para notificaciones)
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_parts ENABLE ROW LEVEL SECURITY;

-- 3. ÍNDICES DE RENDIMIENTO (NUEVO)
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_required_parts_appointment_id ON public.required_parts(appointment_id);

-- 4. LIMPIAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Profiles: Propietario o Admin" ON public.profiles;
DROP POLICY IF EXISTS "Appointments: Propietario o Admin" ON public.appointments;
DROP POLICY IF EXISTS "Daily Settings: Lectura Publica" ON public.daily_settings;
DROP POLICY IF EXISTS "Daily Settings: Solo Admin" ON public.daily_settings;
DROP POLICY IF EXISTS "Required Parts: Lectura Auth" ON public.required_parts;
DROP POLICY IF EXISTS "Required Parts: Solo Admin" ON public.required_parts;

-- 5. POLÍTICAS PARA profiles
-- (Uso de subconsulta para optimización de auth.uid() e is_admin())
CREATE POLICY "Profiles: Propietario o Admin"
ON public.profiles FOR ALL
USING (id = (SELECT auth.uid()) OR (SELECT is_admin()));

-- 6. POLÍTICAS PARA appointments
CREATE POLICY "Appointments: Propietario o Admin"
ON public.appointments FOR ALL
USING (client_id = (SELECT auth.uid()) OR (SELECT is_admin()));

-- 7. POLÍTICAS PARA daily_settings
-- Lectura pública para ver disponibilidad; administración restringida a admins.
CREATE POLICY "Daily Settings: Lectura Publica"
ON public.daily_settings FOR SELECT
USING (true);

CREATE POLICY "Daily Settings: Admin Insert" ON public.daily_settings FOR INSERT TO authenticated WITH CHECK ((SELECT is_admin()));
CREATE POLICY "Daily Settings: Admin Update" ON public.daily_settings FOR UPDATE TO authenticated USING ((SELECT is_admin())) WITH CHECK ((SELECT is_admin()));
CREATE POLICY "Daily Settings: Admin Delete" ON public.daily_settings FOR DELETE TO authenticated USING ((SELECT is_admin()));

-- 8. POLÍTICAS PARA required_parts
-- Lectura restringida a quienes tengan acceso a la cita correspondiente.
CREATE POLICY "Required Parts: Lectura Auth"
ON public.required_parts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = appointment_id AND (client_id = (SELECT auth.uid()) OR (SELECT is_admin()))
  )
);

CREATE POLICY "Required Parts: Admin Insert" ON public.required_parts FOR INSERT TO authenticated WITH CHECK ((SELECT is_admin()));
CREATE POLICY "Required Parts: Admin Update" ON public.required_parts FOR UPDATE TO authenticated USING ((SELECT is_admin())) WITH CHECK ((SELECT is_admin()));
CREATE POLICY "Required Parts: Admin Delete" ON public.required_parts FOR DELETE TO authenticated USING ((SELECT is_admin()));

