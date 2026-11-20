"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EmsLogo } from "@/components/brand/EmsLogo";
import { nav, site } from "@/config/site";

/**
 * Cabeçalho: transparente sobre a hero da página inicial e branco ao rolar
 * (ou em páginas internas). No mobile, menu em painel com foco gerenciado.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Na home, só fica branco quando o texto da hero encosta no cabeçalho
    // (antes disso nada passa por baixo dele, então segue transparente).
    const onScroll = () => {
      const trigger = document.querySelector<HTMLElement>("[data-header-trigger]");
      const headerH = document.querySelector("header")?.getBoundingClientRect().height ?? 80;
      setScrolled(trigger ? trigger.getBoundingClientRect().top < headerH : window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // fecha o menu ao navegar
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = [buttonRef.current, ...panelRef.current.querySelectorAll<HTMLElement>("a")].filter(Boolean) as HTMLElement[];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const overlay = isHome && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${open ? "" : "transition-[background-color,box-shadow,color] duration-500"} ${
        overlay ? "bg-transparent text-white" : "bg-white text-navy shadow-[0_1px_0_0_var(--color-line),0_10px_30px_-20px_rgba(22,47,96,0.35)]"
      }`}
    >
      {overlay && <div aria-hidden="true" className="pointer-events-none absolute inset-0 -bottom-10 bg-gradient-to-b from-navy-950/55 to-transparent" />}
      <div className="container-ems relative flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Link href="/#inicio" className="flex shrink-0 items-center gap-3" aria-label={`${site.name} — página inicial`}>
          <EmsLogo variant={overlay ? "inverse" : "color"} descriptor={false} className="h-8 w-auto lg:h-9" title="EMS" build />
          <span
            className={`logo-build-desc hidden border-l pl-3 font-display text-[11px] font-bold tracking-[0.32em] sm:block ${
              overlay ? "border-white/30 text-white/85" : "border-line text-slate"
            }`}
          >
            LOGÍSTICA
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative py-2 text-[14px] font-medium transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-orange after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    overlay ? "text-white/85 hover:text-white" : "text-navy/75 hover:text-navy"
                  } ${pathname.replace(/\/$/, "") === item.href ? (overlay ? "text-white" : "text-navy") : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#cotacao"
            className="hidden rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-[#ff8d3f] sm:inline-flex"
          >
            Solicitar cotação
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className={`grid h-11 w-11 place-items-center rounded-full transition xl:hidden ${overlay ? "hover:bg-white/10" : "hover:bg-navy/5"}`}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3.5 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-0 h-[1.5px] w-5 bg-current transition duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[6px] h-[1.5px] w-5 bg-current transition duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-[1.5px] w-5 bg-current transition duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto bg-white lg:top-20 xl:hidden"
      >
        <nav aria-label="Menu" className="container-ems flex min-h-full flex-col pb-10 pt-4">
          <ul className="divide-y divide-line">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 font-display text-xl font-semibold text-navy"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-orange">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#cotacao"
            onClick={() => setOpen(false)}
            className="mt-8 inline-flex justify-center rounded-full bg-orange px-6 py-4 text-base font-bold text-navy"
          >
            Solicitar cotação
          </Link>
          {site.contact.instagram && (
          <a
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 text-center text-sm font-medium text-slate underline-offset-4 hover:underline"
          >
            Instagram {site.contact.instagramHandle}
          </a>
          )}
        </nav>
      </div>
    </header>
  );
}
