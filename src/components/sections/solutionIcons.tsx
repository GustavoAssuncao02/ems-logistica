import type { ReactNode } from "react";

/** Ícones de traço (24 × 24) das soluções. A cor vem de `currentColor`. */
function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const TargetIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="11" cy="13" r="8.5" />
    <circle cx="11" cy="13" r="5" />
    <circle cx="11" cy="13" r="1.6" />
    <path d="M11 13 20 4M17 3.5V7h3.5M20 4l1.5-1.5" />
  </Icon>
);

export const PackageIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 3 20 7.5V16.5L12 21 4 16.5V7.5Z" />
    <path d="M4 7.5 12 12 20 7.5M12 12V21M8 5.3 16 9.8" />
  </Icon>
);

export const PinIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 21s-6.5-5.8-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21Z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </Icon>
);

export const CalendarIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01M16 16.5h.01" strokeWidth="2.4" />
  </Icon>
);

export const CubesIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 2.5 16.5 5v5L12 12.5 7.5 10V5Z M7.5 5 12 7.5 16.5 5M12 7.5v5" />
    <path d="M7.5 10 12 12.5V17.5L7.5 20 3 17.5V12.5Z M3 12.5 7.5 15 12 12.5M7.5 15v5" />
    <path d="M16.5 10 21 12.5V17.5L16.5 20 12 17.5V12.5Z M12 12.5 16.5 15 21 12.5M16.5 15v5" />
  </Icon>
);

export const BadgeIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 2.5l2 1.5 2.5-.2.8 2.4 2.1 1.4-.8 2.4.8 2.4-2.1 1.4-.8 2.4-2.5-.2-2 1.5-2-1.5-2.5.2-.8-2.4L4.6 12.4l.8-2.4-.8-2.4 2.1-1.4.8-2.4 2.5.2Z" />
    <path d="m8.8 10 2.2 2.2 4.2-4.2" />
    <path d="M8.6 16.6 7.2 21.5l4.8-1.9 4.8 1.9-1.4-4.9" />
  </Icon>
);

export const TruckIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M2.5 6.5h11v10h-11Z" />
    <path d="M13.5 10h4l3.5 3.6v2.9h-7.5" />
    <circle cx="6.5" cy="17.5" r="2" fill="white" />
    <circle cx="17" cy="17.5" r="2" fill="white" />
  </Icon>
);

export const HandshakeIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3a2 2 0 0 0 1.4.3L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </Icon>
);

export const CoinsIcon = ({ className }: P) => (
  <Icon className={className}>
    <ellipse cx="12" cy="5.5" rx="7" ry="2.6" />
    <path d="M5 5.5v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4" />
    <path d="M5 9.5v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4" />
    <path d="M5 13.5v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4" />
  </Icon>
);

export const SlidersIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M3 6.5h10M17 6.5h4M3 12h3M10 12h11M3 17.5h12M19 17.5h2" />
    <circle cx="15" cy="6.5" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="17" cy="17.5" r="2" />
  </Icon>
);

export const CheckIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth="3" />
  </Icon>
);
