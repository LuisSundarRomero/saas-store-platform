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
  const hostname = request.headers.get('host') || ''
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // ── 1. Detectar subdominio ───────────────────────────────────
  let tenantSlug: string | null = null

  if (!isLocalhost) {
    const subdomain = hostname.replace(`.${MAIN_DOMAIN}`, '')
    if (subdomain && subdomain !== hostname && !RESERVED_SLUGS.includes(subdomain)) {
      tenantSlug = subdomain
    }
  } else {
    // En localhost, detectar subdominio si existe (ej: demo.localhost:3000)
    const parts = hostname.split('.')
    const firstPart = parts[0]
    if (
      parts.length > 1 &&
      !firstPart.includes('localhost') &&
      !firstPart.includes('127') &&
      !RESERVED_SLUGS.includes(firstPart)
    ) {
      tenantSlug = firstPart
    } else {
      tenantSlug = request.headers.get('x-tenant-slug') || 'anarchy'
    }
  }

  // ── 2. Construir headers del request con datos del tenant ────
  const requestHeaders = new Headers(request.headers)

  // Dominio raíz sin subdominio → landing de venta del SaaS
  if (!tenantSlug && !isLocalhost) {
    requestHeaders.set('x-is-platform', 'true')
  }

  if (tenantSlug) {
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, slug, nombre, color_primario, logo_url, activo, font_display, font_body, theme, planes!plan_id(nombre)')
      .eq('slug', tenantSlug)
      .eq('activo', true)
      .single()

    if (!tenant) {
      if (isLocalhost) {
        return new NextResponse(
          `<h1>Tenant "${tenantSlug}" no encontrado</h1><p>Verifica que la migración se ejecutó correctamente en Supabase.</p>`,
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        )
      }
      return NextResponse.redirect(`https://${MAIN_DOMAIN}`)
    }

    // Inyectar en REQUEST headers — los Server Components los leen con headers()
    requestHeaders.set('x-tenant-id', tenant.id)
    requestHeaders.set('x-tenant-slug', tenant.slug)
    requestHeaders.set('x-tenant-nombre', tenant.nombre)
    requestHeaders.set('x-tenant-color', tenant.color_primario || '#000000')
    requestHeaders.set('x-tenant-logo', tenant.logo_url || '')
    requestHeaders.set('x-tenant-font-display', tenant.font_display || '')
    requestHeaders.set('x-tenant-font-body', tenant.font_body || '')
    requestHeaders.set('x-tenant-theme', tenant.theme || 'dark')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planNombre = (tenant as any).planes?.nombre ?? ''
    requestHeaders.set('x-tenant-plan', planNombre)
  }

  // ── 3. Crear respuesta con los headers modificados ───────────
  // Un solo objeto response que: reenvía headers al Server Component + maneja cookies auth
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ── 4. Supabase auth client — usa el mismo response para cookies
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

  // ── 5. Protección de rutas admin ─────────────────────────────
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
