"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MONO, SCENES, VIEWBOXES, type ViewMode } from "./config";
import { JourneyScene } from "./JourneyScene";
import { createPlan, sceneIndexAt } from "./plan";
import { buildTimeline, createRenderer, initialState } from "./timeline";

gsap.registerPlugin(useGSAP);

type Status = "idle" | "playing" | "paused" | "finished";

/**
 * Jornada logística 2D — seção completa.
 *
 * Comportamento de reprodução:
 *  • Inicia sozinha na primeira vez em que ~35% do palco fica visível.
 *  • A história não depende da rolagem; a rolagem nunca é bloqueada.
 *  • Ao sair da tela, pausa automaticamente; ao voltar, continua de onde
 *    parou (a menos que a pessoa tenha pausado manualmente).
 *  • Ao terminar, permanece no quadro final — não reinicia sozinha.
 *    "Assistir novamente" / "Reiniciar" recomeçam do zero.
 *  • "Pular animação" leva ao quadro final com o encerramento.
 *  • Clicar numa etapa da linha de progresso salta para ela.
 *  • prefers-reduced-motion: não há reprodução automática; cada etapa é
 *    exibida como um quadro estático, com navegação Anterior/Próxima e a
 *    opção de reproduzir a animação completa voluntariamente.
 */
export function JourneyAnimation() {
  const plan = useMemo(() => createPlan(), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(0);
  const outroRef = useRef<HTMLDivElement>(null);
  const userPausedRef = useRef(false);
  const autoPausedRef = useRef(false);
  const startedRef = useRef(false);
  const inIntroRef = useRef(true);
  const outroVisibleRef = useRef(false);

  const [scene, setScene] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [outroVisible, setOutroVisible] = useState(false);
  const [inIntro, setInIntro] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [view, setView] = useState<ViewMode>("desktop");

  // ── preferências do dispositivo ──────────────────────────────────────
  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 639px)");
    const mqTablet = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      setReduced(mqReduce.matches);
      setView(mqMobile.matches ? "mobile" : mqTablet.matches ? "tablet" : "desktop");
    };
    update();
    mqReduce.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    return () => {
      mqReduce.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  // ── timeline ─────────────────────────────────────────────────────────
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      const state = initialState(plan);
      const render = createRenderer(svg, plan, state, {
        onFrame: (time, s) => {
          const idx = sceneIndexAt(plan, time);
          if (idx !== sceneRef.current) {
            sceneRef.current = idx;
            setScene(idx);
          }
          const intro = time < plan.t.introEnd - 0.2;
          if (intro !== inIntroRef.current) {
            inIntroRef.current = intro;
            setInIntro(intro);
          }
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, time / plan.duration)})`;
          if (outroRef.current) {
            outroRef.current.style.opacity = String(s.outro);
            outroRef.current.style.transform = `translateY(${(1 - s.outro) * 14}px)`;
          }
          const outroOn = s.outro > 0.4;
          if (outroOn !== outroVisibleRef.current) {
            outroVisibleRef.current = outroOn;
            setOutroVisible(outroOn);
          }
        },
      });
      const tl = buildTimeline(plan, state, render);
      tl.eventCallback("onComplete", () => setStatus("finished"));
      tlRef.current = tl;

      // depuração/inspeção visual: ?jt=12.5 posiciona a jornada nesse instante
      const debugT = new URLSearchParams(window.location.search).get("jt");
      if (debugT !== null) {
        startedRef.current = true;
        tl.pause(Number(debugT) || 0, false);
        render(tl.time());
        setStatus("paused");
        return;
      }
      tl.pause(0, false);
      render(0);
    },
    { scope: rootRef, dependencies: [plan] },
  );

  // modo de movimento reduzido: mostra o quadro-chave da etapa atual
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || !reduced || status === "playing") return;
    if (!startedRef.current) tl.pause(plan.scenes[0].poster, false);
  }, [reduced, status, plan]);

  // ── visibilidade: autoplay e pausa fora da tela ──────────────────────
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const tl = tlRef.current;
        if (!tl) return;
        const visible = entry.intersectionRatio >= 0.35;
        if (visible) {
          if (!startedRef.current && !reduced) {
            startedRef.current = true;
            tl.play(0);
            setStatus("playing");
          } else if (autoPausedRef.current && !userPausedRef.current && tl.progress() < 1) {
            autoPausedRef.current = false;
            tl.play();
            setStatus("playing");
          }
        } else if (entry.intersectionRatio < 0.05 && tl.isActive()) {
          autoPausedRef.current = true;
          tl.pause();
          setStatus("paused");
        }
      },
      { threshold: [0, 0.05, 0.35, 0.6] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduced]);

  // ── controles ────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    startedRef.current = true;
    userPausedRef.current = false;
    if (tl.progress() >= 1) tl.play(0);
    else tl.play();
    setStatus("playing");
  }, []);

  const pause = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    userPausedRef.current = true;
    tl.pause();
    setStatus("paused");
  }, []);

  const restart = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    startedRef.current = true;
    userPausedRef.current = false;
    if (reduced) {
      tl.pause(plan.scenes[0].poster, false);
      setStatus("paused");
      return;
    }
    tl.play(0);
    setStatus("playing");
  }, [reduced, plan]);

  const skip = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    startedRef.current = true;
    tl.pause(plan.duration, false);
    setStatus("finished");
  }, [plan]);

  const goTo = useCallback(
    (i: number) => {
      const tl = tlRef.current;
      if (!tl) return;
      startedRef.current = true;
      const target = plan.scenes[Math.max(0, Math.min(plan.scenes.length - 1, i))];
      if (status === "playing" && !reduced) {
        tl.play(i === 0 ? 0 : target.start);
        return;
      }
      // pausado ou movimento reduzido: mostra o quadro-chave da etapa
      tl.pause(target.poster, false);
      setStatus("paused");
    },
    [plan, reduced, status],
  );

  const vb = VIEWBOXES[view];
  const isPlaying = status === "playing";
  const current = SCENES[scene];

  return (
    <div ref={rootRef} className="relative">
      <div
        className="journey-stage relative overflow-hidden rounded-[22px] md:rounded-[32px]"
        style={{ background: MONO.bg }}
      >
        <svg
          ref={svgRef}
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          preserveAspectRatio="xMidYMid slice"
          className="block h-auto w-full select-none"
          style={{ aspectRatio: `${vb.w} / ${vb.h}` }}
          role="img"
          aria-labelledby="jornada-svg-title jornada-svg-desc"
        >
          <title id="jornada-svg-title">Jornada logística EMS em seis etapas</title>
          <desc id="jornada-svg-desc">
            Animação em preto e branco: um caminhão com a marca EMS parte de um centro de distribuição, para no
            pedágio, aguarda o semáforo, atravessa um rio de balsa, abastece em um posto e chega à doca de um centro
            logístico.
          </desc>
          <JourneyScene plan={plan} />
        </svg>

        {/* legenda (desktop/tablet) */}
        <div
          className={`pointer-events-none absolute left-5 top-5 hidden max-w-sm transition-opacity duration-500 sm:block md:left-8 md:top-7 ${
            inIntro || outroVisible ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        >
          <p className="font-display text-[11px] font-bold tracking-[0.22em] text-neutral-500">
            {String(scene + 1).padStart(2, "0")} / 06 · {current.label.toUpperCase()}
          </p>
          <p key={current.id} className="journey-caption mt-1.5 font-display text-lg font-semibold leading-snug text-neutral-900 md:text-xl">
            {current.caption}
          </p>
        </div>

        {/* encerramento */}
        <div
          ref={outroRef}
          className="absolute inset-0 flex items-center justify-center bg-white/80 px-6 text-center backdrop-blur-[2px]"
          style={{ opacity: 0, pointerEvents: outroVisible ? "auto" : "none" }}
          aria-hidden={!outroVisible}
        >
          <div className="max-w-xl">
            <p className="font-display text-2xl font-extrabold tracking-[0.18em] text-neutral-950 sm:text-4xl md:text-5xl">
              EMS LOGÍSTICA
            </p>
            <p className="mt-2 font-display text-base font-medium text-neutral-600 sm:mt-3 sm:text-xl">
              Planejamento que movimenta negócios.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
              <Link
                href="/#cotacao"
                tabIndex={outroVisible ? 0 : -1}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:text-base"
              >
                Solicitar cotação
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={restart}
                tabIndex={outroVisible ? 0 : -1}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-300 transition hover:bg-neutral-100 sm:text-base"
              >
                Assistir novamente
              </button>
            </div>
          </div>
        </div>

        {/* aviso de movimento reduzido */}
        {reduced && !isPlaying && !outroVisible && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200 sm:bottom-5 sm:right-5 sm:text-xs">
            Movimento reduzido ativo · navegue pelas etapas
          </div>
        )}
      </div>

      {/* legenda (mobile) */}
      <div className="mt-4 min-h-[4.75rem] sm:hidden" aria-hidden="true">
        <p className="font-display text-[11px] font-bold tracking-[0.22em] text-neutral-500">
          {String(scene + 1).padStart(2, "0")} / 06 · {current.label.toUpperCase()}
        </p>
        <p className="mt-1 font-display text-base font-semibold text-neutral-900">{current.caption}</p>
      </div>

      {/* controles + progresso */}
      <div className="mt-4 flex flex-col gap-4 sm:mt-6 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-2">
          {reduced && (
            <button type="button" onClick={() => goTo(scene - 1)} className={ctrlBtn} aria-label="Etapa anterior" disabled={scene === 0}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M11 4 6 9l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={isPlaying ? pause : play}
            className={`${ctrlBtn} bg-neutral-950 text-white ring-neutral-950 hover:bg-neutral-800`}
            aria-label={isPlaying ? "Pausar animação" : status === "finished" ? "Reproduzir novamente" : "Reproduzir animação"}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <rect x="4.5" y="3.5" width="3" height="11" rx="1" fill="currentColor" />
                <rect x="10.5" y="3.5" width="3" height="11" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M6 3.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L6.9 3.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
              </svg>
            )}
          </button>
          {reduced && (
            <button
              type="button"
              onClick={() => goTo(scene + 1)}
              className={ctrlBtn}
              aria-label="Próxima etapa"
              disabled={scene === SCENES.length - 1}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="m7 4 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button type="button" onClick={restart} className={ctrlBtn} aria-label="Reiniciar animação">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M3.5 9a5.5 5.5 0 1 0 1.7-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M4.6 2.2v3.3h3.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={skip}
            className="ml-1 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 underline-offset-4 transition hover:text-neutral-950 hover:underline"
          >
            Pular animação
          </button>
        </div>

        <nav aria-label="Etapas da jornada" className="min-w-0 flex-1">
          <div className="relative mb-3 h-px w-full bg-neutral-200">
            <div ref={progressRef} className="absolute inset-0 origin-left bg-neutral-950" style={{ transform: "scaleX(0)" }} />
          </div>
          <ol className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 lg:grid-cols-6">
            {SCENES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === scene ? "step" : undefined}
                  className={`w-full truncate py-1 text-left font-display text-[10.5px] font-bold tracking-[0.14em] transition sm:text-[11px] ${
                    i === scene ? "text-neutral-950" : i < scene ? "text-neutral-500" : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <span className="mr-1.5 inline-block tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s.label.toUpperCase()}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <p className="sr-only" aria-live="polite">
        Etapa {scene + 1} de 6: {current.label}. {current.caption}
      </p>
    </div>
  );
}

const ctrlBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 ring-1 ring-neutral-300 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40";
