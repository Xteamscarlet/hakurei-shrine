import * as THREE from 'three';
import {
  COLORS, toon, toonFlat, addOutline, box, cyl, at, roundedRectShape, rand, randRange,
} from './materials.js';

/* ---------------------------------------------------------------
 * 鸟居（朱红）：岛木 + 笠木（两端起翘）+ 贯 + 额束 + 黑石础
 * -------------------------------------------------------------- */
export function buildTorii() {
  const g = new THREE.Group();
  const matRed = toon(COLORS.red);
  const matRedDark = toon(COLORS.redDark);
  const matStone = toon(COLORS.stoneDark);

  const pillarH = 2.65;
  const span = 3.0;
  for (const s of [1, -1]) {
    const p = cyl(0.14, 0.18, pillarH, matRed, 14);
    at(p, (s * span) / 2, pillarH / 2, 0);
    addOutline(p);
    g.add(p);
    const shoe = cyl(0.25, 0.29, 0.2, matStone, 16);
    at(shoe, (s * span) / 2, 0.1, 0);
    addOutline(shoe);
    g.add(shoe);
  }

  // 贯（下横梁）
  const nuki = box(span + 0.5, 0.26, 0.26, matRed);
  at(nuki, 0, 2.14, 0);
  addOutline(nuki);
  g.add(nuki);
  // 楔木
  for (const s of [1, -1]) {
    const wedge = box(0.16, 0.36, 0.36, matRedDark);
    at(wedge, s * (span / 2 + 0.12), 2.14, 0);
    g.add(wedge);
  }

  // 岛木（上横梁）
  const shimaki = box(span + 1.0, 0.24, 0.4, matRedDark);
  at(shimaki, 0, 2.72, 0);
  addOutline(shimaki);
  g.add(shimaki);

  // 笠木：中间平直 + 两端起翘
  const kasagiMid = box(span + 0.1, 0.2, 0.46, matRed);
  at(kasagiMid, 0, 2.92, 0);
  addOutline(kasagiMid);
  g.add(kasagiMid);
  for (const s of [1, -1]) {
    const tip = box(0.66, 0.19, 0.44, matRed);
    tip.position.set(s * (span / 2 + 0.33), 3.01, 0);
    tip.rotation.z = -s * 0.14;
    addOutline(tip);
    g.add(tip);
  }

  // 额束 + 匾额
  const gaku = box(0.34, 0.56, 0.24, matRed);
  at(gaku, 0, 2.44, 0);
  addOutline(gaku);
  g.add(gaku);
  const board = box(0.62, 0.4, 0.06, toon(COLORS.paper));
  at(board, 0, 2.44, 0.15);
  addOutline(board);
  g.add(board);

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 石灯笼（春日型）
 * -------------------------------------------------------------- */
export function buildStoneLantern() {
  const g = new THREE.Group();
  const matStone = toon(COLORS.stoneDark);
  const matStoneLight = toon(COLORS.stoneLight);
  const matLight = new THREE.MeshBasicMaterial({ color: 0xf6e2b0 });

  const base = box(0.5, 0.12, 0.5, matStone);
  at(base, 0, 0.06, 0);
  addOutline(base);
  g.add(base);

  const ped = box(0.34, 0.14, 0.34, matStoneLight);
  at(ped, 0, 0.19, 0);
  g.add(ped);

  const shaft = cyl(0.11, 0.13, 0.6, matStone, 12);
  at(shaft, 0, 0.56, 0);
  addOutline(shaft);
  g.add(shaft);

  const mid = box(0.46, 0.12, 0.46, matStoneLight);
  at(mid, 0, 0.92, 0);
  addOutline(mid);
  g.add(mid);

  // 火袋（四面开窗）
  const firebox = box(0.36, 0.36, 0.36, matStone);
  at(firebox, 0, 1.16, 0);
  addOutline(firebox);
  g.add(firebox);
  for (const [dx, dz] of [[0, 0.19], [0, -0.19], [0.19, 0], [-0.19, 0]]) {
    const w = box(dx === 0 ? 0.2 : 0.02, 0.2, dz === 0 ? 0.2 : 0.02, matLight);
    at(w, dx, 1.16, dz);
    g.add(w);
  }

  // 笠（四角攒尖顶）
  const capG = new THREE.ConeGeometry(0.42, 0.26, 4);
  const cap = new THREE.Mesh(capG, matStoneLight);
  cap.position.set(0, 1.47, 0);
  cap.rotation.y = Math.PI / 4;
  addOutline(cap);
  g.add(cap);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), matStoneLight);
  at(ball, 0, 1.65, 0);
  addOutline(ball);
  g.add(ball);

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial && !o.material.isMeshBasicMaterial) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 树木：樱花 / 松树 / 阔叶树
 * -------------------------------------------------------------- */
function blob(r, mat, detail = 1) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), mat);
  m.scale.set(randRange(0.9, 1.12), randRange(0.82, 1.0), randRange(0.9, 1.12));
  addOutline(m);
  return m;
}

export function buildSakura(scale = 1) {
  const g = new THREE.Group();
  const matBark = toon(COLORS.woodDark);
  const matPink = toon(COLORS.pink);
  const matPinkDark = toon(COLORS.pinkDark);

  const trunk = cyl(0.13 * scale, 0.24 * scale, 1.7 * scale, matBark, 10);
  at(trunk, 0, 0.85 * scale, 0);
  addOutline(trunk);
  g.add(trunk);

  for (let i = 0; i < 3; i++) {
    const br = cyl(0.05 * scale, 0.1 * scale, 0.8 * scale, matBark, 8);
    const a = (i / 3) * Math.PI * 2 + 0.4;
    br.position.set(Math.cos(a) * 0.28 * scale, 1.65 * scale, Math.sin(a) * 0.28 * scale);
    br.rotation.z = Math.cos(a) * 0.6;
    br.rotation.x = -Math.sin(a) * 0.6;
    addOutline(br);
    g.add(br);
  }

  const crown = [
    [0, 2.35, 0, 0.85], [-0.75, 2.1, 0.2, 0.66], [0.7, 2.15, 0.3, 0.62],
    [0.1, 2.05, -0.7, 0.6], [-0.45, 2.65, -0.35, 0.52], [0.55, 2.7, -0.2, 0.48],
  ];
  crown.forEach(([x, y, z, r], i) => {
    const b = blob(r * scale, i % 2 ? matPink : matPinkDark);
    b.position.set(x * scale, y * scale, z * scale);
    g.add(b);
  });

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

export function buildPine(scale = 1) {
  const g = new THREE.Group();
  const matBark = toon(COLORS.woodDark);
  const matPine = toon(COLORS.pine);

  const trunk = cyl(0.12 * scale, 0.2 * scale, 1.9 * scale, matBark, 10);
  at(trunk, 0, 0.95 * scale, 0);
  addOutline(trunk);
  g.add(trunk);

  const tiers = [
    [0.95, 0.85], [1.4, 0.68], [1.78, 0.48],
  ];
  tiers.forEach(([y, r]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r * scale, 0.62 * scale, 9), matPine);
    c.position.set(randRange(-0.05, 0.05), y * scale, randRange(-0.05, 0.05));
    addOutline(c);
    g.add(c);
  });
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

export function buildBroadleaf(scale = 1) {
  const g = new THREE.Group();
  const matBark = toon(COLORS.woodDark);
  const matA = toon(COLORS.leaf);
  const matB = toon(COLORS.leafDark);

  const trunk = cyl(0.11 * scale, 0.2 * scale, 1.5 * scale, matBark, 10);
  at(trunk, 0, 0.75 * scale, 0);
  addOutline(trunk);
  g.add(trunk);

  const crown = [
    [0, 1.95, 0, 0.78], [-0.62, 1.75, 0.15, 0.55], [0.6, 1.8, -0.15, 0.52],
    [0.05, 2.3, 0.35, 0.5], [-0.25, 1.7, -0.6, 0.46],
  ];
  crown.forEach(([x, y, z, r], i) => {
    const b = blob(r * scale, i % 2 ? matA : matB);
    b.position.set(x * scale, y * scale, z * scale);
    g.add(b);
  });
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 灌木丛
 * -------------------------------------------------------------- */
export function buildBush(count = 5, radius = 0.55) {
  const g = new THREE.Group();
  const matA = toon(COLORS.leaf);
  const matB = toon(COLORS.leafDark);
  for (let i = 0; i < count; i++) {
    const r = radius * randRange(0.6, 1.0);
    const b = blob(r, i % 2 ? matA : matB);
    b.position.set(randRange(-radius, radius), r * 0.62, randRange(-radius, radius));
    b.scale.y *= 0.75;
    g.add(b);
  }
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 岩石（低多边形，顶点轻微抖动）
 * -------------------------------------------------------------- */
export function buildRock(size = 0.4) {
  const geo = new THREE.IcosahedronGeometry(size, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * randRange(0.75, 1.2),
      pos.getY(i) * randRange(0.6, 1.05),
      pos.getZ(i) * randRange(0.75, 1.2),
    );
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, toonFlat(COLORS.stoneDark));
  addOutline(m);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* ---------------------------------------------------------------
 * 玉垣围栏：一段直线栏杆（朱红柱 + 两道横贯）
 * -------------------------------------------------------------- */
function fenceRun(x1, z1, x2, z2, h = 0.78) {
  const g = new THREE.Group();
  const matRed = toon(COLORS.red);
  const matDark = toon(COLORS.redDark);
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  const n = Math.max(2, Math.round(len / 0.92) + 1);

  for (let i = 0; i < n; i++) {
    const p = box(0.12, h, 0.12, matRed);
    p.position.set(0, h / 2, (len / (n - 1)) * i);
    addOutline(p);
    g.add(p);
    const base = box(0.2, 0.08, 0.2, toon(COLORS.stoneDark));
    base.position.set(0, 0.04, (len / (n - 1)) * i);
    g.add(base);
  }
  for (const y of [h - 0.12, h - 0.42]) {
    const rail = box(0.08, 0.11, len, matDark);
    rail.position.set(0, y, len / 2);
    addOutline(rail);
    g.add(rail);
  }
  g.position.set(x1, 0, z1);
  g.rotation.y = Math.atan2(dx, dz);
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 场景植被 / 构筑物总装（鸟居、石灯笼、树木、灌木、岩石、围栏）
 * -------------------------------------------------------------- */
export function buildScenery() {
  const g = new THREE.Group();
  g.name = 'scenery';

  // 鸟居（立在参道入口）
  const torii = buildTorii();
  torii.position.set(0, 0, 3.35);
  g.add(torii);

  // 参道两侧石灯笼
  [[-2.15, 1.25], [2.15, 1.25], [-2.2, 4.02], [2.2, 4.02]].forEach(([x, z]) => {
    const l = buildStoneLantern();
    l.position.set(x, 0, z);
    l.scale.setScalar(0.9);
    g.add(l);
  });

  // 树（后景高、前景低，形成前低后高的层次）
  const sakuraA = buildSakura(0.92);
  sakuraA.position.set(-3.9, 0, -3.5);
  g.add(sakuraA);

  const sakuraB = buildSakura(0.68);
  sakuraB.position.set(4.0, 0, -3.65);
  sakuraB.rotation.y = 0.7;
  g.add(sakuraB);

  const pineA = buildPine(0.82);
  pineA.position.set(4.2, 0, 0.85);
  g.add(pineA);

  const pineB = buildPine(0.72);
  pineB.position.set(-4.18, 0, 1.05);
  g.add(pineB);

  const leafA = buildBroadleaf(0.76);
  leafA.position.set(-4.0, 0, 3.75);
  g.add(leafA);

  const leafB = buildBroadleaf(0.6);
  leafB.position.set(4.05, 0, 4.1);
  leafB.rotation.y = -0.5;
  g.add(leafB);

  // 灌木
  const bushSpots = [
    [-3.35, -2.55, 0.42], [3.35, -2.45, 0.4], [-2.6, 1.6, 0.38], [2.7, 1.7, 0.4],
    [-1.6, 3.95, 0.32], [1.7, 3.95, 0.3], [4.25, 2.15, 0.44], [-4.3, -0.5, 0.42],
    [2.05, -0.5, 0.28], [-2.15, -0.45, 0.28],
    [2.7, 3.1, 0.34], [3.2, 4.25, 0.36], [-2.8, 2.85, 0.32], [4.3, 3.55, 0.3],
    [-4.25, 2.65, 0.34], [-4.15, 4.3, 0.3], [3.9, 0.05, 0.32], [-3.85, -3.9, 0.34],
  ];
  bushSpots.forEach(([x, z, r]) => {
    const b = buildBush(5, r);
    b.position.set(x, 0, z);
    g.add(b);
  });

  // 岩石
  const rockSpots = [
    [-1.9, 2.0, 0.3], [2.0, 2.1, 0.26], [-3.0, 0.2, 0.36], [3.1, 0.1, 0.3],
    [-2.9, 4.35, 0.26], [2.9, 4.4, 0.24], [4.2, -1.6, 0.3], [-4.2, -2.2, 0.32],
    [1.5, -0.3, 0.2], [-1.55, -0.32, 0.2],
    [3.6, 2.8, 0.22], [-3.6, 2.3, 0.24], [1.35, 0.75, 0.18], [-1.4, 0.7, 0.18],
  ];
  rockSpots.forEach(([x, z, s]) => {
    const r = buildRock(s);
    r.position.set(x, s * 0.55, z);
    r.rotation.set(randRange(-0.4, 0.4), rand() * Math.PI, randRange(-0.4, 0.4));
    g.add(r);
  });

  // 玉垣围栏（正面留出参道开口）
  g.add(fenceRun(-4.42, 4.42, -1.15, 4.42));
  g.add(fenceRun(1.15, 4.42, 4.42, 4.42));
  g.add(fenceRun(-4.42, 4.42, -4.42, -4.42));
  g.add(fenceRun(4.42, 4.42, 4.42, -4.42));
  g.add(fenceRun(-4.42, -4.42, 4.42, -4.42));

  // 庭院左前方的枯山水小景（白砂 + 三石）
  const sand = new THREE.Mesh(new THREE.CircleGeometry(1.05, 20), toon(0xe6e0cd));
  sand.rotation.x = -Math.PI / 2;
  sand.scale.set(1.25, 1, 0.95);
  sand.rotation.z = 0.3;
  sand.position.set(-2.85, 0.02, 2.7);
  sand.receiveShadow = true;
  g.add(sand);
  [[-2.45, 2.95, 0.26], [-3.15, 2.5, 0.34], [-2.8, 2.2, 0.2]].forEach(([x, z, s]) => {
    const r = buildRock(s);
    r.position.set(x, s * 0.62, z);
    r.rotation.set(0.1, rand() * Math.PI, -0.05);
    g.add(r);
  });

  // 参道入口的一对石柱
  for (const s of [1, -1]) {
    const p = box(0.16, 0.78, 0.16, toon(COLORS.stoneLight));
    p.position.set(s * 1.05, 0.39, 4.42);
    addOutline(p);
    p.castShadow = true;
    p.receiveShadow = true;
    g.add(p);
    const cap = box(0.22, 0.09, 0.22, toon(COLORS.stone));
    cap.position.set(s * 1.05, 0.82, 4.42);
    addOutline(cap);
    cap.castShadow = true;
    g.add(cap);
  }

  return g;
}
