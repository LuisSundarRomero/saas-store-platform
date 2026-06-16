import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'contahorro.com'
const RESERVED_SLUGS = ['www', 'sass', 'app', 'api']

// Cliente admin para resolver tenants — bypasa RLS, solo se usa en servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const hostname = request.headers.get('host') || ''

  // ── Detectar subdominio ──────────────────────────────────────
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  let tenantSlug: string | null = null

  if (!isLocalhost) {
    const subdomain = hostname.replace(`.${MAIN_DOMAIN}`, '')
    if (subdomain && subdomain !== hostname && !RESERVED_SLUGS.includes(subdomain)) {
      tenantSlug = subdomain
    }
  } else {
    tenantSlug = request.headers.get('x-tenant-slug') || 'anarchy'
  }

  // ── Supabase client para auth ────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── Resolver tenant desde DB ─────────────────────────────────
  if (tenantSlug) {
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, slug, nombre, color_primario, logo_url, activo')
      .eq('slug', tenantSlug)
      .eq('activo', true)
      .single()

    if (!tenant) {
      // En desarrollo: mostrar error en lugar de redirigir a dominio externo
      if (isLocalhost) {
        return new NextResponse(
          `<h1>Tenant "${tenantSlug}" no encontrado</h1><p>Verifica que la migración se ejecutó correctamente en Supabase.</p>`,
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        )
      }
      return NextResponse.redirect(`https://${MAIN_DOMAIN}`)
    }

    // Inyectar tenant en headers para que los Server Components lo lean
    response.headers.set('x-tenant-id', tenant.id)
    response.headers.set('x-tenant-slug', tenant.slug)
    response.headers.set('x-tenant-nombre', tenant.nombre)
    response.headers.set('x-tenant-color', tenant.color_primario || '#000000')
    response.headers.set('x-tenant-logo', tenant.logo_url || '')
  }

  // ── Protección de rutas admin ────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto archivos estáticos y _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
