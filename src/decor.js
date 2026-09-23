import * as THREE from 'three';
import { COLORS, toon, rand, randRange } from './materials.js';

/* ---------------------------------------------------------------
 * 地面散落的花瓣与落叶（实例化，性能友好）
 * 参数 clusters: [{ x, z, r, radius, colorHex, count }]
 * -------------------------------------------------------------- */
function scatterCluster({ x, z, r, colorHex, count, size = 0.055, lift = 0.016 }) {
  const geo = new THREE.CircleGeometry(size, 5);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r;
    dummy.position.set(x + Math.cos(a) * d, lift + rand() * 0.006, z + Math.sin(a) * d);
    dummy.rotation.set(randRange(-0.25, 0.25), rand() * Math.PI, randRange(-0.25, 0.25));
    dummy.scale.setScalar(randRange(0.7, 1.35));
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
    col.setHex(colorHex);
    col.offsetHSL(randRange(-0.02, 0.02), randRange(-0.06, 0.06), randRange(-0.07, 0.07));
    inst.setColorAt(i, col);
  }
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  inst.receiveShadow = true;
  return inst;
}

/** 散落的樱花瓣与落叶 */
export function buildScatter() {
  const g = new THREE.Group();
  g.name = 'scatter';

  // 樱花树下的花瓣
  g.add(scatterCluster({ x: -3.55, z: -3.15, r: 1.5, colorHex: COLORS.pink, count: 90 }));
  g.add(scatterCluster({ x: 3.5, z: -3.3, r: 1.3, colorHex: COLORS.pinkDark, count: 70 }));

  // 参道上的零星花瓣
  g.add(scatterCluster({ x: 0, z: 2.0, r: 1.1, colorHex: COLORS.pink, count: 34, size: 0.05 }));
  g.add(scatterCluster({ x: 0, z: 3.6, r: 0.9, colorHex: COLORS.paper, count: 22, size: 0.045 }));

  // 树下与角落的落叶
  g.add(scatterCluster({ x: -3.9, z: 3.5, r: 1.2, colorHex: COLORS.leaf, count: 60 }));
  g.add(scatterCluster({ x: 3.9, z: 3.8, r: 1.1, colorHex: COLORS.leafDark, count: 48 }));
  g.add(scatterCluster({ x: 4.1, z: 0.7, r: 1.0, colorHex: COLORS.leafDark, count: 40 }));
  g.add(scatterCluster({ x: -4.05, z: 0.9, r: 1.0, colorHex: COLORS.leaf, count: 40 }));
  g.add(scatterCluster({ x: -3.8, z: -1.6, r: 0.8, colorHex: COLORS.leafDark, count: 26 }));

  // 本殿周边的碎花点缀
  g.add(scatterCluster({ x: 2.6, z: 0.4, r: 0.9, colorHex: COLORS.pink, count: 24, size: 0.048 }));
  g.add(scatterCluster({ x: -2.5, z: 0.3, r: 0.9, colorHex: COLORS.paper, count: 20, size: 0.045 }));

  g.traverse((o) => { o.frustumCulled = false; });
  return g;
}

/* ---------------------------------------------------------------
 * 空中飘落的花瓣：缓慢旋转下沉，到底部后回到高处
 * -------------------------------------------------------------- */
export function buildFloaters(count = 46) {
  const geo = new THREE.CircleGeometry(0.07, 5);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  inst.frustumCulled = false;

  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  const data = [];
  for (let i = 0; i < count; i++) {
    const d = {
      x: randRange(-4.6, 4.6),
      y: randRange(0.6, 7.4),
      z: randRange(-4.6, 4.6),
      speed: randRange(0.16, 0.42),
      phase: rand() * Math.PI * 2,
      spin: randRange(0.4, 1.4),
      sway: randRange(0.25, 0.7),
      scale: randRange(0.75, 1.4),
    };
    data.push(d);
    col.setHex(rand() > 0.35 ? COLORS.pink : COLORS.paper);
    inst.setColorAt(i, col);
  }
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;

  const update = (t) => {
    for (let i = 0; i < count; i++) {
      const d = data[i];
      d.y -= d.speed * 0.016;
      if (d.y < 0.15) {
        d.y = randRange(5.5, 8.2);
        d.x = randRange(-4.6, 4.6);
        d.z = randRange(-4.6, 4.6);
      }
      dummy.position.set(
        d.x + Math.sin(t * d.spin + d.phase) * d.sway,
        d.y,
        d.z + Math.cos(t * d.spin * 0.8 + d.phase) * d.sway,
      );
      dummy.rotation.set(t * d.spin * 0.7, t * d.spin, t * d.spin * 0.5);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  };
  update(0);

  return { object: inst, update };
}

/* ---------------------------------------------------------------
 * 远景云团（画在天空里的柔软云朵，增强动画感）
 * -------------------------------------------------------------- */
export function buildClouds() {
  const g = new THREE.Group();
  g.name = 'clouds';
  const mat = toon(0xfdfbf6);
  const matShade = toon(0xe6e9f0);

  const clouds = [
    [-58, 17.5, -48, 3.2], [52, 20.0, -60, 3.6], [-66, 18.5, 30, 2.8],
    [58, 15.5, 44, 2.6], [8, 22.5, -74, 3.8], [-22, 19.5, 68, 3.0],
    [74, 16.5, 6, 2.7], [-56, 21.0, -28, 2.4],
  ];
  clouds.forEach(([x, y, z, s], idx) => {
    const c = new THREE.Group();
    const parts = 6;
    for (let i = 0; i < parts; i++) {
      const r = randRange(1.1, 2.0) * s;
      const b = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), i % 3 === 0 ? matShade : mat);
      b.position.set(randRange(-2.4, 2.4) * s, randRange(-0.3, 0.5) * s, randRange(-1.1, 1.1) * s);
      b.scale.y = 0.72;
      c.add(b);
    }
    c.position.set(x, y, z);
    g.add(c);
  });
  return g;
}
