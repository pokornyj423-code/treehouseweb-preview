/* Hero hlavní stránky: 3D domek na stromě ve stylu dětské pastelkové kresby (Three.js, toon materiály s šrafovanými texturami,
   černé obrysy metodou „inverted hull“, křivé low-poly tvary). Načítá se líně z hero.js. Pauza mimo viewport. */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const stage = document.querySelector('[data-ph]');
const canvas = stage.querySelector('.ph-3d');
const root = document.documentElement;
const mobile = window.matchMedia('(max-width: 760px)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'default' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);

/* ---------- pastelkové textury ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
function shade(hex, f) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, f); return '#' + c.getHexString(); }
const texCache = {};
function crayon(hex, n = 380) {
  if (texCache[hex]) return texCache[hex];
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = hex; g.fillRect(0, 0, 256, 256); g.lineCap = 'round';
  const inks = [shade(hex, 0.13), shade(hex, -0.12), shade(hex, 0.06)];
  for (let i = 0; i < n; i++) {
    g.strokeStyle = inks[i % 3]; g.globalAlpha = rnd(0.25, 0.6); g.lineWidth = rnd(2, 5);
    const x = rnd(-10, 266), y = rnd(-10, 266), l = rnd(18, 46);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * 0.7, y - l * 0.7); g.stroke();
  }
  g.globalAlpha = 0.12; g.fillStyle = '#fff';
  for (let i = 0; i < 400; i++) g.fillRect(rnd(0, 256), rnd(0, 256), 2, 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (texCache[hex] = t);
}
const ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const toon = (hex) => new THREE.MeshToonMaterial({ color: 0xffffff, map: crayon(hex), gradientMap: ramp });

/* ---------- křivé tvary + obrysy ---------- */
function hash(x, y, z, k) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + k * 19.19) * 43758.5453; return s - Math.floor(s) - 0.5; }
function wob(geo, a) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = (v) => Math.round(v * 200) / 200;
    p.setXYZ(i, x + hash(r(x), r(y), r(z), 1) * a, y + hash(r(x), r(y), r(z), 2) * a, z + hash(r(x), r(y), r(z), 3) * a);
  }
  geo.computeVertexNormals(); return geo;
}
const hullMat = (t) => new THREE.ShaderMaterial({ uniforms: { t: { value: t } }, side: THREE.BackSide,
  vertexShader: 'uniform float t; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * t, 1.0); }',
  fragmentShader: 'void main(){ gl_FragColor = vec4(0.07,0.05,0.08,1.0); }' });
function smoothHull(geo) { const h = geo.clone(); h.deleteAttribute('normal'); h.deleteAttribute('uv'); const m = mergeVertices(h, 0.01); m.computeVertexNormals(); return m; }
function solid(geo, hex, { wobble = 0.06, line = 0.07 } = {}) {
  wob(geo, wobble);
  const m = new THREE.Mesh(geo, toon(hex));
  if (line) m.add(new THREE.Mesh(smoothHull(geo), hullMat(line)));
  return m;
}
function flat(shape, hex, line = 0.07) { // plochý tvar s obrysem (hvězdy, měsíc)
  const g = new THREE.ShapeGeometry(shape); const grp = new THREE.Group();
  const o = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x1a1020 })); o.scale.setScalar(1 + line); o.position.z = -0.01;
  grp.add(o, new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: hex }))); return grp;
}

/* ---------- pozadí: pastelková noční obloha ---------- */
(function sky() {
  const c = document.createElement('canvas'); c.width = 768; c.height = 768; const g = c.getContext('2d');
  g.fillStyle = '#12308f'; g.fillRect(0, 0, 768, 768); g.lineCap = 'round';
  const cols = ['#1d45b8', '#0b2272', '#2a57cf', '#183a9e'];
  for (let i = 0; i < 1500; i++) { g.strokeStyle = cols[i % 4]; g.globalAlpha = rnd(.25, .6); g.lineWidth = rnd(3, 8); const x = rnd(-20, 790), y = rnd(-20, 790), l = rnd(26, 70); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * .6, y - l * .8); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
})();

/* ---------- světla ---------- */
scene.add(new THREE.AmbientLight(0xb8c4ff, 0.95));
const moonL = new THREE.DirectionalLight(0xcfd8ff, 1.6); moonL.position.set(6, 9, 6); scene.add(moonL);
const winL = new THREE.PointLight(0xffc24a, 14, 9, 1.8); winL.position.set(0.2, 3.0, 4.0); scene.add(winL);

/* ---------- kopec, strom, koruna ---------- */
const world = new THREE.Group(); scene.add(world);
const hill = solid(new THREE.SphereGeometry(40, 28, 14), '#3fae2a', { wobble: 0.5, line: 0 }); hill.scale.set(1, 0.16, 1); hill.position.set(0, -7.5, -4); world.add(hill);
const trunk = solid(new THREE.CylinderGeometry(0.75, 1.25, 4.2, 7, 4), '#7a4421', { wobble: 0.12 }); trunk.position.set(0, 0.8, 0); trunk.rotation.z = 0.05; world.add(trunk);
const leafGreens = ['#3aa626', '#4cb82f', '#2f9420'];
[[0, 4.4, -2.3, 3.2], [-2.8, 3.3, -1.4, 2.0], [2.9, 3.4, -1.5, 2.0], [-1.7, 5.8, -1.8, 1.9], [1.8, 5.9, -1.7, 1.9], [0, 6.5, -2.0, 1.6], [-3.1, 5.0, -1.8, 1.5], [3.2, 5.1, -1.7, 1.5], [0, 2.6, -2.2, 2.2]].forEach((b, i) => {
  const m = solid(new THREE.IcosahedronGeometry(b[3], 1), leafGreens[i % 3], { wobble: 0.22, line: 0.09 }); m.position.set(b[0], b[1], b[2]); world.add(m);
});
/* domek */
const house = new THREE.Group(); house.position.set(0, 3.0, 1.2); world.add(house);
const cab = solid(new THREE.BoxGeometry(2.5, 1.9, 2, 3, 3, 3), '#b97a43', { wobble: 0.05 }); house.add(cab);
const roof = solid(new THREE.ConeGeometry(2.15, 1.3, 4, 1), '#7b3f1c', { wobble: 0.05 }); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.85; roof.position.y = 1.55; house.add(roof);
const plat = solid(new THREE.BoxGeometry(3.1, 0.22, 2.5, 3, 1, 3), '#6a3817', { wobble: 0.04 }); plat.position.y = -1.05; house.add(plat);
const winM = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), new THREE.MeshBasicMaterial({ map: crayon('#ffd42a', 260) })); winM.position.set(0.1, 0.05, 1.02); house.add(winM);
const winFrame = solid(new THREE.BoxGeometry(1.5, 1.2, 0.1, 2, 2, 1), '#5a2d12', { wobble: 0.03, line: 0.05 }); winFrame.position.set(0.1, 0.05, 0.98); house.add(winFrame); winM.renderOrder = 2;
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,214,90,.9)'); r.addColorStop(.4, 'rgba(255,190,60,.28)'); r.addColorStop(1, 'rgba(255,180,50,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
glow.scale.set(4.4, 3.8, 1); glow.position.set(0.1, 0.05, 1.3); house.add(glow);
/* chlápek u počítače */
const man = new THREE.Group(); man.position.set(0.28, -0.32, 1.1); house.add(man);
const body = solid(new THREE.BoxGeometry(0.42, 0.42, 0.22, 2, 2, 1), '#2f6fe0', { wobble: 0.02, line: 0.035 }); body.position.y = 0.2; man.add(body);
const head = solid(new THREE.SphereGeometry(0.2, 8, 6), '#f4c795', { wobble: 0.02, line: 0.035 }); head.position.y = 0.62; man.add(head);
const hair = solid(new THREE.SphereGeometry(0.205, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45), '#2b1a0e', { wobble: 0.02, line: 0.03 }); hair.position.y = 0.64; man.add(hair);
[-0.07, 0.07].forEach((x) => { const e = new THREE.Mesh(new THREE.CircleGeometry(0.02, 6), new THREE.MeshBasicMaterial({ color: 0x151015 })); e.position.set(x + 0.02, 0.62, 0.2); man.add(e); });
const mon = solid(new THREE.BoxGeometry(0.46, 0.34, 0.07, 2, 2, 1), '#8aa0b8', { wobble: 0.015, line: 0.03 }); mon.position.set(-0.46, 0.42, 0.05); man.add(mon);
const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.25), new THREE.MeshBasicMaterial({ color: 0x59c4ff })); scr.position.set(-0.46, 0.42, 0.095); man.add(scr);
const desk = solid(new THREE.BoxGeometry(1.0, 0.07, 0.35, 2, 1, 1), '#6a3817', { wobble: 0.015, line: 0.03 }); desk.position.set(-0.2, 0.18, 0.12); man.add(desk);
/* otazník */
const qc = document.createElement('canvas'); qc.width = qc.height = 128; { const g = qc.getContext('2d'); g.font = '700 108px "Patrick Hand","Comic Sans MS",cursive'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#1b1220'; g.strokeText('?', 64, 70); g.fillStyle = '#ffd42a'; g.fillText('?', 64, 70); }
const qT = new THREE.CanvasTexture(qc); qT.colorSpace = THREE.SRGBColorSpace;
const q = new THREE.Sprite(new THREE.SpriteMaterial({ map: qT, transparent: true, depthTest: false })); q.scale.set(0.8, 0.8, 1); q.renderOrder = 10; man.add(q);
/* žebřík */
const ladder = new THREE.Group(); ladder.position.set(-1.1, -0.3, 2.0); ladder.rotation.set(0.06, 0, -0.12); world.add(ladder);
[-0.32, 0.32].forEach((x) => { const r = solid(new THREE.BoxGeometry(0.12, 4.4, 0.12, 1, 4, 1), '#6a3817', { wobble: 0.03, line: 0.04 }); r.position.set(x, 0.0, 0); ladder.add(r); });
for (let i = 0; i < 7; i++) { const r = solid(new THREE.BoxGeometry(0.76, 0.1, 0.1, 1, 1, 1), '#7a4421', { wobble: 0.02, line: 0.035 }); r.position.set(0, -1.9 + i * 0.62, 0.02); ladder.add(r); }
/* trsy trávy */
for (let i = 0; i < 14; i++) { const t = solid(new THREE.ConeGeometry(0.16, rnd(0.5, 0.9), 4, 1), '#2f9a22', { wobble: 0.04, line: 0.04 }); const a = rnd(0, Math.PI * 2), r = rnd(2.4, 9); t.position.set(Math.cos(a) * r, -1.45, Math.sin(a) * r * 0.5 + 2); t.rotation.z = rnd(-.2, .2); world.add(t); }

/* ---------- hvězdy, měsíc ---------- */
const starShape = (R, r) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; i ? s.lineTo(Math.cos(a) * d, Math.sin(a) * d) : s.moveTo(Math.cos(a) * d, Math.sin(a) * d); } return s; };
const sky = new THREE.Group(); sky.position.z = -14; scene.add(sky);
const stars = [];
[[-12, 11, 1.3], [-6, 12.5, .8], [-1, 13, .7], [5, 12, .9], [-9, 6, .6], [12, 7, .8], [-14, 1, .9], [14, 1, .7], [9, 12.5, .6], [-4, 8, .55], [16, 10, .6]].forEach((s, i) => {
  const m = flat(starShape(1, 0.45), '#ffd42a', 0.14); m.position.set(s[0], s[1], 0); m.scale.setScalar(s[2]); m.userData = { s: s[2], p: i * 1.7 }; sky.add(m); stars.push(m);
});
const moonPivot = new THREE.Group(); moonPivot.position.set(13, 15, 0); sky.add(moonPivot);
{ const s = new THREE.Shape(); s.absarc(0, 0, 2.1, -1.1, 1.1 + Math.PI * 0.0 + 2.0, false); s.absarc(1.0, 0.1, 1.85, 4.0, -0.9, true); const m = flat(s, '#ffd42a', 0.07); m.position.y = -2.4; moonPivot.add(m); }
/* světlušky */
const FN = mobile ? 22 : 44, fpos = new Float32Array(FN * 3), fph = [];
for (let i = 0; i < FN; i++) fph.push([rnd(-8, 8), rnd(-1, 8), rnd(-2, 5), rnd(0, 6.28), rnd(.3, .9)]);
const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
const fc = document.createElement('canvas'); fc.width = fc.height = 32; { const g = fc.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff6b0'); r.addColorStop(.35, 'rgba(255,220,90,.8)'); r.addColorStop(1, 'rgba(255,210,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); }
const flies = new THREE.Points(fgeo, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(fc), size: mobile ? 0.5 : 0.42, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
flies.frustumCulled = false; scene.add(flies);

/* ---------- kamera, rozměry, smyčka ---------- */
let W = 0, H = 0, zoomT = 0, zoom = 0, mx = 0, my = 0, tx = 0, ty = 0, fovBase = 36;
const look = new THREE.Vector3(), pos = new THREE.Vector3();
function resize() {
  const r = stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
  renderer.setSize(W, H, false);
  const asp = W / H; camera.aspect = asp; fovBase = asp < 0.8 ? 50 : 36; camera.fov = fovBase;
  camera.clearViewOffset();
  if (W > 1000) camera.setViewOffset(W, H, -W * 0.20, 0, W, H);
  else if (W <= 760) camera.setViewOffset(W, H, 0, H * 0.19, W, H);
  camera.updateProjectionMatrix();
}
const ease = (x) => x * x * (3 - 2 * x);
function updateCam(dt) {
  const sy = window.scrollY, p = Math.min(Math.max(sy / (H * 0.95), 0), 1);
  zoomT = ease(p); zoom += (zoomT - zoom) * (1 - Math.exp(-dt * 3.2));
  mx += (tx - mx) * (1 - Math.exp(-dt * 3)); my += (ty - my) * (1 - Math.exp(-dt * 3));
  const asp = W / H, tan = Math.tan(THREE.MathUtils.degToRad(fovBase / 2));
  const dist = Math.max(19, 12.5 / (2 * tan * Math.min(asp, 1.2)));
  pos.set(mx * 0.9, 3.0 - my * 0.5, dist); look.set(0, 2.9, 0);
  const zp = new THREE.Vector3(0.1 + mx * 0.15, 3.0, 6.2), zl = new THREE.Vector3(0.1, 2.95, 1.7);
  pos.lerp(zp, zoom * 0.92); look.lerp(zl, zoom);
  camera.position.copy(pos); camera.lookAt(look);
  stage.style.setProperty('--zoom', zoom.toFixed(3));
}
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let running = false, last = 0, t0 = performance.now(), readyDone = false;
function frame(now) {
  if (!running) return; requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.1); last = now; const t = (now - t0) / 1000;
  if (mobile) { if (dt < 1 / 34) { last = now - dt * 1000; return; } }
  updateCam(dt);
  q.position.set(0.1, 1.12 + Math.abs(Math.sin(t * 3.2)) * 0.2, 0.2); q.material.rotation = Math.sin(t * 3.2) * 0.12;
  moonPivot.rotation.z = Math.sin(t * 1.1) * 0.14;
  stars.forEach((s) => { const k = 1 + Math.sin(t * 2.2 + s.userData.p) * 0.18; s.scale.setScalar(s.userData.s * k); s.rotation.z = Math.sin(t * 1.4 + s.userData.p) * 0.12; });
  winL.intensity = 13 + Math.sin(t * 2.1) * 2.5 + Math.sin(t * 7.3) * 0.8; glow.material.opacity = 0.8 + Math.sin(t * 2.1) * 0.15;
  foliageSway(t);
  for (let i = 0; i < FN; i++) { const f = fph[i]; fpos[i * 3] = f[0] + Math.sin(t * f[4] + f[3]) * 0.8; fpos[i * 3 + 1] = f[1] + Math.cos(t * f[4] * 1.2 + f[3]) * 0.6; fpos[i * 3 + 2] = f[2] + Math.sin(t * .5 + f[3]) * 0.5; }
  fgeo.attributes.position.needsUpdate = true; flies.material.opacity = 1;
  renderer.render(scene, camera);
  if (!readyDone) { readyDone = true; root.classList.add('ph-live'); }
}
function foliageSway(t) { world.children.forEach((c, i) => { if (c.geometry && c.geometry.type === 'IcosahedronGeometry') c.rotation.z = Math.sin(t * 0.8 + i) * 0.03; }); }
function setRunning(on) { if (on && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!on) running = false; }
resize(); updateCam(1); renderer.render(scene, camera); readyDone = true; root.classList.add('ph-live');
if (reduce) { /* statický jeden snímek */ }
else {
  new IntersectionObserver((e) => setRunning(e[0].isIntersecting && !document.hidden), { threshold: 0 }).observe(stage);
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden && stage.getBoundingClientRect().bottom > 0));
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) window.addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
}
new ResizeObserver(() => { resize(); if (!running) { updateCam(1); renderer.render(scene, camera); } }).observe(stage);
