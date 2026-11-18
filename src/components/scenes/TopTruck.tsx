/**
 * Carreta branca vista de cima, levemente de lado (aparece a lateral direita).
 * Coordenadas locais: frente para +x, centro na origem, 300 × 70 unidades.
 */
export function TopTruck() {
  const ribs = [];
  for (let x = -143; x < 60; x += 9) ribs.push(x);
  return (
    <g>
      <defs>
        <linearGradient id="tt-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e9edf3" />
        </linearGradient>
        <linearGradient id="tt-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e8ef" />
          <stop offset="1" stopColor="#bcc5d2" />
        </linearGradient>
        <linearGradient id="tt-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c4372" />
          <stop offset="0.55" stopColor="#14213d" />
          <stop offset="1" stopColor="#0b1428" />
        </linearGradient>
        <filter id="tt-blur" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <radialGradient id="tt-red">
          <stop offset="0" stopColor="#ff3b30" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff3b30" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sombra no asfalto */}
      <rect x={-146} y={-20} width={304} height={70} rx={16} fill="#050b18" opacity={0.42} filter="url(#tt-blur)" />

      {/* rodas aparecendo sob a lateral */}
      {[-132, -108, 98, 132].map((x) => (
        <rect key={x} x={x - 10} y={31} width={20} height={8} rx={3} fill="#121826" />
      ))}

      {/* baú: lateral com nervuras e friso laranja */}
      <rect x={-150} y={5} width={214} height={29} rx={3} fill="url(#tt-side)" />
      {ribs.map((x) => (
        <line key={x} x1={x} y1={8} x2={x} y2={30} stroke="#a9b4c4" strokeWidth={1} opacity={0.75} />
      ))}
      <rect x={-150} y={29} width={214} height={2.6} fill="#f47c28" />

      {/* baú: teto */}
      <rect x={-150} y={-35} width={214} height={42} rx={4} fill="url(#tt-top)" stroke="#cfd6e0" strokeWidth={1} />
      {[-112, -72, -32, 8, 46].map((x) => (
        <line key={x} x1={x} y1={-33} x2={x} y2={5} stroke="#e0e5ec" strokeWidth={1.4} />
      ))}

      {/* lanternas traseiras */}
      <circle cx={-156} cy={-28} r={14} fill="url(#tt-red)" />
      <circle cx={-156} cy={24} r={16} fill="url(#tt-red)" />
      <rect x={-153.5} y={-32} width={5} height={8} rx={1.5} fill="#ff4136" />
      <rect x={-153.5} y={18} width={5} height={11} rx={1.5} fill="#ff4136" />

      {/* engate */}
      <rect x={62} y={-13} width={15} height={36} rx={2} fill="#283246" />

      {/* cabine: lateral, janela */}
      <path d="M74 5H140Q153 5 153 18V30Q153 35 148 35H74Z" fill="url(#tt-side)" />
      <path d="M122 9H143Q148 9 148 14V18H122Z" fill="#2a3a5c" />
      <rect x={74} y={30} width={74} height={2.6} fill="#f47c28" />

      {/* cabine: teto, defletor e para-brisa */}
      <rect x={74} y={-33} width={74} height={40} rx={10} fill="url(#tt-top)" stroke="#cfd6e0" strokeWidth={1} />
      <rect x={79} y={-29} width={36} height={32} rx={8} fill="#eef1f6" stroke="#d5dbe4" strokeWidth={1} />
      <path d="M128 -31Q146 -31 149 -20V-1Q146 7 128 7Z" fill="url(#tt-glass)" />

      {/* retrovisores e faróis */}
      <rect x={127} y={-41} width={8} height={6} rx={2} fill="#1b2231" />
      <rect x={127} y={36} width={8} height={6} rx={2} fill="#1b2231" />
      <ellipse cx={151.5} cy={-26} rx={2.4} ry={4} fill="#fff4d0" />
      <ellipse cx={151.5} cy={28} rx={2.4} ry={4} fill="#fff4d0" />
    </g>
  );
}
