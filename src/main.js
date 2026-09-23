import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildBase } from './base.js';
import { buildShrine } from './shrine.js';
import { buildScenery } from './props.js';
import { buildFacilities } from './props2.js';
import { buildScatter, buildFloaters, buildClouds } from './decor.js';

/* ===============================================================
 * 博麗神社 · 微缩立体场景
 * 三渲二风格 / 无 UI / 可拖拽旋转缩放
 * =============================================================== */

const container = document.body;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8f1f7, 34, 132);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(14.2, 9.8, 13.6);

/* ---------------- 天空：自下而上的柔和渐变 ---------------- */
const skyGeo = new THREE.SphereGeometry(160, 32, 20);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {
    topColor: { value: new THREE.Color(0x9ec8e8) },
    midColor: { value: new THREE.Color(0xdcecf6) },
    botColor: { value: new THREE.Color(0xf7ecdc) },
  },
  vertexShader: /* glsl */ `
    varying vec3 vWorld;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorld = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 topColor;
    uniform vec3 midColor;
    uniform vec3 botColor;
    varying vec3 vWorld;
    void main() {
      float h = normalize(vWorld).y;
      vec3 c = mix(botColor, midColor, smoothstep(-0.05, 0.30, h));
      c = mix(c, topColor, smoothstep(0.25, 0.85, h));
      gl_FragColor = vec4(c, 1.0);
    }`,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

/* ---------------- 灯光：主光 + 天空补光 + 冷色轮廓光 ---------------- */
const hemi = new THREE.HemisphereLight(0xdfeaf7, 0xc2c9ad, 0.85);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff3e0, 1.45);
key.position.set(9, 14, 8);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -10;
key.shadow.camera.right = 10;
key.shadow.camera.top = 10;
key.shadow.camera.bottom = -10;
key.shadow.camera.near = 1;
key.shadow.camera.far = 46;
key.shadow.bias = -0.0006;
key.shadow.normalBias = 0.022;
scene.add(key);

const rim = new THREE.DirectionalLight(0xc4dcf7, 0.5);
rim.position.set(-10, 7, -9);
scene.add(rim);

/* ---------------- 组装场景 ---------------- */
const { group: baseGroup, groundY } = buildBase();
scene.add(baseGroup);

const world = new THREE.Group();
world.position.y = groundY;
scene.add(world);

const shrine = buildShrine();
shrine.position.set(0, 0, -0.6);
world.add(shrine);

world.add(buildScenery());
world.add(buildFacilities());
world.add(buildScatter());

const floaters = buildFloaters(46);
world.add(floaters.object);

scene.add(buildClouds());

/* ---------------- 第三视角控制器 ---------------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.7, -0.6);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 8;
controls.maxDistance = 38;
controls.minPolarAngle = 0.22;
controls.maxPolarAngle = Math.PI * 0.475;
controls.rotateSpeed = 0.85;
controls.zoomSpeed = 0.85;
controls.update();

/* ---------------- 渲染循环 ---------------- */
const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  floaters.update(t);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
