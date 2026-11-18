/**
 * Faixa curva azul-marinho com filete laranja luminoso, usada nos cantos das
 * cenas. A altura vem da classe (`h-…`); a largura acompanha a proporção.
 */
export function CornerSwoosh({ corner, className = "" }: { corner: "tl" | "br"; className?: string }) {
  if (corner === "tl") {
    return (
      <svg viewBox="0 0 400 200" className={`w-auto ${className}`} aria-hidden="true" focusable="false">
        <path d="M330 0H420C300 44 160 116 0 208V160C120 82 236 30 330 0Z" fill="#dde4ef" opacity="0.55" />
        <path d="M0 0H330C236 30 120 82 0 160Z" fill="#0f2248" />
        <path d="M0 0H250C180 22 96 60 0 112Z" fill="#0b1a38" opacity="0.6" />
        <path d="M0 160C120 82 236 30 330 0" fill="none" stroke="#f47c28" strokeOpacity="0.28" strokeWidth="9" strokeLinecap="round" />
        <path d="M0 160C120 82 236 30 330 0" fill="none" stroke="#ff9a4d" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 440 180" className={`w-auto ${className}`} aria-hidden="true" focusable="false">
      <path d="M440 -30V0C330 96 190 160 40 180H-20C150 156 300 80 440 -30Z" fill="#dde4ef" opacity="0.55" />
      <path d="M440 0V180H40C190 160 330 96 440 0Z" fill="#0f2248" />
      <path d="M440 70V180H200C300 156 380 120 440 70Z" fill="#0b1a38" opacity="0.6" />
      <path d="M40 180C190 160 330 96 440 0" fill="none" stroke="#f47c28" strokeOpacity="0.28" strokeWidth="9" strokeLinecap="round" />
      <path d="M40 180C190 160 330 96 440 0" fill="none" stroke="#ff9a4d" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
