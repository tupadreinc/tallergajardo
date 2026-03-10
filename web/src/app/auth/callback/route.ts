import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/client/dashboard'
  
  // Sanitizar parámetro: la redirección debe ser relativa internamente y no un host externo
  const safeNext = (rawNext.startsWith('/') && !rawNext.startsWith('//')) 
    ? rawNext 
    : '/client/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // Ignorar error si se llama desde entorno que no soporta escritura
            }
          },
        },
      }
    )

    // exchangeCodeForSession intercambia el código por tokens y ejecuta setAll guardándolos en la cookie del browser.
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // Si hay error o falta código redirige con query param
  return NextResponse.redirect(`${origin}/login?error=Invalid_Token`)
}
