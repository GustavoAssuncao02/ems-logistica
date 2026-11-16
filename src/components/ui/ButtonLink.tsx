import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost-light" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-orange text-navy hover:bg-[#ff8d3f] shadow-[0_8px_24px_-12px_rgba(244,124,40,0.8)]",
  secondary: "bg-navy text-white hover:bg-navy-700",
  "ghost-light": "bg-white/10 text-white ring-1 ring-white/35 backdrop-blur-[2px] hover:bg-white/20",
  outline: "text-navy ring-1 ring-navy/20 hover:ring-navy/50 hover:bg-navy/[0.03]",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  arrow = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition duration-300 ${styles[variant]} ${className}`}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={`transition-transform duration-300 group-hover:translate-x-0.5 ${className}`}>
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
