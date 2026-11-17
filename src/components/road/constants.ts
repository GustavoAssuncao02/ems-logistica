/**
 * Estrada da hero — parâmetros ajustáveis.
 *
 * Unidades: a cena tem altura fixa de 300 "unidades"; a largura acompanha a
 * proporção da faixa. Tempo em segundos, velocidades em unidades/s.
 */

export const H = 300;

/** Asfalto (lado de lá → lado de cá). */
export const ROAD = { top: 214, center: 243, bottom: 276 } as const;
/** Linha onde as rodas da carreta tocam (faixa da direita, mais próxima). */
export const GROUND = 264;
/** Linha das rodas dos carros na faixa contrária. */
export const FAR_GROUND = 240;

export const RIG = {
  /** Traseira da carreta → para-choque do cavalo mecânico. */
  length: 606,
  wheelR: 20,
  /** Bocal do tanque (coordenadas locais, a partir da traseira). */
  tankCap: { x: 490, y: -46 },
  trailerAxles: [86, 130, 174] as const,
  /** Dois eixos de tração + eixo dianteiro. */
  tractorAxles: [398, 442, 552] as const,
} as const;

export const SPEED = {
  cruise: 520,
  /** Retomada após uma parada. */
  accel: 210,
  /** Desaceleração de referência para iniciar a frenagem. */
  decel: 260,
  /** Carros na contramão (relativo ao chão). */
  oncoming: 380,
} as const;

/** Tempo rodando na estrada entre um acontecimento e outro. */
export const CRUISE_SECONDS = [13, 17] as const;
/** Depois de retomar a viagem, quando passar por um túnel ou ponte. */
export const PASS_SECONDS = [4, 6] as const;
/**
 * Cidades ao fundo: uma nova a cada `every` segundos de viagem; cada uma
 * leva `cross` segundos para cruzar a tela (contados com a carreta andando).
 */
export const CITY = {
  every: 10,
  cross: 25,
  /** Quantas cidades seguidas passam antes de um trecho de campo. */
  run: [1, 2],
  /**
   * Trecho de campo: quantos ciclos de `every` pular sem cidade nova.
   * Como cada cidade leva `cross` s para sair, 3–5 ciclos deixam o fundo
   * sem cidade por ~15–35 s.
   */
  gap: [3, 5],
} as const;
/**
 * Abertura (ao entrar no site): carreta encostada na doca do centro de
 * distribuição, caixas entrando no baú, porta fechando e partida.
 */
export const LOAD = {
  boxes: 9,
  /** Quando sai a primeira caixa e o intervalo entre caixas (s). */
  first: 0.9,
  every: 0.38,
  /** Tempo de cada caixa da doca até o lugar na pilha. */
  travel: 1.1,
  /** Descida da porta de enrolar e pausa antes de arrancar. */
  door: 1.0,
  hold: 0.5,
  /** Onde cada caixa sai, na doca (relativo à traseira do baú). */
  from: -150,
} as const;

/**
 * Compartimento de carga visível na traseira do baú (coordenadas locais da
 * carreta): janela aberta onde as caixas são empilhadas em `cols` colunas,
 * do fundo para a porta e de baixo para cima.
 */
export const CARGO = {
  win: { x: 8, y: -153, w: 96, h: 99 },
  /** Piso do baú = topo da plataforma da doca. */
  floor: -54,
  box: { w: 30, h: 28 },
  cols: 3,
} as const;

/** Posição final (canto inferior esquerdo) da caixa `i` na pilha. */
export const cargoSlot = (i: number): [number, number] => {
  const row = Math.floor(i / CARGO.cols);
  const col = CARGO.cols - 1 - (i % CARGO.cols);
  return [CARGO.win.x + 1.5 + col * (CARGO.box.w + 1.5), CARGO.floor - row * CARGO.box.h];
};
/** Instante em que a porta começa a fechar e em que a carreta arranca. */
export const LOAD_DOOR = LOAD.first + (LOAD.boxes - 1) * LOAD.every + LOAD.travel + 0.25;
export const LOAD_GO = LOAD_DOOR + LOAD.door + LOAD.hold;
/** Intervalo entre carros na contramão. */
export const CAR_SECONDS = [4, 9] as const;

/** Paleta do entardecer (combina com a fotografia da hero). */
export const C = {
  sun: "#FFD9A0",
  mountFar: "#7A6A9E",
  mountNear: "#575A8E",
  hills: "#3F6F5A",
  grove: "#2E5B49",
  verge: "#4F8048",
  vergeDark: "#3B6A3A",
  trees: ["#2F7048", "#3F8653", "#285F3E", "#4F9560"],
  trunk: "#5A4334",
  asphalt: "#2C3038",
  asphaltEdge: "#22262D",
  line: "#EEF0F2",
  center: "#F2C94C",
  nearVerge: "#3E7140",
  curb: "#A3ABB5",
  pole: "#3A4150",
  warm: "#FFD27A",
  glass: "#24324A",
  orange: "#F47C28",
  navy: "#162F60",
  teal: "#0F8B8D",
} as const;
