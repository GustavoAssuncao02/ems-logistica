/**
 * Céu de fim de tarde com nuvens volumétricas renderizadas em tempo real
 * (WebGL2, sem bibliotecas).
 *
 * As nuvens não são imagens nem desenhos: cada pixel lança um raio que
 * atravessa uma camada de nuvens definida por ruído 3D (Perlin-Worley),
 * acumulando densidade, absorção e espalhamento da luz do sol baixo à
 * direita (Beer-Lambert + função de fase de Henyey-Greenstein + efeito
 * "powder"). O vento desloca o volume devagar, então as nuvens se movem e
 * mudam de forma suavemente.
 *
 * O volume de ruído (64³) é gerado na própria GPU, camada a camada, na
 * inicialização — não há arquivo para baixar nem custo na thread principal.
 */

export type CloudSky = {
  /** Ajusta a resolução interna para o tamanho exibido (px CSS). */
  setSize(cssWidth: number, cssHeight: number): void;
  /** Muda a fração de resolução (aparelhos lentos). */
  setScale(scale: number): void;
  /** Desenha um quadro para o instante `seconds`. */
  render(seconds: number): void;
  dispose(): void;
};

const NOISE_N = 64;

const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/** Gera uma camada do volume de ruído (repetível nas três direções). */
const NOISE_FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
uniform float uLayer;
uniform float uN;
out vec4 outColor;

uvec3 pcg3d(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}
vec3 hash3(vec3 cell, float seed) {
  uvec3 h = pcg3d(uvec3(ivec3(cell) + ivec3(int(seed) * 131, int(seed) * 71, int(seed) * 37) + 4096));
  return vec3(h) * (1.0 / 4294967296.0);
}

// Worley (distância à semente mais próxima), invertido: 1 no centro das "bolhas".
float worley(vec3 p, float cells, float seed) {
  vec3 u = p * cells;
  vec3 c = floor(u);
  vec3 f = u - c;
  float m = 1.0;
  for (int z = -1; z <= 1; z++)
  for (int y = -1; y <= 1; y++)
  for (int x = -1; x <= 1; x++) {
    vec3 o = vec3(x, y, z);
    vec3 cell = mod(c + o, cells);
    vec3 fp = hash3(cell, seed);
    m = min(m, length(o + fp - f));
  }
  return 1.0 - clamp(m, 0.0, 1.0);
}

// Ruído de valor com interpolação quíntica, periódico em "period".
float vnoise(vec3 p, float period, float seed) {
  vec3 u = p * period;
  vec3 i = floor(u);
  vec3 f = u - i;
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = hash3(mod(i, period), seed).x;
  float n100 = hash3(mod(i + vec3(1, 0, 0), period), seed).x;
  float n010 = hash3(mod(i + vec3(0, 1, 0), period), seed).x;
  float n110 = hash3(mod(i + vec3(1, 1, 0), period), seed).x;
  float n001 = hash3(mod(i + vec3(0, 0, 1), period), seed).x;
  float n101 = hash3(mod(i + vec3(1, 0, 1), period), seed).x;
  float n011 = hash3(mod(i + vec3(0, 1, 1), period), seed).x;
  float n111 = hash3(mod(i + vec3(1, 1, 1), period), seed).x;
  return mix(
    mix(mix(n000, n100, w.x), mix(n010, n110, w.x), w.y),
    mix(mix(n001, n101, w.x), mix(n011, n111, w.x), w.y),
    w.z);
}

void main() {
  vec3 p = vec3(gl_FragCoord.xy, uLayer + 0.5) / uN;

  float perlin = vnoise(p, 4.0, 1.0) * 0.55 + vnoise(p, 8.0, 2.0) * 0.28 + vnoise(p, 16.0, 3.0) * 0.17;
  float wBase = worley(p, 4.0, 4.0) * 0.625 + worley(p, 8.0, 5.0) * 0.25 + worley(p, 16.0, 6.0) * 0.125;
  // Perlin-Worley: forma arredondada de cúmulo com variação de baixa frequência
  float pw = clamp((perlin - (wBase - 1.0)) / (2.0 - wBase), 0.0, 1.0);

  float detail = worley(p, 8.0, 7.0) * 0.625 + worley(p, 16.0, 8.0) * 0.25 + worley(p, 32.0, 9.0) * 0.125;
  float weather = vnoise(p, 2.0, 10.0) * 0.65 + vnoise(p, 4.0, 11.0) * 0.35;

  outColor = vec4(pw, detail, weather, 1.0);
}
`;

/** Céu + nuvens por marcha de raios. Cores em espaço linear. */
const SKY_FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler3D;
uniform sampler3D uNoise;
uniform vec2 uRes;
uniform float uTime;
out vec4 outColor;

// Sol baixo, logo além da borda direita do quadro.
const vec3 SUN = normalize(vec3(0.50, 0.115, 0.86));
const vec3 SUN_COL = vec3(1.0, 0.27, 0.08) * 1.6;

// Mar de nuvens abaixo da câmera; ao longe, torres de cúmulo — mais altas
// do lado do sol.
const float SEA_BOT = -3.2;
const float SEA_TOP = -1.0;
const float TOWER = 2.3;
const float TOWER_SUN = 1.7;
const float TOWER_Z = 9.0;

const vec3 WIND = vec3(0.028, 0.0, 0.010);
// gira o domínio do ruído para a repetição não alinhar com a visão
const mat3 ROT = mat3(0.866, 0.0, -0.5,  0.0, 1.0, 0.0,  0.5, 0.0, 0.866);

float remap(float v, float a, float b, float c, float d) {
  return c + (v - a) / (b - a) * (d - c);
}

float hg(float c, float g) {
  float g2 = g * g;
  return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * c, 1.5);
}

vec3 skyAbove(vec3 rd) {
  float y = max(rd.y, 0.0);
  float s = max(dot(rd, SUN), 0.0);
  vec3 col = mix(vec3(0.050, 0.046, 0.120), vec3(0.016, 0.042, 0.140), smoothstep(0.0, 0.14, y));
  col = mix(col, vec3(0.003, 0.026, 0.125), smoothstep(0.10, 0.42, y));
  // lóbulo largo rosado na direção do sol e núcleo laranja
  col += vec3(0.30, 0.10, 0.045) * pow(s, 8.0) * (1.0 - 0.8 * smoothstep(0.0, 0.32, y));
  col += vec3(0.75, 0.22, 0.05) * pow(s, 18.0);
  col += vec3(1.50, 0.60, 0.20) * pow(s, 180.0);
  return col;
}

// Abaixo do horizonte: o mar de nuvens distante se perde na névoa; perto,
// as frestas mostram o chão escuro lá embaixo.
vec3 skyColor(vec3 rd) {
  if (rd.y >= 0.0) return skyAbove(rd);
  vec3 haze = skyAbove(normalize(vec3(rd.x, 0.012, rd.z)));
  float s = max(dot(rd, SUN), 0.0);
  vec3 ground = vec3(0.010, 0.008, 0.020) + vec3(0.12, 0.035, 0.02) * pow(s, 6.0);
  return mix(haze, ground, smoothstep(0.0, 0.16, -rd.y));
}

float lod(float foot, float freq) {
  return log2(max(foot * freq * 40.0, 1.0));
}

float towerTop(vec3 p, float weather, float variation) {
  float far = smoothstep(TOWER_Z, TOWER_Z + 8.0, p.z);
  float sunSide = smoothstep(4.0, 12.0, p.x);
  float lift = TOWER * smoothstep(0.5, 0.85, weather) + TOWER_SUN * sunSide * smoothstep(0.42, 0.75, weather);
  // topos em alturas diferentes: nada de "platô"
  return SEA_TOP + 0.35 * (variation - 0.5) + far * lift * (0.3 + 0.9 * variation);
}

float density(vec3 p, bool detailed, float foot) {
  // Antes das torres, a variação só eleva o topo do mar em até 0,175.
  if (p.y <= SEA_BOT || (p.z <= TOWER_Z && p.y >= SEA_TOP + 0.175)) return 0.0;
  vec3 w = ROT * p;
  float weather = textureLod(uNoise, w * 0.03 + WIND * uTime * 0.25 + 0.37, lod(foot, 0.03)).b;
  float variation = textureLod(uNoise, w * 0.11 + WIND * uTime * 0.5 + 0.71, lod(foot, 0.11)).b;
  float top = towerTop(p, weather, variation);
  float h = (p.y - SEA_BOT) / (top - SEA_BOT);
  if (h <= 0.0 || h >= 1.0) return 0.0;
  vec3 q = w * 0.42 + WIND * uTime;
  float base = textureLod(uNoise, q, lod(foot, 0.42)).r;
  float cover = clamp(0.25 + (weather - 0.45) * 1.2 + clamp(p.x * 0.015, -0.05, 0.05), 0.0, 1.0);
  // perfil de cúmulo: base achatada, topo arredondado
  float profile = smoothstep(0.0, 0.08, h) * smoothstep(1.0, 0.5, h);
  float d = remap(base * profile, 1.0 - cover, 1.0, 0.0, 1.0);
  if (d <= 0.0) return 0.0;
  if (detailed) {
    float det = textureLod(uNoise, q * 2.4 + vec3(0.0, uTime * 0.006, 0.0), lod(foot, 1.0)).g;
    d = remap(d, det * 0.28 * mix(1.0, 0.6, h), 1.0, 0.0, 1.0);
  }
  return clamp(d, 0.0, 1.0) * 9.0;
}

float lightMarch(vec3 p, float foot) {
  float acc = 0.0;
  float ls = 0.14;
  for (int j = 0; j < 5; j++) {
    float k = 1.0 + float(j) * 0.6;
    acc += density(p + SUN * ls * (float(j) + 0.5) * k, false, foot * 1.5) * ls * k;
  }
  return acc;
}

// Marcha pelo trecho [t0, t1]; devolve cor (rgb) e transmitância (a).
// O passo cresce com a distância: fino perto, grosso perto do horizonte
// (onde o ruído já está suavizado pelo mipmap).
vec4 march(vec3 ro, vec3 rd, float t0, float t1, float jitter, float pixAng) {
  if (t1 <= t0) return vec4(0.0, 0.0, 0.0, 1.0);
  float k = mix(0.034, 0.016, smoothstep(0.02, 0.12, abs(rd.y)));
  float t = t0 + max(0.04, t0 * k) * jitter;
  float c = dot(rd, SUN);
  float phase = mix(hg(c, 0.6), hg(c, -0.2), 0.3);
  // névoa sem o núcleo do sol, para as nuvens contra o sol manterem o contraste
  vec3 haze = min(skyAbove(normalize(vec3(rd.x, 0.012, rd.z))), vec3(0.32, 0.15, 0.15));
  vec3 col = vec3(0.0);
  float T = 1.0;
  for (int i = 0; i < 96; i++) {
    if (t > t1 || T < 0.02) break;
    float dt = max(0.04, t * k);
    vec3 p = ro + rd * t;
    // pegada do pixel e do passo: amostras esparsas pedem ruído mais suave
    float foot = max(t * pixAng, dt * 0.35);
    float d = density(p, true, foot);
    if (d > 0.002) {
      float od = lightMarch(p, foot);
      float sunT = exp(-od * 4.0) + 0.06 * exp(-od * 0.4);
      float powder = 1.0 - exp(-d * 1.6);
      float hh = clamp((p.y - SEA_BOT) / (SEA_TOP + 0.6 - SEA_BOT), 0.0, 1.0);
      vec3 ambient = mix(vec3(0.012, 0.006, 0.012), vec3(0.050, 0.030, 0.052), hh);
      vec3 lum = SUN_COL * sunT * phase * mix(0.55, 1.0, powder) + ambient;
      // perspectiva aérea: ao longe, as nuvens se fundem na névoa do horizonte
      lum = mix(lum, haze, 1.0 - exp(-t * 0.028));
      float tr = exp(-d * dt);
      col += T * lum * (1.0 - tr);
      T *= tr;
    }
    t += dt;
  }
  return vec4(col, T);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  // câmera levemente inclinada para cima: horizonte a ~30% da base do quadro
  float pitch = 0.124;
  vec3 fw = vec3(0.0, sin(pitch), cos(pitch));
  vec3 rt = vec3(1.0, 0.0, 0.0);
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(rt * uv.x + up * uv.y + fw * 1.6);
  vec3 ro = vec3(0.0);
  float jitter = hash12(gl_FragCoord.xy);
  float pixAng = 1.0 / (1.6 * uRes.y);

  vec3 col = skyColor(rd);

  // topo mais alto que este raio pode encontrar (torres começam em z = TOWER_Z)
  float maxTop = SEA_TOP + TOWER + (rd.x > 0.0 ? TOWER_SUN : 0.0);
  float tTower = TOWER_Z / max(rd.z, 0.2);
  if (rd.y * tTower < maxTop) {
    float tIn, tOut;
    if (rd.y < 0.0) {
      float tTop = SEA_TOP / rd.y;
      tIn = min(tTop, tTower);
      // raios íngremes: só a casca de cima do mar importa; rasantes: vão longe
      tOut = min(tTop + min(1.4 / -rd.y, 40.0), 90.0);
    } else {
      tIn = tTower;
      tOut = min(maxTop / rd.y, 90.0);
    }
    vec4 c = march(ro, rd, tIn, tOut, jitter, pixAng);
    col = col * c.a + c.rgb;
  }

  col = 1.0 - exp(-col * 1.1);
  col = pow(col, vec3(1.0 / 2.2));
  col += (jitter - 0.5) / 255.0;
  outColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`cloudSky: shader — ${log}`);
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const p = gl.createProgram()!;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`cloudSky: link — ${gl.getProgramInfoLog(p)}`);
  return p;
}

/**
 * Cria o céu no canvas. Devolve `null` sem WebGL2 (quem chama mostra o
 * fundo estático).
 * `scale` é a fração da resolução exibida usada internamente — as nuvens
 * são macias, então meia resolução já fica nítida e custa 4× menos.
 */
export function createCloudSky(canvas: HTMLCanvasElement, { scale = 0.6, maxPixels = 520_000 } = {}): CloudSky | null {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  let skyProg: WebGLProgram;
  let noiseProg: WebGLProgram;
  try {
    noiseProg = program(gl, NOISE_FRAG);
    skyProg = program(gl, SKY_FRAG);
  } catch (err) {
    console.warn(err);
    return null;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // volume de ruído gerado na GPU, camada por camada
  const noise = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_3D, noise);
  gl.texStorage3D(gl.TEXTURE_3D, Math.log2(NOISE_N) + 1, gl.RGBA8, NOISE_N, NOISE_N, NOISE_N);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) gl.texParameteri(gl.TEXTURE_3D, p, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.useProgram(noiseProg);
  gl.viewport(0, 0, NOISE_N, NOISE_N);
  gl.uniform1f(gl.getUniformLocation(noiseProg, "uN"), NOISE_N);
  const uLayer = gl.getUniformLocation(noiseProg, "uLayer");
  for (let z = 0; z < NOISE_N; z++) {
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, noise, 0, z);
    gl.uniform1f(uLayer, z);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb);
  gl.generateMipmap(gl.TEXTURE_3D);
  gl.deleteProgram(noiseProg);

  gl.useProgram(skyProg);
  gl.uniform1i(gl.getUniformLocation(skyProg, "uNoise"), 0);
  const uRes = gl.getUniformLocation(skyProg, "uRes");
  const uTime = gl.getUniformLocation(skyProg, "uTime");

  let cssW = 1;
  let cssH = 1;
  return {
    setSize(cssWidth, cssHeight) {
      cssW = cssWidth;
      cssH = cssHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = cssWidth * dpr * scale;
      let h = cssHeight * dpr * scale;
      const k = Math.min(1, Math.sqrt(maxPixels / Math.max(1, w * h)));
      w = Math.max(1, Math.round(w * k));
      h = Math.max(1, Math.round(h * k));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    },
    setScale(next) {
      scale = next;
      this.setSize(cssW, cssH);
    },
    render(seconds) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(skyProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_3D, noise);
      gl.bindVertexArray(vao);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(noise);
      gl.deleteBuffer(quad);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(skyProg);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
