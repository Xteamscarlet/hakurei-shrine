import * as THREE from 'three';
import {
  COLORS, toon, at, box, roundedRectShape, makeNoiseTexture, rand, randRange,
} from './materials.js';

const W = 10; // 底座边长

/** 生成一层圆角板块（石砌 / 木夹层 / 压顶石），返回网格 */
function slab(w, h, r, mat, y, bevel = 0.035) {
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, w, r), {
    depth: h - bevel * 2,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y + bevel;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/**
 * 构建完整正方形底座：
 * 下三层石砌（有砌缝和轻微收分）→ 木制夹层 → 上压顶石 → 地面（碎石庭院 + 植被 + 石板参道）
 * 返回 { group, groundY }，groundY 为地面标高，上层建筑全部以此为 0 基准。
 */
export function buildBase() {
  const g = new THREE.Group();
  g.name = 'base';

  /* ---------- 1. 石砌侧面：三层错缝石砌 ---------- */
  const stoneA = toon(COLORS.stoneDark);
  const stoneB = toon(COLORS.stone);
  const courses = [
    { w: W, r: 0.42, h: 0.22, y: 0.00, mat: stoneA },
    { w: W - 0.07, r: 0.39, h: 0.22, y: 0.22, mat: stoneB },
    { w: W - 0.14, r: 0.36, h: 0.20, y: 0.44, mat: stoneA },
  ];
  courses.forEach((c) => g.add(slab(c.w, c.h, c.r, c.mat, c.y, 0.028)));

  /* ---------- 2. 木制夹层（内收，形成腰线阴影） ---------- */
  const woodMat = toon(COLORS.wood);
  g.add(slab(W - 0.3, 0.18, 0.3, woodMat, 0.62, 0.03));
  // 夹层上的细木条装饰
  const trimMat = toon(COLORS.woodDark);
  g.add(at(box(W - 0.34, 0.035, 0.035, trimMat), 0, 0.72, (W - 0.34) / 2 - 0.16));
  g.add(at(box(W - 0.34, 0.035, 0.035, trimMat), 0, 0.72, -((W - 0.34) / 2 - 0.16)));
  g.add(at(box(0.035, 0.035, W - 0.34, trimMat), (W - 0.34) / 2 - 0.16, 0.72, 0));
  g.add(at(box(0.035, 0.035, W - 0.34, trimMat), -((W - 0.34) / 2 - 0.16), 0.72, 0));

  /* ---------- 3. 上压顶石（微微外挑，形成檐口感） ---------- */
  const capMat = toon(COLORS.stoneLight);
  const cap = slab(W + 0.12, 0.20, 0.42, capMat, 0.78, 0.032);
  g.add(cap);
  const groundY = 0.78 + 0.20;

  /* ---------- 4. 地面：碎石庭院 ---------- */
  const gravelMat = toon(COLORS.gravel, { map: makeNoiseTexture('#dcd5c5', '#c7bfad', 1800, 128) });
  const groundGeo = new THREE.ShapeGeometry(roundedRectShape(W - 0.06, W - 0.06, 0.4), 12);
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, gravelMat);
  ground.position.y = groundY + 0.005;
  ground.receiveShadow = true;
  g.add(ground);

  // 庭院铺装（神社前方偏暖的砂土地）
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(2.9, 24), toon(COLORS.dirt));
  dirt.rotation.x = -Math.PI / 2;
  dirt.scale.set(0.92, 1, 1.12);
  dirt.position.set(0, groundY + 0.008, -1.2);
  dirt.receiveShadow = true;
  g.add(dirt);

  /* ---------- 5. 草地斑块（四角与边缘，营造院落绿化） ---------- */
  const grassMat = toon(COLORS.grass);
  const grassDark = toon(COLORS.grassDark);
  const patches = [
    [-3.5, -3.3, 1.55, 0.0], [3.4, -2.9, 1.35, 0.6], [-3.9, 1.5, 1.25, -0.4],
    [4.0, 2.9, 1.5, 0.3], [-3.1, 3.7, 1.15, 0.9], [2.7, 3.9, 1.0, -0.5],
    [4.1, 0.2, 1.05, 1.2],
  ];
  patches.forEach(([x, z, r, rot], i) => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(r, 14), i % 3 === 0 ? grassDark : grassMat);
    p.rotation.x = -Math.PI / 2;
    p.rotation.z = rot;
    p.scale.set(1, 1, randRange(0.7, 1.05));
    p.position.set(x, groundY + 0.012, z);
    p.receiveShadow = true;
    g.add(p);
  });

  /* ---------- 6. 石板参道：从底座前缘直抵神社石阶 ---------- */
  const pathTop = groundY + 0.02;
  const slabMats = [toon(COLORS.path), toon(0xcac3b4), toon(0xc0b9ab)];
  for (let i = 0; i < 6; i++) {
    const z = 4.15 - i * 0.98;
    for (const sx of [-1, 1]) {
      const s = box(0.56, 0.07, 0.86, slabMats[(i + (sx > 0 ? 1 : 0)) % 3]);
      at(s, sx * 0.3 + randRange(-0.015, 0.015), pathTop, z);
      s.rotation.y = randRange(-0.018, 0.018);
      s.castShadow = false;
      s.receiveShadow = true;
      g.add(s);
    }
  }
  // 参道两侧的路缘石
  const curbMat = toon(COLORS.pathDark);
  for (let i = 0; i < 10; i++) {
    const z = 4.4 - i * 0.72;
    for (const sx of [-1, 1]) {
      const c = box(0.2, 0.05, 0.42, curbMat);
      at(c, sx * 0.72 + randRange(-0.02, 0.02), pathTop, z);
      c.rotation.y = randRange(-0.05, 0.05);
      c.receiveShadow = true;
      g.add(c);
    }
  }

  /* ---------- 7. 边缘小路：沿左侧通向社务所 ---------- */
  for (let i = 0; i < 7; i++) {
    const s = box(0.56, 0.05, 0.46, slabMats[i % 3]);
    at(s, -4.12 + randRange(-0.06, 0.06), groundY + 0.016, 3.9 - i * 0.72);
    s.rotation.y = randRange(-0.06, 0.06);
    s.receiveShadow = true;
    g.add(s);
  }

  /* ---------- 7.1 参道通往手水舍的踏石 ---------- */
  [[1.55, 2.05], [2.25, 2.22], [2.9, 2.32]].forEach(([x, z], i) => {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 7), slabMats[(i + 1) % 3]);
    at(st, x, groundY + 0.02, z);
    st.rotation.y = randRange(0, 1.5);
    st.receiveShadow = true;
    g.add(st);
  });

  /* ---------- 8. 参道旁的小碎石点缀 ---------- */
  const pebbleMat = toon(COLORS.stoneLight);
  for (let i = 0; i < 26; i++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(randRange(0.05, 0.11), 0), pebbleMat);
    const ang = rand() * Math.PI * 2;
    const rad = randRange(1.1, 4.3);
    at(p, Math.cos(ang) * rad, groundY + 0.03, Math.sin(ang) * rad * 0.95 - 0.6);
    p.rotation.set(rand(), rand(), rand());
    p.receiveShadow = true;
    g.add(p);
  }

  return { group: g, groundY };
}
