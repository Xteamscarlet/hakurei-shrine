import * as THREE from 'three';
import {
  COLORS, toon, toonFlat, addOutline, box, cyl, at, makeTextTexture, rand, randRange,
} from './materials.js';

/* ---------------------------------------------------------------
 * 紙垂（纸垂）：折线状白纸，挂在注连绳上
 * -------------------------------------------------------------- */
function shide(scale = 1) {
  const g = new THREE.Group();
  const mat = toon(COLORS.paper, { side: THREE.DoubleSide });
  const segs = 4;
  for (let i = 0; i < segs; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.17), mat);
    p.position.y = -i * 0.135 * scale;
    p.rotation.x = (i % 2 === 0 ? 0.5 : -0.5);
    p.position.z = (i % 2 === 0 ? 0.02 : -0.02);
    p.scale.setScalar(scale);
    g.add(p);
  }
  return g;
}

/* ---------------------------------------------------------------
 * 注连绳 + 纸垂
 * -------------------------------------------------------------- */
function shimenawa(width = 4.0) {
  const g = new THREE.Group();
  const ropeMat = toon(COLORS.rope);
  const knotMat = toon(COLORS.ropeDark);
  const rope = cyl(0.13, 0.13, width, ropeMat, 12);
  rope.rotation.z = Math.PI / 2;
  addOutline(rope);
  g.add(rope);
  // 绳上的绞纹环
  for (let i = 0; i < 9; i++) {
    const k = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.032, 6, 10), knotMat);
    k.position.x = -width / 2 + 0.22 + i * ((width - 0.44) / 8);
    k.rotation.y = Math.PI / 2;
    g.add(k);
  }
  // 纸垂
  for (let i = 0; i < 5; i++) {
    const s = shide(1);
    s.position.set(-width / 2 + 0.45 + i * ((width - 0.9) / 4), -0.12, 0.02);
    g.add(s);
  }
  return g;
}

/* ---------------------------------------------------------------
 * 屋顶：切妻造（双坡）+ 宽大屋檐 + 千木 + 胜男木
 * -------------------------------------------------------------- */
function roof() {
  const g = new THREE.Group();
  const matRoof = toon(COLORS.roof);
  const matDark = toon(COLORS.roofDark);
  const matRed = toon(COLORS.red);

  const width = 5.6;
  const half = 2.45;   // 单坡水平投影
  const rise = 1.15;   // 举高
  const thick = 0.17;
  const len = Math.hypot(half, rise);
  const ang = Math.atan2(rise, half);
  const eaveY = 2.32;

  for (const s of [1, -1]) {
    const slope = box(width, thick, len, matRoof);
    slope.position.set(0, eaveY + rise / 2, (s * half) / 2);
    slope.rotation.x = s * ang;
    addOutline(slope);
    g.add(slope);

    // 檐口封檐板（深色）+ 檐下朱红线条
    const fascia = box(width + 0.06, 0.16, 0.14, matDark);
    fascia.position.set(0, eaveY - 0.02, s * half);
    fascia.rotation.x = s * ang;
    g.add(fascia);
    const redLine = box(width + 0.08, 0.06, 0.1, matRed);
    redLine.position.set(0, eaveY - 0.14, s * half);
    g.add(redLine);
  }

  // 栋（正脊）
  const ridge = box(width + 0.14, 0.2, 0.36, matDark);
  ridge.position.y = eaveY + rise + 0.05;
  addOutline(ridge, true);
  g.add(ridge);

  // 破风（山墙面）：红色打底 + 白色内板，形成轮廓线
  const tri = new THREE.Shape();
  tri.moveTo(-half, 0);
  tri.lineTo(half, 0);
  tri.lineTo(0, rise);
  tri.lineTo(-half, 0);
  const triGeo = new THREE.ShapeGeometry(tri);
  const inner = new THREE.Shape();
  inner.moveTo(-half * 0.9, 0.08);
  inner.lineTo(half * 0.9, 0.08);
  inner.lineTo(0, rise * 0.9);
  inner.lineTo(-half * 0.9, 0.08);
  const innerGeo = new THREE.ShapeGeometry(inner);
  for (const s of [1, -1]) {
    const bg = new THREE.Mesh(triGeo, matRed);
    bg.rotation.y = (s * Math.PI) / 2;
    bg.position.set(s * (width / 2 - 0.01), eaveY, 0);
    g.add(bg);
    const pn = new THREE.Mesh(innerGeo, toon(COLORS.white));
    pn.rotation.y = (s * Math.PI) / 2;
    pn.position.set(s * (width / 2 + 0.01), eaveY, 0);
    g.add(pn);
  }

  // 千木（交叉的脊饰木）
  for (const s of [1, -1]) {
    for (const t of [1, -1]) {
      const beam = box(0.09, 1.25, 0.09, matDark);
      beam.position.set(s * (width / 2 - 0.28), eaveY + rise + 0.5, 0);
      beam.rotation.x = t * 0.42;
      addOutline(beam);
      g.add(beam);
    }
  }
  // 胜男木（脊上短木）
  for (const x of [-1.75, 0, 1.75]) {
    const k = box(0.17, 0.17, 0.6, matDark);
    k.position.set(x, eaveY + rise + 0.2, 0);
    addOutline(k);
    g.add(k);
  }

  return g;
}

/* ---------------------------------------------------------------
 * 铃与木制拉绳
 * -------------------------------------------------------------- */
function bellAssembly() {
  const g = new THREE.Group();
  const matGold = toon(COLORS.gold);
  const matRope = toon(COLORS.rope);
  const matWood = toon(COLORS.wood);

  // 铃
  const bell = cyl(0.14, 0.19, 0.24, matGold, 16);
  bell.position.y = 1.62;
  addOutline(bell);
  g.add(bell);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), matGold);
  cap.position.y = 1.74;
  g.add(cap);
  const bar = box(0.52, 0.07, 0.07, matWood);
  bar.position.y = 1.78;
  addOutline(bar);
  g.add(bar);
  // 悬挂红白绳结
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), toon(COLORS.red));
  knob.position.y = 1.88;
  g.add(knob);

  // 铃绪（拉绳）
  const cord = cyl(0.038, 0.038, 1.0, matRope, 10);
  cord.position.y = 1.02;
  addOutline(cord);
  g.add(cord);
  const handle = box(0.62, 0.09, 0.09, matWood);
  handle.position.y = 0.52;
  addOutline(handle);
  g.add(handle);

  // 底部的两束币束（大纸垂）
  for (const s of [1, -1]) {
    const b = shide(1.7);
    b.position.set(s * 0.3, 1.0, 0);
    g.add(b);
  }
  return g;
}

/* ---------------------------------------------------------------
 * 赛钱箱
 * -------------------------------------------------------------- */
function offeringBox() {
  const g = new THREE.Group();
  const matWood = toon(COLORS.woodDark);
  const matDark = toon(COLORS.black);
  const body = box(1.5, 0.55, 0.72, matWood);
  body.position.y = 0.3;
  addOutline(body, true);
  g.add(body);
  // 顶面投入口
  for (let i = 0; i < 5; i++) {
    const slit = box(1.05, 0.06, 0.055, matDark);
    slit.position.set(0, 0.585, -0.22 + i * 0.11);
    g.add(slit);
  }
  // 顶面边框
  const frame = box(1.62, 0.07, 0.84, toon(COLORS.wood));
  frame.position.y = 0.55;
  g.add(frame);
  // 正面铭牌
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.36),
    new THREE.MeshBasicMaterial({ map: makeTextTexture('賽銭箱', { w: 320, h: 104, bg: '#efe7d5', fg: '#3a2a22', font: 'bold 62px "Yu Mincho", "Microsoft YaHei", serif' }) }),
  );
  plate.position.set(0, 0.3, 0.362);
  g.add(plate);
  return g;
}

/**
 * 构建神社本殿（拝殿）：石砌基坛 + 广缘 + 朱红立柱 + 白壁 + 深色大屋顶
 * 局部坐标：基坛前沿为 z = 0，向上为 +y，主殿向后延伸。
 */
export function buildShrine() {
  const g = new THREE.Group();
  g.name = 'shrine';

  const matStone = toon(COLORS.stoneLight);
  const matRed = toon(COLORS.red);
  const matRedDark = toon(COLORS.redDark);
  const matWhite = toon(COLORS.white);
  const matWood = toon(COLORS.wood);
  const matWoodDark = toon(COLORS.woodDark);
  const matDark = toon(0x3a2320);

  /* ---------- 基坛 ---------- */
  const podium = box(5.0, 0.62, 3.3, matStone);
  podium.position.set(0, 0.31, -1.65);
  addOutline(podium, true);
  g.add(podium);
  const podiumCap = box(5.14, 0.08, 3.44, toon(COLORS.stone));
  podiumCap.position.set(0, 0.63, -1.65);
  g.add(podiumCap);

  /* ---------- 正面石阶 ---------- */
  const steps = [
    { h: 0.47, z: 0.0, d: 0.22 },
    { h: 0.32, z: 0.22, d: 0.22 },
    { h: 0.16, z: 0.44, d: 0.22 },
  ];
  steps.forEach((s) => {
    const st = box(3.5, s.h, s.d, matStone);
    st.position.set(0, s.h / 2, s.z + s.d / 2);
    st.castShadow = true;
    st.receiveShadow = true;
    g.add(st);
  });

  /* ---------- 木地板 / 广缘 ---------- */
  const deck = box(4.0, 0.14, 2.6, matWood);
  deck.position.set(0, 0.71, -1.75);
  addOutline(deck);
  g.add(deck);

  /* ---------- 内部暗部（形成进深） ---------- */
  const inner = box(3.6, 1.45, 2.0, matDark);
  inner.position.set(0, 1.34, -1.9);
  g.add(inner);

  /* ---------- 墙体（背板 + 两侧） ---------- */
  const backWall = box(3.9, 1.5, 0.09, matWhite);
  backWall.position.set(0, 1.4, -2.98);
  addOutline(backWall);
  g.add(backWall);
  for (const s of [1, -1]) {
    const side = box(0.09, 1.5, 2.3, matWhite);
    side.position.set(s * 1.9, 1.4, -1.85);
    addOutline(side);
    g.add(side);
    // 侧墙木质腰线
    const band = box(0.12, 0.1, 2.3, matWoodDark);
    band.position.set(s * 1.9, 0.98, -1.85);
    g.add(band);
  }
  // 背板上部横枋
  const beamTop = box(4.2, 0.16, 0.14, matRedDark);
  beamTop.position.set(0, 2.2, -2.94);
  g.add(beamTop);

  /* ---------- 朱红立柱（前后各 4 根） ---------- */
  for (const z of [-0.78, -2.94]) {
    for (const x of [-1.85, -0.62, 0.62, 1.85]) {
      const p = cyl(0.12, 0.13, 1.62, matRed, 12);
      p.position.set(x, 1.43, z);
      addOutline(p);
      g.add(p);
      // 柱脚石
      const base = cyl(0.17, 0.19, 0.09, matStone, 12);
      base.position.set(x, 0.82, z);
      g.add(base);
    }
  }
  // 前后柱之间的横梁（长押）
  for (const z of [-0.78, -2.94]) {
    const beam = box(4.0, 0.14, 0.14, matRedDark);
    beam.position.set(0, 2.12, z);
    g.add(beam);
  }
  // 侧向连接梁
  for (const x of [-1.85, 1.85]) {
    const beam = box(0.14, 0.14, 2.3, matRedDark);
    beam.position.set(x, 2.12, -1.86);
    g.add(beam);
  }

  /* ---------- 缘侧栏杆（左右两侧） ---------- */
  for (const s of [1, -1]) {
    const rail = box(0.09, 0.09, 2.3, matRedDark);
    rail.position.set(s * 1.98, 1.02, -1.75);
    addOutline(rail);
    g.add(rail);
    const rail2 = box(0.07, 0.07, 2.3, matRedDark);
    rail2.position.set(s * 1.98, 0.86, -1.75);
    g.add(rail2);
    for (let i = 0; i < 7; i++) {
      const b = box(0.06, 0.36, 0.06, matRed);
      b.position.set(s * 1.98, 0.86, -0.75 - i * 0.34);
      g.add(b);
    }
  }

  /* ---------- 屋顶 ---------- */
  const rf = roof();
  rf.position.set(0, 0, -1.86);
  g.add(rf);

  /* ---------- 注连绳 ---------- */
  const sw = shimenawa(4.0);
  sw.position.set(0, 1.95, -0.72);
  sw.rotation.x = 0.06;
  g.add(sw);

  /* ---------- 铃与拉绳 ---------- */
  const bell = bellAssembly();
  bell.position.set(0, 0, -0.62);
  g.add(bell);

  /* ---------- 匾额（挂在檐下正中） ---------- */
  const plaqueFrame = box(1.9, 0.62, 0.08, matRedDark);
  plaqueFrame.position.set(0, 2.42, -0.66);
  addOutline(plaqueFrame);
  g.add(plaqueFrame);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(1.66, 0.46),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('博麗神社', { w: 512, h: 150, bg: '#f7f2e7', fg: '#2a2a33', font: 'bold 92px "Yu Mincho", "Microsoft YaHei", serif' }),
    }),
  );
  plaque.position.set(0, 2.42, -0.615);
  g.add(plaque);

  /* ---------- 赛钱箱（基坛前方地面） ---------- */
  const ob = offeringBox();
  ob.position.set(0, 0, 0.35);
  g.add(ob);

  /* ---------- 基坛两侧的小石灯笼台 & 台阶两侧立石 ---------- */
  for (const s of [1, -1]) {
    const post = box(0.12, 0.5, 0.12, matStone);
    post.position.set(s * 2.15, 0.25, 0.1);
    g.add(post);
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(randRange(0.16, 0.22), 0), toonFlat(COLORS.stoneDark));
    stone.position.set(s * 2.45, 0.13, 0.42);
    stone.rotation.set(rand(), rand(), rand());
    addOutline(stone);
    g.add(stone);
  }

  return g;
}
