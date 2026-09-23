import * as THREE from 'three';
import {
  COLORS, toon, toonFlat, addOutline, box, cyl, at, makeTextTexture, rand, randRange,
} from './materials.js';

/* ---------------------------------------------------------------
 * 手水舍（简化净手处）：四柱小屋顶 + 石水钵 + 竹柄勺
 * -------------------------------------------------------------- */
export function buildChozuya() {
  const g = new THREE.Group();
  const matWood = toon(COLORS.wood);
  const matWoodDark = toon(COLORS.woodDark);
  const matRoof = toon(COLORS.roof);
  const matStone = toon(COLORS.stone);
  const matStoneDark = toon(COLORS.stoneDark);

  // 四柱
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const p = cyl(0.065, 0.075, 1.55, matWood, 10);
      at(p, sx * 0.62, 0.78, sz * 0.48);
      addOutline(p);
      g.add(p);
      const shoe = cyl(0.11, 0.13, 0.12, matStoneDark, 10);
      at(shoe, sx * 0.62, 0.06, sz * 0.48);
      g.add(shoe);
    }
  }
  // 横梁
  for (const sz of [-1, 1]) {
    const b = box(1.45, 0.1, 0.1, matWoodDark);
    at(b, 0, 1.5, sz * 0.48);
    addOutline(b);
    g.add(b);
  }
  // 切妻小屋面
  const half = 0.92;
  const rise = 0.52;
  const len = Math.hypot(half, rise);
  const ang = Math.atan2(rise, half);
  for (const s of [1, -1]) {
    const slope = box(1.95, 0.12, len, matRoof);
    slope.position.set(0, 1.58 + rise / 2, (s * half) / 2);
    slope.rotation.x = s * ang;
    addOutline(slope);
    g.add(slope);
  }
  const ridge = box(2.0, 0.14, 0.2, toon(COLORS.roofDark));
  at(ridge, 0, 1.58 + rise + 0.04, 0);
  addOutline(ridge);
  g.add(ridge);

  // 石水钵
  const basinBase = box(1.15, 0.14, 0.85, matStoneDark);
  at(basinBase, 0, 0.07, 0);
  addOutline(basinBase);
  g.add(basinBase);
  const basin = box(0.92, 0.34, 0.66, matStone);
  at(basin, 0, 0.31, 0);
  addOutline(basin, true);
  g.add(basin);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.56), toon(COLORS.water));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.475, 0);
  g.add(water);

  // 竹柄勺
  for (const s of [1, -1]) {
    const ladle = cyl(0.028, 0.028, 0.42, matWoodDark, 8);
    ladle.rotation.z = Math.PI / 2;
    ladle.rotation.y = s * 0.25;
    at(ladle, s * 0.08, 0.53, 0.2);
    g.add(ladle);
    const cup = cyl(0.07, 0.06, 0.07, toon(COLORS.woodLight), 10);
    at(cup, s * 0.22, 0.54, 0.24);
    g.add(cup);
  }

  // 小告示（手水舍）
  const sign = box(0.52, 0.34, 0.05, toon(COLORS.paper));
  at(sign, 0, 1.28, 0.5);
  addOutline(sign);
  g.add(sign);
  const signText = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.28),
    new THREE.MeshBasicMaterial({ map: makeTextTexture('手水舎', { w: 256, h: 156, bg: '#f7f2e7', fg: '#2a2a33', font: 'bold 54px "Yu Mincho", "Microsoft YaHei", serif' }) }),
  );
  signText.position.set(0, 1.28, 0.527);
  g.add(signText);

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial && !o.material.isMeshBasicMaterial) {
      o.castShadow = true; o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 社务所 / 仓库：石基 + 白壁木框 + 深色小屋面
 * -------------------------------------------------------------- */
export function buildStorehouse() {
  const g = new THREE.Group();
  const matStone = toon(COLORS.stone);
  const matWhite = toon(COLORS.white);
  const matWood = toon(COLORS.wood);
  const matWoodDark = toon(COLORS.woodDark);
  const matRoof = toon(COLORS.roof);

  const W = 2.1;
  const D = 1.7;
  const baseH = 0.16;
  const bodyH = 1.25;

  const base = box(W + 0.14, baseH, D + 0.14, matStone);
  at(base, 0, baseH / 2, 0);
  addOutline(base);
  g.add(base);

  const body = box(W, bodyH, D, matWhite);
  at(body, 0, baseH + bodyH / 2, 0);
  addOutline(body, true);
  g.add(body);

  // 木构框架
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const post = box(0.11, bodyH, 0.11, matWood);
      at(post, sx * (W / 2 - 0.03), baseH + bodyH / 2, sz * (D / 2 - 0.03));
      g.add(post);
    }
  }
  for (const y of [baseH + 0.06, baseH + bodyH - 0.06]) {
    const bandZ = box(W + 0.04, 0.1, 0.09, matWood);
    at(bandZ, 0, y, D / 2 - 0.02);
    g.add(bandZ);
    const bandZ2 = box(W + 0.04, 0.1, 0.09, matWood);
    at(bandZ2, 0, y, -(D / 2 - 0.02));
    g.add(bandZ2);
  }
  // 拉门
  const door = box(0.78, 1.0, 0.07, matWoodDark);
  at(door, -0.28, baseH + 0.5, D / 2 + 0.02);
  addOutline(door);
  g.add(door);
  for (let i = 0; i < 3; i++) {
    const slit = box(0.02, 0.92, 0.02, toon(COLORS.woodLight));
    at(slit, -0.28 + (i - 1) * 0.2, baseH + 0.5, D / 2 + 0.06);
    g.add(slit);
  }
  // 小窗（障子）
  const win = box(0.44, 0.42, 0.06, toon(COLORS.paper));
  at(win, 0.6, baseH + 0.78, D / 2 + 0.02);
  addOutline(win);
  g.add(win);
  for (let i = 0; i < 3; i++) {
    const bar = box(0.44, 0.02, 0.02, matWoodDark);
    at(bar, 0.6, baseH + 0.78 + (i - 1) * 0.12, D / 2 + 0.055);
    g.add(bar);
  }

  // 屋顶
  const half = D / 2 + 0.45;
  const rise = 0.62;
  const len = Math.hypot(half, rise);
  const ang = Math.atan2(rise, half);
  const roofY = baseH + bodyH;
  for (const s of [1, -1]) {
    const slope = box(W + 0.75, 0.14, len, matRoof);
    slope.position.set(0, roofY + rise / 2, (s * half) / 2);
    slope.rotation.x = s * ang;
    addOutline(slope);
    g.add(slope);
  }
  const ridge = box(W + 0.8, 0.16, 0.24, toon(COLORS.roofDark));
  at(ridge, 0, roofY + rise + 0.05, 0);
  addOutline(ridge);
  g.add(ridge);

  // 侧面的木桶
  const barrel = cyl(0.17, 0.19, 0.42, matWood, 12);
  at(barrel, W / 2 + 0.32, 0.21, 0.35);
  addOutline(barrel);
  g.add(barrel);
  for (const y of [0.11, 0.31]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.018, 6, 14), matWoodDark);
    hoop.rotation.x = Math.PI / 2;
    at(hoop, W / 2 + 0.32, y, 0.35);
    g.add(hoop);
  }

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial && !o.material.isMeshBasicMaterial) {
      o.castShadow = true; o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 小型告示牌
 * -------------------------------------------------------------- */
export function buildSignboard() {
  const g = new THREE.Group();
  const matWood = toon(COLORS.woodDark);
  const matPost = toon(COLORS.wood);

  for (const s of [1, -1]) {
    const p = box(0.1, 1.05, 0.1, matPost);
    at(p, s * 0.46, 0.52, 0);
    addOutline(p);
    g.add(p);
  }
  const top = box(1.28, 0.09, 0.2, matWood);
  at(top, 0, 1.08, 0);
  addOutline(top);
  g.add(top);

  const board = box(1.12, 0.66, 0.07, toon(COLORS.paper));
  at(board, 0, 0.72, 0);
  addOutline(board);
  g.add(board);

  const text = new THREE.Mesh(
    new THREE.PlaneGeometry(1.02, 0.56),
    new THREE.MeshBasicMaterial({ map: makeTextTexture('参拝の心得', { w: 384, h: 210, bg: '#f7f2e7', fg: '#2a2a33', font: 'bold 62px "Yu Mincho", "Microsoft YaHei", serif' }) }),
  );
  text.position.set(0, 0.72, 0.038);
  g.add(text);

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial && !o.material.isMeshBasicMaterial) {
      o.castShadow = true; o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 绘马架：木框 + 悬挂的五角形绘马
 * -------------------------------------------------------------- */
export function buildEmaRack() {
  const g = new THREE.Group();
  const matWood = toon(COLORS.wood);
  const matWoodDark = toon(COLORS.woodDark);
  const matRoof = toon(COLORS.roofDark);

  // 框架
  for (const sx of [-1, 1]) {
    const p = box(0.1, 1.35, 0.1, matWood);
    at(p, sx * 0.66, 0.68, 0);
    addOutline(p);
    g.add(p);
  }
  const topBar = box(1.42, 0.12, 0.14, matWoodDark);
  at(topBar, 0, 1.3, 0);
  addOutline(topBar);
  g.add(topBar);
  const railA = box(1.36, 0.05, 0.05, matWoodDark);
  at(railA, 0, 1.02, 0);
  g.add(railA);
  const railB = box(1.36, 0.05, 0.05, matWoodDark);
  at(railB, 0, 0.58, 0);
  g.add(railB);
  // 小雨庇
  const cap = box(1.55, 0.08, 0.36, matRoof);
  at(cap, 0, 1.42, 0.04);
  cap.rotation.x = -0.16;
  addOutline(cap);
  g.add(cap);

  // 五角形绘马
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.17);
  shape.lineTo(0.115, 0.05);
  shape.lineTo(0.1, -0.15);
  shape.lineTo(-0.1, -0.15);
  shape.lineTo(-0.115, 0.05);
  shape.lineTo(0, 0.17);
  const emaGeo = new THREE.ShapeGeometry(shape);
  const emaMat = toon(COLORS.woodLight, { side: THREE.DoubleSide });
  const knotMat = toon(COLORS.red);

  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 4; i++) {
      const x = -0.48 + i * 0.32;
      const y = row === 0 ? 0.92 : 0.5;
      const ema = new THREE.Mesh(emaGeo, emaMat);
      ema.position.set(x, y, 0.05);
      ema.rotation.z = randRange(-0.14, 0.14);
      ema.castShadow = true;
      g.add(ema);
      // 悬挂细绳
      const str = cyl(0.008, 0.008, 0.16, matWoodDark, 5);
      at(str, x, y + 0.2, 0.05);
      g.add(str);
      // 朱印
      const stamp = box(0.04, 0.04, 0.01, knotMat);
      at(stamp, x + 0.05, y - 0.04, 0.062);
      g.add(stamp);
    }
  }

  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 御神签架：木框 + 一排排签纸
 * -------------------------------------------------------------- */
export function buildOmikujiRack() {
  const g = new THREE.Group();
  const matWood = toon(COLORS.wood);
  const matWoodDark = toon(COLORS.woodDark);
  const matRoof = toon(COLORS.roofDark);
  const matPaper = toon(COLORS.paper, { side: THREE.DoubleSide });

  for (const sx of [-1, 1]) {
    const p = box(0.1, 1.3, 0.1, matWood);
    at(p, sx * 0.6, 0.65, 0);
    addOutline(p);
    g.add(p);
  }
  const topBar = box(1.3, 0.12, 0.13, matWoodDark);
  at(topBar, 0, 1.26, 0);
  addOutline(topBar);
  g.add(topBar);
  const cap = box(1.42, 0.07, 0.34, matRoof);
  at(cap, 0, 1.37, 0.03);
  cap.rotation.x = -0.14;
  g.add(cap);

  for (let row = 0; row < 3; row++) {
    const y = 1.0 - row * 0.32;
    const rail = box(1.22, 0.05, 0.05, matWoodDark);
    at(rail, 0, y, 0);
    g.add(rail);
    for (let i = 0; i < 11; i++) {
      const x = -0.52 + i * 0.104;
      const strip = box(0.055, 0.26, 0.012, matPaper);
      at(strip, x, y - 0.16, 0.035);
      strip.rotation.z = randRange(-0.22, 0.22);
      strip.rotation.x = randRange(-0.12, 0.12);
      g.add(strip);
      const knot = box(0.05, 0.04, 0.03, toon(COLORS.redDark));
      at(knot, x, y - 0.02, 0.03);
      g.add(knot);
    }
  }
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 扫帚与水桶（清扫工具）
 * -------------------------------------------------------------- */
export function buildBroom() {
  const g = new THREE.Group();
  const matHandle = toon(COLORS.woodLight);
  const matStraw = toon(0xd9b877);
  const matBand = toon(COLORS.ropeDark);

  const handle = cyl(0.028, 0.032, 1.5, matHandle, 8);
  at(handle, 0, 0.82, 0);
  addOutline(handle);
  g.add(handle);

  const head = cyl(0.06, 0.16, 0.42, matStraw, 10);
  at(head, 0, 0.2, 0);
  addOutline(head);
  g.add(head);

  // 捆扎
  for (const y of [0.34, 0.24]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 12), matBand);
    band.rotation.x = Math.PI / 2;
    at(band, 0, y, 0);
    g.add(band);
  }
  // 稻草末端
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const s = cyl(0.02, 0.008, 0.22, matStraw, 5);
    s.position.set(Math.cos(a) * 0.11, 0.05, Math.sin(a) * 0.11);
    s.rotation.z = Math.cos(a) * 0.3;
    s.rotation.x = -Math.sin(a) * 0.3;
    g.add(s);
  }
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

export function buildBucket() {
  const g = new THREE.Group();
  const matWood = toon(COLORS.wood);
  const matDark = toon(COLORS.woodDark);
  const body = cyl(0.16, 0.13, 0.3, matWood, 12);
  at(body, 0, 0.15, 0);
  addOutline(body);
  g.add(body);
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.158, 0.014, 6, 14), matDark);
  hoop.rotation.x = Math.PI / 2;
  at(hoop, 0, 0.27, 0);
  g.add(hoop);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 6, 14, Math.PI), matDark);
  at(handle, 0, 0.3, 0);
  handle.rotation.y = Math.PI / 2;
  g.add(handle);
  g.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
  });
  return g;
}

/* ---------------------------------------------------------------
 * 院落附属设施总装
 * -------------------------------------------------------------- */
export function buildFacilities() {
  const g = new THREE.Group();
  g.name = 'facilities';

  // 手水舍（右侧前方，面向参道）
  const chozuya = buildChozuya();
  chozuya.position.set(3.45, 0, 2.4);
  chozuya.rotation.y = -0.5;
  chozuya.scale.setScalar(0.92);
  g.add(chozuya);

  // 社务所 / 仓库（左后方）
  const store = buildStorehouse();
  store.position.set(-3.25, 0, -2.35);
  store.rotation.y = 0.26;
  store.scale.setScalar(0.95);
  g.add(store);

  // 告示牌（参道右侧）
  const sign = buildSignboard();
  sign.position.set(1.95, 0, 2.25);
  sign.rotation.y = -0.42;
  g.add(sign);

  // 绘马架（本殿右侧）
  const ema = buildEmaRack();
  ema.position.set(3.45, 0, -1.85);
  ema.rotation.y = -1.15;
  g.add(ema);

  // 御神签架（本殿左侧）
  const omikuji = buildOmikujiRack();
  omikuji.position.set(-3.5, 0, -0.45);
  omikuji.rotation.y = 0.18;
  g.add(omikuji);

  // 扫帚（靠在社务所侧壁）
  const broom = buildBroom();
  broom.position.set(-2.32, 0, -1.32);
  broom.rotation.z = 0.34;
  broom.rotation.y = 0.9;
  g.add(broom);

  // 水桶
  const bucket = buildBucket();
  bucket.position.set(-2.15, 0, -2.62);
  g.add(bucket);

  const bucket2 = buildBucket();
  bucket2.position.set(3.95, 0, 2.35);
  g.add(bucket2);

  return g;
}
