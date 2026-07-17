import Image from 'next/image'
import { ResetPasswordForm } from '@/components/admin/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, var(--color-pbg) 0%, var(--color-pvl) 100%)' }}
    >
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-7">
          <div
            className="flex items-center justify-center rounded-2xl mb-4 overflow-hidden select-none"
            style={{
              width: 64,
              height: 64,
              boxShadow: '0 2px 16px color-mix(in srgb, var(--color-pv) 20%, transparent), 0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Image src="/logo-peshoop.webp" alt="Peshoop" width={64} height={64} priority />
          </div>
          <h1 className="font-display text-3xl text-pv">
            Peshoop
          </h1>
          <p className="text-xs text-pmuted mt-1">Restablecer contraseña</p>
        </div>

        <div
          className="bg-white rounded-3xl p-7"
          style={{ boxShadow: '0 4px 32px color-mix(in srgb, var(--color-pv) 10%, transparent), 0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <ResetPasswordForm />
        </div>

        <p className="text-center text-xs text-pmuted mt-5">
          Acceso restringido al equipo de Peshoop
        </p>
      </div>
    </main>
  )
}
