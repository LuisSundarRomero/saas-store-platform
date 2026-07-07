interface Props {
  size?: number
  className?: string
}

export function LogoMark({ size = 40, className }: Props) {
  const s = size
  const pSize = s * 0.72
  const sSize = s * 0.48

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="peshoop isotipo"
    >
      {/* s en jade — detrás, desplazada abajo-derecha */}
      <text
        x="20"
        y="33"
        fontSize={sSize}
        fontFamily="var(--font-comfortaa), cursive"
        fontWeight="700"
        fill="#00A389"
        opacity="0.9"
      >
        s
      </text>
      {/* p en violeta — delante */}
      <text
        x="4"
        y="30"
        fontSize={pSize}
        fontFamily="var(--font-comfortaa), cursive"
        fontWeight="700"
        fill="#6C2BD9"
      >
        p
      </text>
    </svg>
  )
}

/** Versión para favicon: fondo violeta, letras blanco hueso */
export function LogoMarkIcon({ size = 512 }: { size?: number }) {
  const radius = size * 0.2
  const pSize = size * 0.72
  const sSize = size * 0.48

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="512" height="512" rx={radius} fill="#6C2BD9" />
      <text
        x="256"
        y="420"
        fontSize={sSize}
        fontFamily="var(--font-comfortaa), cursive"
        fontWeight="700"
        fill="#F6F4F2"
        opacity="0.7"
        textAnchor="middle"
      >
        s
      </text>
      <text
        x="200"
        y="390"
        fontSize={pSize}
        fontFamily="var(--font-comfortaa), cursive"
        fontWeight="700"
        fill="#F6F4F2"
        textAnchor="middle"
      >
        p
      </text>
    </svg>
  )
}
