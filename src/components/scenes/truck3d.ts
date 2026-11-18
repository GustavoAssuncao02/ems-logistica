import { monogramSvg } from "@/components/brand/monogramSvg";

/**
 * Carreta EMS em 3D (three.js), vista de cima com a câmera levemente
 * inclinada. Renderiza num canvas transparente que fica sobre a estrada
 * vetorial; a cada quadro só muda a direção (yaw) e o sombreamento acompanha.
 *
 * three.js é carregado sob demanda (import dinâmico), fora do pacote inicial.
 */

/** Lado do quadro renderizado, em metros. */
export const TRUCK_VIEW_M = 24;
/** Inclinação da câmera em relação à vertical. */
export const CAMERA_TILT = (24 * Math.PI) / 180;
/** Comprimento total da carreta (m). */
export const RIG_LENGTH_M = 16.6;

export type TruckView = {
  /** Desenha a carreta apontando para o ângulo de tela (graus, SVG: y para baixo). */
  render: (screenAngleDeg: number) => void;
  /** Tamanho do buffer de desenho (px). */
  resize: (pixels: number) => void;
  dispose: () => void;
};

/** Direção no chão (yaw) que, vista pela câmera inclinada, aparece no ângulo de tela `a`. */
export const yawForScreenAngle = (a: number) => Math.atan2(Math.sin(a) / Math.cos(CAMERA_TILT), Math.cos(a));
/** Encurtamento do comprimento na tela para um ângulo de tela `a` (1 = de lado). */
export const lengthFactor = (a: number) => {
  const y = yawForScreenAngle(a);
  return Math.hypot(Math.cos(y), Math.sin(y) * Math.cos(CAMERA_TILT));
};

type Three = typeof import("three");

export async function createTruckView(canvas: HTMLCanvasElement, pixels: number): Promise<TruckView> {
  const THREE = await import("three");
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.setSize(pixels, pixels, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.4;

  const half = TRUCK_VIEW_M / 2;
  const camera = new THREE.OrthographicCamera(-half, half, half, -half, 1, 200);
  camera.position.set(0, Math.cos(CAMERA_TILT) * 60, Math.sin(CAMERA_TILT) * 60);
  camera.lookAt(0, 0, 0);

  // luz principal alta, vinda de trás/esquerda: teto bem claro, lateral em meia-luz
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5672, 0.38));
  const sun = new THREE.DirectionalLight(0xfff8ee, 3);
  sun.position.set(-5, 28, -8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 80 });
  sun.shadow.radius = 3;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd9e3ff, 0.3);
  fill.position.set(8, 6, 16);
  scene.add(fill);

  // chão invisível: só recebe a sombra, que cai sobre a estrada desenhada
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: 0x050b18, opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const rig = await buildRig(THREE, RoundedBoxGeometry, anisotropy);
  scene.add(rig);

  return {
    render(screenAngleDeg) {
      rig.rotation.y = -yawForScreenAngle((screenAngleDeg * Math.PI) / 180);
      renderer.render(scene, camera);
    },
    resize(px) {
      renderer.setSize(px, px, false);
    },
    dispose() {
      scene.traverse((o) => {
        const m = o as import("three").Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
          Object.values(mat).forEach((v) => (v as { isTexture?: boolean })?.isTexture && (v as import("three").Texture).dispose());
          mat.dispose();
        });
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Modelo                                                               */
/* ------------------------------------------------------------------ */

async function buildRig(THREE: Three, RoundedBox: typeof import("three/addons/geometries/RoundedBoxGeometry.js").RoundedBoxGeometry, anisotropy: number) {
  const rig = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({ color: 0xf5f7fa, roughness: 0.34, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.18 });
  // cavalo mecânico no azul da marca, com verniz: os reflexos marcam as dobras da lataria
  const cabPaint = new THREE.MeshPhysicalMaterial({ color: "#2a4c8f", roughness: 0.3, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 });
  const cabTrim = new THREE.MeshPhysicalMaterial({ color: "#35609f", roughness: 0.32, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.12 });
  // molduras de alumínio do baú (cantoneiras e réguas)
  const frame = new THREE.MeshStandardMaterial({ color: 0x8c96a6, roughness: 0.3, metalness: 0.85 });
  const frameDark = new THREE.MeshStandardMaterial({ color: 0x5f6a7b, roughness: 0.45, metalness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.7, metalness: 0.25 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0d0f13, roughness: 0.95 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xc6ccd5, roughness: 0.28, metalness: 0.9 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0a1322, roughness: 0.06, metalness: 0.35, clearcoat: 1, side: THREE.DoubleSide });
  const orange = new THREE.MeshStandardMaterial({ color: 0xf47c28, roughness: 0.45, emissive: 0xf47c28, emissiveIntensity: 0.12 });
  const tail = new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0xff2414, emissiveIntensity: 3 });
  const head = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1cf, emissiveIntensity: 2.4 });

  const add = (geo: import("three").BufferGeometry, mat: import("three").Material | import("three").Material[], x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    rig.add(m);
    return m;
  };

  const textured = (tex: import("three").Texture) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    const m = paint.clone();
    m.map = tex;
    return m;
  };

  /* ---------- carreta baú ---------- */
  const TL = 13.6;
  const TH = 2.9;
  const TW = 2.55;
  const TX = -1.5;
  const TY = 1.3 + TH / 2;
  const logo = await loadLogo();
  const sideR = new THREE.CanvasTexture(sideCanvas(logo, false));
  const sideL = new THREE.CanvasTexture(sideCanvas(logo, true));
  const roof = new THREE.CanvasTexture(roofCanvas());
  const rear = new THREE.CanvasTexture(rearCanvas());
  // ordem das faces da caixa: +x (frente), −x (traseira), +y (teto), −y (fundo), +z (direita), −z (esquerda)
  add(new RoundedBox(TL, TH, TW, 3, 0.07), [paint, textured(rear), textured(roof), dark, textured(sideR), textured(sideL)], TX, TY, 0);

  // contorno do baú: réguas de teto, cantoneiras verticais, travessas e régua de base
  {
    const P = 0.15;
    const x0 = TX - TL / 2;
    const x1 = TX + TL / 2;
    const y0 = 1.3;
    const y1 = 1.3 + TH;
    const z0 = -TW / 2;
    const z1 = TW / 2;
    for (const z of [z0, z1]) {
      add(new THREE.BoxGeometry(TL + P, P, P), frame, TX, y1, z); // régua do teto
      add(new THREE.BoxGeometry(TL + P, 0.3, 0.1), frameDark, TX, y0 + 0.1, z * 1.012); // régua de base
      // montantes (o do meio fica de fora para não cortar a marca)
      for (const i of [1, 2, 4, 5]) add(new THREE.BoxGeometry(0.08, TH - 0.2, 0.05), frame, x0 + (i * TL) / 6, TY, z * 1.01);
    }
    for (const x of [x0, x1]) {
      add(new THREE.BoxGeometry(P, P, TW + P), frame, x, y1, 0); // travessas do teto
      add(new THREE.BoxGeometry(P, 0.3, TW + P), frameDark, x, y0 + 0.1, 0);
      for (const z of [z0, z1]) add(new THREE.BoxGeometry(P, TH, P), frame, x, TY, z); // cantoneiras
    }
    for (let i = 1; i < 8; i++) add(new THREE.BoxGeometry(0.07, 0.035, TW - 0.1), frame, x0 + (i * TL) / 8, y1 + 0.02, 0); // nervuras do teto
  }

  add(new THREE.BoxGeometry(13.0, 0.28, 2.2), dark, TX, 1.15, 0); // longarinas
  for (const z of [-1.2, 1.2]) add(new THREE.BoxGeometry(5.4, 0.32, 0.05), dark, -0.9, 0.98, z); // proteção lateral
  add(new THREE.BoxGeometry(0.2, 0.24, 2.4), dark, -8.18, 0.76, 0); // para-choque traseiro
  for (const z of [-0.95, 0.95]) {
    add(new THREE.BoxGeometry(0.07, 0.22, 0.52), tail, -8.32, 1.06, z); // lanternas
    add(new THREE.BoxGeometry(0.07, 0.09, 0.32), tail, -8.33, 4.08, z * 1.05); // delimitadoras no alto
  }
  for (const x of [-6.9, -5.6, -4.3]) for (const z of [-0.95, 0.95]) wheel(x, z);

  /* ---------- cavalo mecânico ---------- */
  add(new THREE.BoxGeometry(5.3, 0.34, 1.0), dark, 5.55, 0.95, 0); // chassi
  for (const z of [-1.08, 1.08]) {
    const tank = add(new THREE.CylinderGeometry(0.34, 0.34, 1.15, 24), metal, 5.25, 0.86, z);
    tank.rotation.z = Math.PI / 2;
  }
  for (const x of [3.45, 4.7]) for (const z of [-0.95, 0.95]) wheel(x, z);
  for (const z of [-1.03, 1.03]) wheel(7.1, z, 0.5);

  // cabine: perfil lateral (para-brisa inclinado) extrudado na largura
  const cabShape = new THREE.Shape();
  cabShape.moveTo(5.7, 1.05);
  cabShape.lineTo(8.12, 1.05);
  cabShape.lineTo(8.18, 2.2);
  cabShape.lineTo(7.5, 3.62);
  cabShape.lineTo(5.72, 3.68);
  cabShape.closePath();
  const cabGeo = new THREE.ExtrudeGeometry(cabShape, { depth: 2.4, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.09, bevelSegments: 4, curveSegments: 4 });
  cabGeo.translate(0, 0, -1.2);
  add(cabGeo, cabPaint, 0, 0, 0);

  // defletor de ar sobre o teto
  const fairing = new THREE.Shape();
  fairing.moveTo(5.8, 3.64);
  fairing.lineTo(7.15, 3.62);
  fairing.lineTo(6.1, 4.14);
  fairing.lineTo(5.8, 4.14);
  fairing.closePath();
  const fairGeo = new THREE.ExtrudeGeometry(fairing, { depth: 2.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 });
  fairGeo.translate(0, 0, -1.1);
  add(fairGeo, cabTrim, 0, 0, 0);

  // para-brisa: plano alinhado à inclinação da frente
  const a = { x: 8.18, y: 2.2 };
  const b = { x: 7.5, y: 3.62 };
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const d = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const nrm = { x: d.y, y: -d.x };
  const shield = new THREE.Group();
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.25, len * 0.8), glass);
  pane.rotation.y = Math.PI / 2;
  shield.add(pane);
  shield.rotation.z = Math.atan2(nrm.y, nrm.x);
  shield.position.set(a.x + d.x * len * 0.52 + nrm.x * 0.1, a.y + d.y * len * 0.52 + nrm.y * 0.1, 0);
  rig.add(shield);

  // janelas laterais
  const win = new THREE.Shape();
  win.moveTo(6.75, 2.5);
  win.lineTo(7.94, 2.5);
  win.lineTo(7.58, 3.4);
  win.lineTo(6.75, 3.4);
  win.closePath();
  for (const z of [-1.3, 1.3]) {
    const w = new THREE.Mesh(new THREE.ShapeGeometry(win), glass);
    w.position.z = z;
    rig.add(w);
    add(new THREE.BoxGeometry(2.35, 0.08, 0.02), orange, 6.9, 1.55, z); // friso laranja
    add(new THREE.BoxGeometry(0.06, 0.06, 0.34), dark, 7.78, 3.02, z * 1.1); // braço do retrovisor
    add(new THREE.BoxGeometry(0.2, 0.62, 0.1), dark, 7.78, 2.78, z * 1.22); // retrovisor
  }

  add(new THREE.BoxGeometry(0.22, 0.42, 2.5), dark, 8.2, 0.78, 0); // para-choque
  add(new THREE.BoxGeometry(0.04, 0.62, 1.5), dark, 8.24, 1.6, 0); // grade
  for (const z of [-0.92, 0.92]) add(new THREE.BoxGeometry(0.06, 0.16, 0.42), head, 8.25, 1.12, z); // faróis

  /* ---------- sombra de contato (macia, sob o conjunto) ---------- */
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(18.4, 4.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(contactCanvas()), transparent: true, depthWrite: false, opacity: 0.55 }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, 0.01, 0);
  rig.add(contact);

  return rig;

  function wheel(x: number, z: number, r = 0.52) {
    const tire = add(new THREE.CylinderGeometry(r, r, 0.6, 28), rubber, x, r, z);
    tire.rotation.x = Math.PI / 2;
    const hub = add(new THREE.CylinderGeometry(r * 0.56, r * 0.56, 0.62, 20), metal, x, r, z);
    hub.rotation.x = Math.PI / 2;
  }
}

/* ------------------------------------------------------------------ */
/* Texturas desenhadas em canvas                                        */
/* ------------------------------------------------------------------ */

function canvas2d(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

type Logo = { img: HTMLImageElement; aspect: number } | null;

function loadLogo() {
  const svg = monogramSvg();
  const vb = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 2 1").split(/\s+/).map(Number);
  const aspect = vb[2] / vb[3] || 2;
  // tamanho explícito: o navegador rasteriza a marca nítida no canvas
  const sized = svg.replace("<svg ", `<svg width="${Math.round(400 * aspect)}" height="400" `);
  return new Promise<Logo>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, aspect });
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  });
}

/** Lateral do baú: painéis com nervuras, friso laranja/azul e a marca EMS. */
function sideCanvas(logo: Logo, mirrored: boolean) {
  const W = 2048;
  const H = 436;
  const [c, g] = canvas2d(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#fbfcfd");
  grad.addColorStop(1, "#e9edf2");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  for (let x = 30; x < W; x += 60) {
    g.fillStyle = "rgba(140,152,170,0.32)";
    g.fillRect(x, 14, 2, H - 70);
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillRect(x + 2, 14, 2, H - 70);
  }
  g.fillStyle = "#dde2e9";
  g.fillRect(0, 0, W, 12);
  g.fillStyle = "#d6dce4";
  g.fillRect(0, H - 40, W, 40);
  g.fillStyle = "#f47c28";
  g.fillRect(0, H - 62, W, 14);
  g.fillStyle = "#162f60";
  g.fillRect(0, H - 48, W, 6);

  if (logo) {
    g.save();
    if (mirrored) {
      g.translate(W, 0);
      g.scale(-1, 1);
    }
    // fundo claro atrás da marca, para ler bem por cima das nervuras
    const lh = 190;
    const lw = logo.aspect * lh;
    const lx = W * 0.5 - lw / 2;
    const ly = (H - 62 - lh) / 2 - 6;
    g.fillStyle = "rgba(251,252,253,0.94)";
    g.fillRect(lx - 40, ly - 22, lw + 80, lh + 44);
    g.drawImage(logo.img, lx, ly, lw, lh);
    g.restore();
  }
  return c;
}

/** Teto do baú: chapas com emendas transversais e bordas mais escuras. */
function roofCanvas() {
  const W = 2048;
  const H = 384;
  const [c, g] = canvas2d(W, H);
  g.fillStyle = "#f6f8fa";
  g.fillRect(0, 0, W, H);
  for (let x = 85; x < W; x += 170) {
    g.fillStyle = "rgba(140,152,172,0.42)";
    g.fillRect(x, 0, 3, H);
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillRect(x + 3, 0, 2, H);
  }
  const edge = g.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, "rgba(120,132,150,0.25)");
  edge.addColorStop(0.08, "rgba(120,132,150,0)");
  edge.addColorStop(0.92, "rgba(120,132,150,0)");
  edge.addColorStop(1, "rgba(120,132,150,0.25)");
  g.fillStyle = edge;
  g.fillRect(0, 0, W, H);
  return c;
}

/** Traseira: duas portas, travas verticais e faixa refletiva. */
function rearCanvas() {
  const W = 512;
  const H = 584;
  const [c, g] = canvas2d(W, H);
  g.fillStyle = "#eef1f5";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#b9c1cc";
  g.fillRect(W / 2 - 3, 10, 6, H - 60);
  for (const x of [92, 196, 312, 416]) {
    g.fillStyle = "#9aa3b0";
    g.fillRect(x - 5, 18, 10, H - 80);
  }
  for (let i = 0; i < 12; i++) {
    g.fillStyle = i % 2 ? "#ffffff" : "#e3262d";
    g.beginPath();
    const x = i * 46 - 10;
    g.moveTo(x, H - 50);
    g.lineTo(x + 46, H - 50);
    g.lineTo(x + 26, H - 14);
    g.lineTo(x - 20, H - 14);
    g.closePath();
    g.fill();
  }
  return c;
}

/** Sombra de contato: retângulo arredondado bem desfocado. */
function contactCanvas() {
  const [c, g] = canvas2d(512, 128);
  // só a sombra do retângulo (desenhado fora do quadro) entra no canvas
  g.shadowColor = "rgba(5,11,24,0.85)";
  g.shadowBlur = 28;
  g.shadowOffsetX = 2000;
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(40 - 2000, 34, 432, 60, 26);
  g.fill();
  return c;
}
