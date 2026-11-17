/**
 * Jornada 2D — parâmetros ajustáveis.
 *
 * Unidades: o palco SVG mede 1600 × 640 "unidades de mundo"; o tempo é em
 * segundos. Mudar a velocidade ou as durações aqui recalcula automaticamente
 * a posição de cada cenário (ver plan.ts), mantendo as paradas exatas.
 */

export const STAGE = { w: 1600, h: 640 } as const;

/** Linha do chão (onde as rodas tocam). */
export const GROUND_Y = 500;
export const ROAD_H = 60;
/** Superfície da água na cena da balsa. */
export const WATER_Y = 536;

/** Paleta estritamente monocromática (preto, branco e cinzas neutros). */
export const MONO_HEX = {
  ink: "#0E0E0E",
  paper: "#FFFFFF",
  bg: "#F3F3F3",
  g1: "#E8E8E8",
  g2: "#D9D9D9",
  g3: "#C2C2C2",
  g4: "#8E8E8E",
  g5: "#2E2E2E",
  wall: "#E4E4E4",
  water: "#DEDEDE",
  edge: "#3A3A3A",
  label: "#A8A8A8",
  column: "#D8D8D8",
} as const;

type Tone = keyof typeof MONO_HEX;

/**
 * Cores usadas no desenho: cada uma é uma variável CSS (`--j-<tom>`) com a
 * paleta clara como padrão. Um contêiner pode redefinir as variáveis para
 * trocar o tema da cena inteira (ver `.journey-night` em globals.css).
 */
export const MONO = Object.fromEntries(
  Object.entries(MONO_HEX).map(([k, v]) => [k, `var(--j-${k}, ${v})`]),
) as Record<Tone, string>;

export const TRUCK = {
  /** Comprimento do caminhão (traseira → para-choque). */
  length: 524,
  /** Posição horizontal fixa do caminhão na tela durante o percurso. */
  anchorX: 380,
  wheelR: 34,
  wheelsX: [92, 168, 452] as const,
  /** Logo no baú (coordenadas locais do caminhão). */
  logo: { cx: 176, cy: -160, width: 196 },
  /** Bocal do tanque de combustível (coordenadas locais). */
  tankCap: { x: 338, y: -80 },
} as const;

export const JOURNEY = {
  /** Velocidade de cruzeiro (unidades/s). */
  speed: 760,
  /** Abertura com revelação da marca. */
  intro: 3.4,
  /** Deslocamento inicial do caminhão na tela (estacionado no CD). */
  startDrift: -50,
  /** Deslocamento final (estaciona mais à direita para enquadrar o galpão). */
  endDrift: 170,

  departure: { wait: 0.75, accel: 2.0, cruise: 0.6 },
  toll: { decel: 1.6, stop: 1.0, accel: 1.6, cruise: 0.4 },
  light: { decel: 1.5, stop: 1.1, accel: 1.6, cruise: 0.3 },
  ferry: { decel: 2.2, rampUp: 0.45, crossing: 3.0, rampDown: 0.45, accel: 1.6, cruise: 0.3, distance: 1100 },
  fuel: { decel: 1.6, nozzleIn: 0.55, fill: 1.0, nozzleOut: 0.55, accel: 1.6, cruise: 0.9 },
  arrival: { decel: 2.4, closeDelay: 0.45, outro: 0.9 },
} as const;

/** Fatores de parallax (0 = fixo, 1 = acompanha a estrada). */
export const PARALLAX = { clouds: 0.05, far: 0.14, mid: 0.36 } as const;

/**
 * Enquadramentos (viewBox) por largura de tela. O caminhão nunca muda de
 * perspectiva: apenas o recorte horizontal se adapta.
 */
export const VIEWBOXES = {
  desktop: { x: 0, y: 0, w: 1600, h: 640 },
  tablet: { x: 170, y: 70, w: 1240, h: 560 },
  mobile: { x: 330, y: 92, w: 930, h: 528 },
} as const;

export type ViewMode = keyof typeof VIEWBOXES;

export const SCENES = [
  { id: "partida", label: "Partida", caption: "Uma boa operação começa pelo planejamento." },
  { id: "pedagio", label: "Pedágio", caption: "Cada etapa importa." },
  { id: "semaforo", label: "Semáforo", caption: "Eficiência também é planejar o percurso." },
  { id: "travessia", label: "Travessia", caption: "Conectando caminhos e possibilidades." },
  { id: "abastecimento", label: "Abastecimento", caption: "Uma operação eficiente considera cada detalhe." },
  { id: "destino", label: "Destino", caption: "Planejamento que movimenta negócios." },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
