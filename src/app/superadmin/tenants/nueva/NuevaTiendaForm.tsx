'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { crearTenant, buscarUsuariosPorEmail } from '@/lib/actions/superadmin'

interface Plan { id: string; nombre: string; label: string; color: string }
interface Props { planes: Plan[] }

const S = {
  card:     { backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 } as React.CSSProperties,
  label:    { display: 'block', fontSize: 11, fontWeight: 600, color: '#6B6B70', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 },
  input:    { width: '100%', backgroundColor: '#1a1a1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#F5F5F2', outline: 'none', boxSizing: 'border-box' as const },
  row:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } as React.CSSProperties,
  section:  { fontSize: 13, fontWeight: 600, color: '#F5F5F2', marginBottom: 12 } as React.CSSProperties,
  radioRow: { display: 'flex', gap: 8, marginBottom: 16 } as React.CSSProperties,
  radio:    (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'center',
    border: `2px solid ${active ? '#E11D2E' : 'rgba(255,255,255,0.08)'}`,
    backgroundColor: active ? 'rgba(225,29,46,0.08)' : '#1a1a1c',
    color: active ? '#F5F5F2' : '#6B6B70',
  }),
}

export function NuevaTiendaForm({ planes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [modoUsuario, setModoUsuario] = useState<'nuevo' | 'existente'>('nuevo')

  // Búsqueda de usuarios existentes
  const [emailBusq, setEmailBusq]     = useState('')
  const [sugerencias, setSugerencias] = useState<{ id: string; email: string; tenant_id: string | null }[]>([])
  const [buscando, setBuscando]       = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (modoUsuario !== 'existente') return
    if (emailBusq.length < 3) { setSugerencias([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setBuscando(true)
      const results = await buscarUsuariosPorEmail(emailBusq)
      setSugerencias(results)
      setBuscando(false)
    }, 350)
  }, [emailBusq, modoUsuario])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const fd = new FormData(e.currentTarget)

    const input = {
      slug:          (fd.get('slug') as string).toLowerCase().trim(),
      nombre:        fd.get('nombre') as string,
      color_primario: fd.get('color_primario') as string,
      plan_id:       fd.get('plan_id') as string,
      theme:         fd.get('theme') as string,
      etapa:         fd.get('etapa') as string,
      font_display:  fd.get('font_display') as string,
      font_body:     fd.get('font_body') as string,
      modo_usuario:  modoUsuario,
      email:         fd.get('email') as string,
      password:      modoUsuario === 'nuevo' ? (fd.get('password') as string) : undefined,
    }

    startTransition(async () => {
      const result = await crearTenant(input)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`✓ Tienda "${input.nombre}" creada. El admin puede ingresar en ${input.slug}.peshoop.com/admin`)
        setTimeout(() => router.push('/superadmin'), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Datos de la tienda ── */}
      <div style={S.card}>
        <p style={S.section}>Datos de la tienda</p>
        <div style={S.row}>
          <div>
            <label style={S.label}>Nombre</label>
            <input name="nombre" required placeholder="Anarchy Store" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Slug (subdominio)</label>
            <div style={{ position: 'relative' }}>
              <input name="slug" required placeholder="anarchy" pattern="[a-z0-9-]+" title="Solo letras minúsculas, números y guiones"
                style={{ ...S.input, paddingRight: 120 }} />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6B6B70', pointerEvents: 'none' }}>
                .peshoop.com
              </span>
            </div>
          </div>
        </div>
        <div style={S.row}>
          <div>
            <label style={S.label}>Color primario</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input name="color_primario" type="color" defaultValue="#E11D2E"
                style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', backgroundColor: 'transparent' }} />
              <input name="color_primario_hex" placeholder="#E11D2E" style={{ ...S.input, flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={S.label}>Plan</label>
            <select name="plan_id" style={{ ...S.input, appearance: 'none' }}>
              <option value="">Sin plan</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={S.row}>
          <div>
            <label style={S.label}>Theme</label>
            <select name="theme" style={{ ...S.input, appearance: 'none' }}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Etapa</label>
            <select name="etapa" style={{ ...S.input, appearance: 'none' }}>
              <option value="demo">Demo</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="pruebas">Pruebas</option>
              <option value="pago">Pago</option>
              <option value="produccion">Producción</option>
            </select>
          </div>
        </div>
        <div style={S.row}>
          <div>
            <label style={S.label}>Fuente display <span style={{ color: '#4a4a50' }}>(opcional)</span></label>
            <input name="font_display" placeholder="Anton" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Fuente body <span style={{ color: '#4a4a50' }}>(opcional)</span></label>
            <input name="font_body" placeholder="Inter" style={S.input} />
          </div>
        </div>
      </div>

      {/* ── Usuario administrador ── */}
      <div style={S.card}>
        <p style={S.section}>Usuario administrador</p>

        <div style={S.radioRow}>
          <button type="button" style={S.radio(modoUsuario === 'nuevo')} onClick={() => setModoUsuario('nuevo')}>
            ✦ Crear nuevo usuario
          </button>
          <button type="button" style={S.radio(modoUsuario === 'existente')} onClick={() => setModoUsuario('existente')}>
            ↩ Asignar usuario existente
          </button>
        </div>

        {modoUsuario === 'nuevo' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={S.label}>Email del admin</label>
              <input name="email" type="email" required placeholder="admin@tienda.com" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Contraseña inicial</label>
              <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" style={S.input} />
            </div>
            <p style={{ fontSize: 11, color: '#6B6B70', margin: 0 }}>
              Se creará una cuenta en Supabase Auth con el email confirmado automáticamente.
            </p>
          </div>
        ) : (
          <div>
            <label style={S.label}>Buscar usuario por email</label>
            <div style={{ position: 'relative' }}>
              <input
                name="email"
                type="email"
                required
                placeholder="correo@existente.com"
                value={emailBusq}
                onChange={(e) => setEmailBusq(e.target.value)}
                style={S.input}
                autoComplete="off"
              />
              {buscando && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6B6B70' }}>
                  Buscando...
                </span>
              )}
            </div>
            {sugerencias.length > 0 && (
              <div style={{ backgroundColor: '#1a1a1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 4, overflow: 'hidden' }}>
                {sugerencias.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setEmailBusq(u.email); setSugerencias([]) }}
                    style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span style={{ fontSize: 13, color: '#F5F5F2' }}>{u.email}</span>
                    {u.tenant_id && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                        Ya tiene tenant
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <p style={{ fontSize: 11, color: '#6B6B70', marginTop: 8, marginBottom: 0 }}>
              Se actualizará el <code style={{ backgroundColor: '#1a1a1c', padding: '1px 5px', borderRadius: 4 }}>tenant_id</code> en los metadatos del usuario existente.
              Si ya tiene un tenant asignado, será reemplazado.
            </p>
          </div>
        )}
      </div>

      {/* ── Error / Éxito ── */}
      {error && (
        <div style={{ backgroundColor: 'rgba(225,29,46,0.08)', border: '1px solid rgba(225,29,46,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: '#6ee7b7', margin: 0 }}>{success}</p>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending || !!success}
        style={{ width: '100%', backgroundColor: '#E11D2E', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: (isPending || !!success) ? 0.6 : 1 }}
      >
        {isPending ? 'Creando tienda...' : 'Crear tienda'}
      </button>
    </form>
  )
}
