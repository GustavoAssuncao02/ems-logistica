import { clamp } from "./geometry";

type Options = {
  /** Lê a posição na tela e devolve o progresso-alvo (0..1). */
  measure: () => number;
  /** Desenha o quadro para um progresso (já suavizado). */
  render: (p: number) => void;
  /** Recalcula medidas de layout (antes de redesenhar, ao redimensionar). */
  layout?: () => void;
  /** Valor fixo com `prefers-reduced-motion: reduce`. */
  reduced: number;
  /** Rapidez com que o desenho alcança a rolagem (maior = mais colado). */
  response?: number;
  /** Elementos cujo redimensionamento exige novo layout. */
  observe?: Element[];
};

/**
 * Liga uma animação à rolagem da página. O valor desenhado persegue o alvo
 * com suavização exponencial; só há quadros enquanto ele se aproxima do alvo
 * (parado, não consome nada). Com movimento reduzido, mostra o quadro fixo.
 * Devolve a função de limpeza.
 */
export function bindScrollProgress({ measure, render, layout, reduced, response = 9, observe }: Options) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = Number.NaN;
  let target = 0;
  let raf = 0;
  let last = 0;

  const frame = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    current += (target - current) * (1 - Math.exp(-dt * response));
    if (Math.abs(target - current) < 0.0004) current = target;
    render(current);
    raf = current === target ? 0 : requestAnimationFrame(frame);
  };

  const update = () => {
    target = motion.matches ? reduced : clamp(measure());
    if (Number.isNaN(current) || motion.matches) {
      cancelAnimationFrame(raf);
      raf = 0;
      current = target;
      render(current);
      return;
    }
    if (!raf && current !== target) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const onResize = () => {
    layout?.();
    if (!Number.isNaN(current)) render(current);
    update();
  };

  layout?.();
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", onResize);
  motion.addEventListener("change", onResize);
  // mudanças de tamanho que não vêm da janela (fontes carregando, quebra de linha)
  const ro = observe?.length ? new ResizeObserver(onResize) : null;
  observe?.forEach((el) => ro?.observe(el));
  return () => {
    ro?.disconnect();
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", onResize);
    motion.removeEventListener("change", onResize);
  };
}
