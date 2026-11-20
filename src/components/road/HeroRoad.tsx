"use client";

import { useEffect, useRef, useState } from "react";
import { CAR_SECONDS, CARGO, CITY, CRUISE_SECONDS, FAR_GROUND, GROUND, H, LOAD, LOAD_DOOR, LOAD_GO, PASS_SECONDS, RIG, SPEED, cargoSlot } from "./constants";
import { Depot } from "./Depot";
import { Car, Rig } from "./Rig";
import { CITY_WIDTHS, Foreground, LAYERS, RoadSurface, Scenery } from "./Scenery";
import { PASSING, Stop, STOP_KINDS, STOPPING, STOPS, type StopKind, type StopLayer } from "./Stops";

type Phase = "loading" | "cruise" | "approach" | "brake" | "stopped" | "depart";

type Event = {
  kind: StopKind;
  /** Âncora no mundo. */
  x: number;
  /** Tempo parado. */
  t: number;
  /** Cancela aberta (0..1). */
  open: number;
  closing: boolean;
};

const CAR_COLORS = ["#D64545", "#2F6FD1", "#E6B422", "#E9EDF2", "#3B3F46", "#2BA37A"];
const CARS = 2;
const LAYER_ORDER: StopLayer[] = ["back", "road", "front", "over"];

const rand = ([a, b]: readonly [number, number]) => a + Math.random() * (b - a);
const randInt = ([a, b]: readonly [number, number]) => a + Math.floor(Math.random() * (b - a + 1));
const mod = (v: number, m: number) => ((v % m) + m) % m;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, t: number) => {
  const k = clamp((t - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

/** Retira do "baralho"; ao esvaziar, embaralha de novo sem repetir o último. */
function draw(bag: StopKind[], all: StopKind[], last: StopKind | null) {
  if (!bag.length) {
    bag.push(...all);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
  }
  return bag.pop()!;
}

/** Posição horizontal da carreta na tela (sem o vaivém). */
const baseX = (w: number) => Math.max(24, w * 0.03);
const driftAmp = (w: number) => Math.min(46, w * 0.03);
/** Posição da carreta encostada na doca, na abertura (deixa o galpão à vista). */
const introX = (w: number) => Math.max(baseX(w) + driftAmp(w), Math.min(w * 0.3, w - RIG.length - 60));

/**
 * Estrada sem fim da hero: a carreta EMS roda pela rodovia ao entardecer,
 * com montanhas, cidades, morros e árvores em parallax.
 *
 *  • Abertura: a carreta está de ré na doca do centro de distribuição EMS;
 *    as caixas entram no baú, a porta fecha e ela parte.
 *  • A cada ~15 s rodando, tira do "baralho" uma parada — pedágio, posto,
 *    semáforo ou balança —, freia até o ponto exato, cumpre a parada e
 *    segue. Todas aparecem antes de alguma se repetir.
 *  • Entre as paradas, passa por um túnel ou por uma ponte sobre um rio.
 *  • Cidades grandes surgem ao fundo a cada 10 s de viagem e levam 25 s
 *    para cruzar a tela; como andam conforme a distância percorrida, ficam
 *    paradas quando a carreta para.
 *
 * Tudo é simulado em tempo real (não há roteiro fixo). Sem textos.
 * Pausa fora da tela; com movimento reduzido, mostra um quadro estático.
 */
export function HeroRoad({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(2000);
  const [scale, setScale] = useState(1);
  const widthRef = useRef(width);
  /** px por unidade da cena (altura da faixa / H). */
  const scaleRef = useRef(scale);
  /** Redesenha o quadro atual (após redimensionar, com a animação parada). */
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const update = () => {
      const { width: w, height: h } = node.getBoundingClientRect();
      if (w > 0 && h > 0) {
        const next = Math.round((H * w) / h);
        widthRef.current = next;
        scaleRef.current = h / H;
        setWidth(next);
        setScale(h / H);
        redrawRef.current?.();
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!svg || !root || !stage) return;

    const q = (k: string) => svg.querySelector<SVGElement>(`[data-r="${k}"]`);
    const qa = (k: string) => Array.from(svg.querySelectorAll<SVGElement>(`[data-r="${k}"]`));
    const plane = (k: string) => root.querySelector<SVGSVGElement>(`[data-plane="${k}"]`);
    const el = {
      // camadas em plano próprio (movidas por CSS, na GPU) ou dentro da pista (atributo)
      layers: LAYERS.map((l) => {
        const p = plane(`layer-${l.id}`);
        return { ...l, node: (p ?? q(`layer-${l.id}`)) as SVGElement | null, css: Boolean(p) };
      }),
      rig: q("rig"),
      cab: q("rig-cab"),
      trailer: q("rig-trailer"),
      wheels: qa("wheel"),
      brake: q("brake"),
      beamLow: q("beam-low"),
      beamHigh: q("beam-high"),
      headGlow: q("head-glow"),
      stops: Object.fromEntries(
        STOP_KINDS.map((k) => [k, LAYER_ORDER.map((l) => q(`stop-${k}-${l}`)).filter(Boolean) as SVGElement[]]),
      ) as Record<StopKind, SVGElement[]>,
      tollArm: q("toll-arm"),
      tollLight: q("toll-light"),
      fuelBar: q("fuel-bar"),
      fuelHose: q("fuel-hose"),
      fuelHolster: q("fuel-holster"),
      sigRed: q("sig-red"),
      sigGreen: q("sig-green"),
      scaleBar: q("scale-bar"),
      scaleLight: q("scale-light"),
      cars: Array.from({ length: CARS }, (_, i) => ({ node: q(`car-${i}`), body: q(`car-body-${i}`) })),
      cities: CITY_WIDTHS.map((_, i) => plane(`city-${i}`)),
      depot: q("depot"),
      cargo: Array.from({ length: LOAD.boxes }, (_, i) => q(`cargo-${i}`)),
      door: q("rear-door"),
    };

    const cache = new WeakMap<Element, Record<string, string>>();
    const set = (node: Element | null | undefined, name: string, value: string | number) => {
      if (!node) return;
      const v = typeof value === "number" ? String(Math.round(value * 100) / 100) : value;
      let rec = cache.get(node);
      if (!rec) cache.set(node, (rec = {}));
      if (rec[name] === v) return;
      rec[name] = v;
      node.setAttribute(name, v);
    };
    /** Estilo inline dos planos da GPU, com o mesmo cache. */
    const css = (node: SVGElement | null | undefined, name: "transform" | "display", v: string) => {
      if (!node) return;
      let rec = cache.get(node);
      if (!rec) cache.set(node, (rec = {}));
      const k = `style:${name}`;
      if (rec[k] === v) return;
      rec[k] = v;
      node.style[name] = v;
    };
    /** Deslocamento horizontal de um plano: unidades da cena → px. */
    const shift = (units: number) => `translate3d(${Math.round(units * scaleRef.current * 100) / 100}px,0,0)`;

    const V = SPEED.cruise;
    const firstRun = randInt(CITY.run);
    const st = {
      s: 0,
      v: 0,
      a: 0,
      clock: 0,
      drift: 0,
      k: 0,
      phase: "loading" as Phase,
      /** Abertura: tempo de carga, mistura posição-da-doca → posição normal, galpão. */
      introT: 0,
      ib: 1,
      depotX: 0,
      depotOn: true,
      stopTimer: rand(CRUISE_SECONDS),
      passTimer: rand(PASS_SECONDS),
      ev: null as Event | null,
      lastStop: null as StopKind | null,
      lastPass: null as StopKind | null,
      stopBag: [] as StopKind[],
      passBag: [] as StopKind[],
      carTimer: rand([2, 5]),
      /** Farol alto (1) ↔ baixo (0), com transição suave. */
      high: 0,
      cars: Array.from({ length: CARS }, () => ({ x: 0, on: false })),
      cities: CITY_WIDTHS.map((w) => ({ x: 0, on: false, w })),
      cityAcc: 0,
      cityNext: 1,
      /** Cidades que ainda faltam no trecho urbano atual (a 1ª já está em cena). */
      cityRun: firstRun - 1,
      /** Ciclos restantes de campo (sem cidade nova). */
      citySkip: firstRun === 1 ? randInt(CITY.gap) : 0,
    };

    // uma cidade já em cena desde o início
    st.cities[0] = { ...st.cities[0], x: widthRef.current * 0.42, on: true };
    css(el.cities[0], "display", "block");

    const truckX = (w: number) => {
      const normal = baseX(w) + driftAmp(w) * (1 + st.k * st.drift);
      return normal + (introX(w) - normal) * smooth(0, 1, st.ib);
    };

    const spawn = (kind: StopKind, front: number, w: number) => {
      const cfg = STOPS[kind];
      const brakeDist = (V * V) / (2 * SPEED.decel);
      const enter = st.s + w - cfg.left + 40;
      const x = cfg.stop ? Math.max(enter, front - cfg.front + brakeDist + 120) : enter;
      st.ev = { kind, x, t: 0, open: 0, closing: false };
      if (cfg.stop) st.phase = "approach";
      el.stops[kind].forEach((n) => {
        set(n, "transform", `translate(${x - st.s} 0)`);
        set(n, "display", "inline");
      });
      // estado inicial de cada acontecimento
      set(el.tollArm, "transform", "rotate(0 5 200)");
      set(el.tollLight, "fill", "#EF4444");
      set(el.fuelBar, "width", 0);
      set(el.fuelHose, "opacity", 0);
      set(el.fuelHolster, "opacity", 1);
      set(el.sigRed, "fill", "#EF4444");
      set(el.sigGreen, "fill", "#123B22");
      set(el.scaleBar, "width", 0);
      set(el.scaleLight, "fill", "#EF4444");
    };

    const step = (dt: number) => {
      const w = widthRef.current;
      const moving = st.v / V;

      // vaivém da carreta: só evolui enquanto ela anda (parada, fica imóvel)
      st.clock += dt * moving;
      st.drift = 0.62 * Math.sin(st.clock * 0.23) + 0.38 * Math.sin(st.clock * 0.57 + 1.3);
      const target = st.phase === "cruise" ? 1 : 0;
      st.k += (target - st.k) * Math.min(1, dt * 0.9 * Math.max(moving, 0.05));
      // depois de partir da doca, a carreta volta aos poucos para a posição normal
      if (st.phase !== "loading") st.ib = Math.max(0, st.ib - dt * moving * 0.4);

      const tx = truckX(w);
      const front = st.s + tx + RIG.length;
      const vPrev = st.v;
      const ev = st.ev;

      switch (st.phase) {
        case "loading":
          st.v = 0;
          st.introT += dt;
          st.depotX = st.s + tx;
          if (st.introT >= LOAD_GO) st.phase = "depart";
          break;
        case "cruise":
          st.v = Math.min(V, st.v + SPEED.accel * dt);
          if (st.v >= V) {
            st.stopTimer -= dt;
            st.passTimer -= dt;
            if (!ev && st.stopTimer <= 0) {
              const kind = draw(st.stopBag, STOPPING, st.lastStop);
              st.lastStop = kind;
              spawn(kind, front, w);
            } else if (!ev && st.passTimer <= 0) {
              // só passa por túnel/ponte se ainda houver tempo antes da próxima parada
              if (st.stopTimer > 6) {
                const kind = draw(st.passBag, PASSING, st.lastPass);
                st.lastPass = kind;
                spawn(kind, front, w);
              }
              st.passTimer = Infinity;
            }
          }
          break;
        case "approach": {
          const rem = ev!.x + STOPS[ev!.kind].front - front;
          if (rem <= (st.v * st.v) / (2 * SPEED.decel)) st.phase = "brake";
          break;
        }
        case "brake": {
          const rem = ev!.x + STOPS[ev!.kind].front - front;
          if (rem <= 0.4 || st.v < 4) {
            st.v = 0;
            st.phase = "stopped";
            ev!.t = 0;
          } else {
            st.v = Math.max(0, st.v - ((st.v * st.v) / (2 * rem)) * dt);
          }
          break;
        }
        case "stopped":
          ev!.t += dt;
          if (ev!.t >= STOPS[ev!.kind].go) st.phase = "depart";
          break;
        case "depart":
          st.v = Math.min(V, st.v + SPEED.accel * dt);
          if (st.v >= V) {
            st.phase = "cruise";
            st.stopTimer = rand(CRUISE_SECONDS);
            st.passTimer = rand(PASS_SECONDS);
          }
          break;
      }
      const previousDistance = st.s;
      st.s += st.v * dt;
      if (dt > 0) st.a += ((st.v - vPrev) / dt - st.a) * Math.min(1, dt * 5);

      // ── acontecimento em cena
      if (ev) {
        const sx = ev.x - st.s;
        el.stops[ev.kind].forEach((n) => set(n, "transform", `translate(${sx} 0)`));
        const stoppedHere = st.phase === "stopped" || st.phase === "depart";

        if (ev.kind === "toll") {
          if (stoppedHere && ev.t > 0.8 && !ev.closing) ev.open = Math.min(1, ev.open + dt / 0.6);
          if (!ev.closing && ev.open > 0 && st.s + tx > ev.x + 60) ev.closing = true;
          if (ev.closing) ev.open = Math.max(0, ev.open - dt / 0.7);
          set(el.tollArm, "transform", `rotate(${-82 * smooth(0, 1, ev.open)} 5 200)`);
          set(el.tollLight, "fill", ev.open > 0.02 && !ev.closing ? "#22C55E" : "#EF4444");
        } else if (ev.kind === "fuel") {
          const t = stoppedHere ? ev.t : 0;
          const hose = st.phase === "stopped" ? smooth(0.25, 0.55, t) * (1 - smooth(3.3, 3.6, t)) : 0;
          set(el.fuelHose, "opacity", hose);
          set(el.fuelHolster, "opacity", 1 - hose);
          set(el.fuelBar, "width", 24 * smooth(0.7, 3.2, t));
        } else if (ev.kind === "light") {
          if (stoppedHere && ev.t >= 2.5) {
            set(el.sigRed, "fill", "#4A1616");
            set(el.sigGreen, "fill", "#22C55E");
          }
        } else if (ev.kind === "scale") {
          const t = stoppedHere ? ev.t : 0;
          set(el.scaleBar, "width", 50 * smooth(0.3, 1.7, t));
          set(el.scaleLight, "fill", t >= 1.9 ? "#22C55E" : "#EF4444");
        }

        if (sx + STOPS[ev.kind].right < -60) {
          el.stops[ev.kind].forEach((n) => set(n, "display", "none"));
          st.ev = null;
        }
      }

      // ── centro de distribuição da abertura
      if (st.depotOn) {
        const dx = st.depotX - st.s;
        set(el.depot, "transform", `translate(${dx} 0)`);
        // caixas: da doca até o lugar na pilha; as de cima sobem antes de
        // passar pela porta, para não atravessar as de baixo
        el.cargo.forEach((n, i) => {
          const t = st.introT - (LOAD.first + i * LOAD.every);
          if (t < 0) return set(n, "opacity", 0);
          const [x, y] = cargoSlot(i);
          const k = smooth(0, LOAD.travel, t);
          const lift = smooth(0, LOAD.travel * 0.5, t);
          set(n, "opacity", 1);
          set(n, "transform", `translate(${LOAD.from + (x - LOAD.from) * k} ${CARGO.floor + (y - CARGO.floor) * lift})`);
        });
        // porta de enrolar descendo de cima para baixo
        const shut = smooth(LOAD_DOOR, LOAD_DOOR + LOAD.door, st.introT);
        set(el.door, "transform", `translate(0 ${-CARGO.win.h * (1 - shut)})`);
        if (dx < -40) {
          st.depotOn = false;
          set(el.depot, "display", "none");
        }
      }

      // ── cidades ao fundo: trechos urbanos (uma cidade a cada 10 s de viagem,
      // 25 s para cruzar) alternados com trechos de campo, sem cidade
      st.cityAcc += st.v * dt;
      if (st.cityAcc >= CITY.every * V) {
        st.cityAcc = 0;
        const spawnCity = st.citySkip <= 0 && st.cityRun > 0;
        if (st.citySkip > 0) st.citySkip--;
        else if (st.cityRun > 0) st.cityRun--;
        if (st.cityRun <= 0 && st.citySkip <= 0 && !spawnCity) {
          // fim do trecho de campo → novo trecho urbano começa no próximo ciclo
          st.cityRun = randInt(CITY.run);
        } else if (st.cityRun <= 0 && spawnCity) {
          // última cidade do trecho urbano → segue um trecho de campo
          st.citySkip = randInt(CITY.gap);
        }
        for (let n = 0; spawnCity && n < st.cities.length; n++) {
          const i = (st.cityNext + n) % st.cities.length;
          if (st.cities[i].on) continue;
          st.cities[i].x = w + 10;
          st.cities[i].on = true;
          st.cityNext = i + 1;
          css(el.cities[i], "display", "block");
          break;
        }
      }
      st.cities.forEach((c, i) => {
        if (!c.on) return;
        c.x -= st.v * ((w + c.w) / (CITY.cross * V)) * dt;
        css(el.cities[i], "transform", shift(c.x));
        if (c.x + c.w < -10) {
          c.on = false;
          css(el.cities[i], "display", "none");
        }
      });

      // ── carros na contramão (só com a pista livre)
      st.carTimer -= dt;
      if (st.carTimer <= 0) {
        st.carTimer = rand(CAR_SECONDS);
        const slot = st.cars.findIndex((c) => !c.on);
        if (slot >= 0 && !st.ev && st.phase === "cruise") {
          st.cars[slot] = { x: w + 40, on: true };
          set(el.cars[slot].body, "fill", CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]);
          set(el.cars[slot].node, "display", "inline");
        }
      }
      st.cars.forEach((c, i) => {
        if (!c.on) return;
        c.x -= (st.v + SPEED.oncoming) * dt;
        set(el.cars[i].node, "transform", `translate(${c.x} ${FAR_GROUND})`);
        if (c.x < -220) {
          c.on = false;
          set(el.cars[i].node, "display", "none");
        }
      });

      // ── cenário em parallax
      if (previousDistance !== st.s || dt === 0) {
        for (const l of el.layers) {
          const dx = -mod(st.s * l.f, l.tile);
          if (l.css) css(l.node, "transform", shift(dx));
          else set(l.node, "transform", `translate(${dx} 0)`);
        }
      }

      // ── carreta
      set(el.rig, "transform", `translate(${tx} ${GROUND})`);
      const pitch = clamp(-st.a / 600, -1.1, 1.1);
      const bounce = moving * Math.sin(st.s * 0.045) * 0.6;
      set(el.cab, "transform", `translate(0 ${bounce}) rotate(${pitch} 552 -20)`);
      set(el.trailer, "transform", `translate(0 ${moving * Math.sin(st.s * 0.031 + 1) * 0.4}) rotate(${pitch * 0.3} 400 -20)`);
      const deg = mod(((st.s / RIG.wheelR) * 180) / Math.PI, 360);
      el.wheels.forEach((n) => set(n, "transform", `rotate(${deg})`));
      set(el.brake, "fill", st.phase === "brake" || st.phase === "stopped" || st.phase === "loading" ? "#FF3B30" : "#7A1D1D");

      // ── faróis: alto com a pista livre; baixa ao surgir carro na contramão
      // (até ele passar pela cabine) e também parada, freando ou na doca
      const cabX = tx + RIG.length;
      const oncoming = st.cars.some((c) => c.on && c.x + 60 > cabX - 40);
      const wantHigh = st.phase === "cruise" && !oncoming ? 1 : 0;
      st.high += (wantHigh - st.high) * Math.min(1, dt * 7);
      set(el.beamHigh, "opacity", st.high);
      set(el.beamLow, "opacity", 1 - st.high * 0.6);
      set(el.headGlow, "opacity", 0.35 + st.high * 0.65);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    step(0);
    redrawRef.current = () => step(0);
    stage.style.opacity = "1";
    if (reduced) return;

    let raf = 0;
    let last = 0;
    let visible = false;
    const loop = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      step(dt);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === visible) return;
      visible = entry.isIntersecting;
      if (visible) {
        last = 0;
        raf = requestAnimationFrame(loop);
      } else cancelAnimationFrame(raf);
    });
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      redrawRef.current = null;
    };
  }, []);

  const tx = introX(width);
  const layer = (l: StopLayer) => STOP_KINDS.map((k) => <Stop key={`${k}-${l}`} kind={k} layer={l} />);

  return (
    <div ref={rootRef} className={`road-ribbon overflow-hidden ${className}`} aria-hidden="true">
      <div ref={stageRef} className="absolute inset-0 select-none opacity-0 transition-opacity duration-1000">
        {/* cenário em planos próprios (GPU), sob a pista */}
        <Scenery width={width} scale={scale} />
        {/* pista e tudo o que muda a cada quadro: paradas, carros, galpão, carreta */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${H}`}
          preserveAspectRatio="xMinYMax slice"
          className="absolute inset-0 block h-full w-full"
          focusable="false"
        >
          {layer("back")}
          <RoadSurface width={width} />
          {layer("road")}
          {Array.from({ length: CARS }, (_, i) => (
            <Car key={i} slot={i} />
          ))}
          {/* galpão antes da carreta: as caixas (na carreta) passam por cima da doca */}
          <Depot />
          <g data-r="rig" transform={`translate(${tx} ${GROUND})`}>
            <Rig />
          </g>
          {layer("front")}
          <Foreground width={width} />
          {layer("over")}
        </svg>
      </div>
    </div>
  );
}
