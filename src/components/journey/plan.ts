import { JOURNEY, SCENES, TRUCK } from "./config";

/**
 * Plano da viagem — função pura (sem DOM).
 *
 * O caminhão é descrito pela posição de mundo da sua traseira (`x`).
 * Cada segmento de movimento usa aceleração constante (easing quadrático),
 * o que garante velocidade contínua entre segmentos — sem trancos.
 *   accel : 0 → V  (power1.in)   distância = V·d/2
 *   cruise: V      (linear)      distância = V·d
 *   decel : V → 0  (power1.out)  distância = V·d/2
 *   ferry : caminhão parado sobre a balsa (sine.inOut) — rodas não giram
 *
 * As posições dos cenários são derivadas das paradas: a cancela fica a
 * poucos centímetros do para-choque, a faixa de retenção logo à frente etc.
 */

export type SegKind = "accel" | "cruise" | "decel" | "ferry";

export interface Seg {
  kind: SegKind;
  t0: number;
  t1: number;
  x0: number;
  x1: number;
}

export interface Span {
  t0: number;
  t1: number;
  from: number;
  to: number;
}

export const FERRY_DECK = 760;
/** Distância da traseira do caminhão até o início do convés quando embarcado. */
export const FERRY_TRUCK_OFFSET = 110;
/** Bomba de combustível em relação à traseira do caminhão parado. */
export const PUMP_OFFSET = 236;

export interface JourneyPlan {
  duration: number;
  speed: number;
  segs: Seg[];
  drift: Span[];
  start: { x: number; drift: number };
  t: {
    introEnd: number;
    lightsOn: number;
    originDoorOpen: number;
    originDoorClose: number;
    depart: number;
    tollStop: number;
    barrierOpen: number;
    tollGo: number;
    barrierClose: number;
    lightStop: number;
    signalGo: number;
    lightGo: number;
    ferryStop: number;
    rampUp: number;
    crossStart: number;
    crossEnd: number;
    rampDown: number;
    ferryGo: number;
    fuelStop: number;
    nozzleIn: number;
    fillStart: number;
    nozzleOut: number;
    fuelGo: number;
    destDoorOpen: number;
    parked: number;
    destDoorClose: number;
    outro: number;
  };
  pos: {
    originLeft: number;
    originDoor: number;
    tollPivot: number;
    stopLine: number;
    lightPole: number;
    bankLeft: number;
    deckStart: number;
    bankRight: number;
    pump: number;
    fuelTruck: number;
    destDoor: number;
    destTruck: number;
    destRight: number;
    worldEnd: number;
  };
  ferry: { distance: number };
  scenes: { id: string; label: string; caption: string; start: number; poster: number }[];
}

export function createPlan(): JourneyPlan {
  const V = JOURNEY.speed;
  const L = TRUCK.length;
  const segs: Seg[] = [];
  const drift: Span[] = [];
  let t = 0;
  let x = 0;

  const push = (kind: SegKind, d: number, dx: number) => {
    segs.push({ kind, t0: t, t1: t + d, x0: x, x1: x + dx });
    t += d;
    x += dx;
  };
  const accel = (d: number) => push("accel", d, (V * d) / 2);
  const cruise = (d: number) => push("cruise", d, V * d);
  const decel = (d: number) => push("decel", d, (V * d) / 2);
  const hold = (d: number) => {
    t += d;
  };

  const T = {} as JourneyPlan["t"];
  const P = {} as JourneyPlan["pos"];
  const sceneStart: number[] = [0];

  // ── Abertura + PARTIDA ────────────────────────────────────────────────
  P.originLeft = -232;
  P.originDoor = L + 150;
  hold(JOURNEY.intro);
  T.introEnd = t;
  T.lightsOn = t + 0.05;
  T.originDoorOpen = t + 0.12;
  hold(JOURNEY.departure.wait);
  T.depart = t;
  drift.push({ t0: t, t1: t + JOURNEY.departure.accel, from: JOURNEY.startDrift, to: 0 });
  accel(JOURNEY.departure.accel);
  sceneStart.push(t);
  cruise(JOURNEY.departure.cruise);

  // ── PEDÁGIO ───────────────────────────────────────────────────────────
  decel(JOURNEY.toll.decel);
  T.tollStop = t;
  P.tollPivot = x + L + 26 + 232;
  T.barrierOpen = t + 0.22;
  hold(JOURNEY.toll.stop);
  T.tollGo = t;
  accel(JOURNEY.toll.accel);
  sceneStart.push(t);
  cruise(JOURNEY.toll.cruise);

  // ── SEMÁFORO ──────────────────────────────────────────────────────────
  decel(JOURNEY.light.decel);
  T.lightStop = t;
  P.stopLine = x + L + 24;
  P.lightPole = P.stopLine + 78;
  T.signalGo = t + JOURNEY.light.stop * 0.55;
  hold(JOURNEY.light.stop);
  T.lightGo = t;
  accel(JOURNEY.light.accel);
  sceneStart.push(t);
  cruise(JOURNEY.light.cruise);

  // ── TRAVESSIA (balsa) ─────────────────────────────────────────────────
  const F = JOURNEY.ferry;
  decel(F.decel);
  T.ferryStop = t;
  P.deckStart = x - FERRY_TRUCK_OFFSET;
  P.bankLeft = P.deckStart - 6;
  hold(0.1);
  T.rampUp = t;
  hold(F.rampUp);
  T.crossStart = t;
  push("ferry", F.crossing, F.distance);
  T.crossEnd = t;
  P.bankRight = P.deckStart + F.distance + FERRY_DECK + 6;
  T.rampDown = t;
  hold(F.rampDown + 0.05);
  T.ferryGo = t;
  accel(F.accel);
  sceneStart.push(t);
  cruise(F.cruise);

  // ── ABASTECIMENTO ─────────────────────────────────────────────────────
  const U = JOURNEY.fuel;
  decel(U.decel);
  T.fuelStop = t;
  P.fuelTruck = x;
  P.pump = x + PUMP_OFFSET;
  hold(0.1);
  T.nozzleIn = t;
  hold(U.nozzleIn);
  T.fillStart = t;
  hold(U.fill);
  T.nozzleOut = t;
  hold(U.nozzleOut + 0.05);
  T.fuelGo = t;
  accel(U.accel);
  sceneStart.push(t);
  cruise(U.cruise);

  // ── DESTINO ───────────────────────────────────────────────────────────
  const A = JOURNEY.arrival;
  drift.push({ t0: t, t1: t + A.decel, from: 0, to: JOURNEY.endDrift });
  decel(A.decel);
  T.parked = t;
  P.destTruck = x;
  P.destDoor = x - 232;
  P.destRight = x + L + 230;
  P.worldEnd = P.destRight + 2400;
  T.destDoorClose = t + A.closeDelay;
  T.outro = t + 0.5;

  const duration = T.outro + A.outro + 0.2;

  const plan: JourneyPlan = {
    duration,
    speed: V,
    segs,
    drift,
    start: { x: 0, drift: JOURNEY.startDrift },
    t: T,
    pos: P,
    ferry: { distance: F.distance },
    scenes: SCENES.map((s, i) => ({ ...s, start: sceneStart[i], poster: 0 })),
  };

  // Eventos que dependem de "quando o caminhão passa por X"
  T.originDoorClose = rearTimeAt(plan, P.originDoor + 34 + 40);
  T.barrierClose = rearTimeAt(plan, P.tollPivot + 50);
  T.destDoorOpen = Math.max(T.fuelGo + 0.4, rearTimeAt(plan, P.destDoor - L - 40) - 0.9);

  // Quadros-chave para o modo de movimento reduzido (cena parada e legível)
  const posters = [
    T.depart - 0.05,
    T.tollGo - 0.04,
    T.lightGo - 0.04,
    (T.crossStart + T.crossEnd) / 2,
    T.fillStart + U.fill * 0.65,
    duration,
  ];
  plan.scenes.forEach((s, i) => (s.poster = posters[i]));

  return plan;
}

// ── Consultas analíticas (determinísticas a partir do tempo) ─────────────

function segAt(plan: JourneyPlan, time: number): Seg | null {
  for (const s of plan.segs) if (time >= s.t0 && time <= s.t1) return s;
  return null;
}

function progress(s: Seg, time: number) {
  return Math.min(1, Math.max(0, (time - s.t0) / (s.t1 - s.t0)));
}

/** Instante em que a traseira do caminhão alcança a posição de mundo `wx`. */
export function rearTimeAt(plan: JourneyPlan, wx: number): number {
  for (const s of plan.segs) {
    if (wx < s.x0 || wx > s.x1) continue;
    const r = (wx - s.x0) / (s.x1 - s.x0);
    let p = r;
    if (s.kind === "accel") p = Math.sqrt(r);
    else if (s.kind === "decel") p = 1 - Math.sqrt(1 - r);
    else if (s.kind === "ferry") p = Math.acos(1 - 2 * r) / Math.PI;
    return s.t0 + p * (s.t1 - s.t0);
  }
  return wx <= plan.segs[0].x0 ? 0 : plan.duration;
}

/** Velocidade relativa ao solo (0–1 de V). Zero sobre a balsa. */
export function groundSpeedAt(plan: JourneyPlan, time: number): number {
  const s = segAt(plan, time);
  if (!s) return 0;
  const p = progress(s, time);
  switch (s.kind) {
    case "accel":
      return p;
    case "decel":
      return 1 - p;
    case "cruise":
      return 1;
    default:
      return 0;
  }
}

const smooth = (e0: number, e1: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

/**
 * Arfagem da carroceria (graus): levanta a frente ao acelerar, abaixa ao
 * frear e oscila levemente ao parar — sutil, para dar peso ao veículo.
 */
export function pitchAt(plan: JourneyPlan, time: number): number {
  let pitch = 0;
  for (const s of plan.segs) {
    if (s.kind === "ferry") continue;
    if (time >= s.t0 && time <= s.t1) {
      const p = progress(s, time);
      const env = smooth(0, 0.18, p) * (1 - smooth(0.82, 1, p));
      if (s.kind === "accel") pitch += -0.55 * env;
      if (s.kind === "decel") pitch += 0.75 * env;
    }
    if (s.kind === "decel" && time > s.t1 && time < s.t1 + 1.1) {
      const tau = time - s.t1;
      pitch += -0.32 * Math.exp(-4.2 * tau) * Math.sin(11 * tau);
    }
  }
  return pitch;
}

/** Luz de freio acesa entre o início de cada frenagem e a próxima partida. */
export function brakingAt(plan: JourneyPlan, time: number): boolean {
  for (let i = 0; i < plan.segs.length; i++) {
    const s = plan.segs[i];
    if (s.kind !== "decel") continue;
    const next = plan.segs.slice(i + 1).find((n) => n.kind === "accel");
    const end = next ? next.t0 : Infinity;
    if (time >= s.t0 && time < end) return true;
  }
  return false;
}

/** Índice da cena atual (0–5). */
export function sceneIndexAt(plan: JourneyPlan, time: number): number {
  let idx = 0;
  plan.scenes.forEach((s, i) => {
    if (time >= s.start) idx = i;
  });
  return idx;
}
