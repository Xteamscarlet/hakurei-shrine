import * as THREE from 'three';

/* ---------------------------------------------------------------
 * 配色：日式动画风格的柔和色板（红白神社 + 灰瓦 + 浅木 + 淡石）
 * -------------------------------------------------------------- */
export const COLORS = {
  stone: 0xd3cdc1,
  stoneDark: 0xb8b2a6,
  stoneLight: 0xe6e1d6,
  gravel: 0xdcd5c5,
  path: 0xc4bdaf,
  pathDark: 0xaba498,
  dirt: 0xcbbea4,
  grass: 0x8dbc6d,
  grassDark: 0x6fa356,
  red: 0xd8513f,
  redDark: 0xb03c2e,
  white: 0xf7f2e7,
  roof: 0x3c4050,
  roofDark: 0x2a2d3a,
  wood: 0xc08c5a,
  woodDark: 0x8a5f38,
  woodLight: 0xdcb98a,
  gold: 0xe8bb45,
  rope: 0xd8caa4,
  ropeDark: 0xb5a67c,
  paper: 0xfbf8f0,
  leaf: 0x7fae5f,
  leafDark: 0x5d9048,
  pink: 0xf7c0cd,
  pinkDark: 0xe6a2b6,
  pine: 0x4e8050,
  water: 0x93c9dc,
  black: 0x2a2a33,
};

/* ---------------------------------------------------------------
 * 三渲二核心：把连续光照量化成 4 档，形成赛璐璐分层明暗
 * -------------------------------------------------------------- */
export function makeGradientMap(steps = 4) {
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) data[i] = Math.round((i / (steps - 1)) * 255);
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

export const GRADIENT = makeGradientMap(4);

/** 卡通材质 */
export function toon(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: GRADIENT, ...opts });
}

/** 卡通材质（平面着色，用于岩石 / 树冠，轮廓更硬朗） */
export function toonFlat(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: GRADIENT, flatShading: true, ...opts });
}

/* ---------------------------------------------------------------
 * 描边：反向外壳法（BackSide + 沿法线外扩），营造动画线稿感
 * -------------------------------------------------------------- */
function makeOutlineMaterial(thickness, color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: thickness },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: /* glsl */ `
      uniform float uThickness;
      void main() {
        vec3 n = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        mv.xyz += n * uThickness;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() { gl_FragColor = vec4(uColor, 1.0); }`,
    side: THREE.BackSide,
  });
}

export const OUTLINE_THIN = makeOutlineMaterial(0.013, 0x2a2a33);
export const OUTLINE_THICK = makeOutlineMaterial(0.024, 0x26262e);

/** 给网格加一层外壳描边（描边作为子节点，随父级变换） */
export function addOutline(mesh, thick = false) {
  const o = new THREE.Mesh(mesh.geometry, thick ? OUTLINE_THICK : OUTLINE_THIN);
  o.castShadow = false;
  o.receiveShadow = false;
  o.frustumCulled = false;
  mesh.add(o);
  return mesh;
}

/* ---------------------------------------------------------------
 * 便捷构造器
 * -------------------------------------------------------------- */
export function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

export function cyl(rt, rb, h, mat, seg = 14) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
}

export function at(mesh, x, y, z) {
  mesh.position.set(x, y, z);
  return mesh;
}

/** 递归开启投影（描边外壳不投影，避免变粗） */
export function enableShadows(obj) {
  obj.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return obj;
}

/** 圆角矩形轮廓（用于底座） */
export function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** 程序化噪点贴图（碎石 / 砂土表面） */
export function makeNoiseTexture(base = '#dcd5c5', dot = '#c8c0ae', count = 1400, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = dot;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.4 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 文字贴图（匾额 / 告示牌 / 绘马架等） */
export function makeTextTexture(text, opts = {}) {
  const {
    w = 320,
    h = 128,
    bg = '#f7f2e7',
    fg = '#2a2a33',
    font = 'bold 62px "Microsoft YaHei", "Yu Gothic", sans-serif',
    border = null,
  } = opts;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, w - 10, h - 10);
  }
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 简易伪随机（保证每次加载布局一致） */
let seed = 20260923;
export function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
export function randRange(a, b) {
  return a + rand() * (b - a);
}
export function resetSeed(s = 20260923) {
  seed = s;
}
