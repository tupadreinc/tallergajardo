-- ==========================================
-- SUPABASE AUTH TRIGGER: Auto-crear Profile
-- ==========================================
-- Este trigger se ejecuta automáticamente en PostgreSQL cada vez que un usuario
-- se registra y confirma su cuenta en auth.users, inyectando su `id` y la meta data
-- (nombre y teléfono) configurados desde el Frontend directamente a `public.profiles`.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    'cliente', -- los nuevos usuarios web siempre son clientes
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Eliminamos el trigger si ya existiera para evitar duplicidades en reinicios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
