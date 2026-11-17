import { gsap } from "gsap";
import { ARROW_LENGTH, LOGO_WIDTH } from "@/components/brand/logoGeometry";
import { TILE } from "./Backdrop";
import { GROUND_Y, JOURNEY, MONO, MONO_HEX, PARALLAX, TRUCK } from "./config";
import { RAMP_RAISED, WAVE } from "./Ferry";
import { PUMP } from "./FuelStation";
import { brakingAt, groundSpeedAt, pitchAt, rearTimeAt, type JourneyPlan } from "./plan";
import { WAREHOUSE } from "./Warehouse";

/**
 * Estado numérico animado pela timeline. Todo o desenho é derivado dele
 * (função `render`), o que torna pausa, reinício, pulo e salto entre cenas
 * totalmente determinísticos.
 */
export type JourneyState = {
  x: number; // traseira do caminhão (mundo)
  drift: number; // deslocamento do caminhão na tela em relação à âncora
  ferry: number; // deslocamento da balsa
  iris: number;
  fly: number;
  ink: number;
  iE: number;
  iS: number;
  iM: number;
  iBar1: number;
  iBar2: number;
  iBar3: number;
  iArrow: number;
  iHead: number;
  iFlash: number;
  iDesc: number;
  truckLogo: number;
  truckDesc: number;
  headlight: number;
  originDoor: number;
  destDoor: number;
  barrier: number;
  tollLamp: number;
  sigStop: number;
  sigGo: number;
  rampL: number;
  rampR: number;
  nozzle: number;
  fuel: number;
  chip: number;
  dockLight: number;
  outro: number;
};

export function initialState(plan: JourneyPlan): JourneyState {
  return {
    x: plan.start.x,
    drift: plan.start.drift,
    ferry: 0,
    iris: 0,
    fly: 0,
    ink: 0,
    iE: 0,
    iS: 0,
    iM: 0,
    iBar1: 0,
    iBar2: 0,
    iBar3: 0,
    iArrow: 0,
    iHead: 0,
    iFlash: 0,
    iDesc: 0,
    truckLogo: 0,
    truckDesc: 0,
    headlight: 0,
    originDoor: 0,
    destDoor: 0,
    barrier: 0,
    tollLamp: 0,
    sigStop: 1,
    sigGo: 0,
    rampL: 1,
    rampR: 0,
    nozzle: 0,
    fuel: 0,
    chip: 0,
    dockLight: 0,
    outro: 0,
  };
}

const EASE: Record<string, string> = {
  accel: "power1.in",
  decel: "power1.out",
  cruise: "none",
  ferry: "sine.inOut",
};

/** Monta a timeline mestre a partir do plano. */
export function buildTimeline(plan: JourneyPlan, state: JourneyState, render: (time: number) => void) {
  const T = plan.t;
  const tl = gsap.timeline({ paused: true, onUpdate: () => render(tl.time()) });

  const tw = (key: keyof JourneyState, from: number, to: number, at: number, duration: number, ease = "power2.inOut") => {
    tl.fromTo(state, { [key]: from }, { [key]: to, duration, ease, immediateRender: false }, at);
  };

  // ── Movimento do caminhão, câmera e balsa ─────────────────────────────
  for (const s of plan.segs) tw("x", s.x0, s.x1, s.t0, s.t1 - s.t0, EASE[s.kind]);
  for (const d of plan.drift) tw("drift", d.from, d.to, d.t0, d.t1 - d.t0, "power1.inOut");
  tw("ferry", 0, plan.ferry.distance, T.crossStart, T.crossEnd - T.crossStart, "sine.inOut");

  // ── Abertura: construção da marca ─────────────────────────────────────
  tw("iE", 0, 1, 0.15, 0.5, "power3.out");
  tw("iS", 0, 1, 0.3, 0.5, "power3.out");
  tw("iM", 0, 1, 0.5, 0.55, "power3.out");
  tw("iBar1", 0, 1, 0.85, 0.5, "power3.out");
  tw("iBar2", 0, 1, 0.94, 0.5, "power3.out");
  tw("iBar3", 0, 1, 1.03, 0.5, "power3.out");
  tw("iArrow", 0, 1, 1.3, 0.7, "power2.inOut");
  tw("iHead", 0, 1, 1.96, 0.24, "back.out(2.2)");
  tw("iFlash", 0, 1, 2.02, 0.6, "power2.out");
  tw("iDesc", 0, 1, 2.05, 0.45, "power2.out");
  // voo até o baú + revelação do cenário em íris
  tw("fly", 0, 1, 2.65, 0.75, "power3.inOut");
  tw("ink", 0, 1, 2.8, 0.5, "power1.inOut");
  tw("iris", 0, 1, 2.6, 0.8, "power2.in");
  tw("truckLogo", 0, 1, T.introEnd - 0.02, 0.01, "none");
  tw("truckDesc", 0, 1, T.introEnd - 0.1, 0.4, "power1.out");

  // ── 01 Partida ────────────────────────────────────────────────────────
  tw("headlight", 0, 1, T.lightsOn, 0.25, "power1.out");
  tw("originDoor", 0, 1, T.originDoorOpen, 0.9);
  tw("originDoor", 1, 0, T.originDoorClose, 0.8);

  // ── 02 Pedágio ────────────────────────────────────────────────────────
  tw("tollLamp", 0, 1, T.barrierOpen - 0.08, 0.15, "power1.out");
  tw("barrier", 0, 1, T.barrierOpen, T.tollGo - T.barrierOpen - 0.06);
  tw("barrier", 1, 0, T.barrierClose, 0.7);
  tw("tollLamp", 1, 0, T.barrierClose, 0.2, "power1.out");

  // ── 03 Semáforo ───────────────────────────────────────────────────────
  tw("sigStop", 1, 0, T.signalGo, 0.12, "power1.out");
  tw("sigGo", 0, 1, T.signalGo + 0.16, 0.16, "power1.out");

  // ── 04 Travessia ──────────────────────────────────────────────────────
  tw("rampL", 1, 0, T.rampUp, JOURNEY.ferry.rampUp);
  tw("rampR", 0, 1, T.rampDown, JOURNEY.ferry.rampDown);

  // ── 05 Abastecimento ──────────────────────────────────────────────────
  tw("nozzle", 0, 1, T.nozzleIn, JOURNEY.fuel.nozzleIn);
  tw("chip", 0, 1, T.nozzleIn + 0.3, 0.25, "power1.out");
  tw("fuel", 0, 1, T.fillStart, JOURNEY.fuel.fill, "none");
  tw("nozzle", 1, 0, T.nozzleOut, JOURNEY.fuel.nozzleOut);
  tw("chip", 1, 0, T.nozzleOut + 0.25, 0.3, "power1.in");

  // ── 06 Destino ────────────────────────────────────────────────────────
  const doorOpenAt = rearTimeAt(plan, plan.pos.destDoor - TRUCK.length - 30) - 0.72;
  tw("destDoor", 0, 1, doorOpenAt, 0.62);
  tw("dockLight", 0, 1, T.parked + 0.1, 0.3, "power1.out");
  tw("headlight", 1, 0, T.parked + 0.35, 0.3, "power1.in");
  tw("destDoor", 1, 0, T.destDoorClose, 0.8);
  tw("outro", 0, 1, T.outro, 0.8, "power2.out");

  // garante a duração total
  tl.set({}, {}, plan.duration);
  return tl;
}

// ── Renderização ───────────────────────────────────────────────────────

const mod = (v: number, m: number) => ((v % m) + m) % m;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const gray = (v: number) => {
  const c = Math.round(v);
  return `rgb(${c},${c},${c})`;
};
const hexGray = (hex: string) => parseInt(hex.slice(1, 3), 16);

export type RenderHooks = { onFrame?: (time: number, state: JourneyState) => void };

export function createRenderer(root: SVGSVGElement, plan: JourneyPlan, state: JourneyState, hooks: RenderHooks = {}) {
  const one = (k: string) => root.querySelector<SVGElement>(`[data-j="${k}"]`);
  const all = (k: string) => Array.from(root.querySelectorAll<SVGElement>(`[data-j="${k}"]`));

  const el = {
    scene: one("scene"),
    iris: one("iris"),
    world: one("world"),
    far: one("layer-far"),
    mid: one("layer-mid"),
    clouds: one("layer-clouds"),
    turbines: all("turbine-rot"),
    truck: one("truck-pos"),
    body: one("truck-body"),
    wheels: all("wheel-rot"),
    tail: one("tail-light"),
    head: one("headlight"),
    truckLogo: one("truck-logo"),
    truckDesc: one("truck-desc"),
    originDoor: one("origin-door"),
    originLamp: one("origin-door-lamp"),
    destDoor: one("dest-door"),
    destLamp: one("dest-door-lamp"),
    arm: one("toll-arm"),
    tollLamp: one("toll-lamp"),
    sigStop: one("sig-stop-on"),
    sigGo: one("sig-go-on"),
    labelStop: one("sig-label-stop"),
    labelGo: one("sig-label-go"),
    ferry: one("ferry"),
    wake: one("wake"),
    rampL: one("ramp-left"),
    rampR: one("ramp-right"),
    pennant: one("pennant"),
    waves: all("wave"),
    nozzle: one("nozzle"),
    hose: one("hose"),
    hoseOutline: one("hose-outline"),
    gauge: all("gauge-bar"),
    chip: one("fuel-chip"),
    chipFill: one("chip-fill"),
    dockLight: one("dock-light"),
    dockRays: one("dock-rays"),
    intro: one("intro"),
    introLogo: one("intro-logo"),
    ilE: one("il-e"),
    ilS: one("il-s"),
    ilM: one("il-m"),
    ilBars: [one("il-bar1"), one("il-bar2"), one("il-bar3")],
    ilArrow: one("il-arrow"),
    ilHead: one("il-head"),
    ilFlash: one("il-flash"),
    ilDesc: one("il-desc"),
  };

  // cache de atributos para evitar escritas redundantes no DOM
  const cache = new WeakMap<Element, Record<string, string>>();
  const set = (node: Element | null | undefined, name: string, value: string | number) => {
    if (!node) return;
    const v = typeof value === "number" ? String(Math.round(value * 1000) / 1000) : value;
    let rec = cache.get(node);
    if (!rec) cache.set(node, (rec = {}));
    if (rec[name] === v) return;
    rec[name] = v;
    node.setAttribute(name, v);
  };

  if (el.ilArrow) set(el.ilArrow, "stroke-dasharray", `${ARROW_LENGTH + 4} ${ARROW_LENGTH + 4}`);

  const P = plan.pos;
  const T = plan.t;
  const G = GROUND_Y;
  const A = TRUCK.anchorX;
  const R = TRUCK.wheelR;
  const DOOR_H = G - WAREHOUSE.doorTop;
  const INK = hexGray(MONO_HEX.ink);
  const G4 = hexGray(MONO_HEX.g4);
  const startScreen = A + plan.start.drift;
  const logoTarget = { x: startScreen + TRUCK.logo.cx, y: G + TRUCK.logo.cy, s: TRUCK.logo.width / LOGO_WIDTH };
  const logoStart = { x: 800, y: 286, s: 0.5 };
  const capRel = PUMP.cap;

  return function render(time: number) {
    const s = state;
    const C = s.x - A - s.drift;

    // ── câmera e parallax
    set(el.world, "transform", `translate(${-C} 0)`);
    set(el.far, "transform", `translate(${-mod(C * PARALLAX.far, TILE.far)} 0)`);
    set(el.mid, "transform", `translate(${-mod(C * PARALLAX.mid, TILE.mid)} 0)`);
    set(el.clouds, "transform", `translate(${-mod(C * PARALLAX.clouds + time * 7, TILE.clouds)} 0)`);
    const blade = (time * 70) % 360;
    el.turbines.forEach((t, i) => set(t, "transform", `rotate(${blade + i * 40})`));

    // ── balsa
    const crossing = clamp01(s.ferry / plan.ferry.distance);
    const sail = Math.sin(Math.PI * crossing);
    const bob = Math.sin(time * 2.3) * 2.4 * sail;
    set(el.ferry, "transform", `translate(${s.ferry} ${bob})`);
    set(el.wake, "opacity", sail * 0.85);
    set(el.rampL, "transform", `rotate(${(1 - s.rampL) * RAMP_RAISED})`);
    set(el.rampR, "transform", `rotate(${-(1 - s.rampR) * RAMP_RAISED})`);
    el.waves.forEach((w, i) => {
      const dir = i % 2 ? -1 : 1;
      set(w, "transform", `translate(${mod(time * (16 + i * 7) * dir, WAVE.length * 2) - WAVE.length} 0)`);
    });

    // ── caminhão
    const v = groundSpeedAt(plan, time);
    const odo = s.x - s.ferry;
    const vib = Math.sin(odo * 0.11) * 0.55 * v;
    set(el.truck, "transform", `translate(${s.x} ${G + bob})`);
    set(el.body, "transform", `translate(0 ${vib}) rotate(${pitchAt(plan, time)} 300 -34)`);
    const wheelDeg = ((odo / R) * 180) / Math.PI;
    el.wheels.forEach((w) => set(w, "transform", `rotate(${wheelDeg % 360})`));
    set(el.tail, "fill", brakingAt(plan, time) ? MONO.paper : MONO.g4);
    set(el.head, "fill", gray(lerp(G4, 255, s.headlight)));
    set(el.truckLogo, "opacity", s.truckLogo);
    set(el.truckDesc, "opacity", s.truckDesc);

    // ── portões
    set(el.originDoor, "transform", `translate(0 ${-s.originDoor * DOOR_H})`);
    set(el.originLamp, "fill", s.originDoor > 0.01 ? MONO.paper : MONO.g4);
    set(el.destDoor, "transform", `translate(0 ${-s.destDoor * DOOR_H})`);
    set(el.destLamp, "fill", s.destDoor > 0.01 ? MONO.paper : MONO.g4);

    // ── pedágio
    set(el.arm, "transform", `rotate(${s.barrier * 84})`);
    set(el.tollLamp, "fill", gray(lerp(G4, 255, s.tollLamp)));

    // ── semáforo
    set(el.sigStop, "opacity", s.sigStop);
    set(el.sigGo, "opacity", s.sigGo);
    set(el.labelStop, "opacity", s.sigStop);
    set(el.labelGo, "opacity", s.sigGo);

    // ── abastecimento: bico percorre um arco do suporte até o tanque
    const k = s.nozzle;
    const hx = P.pump + PUMP.holster.x - 2;
    const hy = PUMP.holster.y - 24;
    const cx = P.pump + capRel.x - 19;
    const cy = capRel.y - 11;
    const nx = lerp(hx, cx, k);
    const ny = lerp(hy, cy, k) - Math.sin(Math.PI * k) * 46;
    const na = lerp(PUMP.holster.angle, 28, k);
    set(el.nozzle, "transform", `translate(${nx} ${ny}) rotate(${na})`);
    const rad = (na * Math.PI) / 180;
    const tailX = nx + Math.cos(rad) * -6 - Math.sin(rad) * 6;
    const tailY = ny + Math.sin(rad) * -6 + Math.cos(rad) * 6;
    const ox = P.pump + PUMP.outlet.x;
    const oy = PUMP.outlet.y;
    const sag = lerp(66, 30, k);
    const hosePath = `M${ox} ${oy} C${ox + 34} ${oy - 18} ${tailX + 26} ${Math.max(oy, tailY) + sag} ${tailX} ${tailY}`;
    set(el.hose, "d", hosePath);
    set(el.hoseOutline, "d", hosePath);
    const lit = Math.round(s.fuel * el.gauge.length);
    el.gauge.forEach((g, i) => set(g, "fill", i < lit ? MONO.paper : MONO.g4));
    set(el.chip, "opacity", s.chip);
    set(el.chipFill, "width", 64 * s.fuel);

    // ── doca
    set(el.dockLight, "fill", gray(lerp(G4, 255, s.dockLight)));
    set(el.dockRays, "opacity", s.dockLight);

    // ── abertura (marca)
    const introDone = s.fly >= 1 && s.truckLogo >= 1;
    set(el.intro, "opacity", introDone ? 0 : 1);
    if (!introDone) {
      set(el.ilE, "transform", `translate(0 ${(1 - s.iE) * 394})`);
      set(el.ilS, "transform", `translate(0 ${(1 - s.iS) * 400})`);
      set(el.ilM, "transform", `translate(0 ${(1 - s.iM) * 150})`);
      set(el.ilM, "opacity", s.iM);
      const bars = [s.iBar1, s.iBar2, s.iBar3];
      el.ilBars.forEach((b, i) => {
        set(b, "y", 394 * (1 - bars[i]));
        set(b, "height", 394 * bars[i]);
      });
      set(el.ilArrow, "stroke-dashoffset", (ARROW_LENGTH + 4) * (1 - s.iArrow));
      set(el.ilHead, "transform", `translate(716 69) scale(${s.iHead}) translate(-716 -69)`);
      set(el.ilFlash, "r", 12 + s.iFlash * 84);
      set(el.ilFlash, "opacity", s.iFlash > 0 && s.iFlash < 1 ? (1 - s.iFlash) * 0.8 : 0);
      set(el.ilDesc, "opacity", s.iDesc * clamp01(1 - s.fly * 3));
      const letters = gray(lerp(INK, 255, s.ink));
      set(el.ilE, "fill", letters);
      set(el.ilM, "fill", letters);
      set(el.ilS, "fill", letters);
      set(el.ilHead, "fill", letters);
      set(el.ilArrow, "stroke", letters);
      const barsColor = gray(lerp(154, 140, s.ink));
      el.ilBars.forEach((b) => set(b, "fill", barsColor));
      const lx = lerp(logoStart.x, logoTarget.x, s.fly);
      const ly = lerp(logoStart.y, logoTarget.y, s.fly);
      const ls = lerp(logoStart.s, logoTarget.s, s.fly);
      set(el.introLogo, "transform", `translate(${lx} ${ly}) scale(${ls})`);
    }

    // íris: revela o cenário a partir da posição da logo no baú
    if (s.iris >= 0.999) {
      if (el.scene?.hasAttribute("clip-path")) el.scene.removeAttribute("clip-path");
    } else if (el.scene) {
      el.scene.setAttribute("clip-path", `url(#${el.iris?.parentElement?.id ?? ""})`);
      set(el.iris, "r", s.iris * 1900);
      set(el.iris, "cx", logoTarget.x);
      set(el.iris, "cy", logoTarget.y);
    }

    hooks.onFrame?.(time, s);
  };
}

/** Instantes úteis para depuração e para o modo de movimento reduzido. */
export function describePlan(plan: JourneyPlan) {
  const T = plan.t;
  return {
    duration: plan.duration,
    stops: { toll: T.tollStop, light: T.lightStop, ferry: T.ferryStop, fuel: T.fuelStop, parked: T.parked },
  };
}
