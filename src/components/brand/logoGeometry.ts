/**
 * Geometria vetorial do monograma EMS.
 *
 * Reconstruída a partir da logo oficial publicada nas mídias da marca
 * (traçado automático por máscara de cor + redesenho geométrico).
 * Substitua pelo arquivo vetorial oficial assim que estiver disponível —
 * os nomes das partes devem ser preservados, pois a animação da jornada
 * (revelação da marca) anima cada parte separadamente.
 *
 * Sistema de coordenadas próprio: x 12–1010, y 10–400 (linha de base = 394).
 */

export const LOGO_BOX = { x: 10, y: 8, w: 1002, h: 394 } as const;
export const LOGO_CENTER = { x: 511, y: 205 } as const;
export const LOGO_WIDTH = 998;
export const LOGO_BASELINE = 394;

/** Letra E. O braço inferior é cortado pela máscara do vão da seta. */
export const PATH_E = "M15 16H252V88H104V162H231V234H104V320H250V394H15Z";

/** Letra m completa (arcos + 3 hastes) com os dois vãos internos (evenodd). */
export const PATH_M =
  "M286 394V100C286 46 330 12 398 12C440 12 470 24 488 42C508 22 538 13 576 13C636 13 679 42 679 92V394Z" +
  "M383 394V106C383 91 395 81 410 81C426 81 438 92 438 107V394Z" +
  "M527 394V108C527 93 540 81 558 81C576 81 589 93 589 108V394Z";

/** Hastes do m isoladas — usadas na animação de "barras subindo". */
export const BAR_RECTS = [
  { x: 286, w: 97 },
  { x: 438, w: 89 },
  { x: 589, w: 90 },
] as const;

/** Letra S (suavizada a partir do traçado). */
export const PATH_S =
  "M763 302L763 378C768.5 379.7 781.7 386 793.2 389.2C804.8 392.5 821.2 395.6 833 397.2C844.8 398.9 851.2 399 864 399C876.8 399 896.3 399 909.5 397.5C922.7 396 935 392.2 943.2 389.8C951.5 387.3 953.9 385.9 959.2 383C964.6 380.1 969.5 377.8 975.2 372.5C981 367.2 989.2 358.1 993.8 351.2C998.3 344.4 1000.2 339.1 1002.5 331.5C1004.8 323.9 1006.6 315.1 1007.2 305.5C1007.9 295.9 1007.4 282.8 1006.2 273.8C1005.1 264.8 1002.3 257.4 1000.2 251.5C998.2 245.6 997.1 243.4 994 238.5C990.9 233.6 987.7 228.1 981.8 222C975.8 215.9 967.3 208.2 958.2 201.8C949.2 195.2 941.8 190.8 927.5 183C913 175.2 886 162 872.8 154.8C860.8 148.2 860 146.8 856 143.8C852 140.7 850.5 140.3 848.5 136.2C846.5 132.2 844.2 124.5 843.8 119.2C843.3 114 845.2 108.2 846 105C846.8 101.8 847 101.7 848.2 100C849.5 98.3 851.1 96.5 853.8 94.8C856.4 93 858.8 90.8 864.2 89.5C869.7 88.2 877.6 87.1 886.2 86.8C894.9 86.4 907 86.6 916.2 87.2C925.5 87.9 934.1 89 942 90.8C949.9 92.5 954.9 93.8 963.5 97.8C972.1 101.8 988.7 111.9 995 114.8L995 39C992.2 37.4 986.7 32.8 978 29.5C969.3 26.2 953.1 21.3 943 19C932.9 16.7 929 16.2 917.2 15.5C905.5 14.8 884 14.5 872.5 14.8C861 15 856.1 15.6 848 17C839.9 18.4 830.8 20.8 823.8 23.2C816.8 25.7 811.5 28.2 806 31.5C800.5 34.8 795.7 37.8 790.5 42.8C785.3 47.7 779.2 54.5 775 61.2C770.8 68 767.4 76.5 765 83.2C762.6 90 761.7 96.1 760.8 102C759.8 107.9 759.5 111.8 759.5 118.5C759.5 125.2 759.6 135 760.5 142C761.4 149 762.8 154.4 765 160.5C767.2 166.6 770.2 173.3 773.5 178.8C776.8 184.2 779.1 187.9 784.5 193.2C789.9 198.6 796.9 205 805.8 211C814.6 217 825.3 223 837.5 229.5C849.7 236 866.8 243.2 879 250C891.2 256.8 904 265 910.8 270.5C917.5 276 918 277.5 919.8 282.8C921.5 288 921.9 296.9 921.5 302C921.1 307.1 919.2 310.2 917.5 313.2C915.8 316.3 915.2 318.1 911 320.5C906.8 322.9 900.7 326 892 327.5C883.3 329 868.6 329.2 859 329.2C849.4 329.2 843.2 328.8 834.2 327.5C825.3 326.2 814.3 324 805.2 321.2C796.2 318.5 786.5 314 779.8 310.8C773 307.5 767 304 763 302Z";

/** Linha central da seta em zigue-zague (traço contínuo — permite a animação de desenho). */
export const ARROW_LINE = "M211.4 420L445.5 156.5L555 253.5L716 69";
export const ARROW_STROKE = 49;
/** Comprimento aproximado da linha central (para stroke-dasharray). */
export const ARROW_LENGTH = 353 + 146.3 + 245.4;

/** Ponta da seta. */
export const ARROW_HEAD = "M684 37L765 14L749 97Z";
export const ARROW_TIP = { x: 765, y: 14 } as const;

/** Largura do vão entre seta e letras (de cada lado). */
export const ARROW_GAP = 14;

/** Região acima da seta (parte azul do m) e abaixo (barras cinza). */
export const REGION_ABOVE = "M-20 -60H781.7V-6.4L716 69L555 253.5L445.5 156.5L211.4 420H-20Z";
export const REGION_BELOW = "M211.4 420L445.5 156.5L555 253.5L716 69L781.7 -6.4H1100V480H211.4Z";
