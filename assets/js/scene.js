/* 3D scéna „dům na stromě“ (procedurální Three.js, žádné modely ke stažení).
   Strom, kmen, větve, listí (InstancedMesh, vítr ve vertex shaderu), dřevěný domek, svítící okna a světelné řetězy,
   světlušky, padající listy, hvězdy a měsíc. Kamera se při scrollu pohybuje kolem stromu, scéna přechází ze soumraku do noci.
   Respektuje prefers-reduced-motion (jeden statický snímek), bez WebGL / na slabých zařízeních zůstává CSS záloha. */
import * as THREE from 'three';

const root = document.documentElement;
const canvas = document.getElementById('scene');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
const lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
  (navigator.connection && navigator.connection.saveData);

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}
if (!canvas || lowPower || !webglOK()) { root.classList.add('no-webgl'); }
else { try { start(); } catch (e) { console.warn('3D scéna se nespustila:', e); root.classList.add('no-webgl'); } }

function start() {
  const { MathUtils: MU } = THREE;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
  let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd98a52, 22, 95);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 220);
  const UP = new THREE.Vector3(0, 1, 0);
  const uniforms = { uTime: { value: 0 } };
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  /* ---------- paleta soumrak → noc ---------- */
  const C = (h) => new THREE.Color(h);
  const pal = {
    top: [C('#1d3350'), C('#050a18')], horizon: [C('#ec9b5a'), C('#11223a')],
    hemiSky: [C('#8fa9d0'), C('#1d2c4c')], hemiGround: [C('#4a3d2a'), C('#0b140f')],
    dir: [C('#ffc283'), C('#7d9bd6')], hill: [C('#2a4a44'), C('#0a1822')],
    ground: [C('#2c4a2f'), C('#0f1d14')], bulb: [C('#a07a40'), C('#ffd58a')], win: [C('#c9904a'), C('#ffd27a')]
  };
  const mix = (arr, t, out) => out.copy(arr[0]).lerp(arr[1], t);

  /* ---------- obloha ---------- */
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(-0.55, 0.1, -0.83).normalize() }, sunI: { value: 1 } },
    vertexShader: 'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 vP; uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform float sunI;' +
      'void main(){ float h=clamp(vP.y,-.2,1.); vec3 c=mix(hor,top,pow(smoothstep(-.05,.85,h),.65));' +
      'float g=max(dot(normalize(vP),sunDir),0.); c+=vec3(1.,.55,.25)*(pow(g,12.)*.38+pow(g,500.)*.8)*sunI; gl_FragColor=vec4(c,1.); }'
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 24, 16), skyMat);
  scene.add(sky);

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();

  // hvězdy
  const starN = isMobile ? 160 : 380, sp = new Float32Array(starN * 3);
  for (let i = 0; i < starN; i++) {
    const a = rnd() * Math.PI * 2, e = Math.asin(0.12 + rnd() * 0.88), r = 105;
    sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
  }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));
  // měsíc
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xeaf0ff, transparent: true, opacity: 0, fog: false, toneMapped: false });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), moonMat); moon.position.set(-30, 30, -80); scene.add(moon);
  const moonGlowMat = new THREE.PointsMaterial({ map: glowTex, color: 0x9db8ff, size: 26, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const moonGlow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([-30, 30, -80], 3)), moonGlowMat); scene.add(moonGlow);

  /* ---------- světla ---------- */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc283, 1.6); sun.position.set(-8, 7, 9); scene.add(sun);
  const houseLight = new THREE.PointLight(0xffb45a, 0, 9, 1.6); scene.add(houseLight);
  const lanternLight = new THREE.PointLight(0xffa850, 0, 7, 1.8); scene.add(lanternLight);

  /* ---------- materiály ---------- */
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5b3d2b, roughness: 0.95, flatShading: true, side: THREE.DoubleSide });
  const plankTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 8; i++) {
      const l = 36 + Math.floor(rnd() * 10); x.fillStyle = `hsl(26 42% ${l}%)`; x.fillRect(i * 32, 0, 32, 256);
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(i * 32, 0, 2, 256);
      x.strokeStyle = 'rgba(40,20,8,.25)'; for (let k = 0; k < 4; k++) { x.beginPath(); const px = i * 32 + 6 + rnd() * 20; x.moveTo(px, 0); x.lineTo(px + (rnd() - .5) * 6, 256); x.stroke(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  })();
  const woodMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.9 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3a2517, roughness: 0.9 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xa24a2d, roughness: 0.8, flatShading: true });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7c7a72, roughness: 1, flatShading: true });
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd58a, toneMapped: false });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb59a6b, roughness: 1 });
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c4a2f, roughness: 1, flatShading: true });

  const tree = new THREE.Group(); scene.add(tree);

  /* ---------- země, kopce ---------- */
  {
    const g = new THREE.CircleGeometry(60, 64); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z);
      p.setY(i, Math.max(0, 1.2 - d * 0.12) * 0.35 * Math.cos(d * 0.8) * 0 + (d > 4 ? (Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.18) : 0) + Math.max(0, 1 - d / 4.5) * 0.28);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, groundMat); scene.add(m);
  }
  const hillMats = [];
  [[-40, -62, 55, 13, 18], [20, -75, 70, 17, 22], [70, -55, 45, 11, 16], [-85, -48, 40, 9, 14]].forEach(([x, z, sx, sy, sz]) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0x2a4a44 }); hillMats.push(mat);
    const h = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    h.scale.set(sx, sy, sz); h.position.set(x, -0.5, z); scene.add(h);
  });
  // kameny
  for (let i = 0; i < 7; i++) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + rnd() * 0.3, 0), stoneMat);
    const a = rnd() * 6.28, d = 2.2 + rnd() * 5; r.position.set(Math.cos(a) * d, 0.08, Math.sin(a) * d); r.rotation.set(rnd() * 3, rnd() * 3, 0); r.scale.y = 0.6; scene.add(r);
  }

  /* ---------- kmen, kořeny, větve ---------- */
  {
    const rings = 16, seg = 12, pos = [], idx = [];
    for (let i = 0; i <= rings; i++) {
      const t = i / rings, y = t * 5.9;
      const r = MU.lerp(0.6, 0.3, Math.pow(t, 0.8)) + 0.5 * Math.pow(1 - t, 6);
      const cx = Math.sin(t * 2.4) * 0.14, cz = Math.cos(t * 1.7) * 0.08 - 0.08;
      for (let j = 0; j < seg; j++) {
        const a = (j / seg) * Math.PI * 2, n = 1 + 0.08 * Math.sin(a * 3 + t * 5) + 0.05 * Math.sin(a * 5 - t * 3);
        pos.push(cx + Math.cos(a) * r * n, y, cz + Math.sin(a) * r * n);
      }
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
      const a = i * seg + j, b = i * seg + ((j + 1) % seg), c = a + seg, d = b + seg; idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    tree.add(new THREE.Mesh(g, barkMat));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3, dir = new THREE.Vector3(Math.cos(a), -0.4, Math.sin(a)).normalize();
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.7, 6), barkMat);
      m.position.copy(dir).multiplyScalar(0.95).add(new THREE.Vector3(0, 0.25, 0)); m.quaternion.setFromUnitVectors(UP, dir); tree.add(m);
    }
  }
  function branch(a, b, r0, r1) {
    a = new THREE.Vector3(...a); b = new THREE.Vector3(...b);
    const d = b.clone().sub(a), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 7, 1), barkMat);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); tree.add(m);
  }
  branch([0, 2.7, 0], [2.7, 3.15, 0.1], 0.26, 0.14);            // nosník pod domkem
  branch([0, 2.9, 0], [1.9, 2.95, 1.1], 0.2, 0.1);              // druhá podpěra
  branch([0, 3.2, 0], [-2.5, 4.5, 0.4], 0.26, 0.13); branch([-2.5, 4.5, 0.4], [-3.7, 5.7, 0.2], 0.13, 0.06);
  branch([0, 4.3, 0], [2.9, 5.9, -0.6], 0.22, 0.1); branch([2.9, 5.9, -0.6], [3.9, 6.6, -0.3], 0.1, 0.05);
  branch([0, 4.6, 0], [0.6, 6.5, 1.5], 0.2, 0.08);
  branch([0, 4.9, 0], [-0.9, 6.9, -1.4], 0.2, 0.08);
  branch([0, 5.3, 0], [0.2, 7.7, 0], 0.2, 0.06);
  branch([0, 2.6, 0], [-2.3, 3.3, 1.0], 0.2, 0.1);              // větev s houpačkou
  branch([-1.2, 3.0, 0.5], [-1.7, 3.9, 0.9], 0.07, 0.04);

  /* ---------- domek ---------- */
  /* ---------- obrazovka monitoru (CanvasTexture): problém → Tree House Web pomůže ---------- */
  const screenCv = document.createElement('canvas'); screenCv.width = 512; screenCv.height = 364; let screenTex = null, screenState = -1;
  function drawScreen(st) {
    const c = screenCv.getContext('2d'), w = 512, h = 364; screenState = st;
    const FD = '"Fraunces", Georgia, serif', FS = '"Manrope", system-ui, sans-serif';
    c.clearRect(0, 0, w, h);
    if (st === 0) {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1b2a4a'); g.addColorStop(1, '#0d1626'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ff7a59'; c.font = '600 150px ' + FD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, 130);
      c.fillStyle = '#e8eefc'; c.font = '700 40px ' + FS; c.fillText('Jak na web…?', w / 2, 250);
      c.fillStyle = 'rgba(232,238,252,.55)'; c.font = '600 26px ' + FS; c.fillText('Nic nenalezeno', w / 2, 304);
    } else {
      const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#12392b'); g.addColorStop(1, '#2a2a14'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const r = c.createRadialGradient(w / 2, 150, 10, w / 2, 150, 300); r.addColorStop(0, 'rgba(255,196,110,.38)'); r.addColorStop(1, 'rgba(255,196,110,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h);
      // mini logo: strom s domkem
      c.save(); c.translate(w / 2, 86); c.fillStyle = '#86d6a2'; c.beginPath(); c.arc(0, -8, 38, 0, 7); c.fill(); c.fillStyle = '#8a5a35'; c.fillRect(-7, 20, 14, 34);
      c.fillStyle = '#ffb454'; c.fillRect(-14, -18, 28, 20); c.beginPath(); c.moveTo(-19, -18); c.lineTo(0, -34); c.lineTo(19, -18); c.fill(); c.fillStyle = '#12392b'; c.fillRect(-4, -12, 8, 8); c.restore();
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff4dc'; c.font = '600 62px ' + FD; c.fillText('Tree House Web', w / 2, 188);
      c.fillStyle = '#ffc56e'; c.font = '800 44px ' + FS; c.fillText('ti se vším pomůže', w / 2, 258);
      c.strokeStyle = '#ffc56e'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 296); c.quadraticCurveTo(w / 2, 312, 362, 294); c.stroke();
    }
    if (screenTex) screenTex.needsUpdate = true;
  }
  drawScreen(0);
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('600 62px "Fraunces"'), document.fonts.load('800 44px "Manrope"'), document.fonts.load('700 40px "Manrope"')]).then(() => document.fonts.ready).then(() => drawScreen(Math.max(screenState, 0))).catch(() => {});
  const house = new THREE.Group(); house.position.set(1.65, 3.38, 0.3); house.rotation.y = 0.35; house.scale.setScalar(1.45); tree.add(house);
  {
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.5, 0.16, 10), woodMat); plat.position.y = -0.08; house.add(plat);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.15, 1.35), woodMat); cab.position.set(0.05, 0.575, -0.1); house.add(cab);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.58, 0.95, 4), roofMat); roof.rotation.y = Math.PI / 4; roof.scale.set(1.0, 1, 0.86); roof.position.set(0.05, 1.62, -0.1); house.add(roof);
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), stoneMat); chim.position.set(0.5, 1.9, -0.25); house.add(chim);
    const wins = [];
    const addWin = (x, y, z, ry) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.32), winMat); w.position.set(x, y, z); w.rotation.y = ry; house.add(w);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.03), darkWood); f.position.set(x, y, z - 0.012 * Math.cos(ry)); f.rotation.y = ry; house.add(f);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.03, 0.02), darkWood); bar.position.set(x, y, z + 0.012 * Math.cos(ry)); bar.rotation.y = ry; house.add(bar);
      wins.push(new THREE.Vector3(x, y, z));
    };
    addWin(-0.55, 0.65, 0.59, 0); addWin(0.65, 0.65, 0.59, 0); addWin(0.91, 0.65, -0.1, Math.PI / 2); addWin(-0.81, 0.65, -0.1, -Math.PI / 2);
    // velké čelní okno s týpkem u počítače (low-poly, stejné materiály)
    { const bw = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5), winMat); bw.position.set(0.05, 0.66, 0.595); house.add(bw);
      const bf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.58, 0.03), darkWood); bf.position.set(0.05, 0.66, 0.58); house.add(bf);
      const bb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.02), darkWood); bb.position.set(0.05, 0.66, 0.61); house.add(bb);
      const m = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
      const g = new THREE.Group(); g.position.set(0.12, 0.48, 0.64); house.add(g);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.1), m(0x3f6fd6)); body.position.y = 0.12; g.add(body);
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), m(0xf0c29a)); head.position.set(0, 0.32, 0); head.rotation.z = 0.2; g.add(head);
      const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), m(0x3a2415)); hair.scale.set(1, 0.6, 1); hair.position.set(0, 0.37, -0.005); g.add(hair);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.16), m(0x3f6fd6)); arm.position.set(-0.08, 0.15, 0.1); g.add(arm);
      const desk = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.03, 0.16), woodMat); desk.position.set(-0.13, 0.1, 0.06); g.add(desk);
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.23, 0.025), m(0x2a3140)); mon.position.set(-0.22, 0.23, 0.05); g.add(mon);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.03), m(0x2a3140)); stand.position.set(-0.22, 0.13, 0.05); g.add(stand);
      screenTex = new THREE.CanvasTexture(screenCv); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 4;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.185), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })); scr.position.set(-0.22, 0.23, 0.064); g.add(scr);
      const lamp = new THREE.PointLight(0xffc878, 0.9, 2.2, 2); lamp.position.set(0.1, 0.8, 1.05); house.add(lamp); house.userData.manLight = lamp; }
    // zábradlí
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2; if (Math.sin(a) < -0.2) continue;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5), darkWood); p.position.set(Math.cos(a) * 1.5, 0.25, Math.sin(a) * 1.5); house.add(p);
    }
    const rail = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.025, 5, 24, Math.PI * 1.2), darkWood); rail.rotation.x = Math.PI / 2; rail.rotation.z = Math.PI * 0.4; rail.position.y = 0.5; house.add(rail);
    // vlajka
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.22), new THREE.MeshStandardMaterial({ color: 0xef7a4e, side: THREE.DoubleSide, roughness: 0.8 }));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4), darkWood); pole.position.set(0.05, 2.45, -0.1); house.add(pole);
    flag.position.set(0.27, 2.68, -0.1); house.add(flag); house.userData.flag = flag;
    house.userData.wins = wins;
  }
  house.updateMatrixWorld(true);
  const W = (x, y, z) => house.localToWorld(new THREE.Vector3(x, y, z));
  houseLight.position.copy(W(0.2, 1.0, 1.5)); lanternLight.position.copy(W(-0.3, 0.7, 0.9));

  /* ---------- světelné řetězy ---------- */
  const bulbPos = [];
  const lightObjs = [];
  {
    const strands = [
      [W(-1.0, 1.12, 0.78), W(-0.1, 0.85, 0.95), W(1.0, 1.12, 0.78)],
      [W(-1.0, 1.12, 0.78), W(-1.45, 0.75, 0.9), W(-1.4, 0.5, 0.2)],
      [W(-1.0, 1.1, 0.2), new THREE.Vector3(-1.9, 4.0, 0.8), new THREE.Vector3(-2.5, 4.55, 0.4)],
      [W(1.0, 1.12, 0.6), new THREE.Vector3(2.7, 4.5, 1.3), new THREE.Vector3(1.0, 5.4, 1.5), new THREE.Vector3(0.6, 6.4, 1.5)],
      [new THREE.Vector3(-2.5, 4.55, 0.4), new THREE.Vector3(-1.6, 5.2, 1.2), new THREE.Vector3(-0.2, 5.0, 1.0), new THREE.Vector3(0.4, 6.2, 1.4)]
    ];
    const ropeG = [];
    strands.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts); const n = 14;
      for (let i = 0; i <= n; i++) { const p = curve.getPoint(i / n); p.y -= Math.sin((i / n) * Math.PI) * 0.18; bulbPos.push(p); }
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.008, 3, false), darkWood); scene.add(tube); lightObjs.push(tube);
    });
  }
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 8, 6), bulbMat, bulbPos.length);
  { const d = new THREE.Object3D(); const col = new THREE.Color(); const cols = ['#ffd58a', '#ffb454', '#fff1c4', '#ffc67a'];
    bulbPos.forEach((p, i) => { d.position.copy(p); d.updateMatrix(); bulbs.setMatrixAt(i, d.matrix); bulbs.setColorAt(i, col.set(pick(cols))); }); }
  scene.add(bulbs);
  const glowPts = new THREE.Points(new THREE.BufferGeometry().setFromPoints(bulbPos),
    new THREE.PointsMaterial({ map: glowTex, color: 0xffc070, size: 0.42, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(glowPts);
  const winGlow = new THREE.Points(new THREE.BufferGeometry().setFromPoints(house.userData.wins.map((v) => house.localToWorld(v.clone().add(new THREE.Vector3(0, 0, 0.04))))),
    new THREE.PointsMaterial({ map: glowTex, color: 0xffb45a, size: 1.5, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(winGlow);

  /* ---------- provazový žebřík a houpačka ---------- */
  const ladderTop = W(0.35, 0, 1.45); const ladderLen = ladderTop.y - 0.08;
  const ladder = new THREE.Group(); ladder.position.copy(ladderTop); scene.add(ladder);
  [-0.2, 0.2].forEach((x) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, ladderLen, 4), ropeMat); r.position.set(x, -ladderLen / 2, 0); ladder.add(r); });
  for (let i = 1; i < 13; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.06), woodMat); r.position.set(0, -i * (ladderLen / 13), 0); ladder.add(r); }
  const swing = new THREE.Group(); swing.position.set(-1.85, 3.2, 0.75); scene.add(swing);
  { const L = 2.0;
    [-0.22, 0.22].forEach((x) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 4), ropeMat); r.position.set(x, -L / 2, 0); swing.add(r); });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.22), woodMat); seat.position.set(0, -L, 0); swing.add(seat); }

  /* ---------- listí (InstancedMesh + vítr) ---------- */
  function wind(mat, amp) {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uniforms.uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          #ifdef USE_INSTANCING
          vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          float k = ${amp.toFixed(3)} * (0.4 + 0.12 * ip.y);
          transformed.x += (sin(uTime * 1.25 + ip.x * 1.7 + ip.z) + 0.6 * sin(uTime * 0.45 + ip.y)) * k;
          transformed.y += sin(uTime * 1.6 + ip.z * 2.0 + ip.x) * k * 0.45;
          transformed.z += cos(uTime * 1.05 + ip.x * 1.3) * k * 0.7;
          #endif`);
    };
  }
  {
    const N = isMobile ? 210 : 520;
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }); wind(mat, 0.07);
    const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), mat, N);
    const d = new THREE.Object3D(), col = new THREE.Color();
    const greens = ['#2c6a44', '#37804e', '#4c9a58', '#2a5e3c', '#5aa35a', '#3f8a4f', '#c9a13c'];
    const zones = [{ c: [-0.5, 7.5, 0], r: [3.7, 2.0, 3.2], w: 6 }, { c: [-3.6, 5.5, 0.3], r: [1.7, 1.2, 1.5], w: 1.3 }, { c: [3.6, 6.4, -0.4], r: [1.6, 1.2, 1.4], w: 1.2 }, { c: [0.6, 6.4, 1.6], r: [1.4, 1.0, 1.2], w: 1 }];
    const tw = zones.reduce((s, z) => s + z.w, 0);
    for (let i = 0; i < N; i++) {
      let p; let tries = 0;
      do {
        let r = rnd() * tw, z = zones[0]; for (const zz of zones) { if ((r -= zz.w) <= 0) { z = zz; break; } }
        const u = rnd() * 2 - 1, th = rnd() * 6.283, s = Math.sqrt(1 - u * u), rr = Math.cbrt(rnd());
        p = new THREE.Vector3(z.c[0] + s * Math.cos(th) * z.r[0] * rr, z.c[1] + u * z.r[1] * rr, z.c[2] + s * Math.sin(th) * z.r[2] * rr);
        tries++;
      } while (tries < 6 && Math.hypot(p.x - 1.65, p.z - 0.3) < 1.75 && p.y < 5.8);
      const sc = 0.5 + rnd() * 0.55; d.position.copy(p); d.scale.set(sc * (1 + rnd() * 0.3), sc * 0.85, sc * (1 + rnd() * 0.3)); d.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix); mesh.setColorAt(i, col.set(rnd() < 0.07 ? greens[6] : pick(greens.slice(0, 6))));
    }
    scene.add(mesh);
    // tráva
    const gm = new THREE.MeshStandardMaterial({ color: 0x4f9a55, roughness: 1, flatShading: true }); wind(gm, 0.05);
    const gN = isMobile ? 70 : 260, grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.55, 3), gm, gN);
    for (let i = 0; i < gN; i++) { const a = rnd() * 6.28, dd = 0.9 + rnd() * 9; d.position.set(Math.cos(a) * dd, 0.22, Math.sin(a) * dd); d.rotation.set((rnd() - .5) * .4, rnd() * 3, (rnd() - .5) * .4); d.scale.setScalar(0.6 + rnd() * 0.9); d.updateMatrix(); grass.setMatrixAt(i, d.matrix); grass.setColorAt(i, col.set(pick(['#4f9a55', '#3c8048', '#6cb060']))); }
    scene.add(grass);
  }

  /* ---------- padající listy ---------- */
  const leafN = isMobile ? 12 : 34;
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.2, 0.13), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9 }), leafN);
  const leafData = [];
  { const col = new THREE.Color();
    for (let i = 0; i < leafN; i++) {
      leafData.push({ x: (rnd() - 0.5) * 8, y: rnd() * 8, z: (rnd() - 0.3) * 6, v: 0.22 + rnd() * 0.3, ph: rnd() * 6.28, sp: 0.8 + rnd() * 1.6, am: 0.3 + rnd() * 0.5 });
      leaves.setColorAt(i, col.set(pick(['#d9a441', '#e07a3f', '#7fbf62', '#c9a13c'])));
    } }
  scene.add(leaves);
  const dummy = new THREE.Object3D();
  function updateLeaves(t, dt) {
    for (let i = 0; i < leafN; i++) {
      const l = leafData[i]; l.y -= l.v * dt; if (l.y < 0.05) { l.y = 7.5 + rnd(); l.x = (rnd() - 0.5) * 7; l.z = (rnd() - 0.3) * 5; }
      dummy.position.set(l.x + Math.sin(t * l.sp + l.ph) * l.am, l.y, l.z + Math.cos(t * l.sp * 0.7 + l.ph) * l.am * 0.6);
      dummy.rotation.set(t * l.sp + l.ph, t * l.sp * 0.6, Math.sin(t + l.ph)); dummy.updateMatrix(); leaves.setMatrixAt(i, dummy.matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;
  }

  /* ---------- světlušky ---------- */
  const ffN = isMobile ? 48 : 140;
  const ffGeo = new THREE.BufferGeometry(); const ffp = new Float32Array(ffN * 3), ffs = new Float32Array(ffN);
  for (let i = 0; i < ffN; i++) { const a = rnd() * 6.28, d = 0.8 + Math.pow(rnd(), 0.7) * 7; ffp[i * 3] = Math.cos(a) * d; ffp[i * 3 + 1] = 0.3 + rnd() * 6.5; ffp[i * 3 + 2] = Math.sin(a) * d; ffs[i] = 0.5 + rnd(); }
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffp, 3)); ffGeo.setAttribute('seed', new THREE.BufferAttribute(ffs, 1));
  const ffMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: uniforms.uTime, uOpacity: { value: 0 }, uScale: { value: 300 } },
    vertexShader: 'attribute float seed; uniform float uTime; uniform float uScale; varying float vA;' +
      'void main(){ vec3 p=position; p.x+=sin(uTime*.35*seed+seed*9.)*.9; p.y+=sin(uTime*.5*seed+seed*5.)*.5; p.z+=cos(uTime*.3*seed+seed*7.)*.9;' +
      'vec4 mv=modelViewMatrix*vec4(p,1.); vA=.35+.65*pow(.5+.5*sin(uTime*(1.2+seed)+seed*20.),2.); gl_PointSize=uScale*.045*vA/(-mv.z)*3.; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform float uOpacity; varying float vA; void main(){ float d=length(gl_PointCoord-.5)*2.; float a=exp(-d*d*4.5)*vA*uOpacity; if(a<.01) discard; gl_FragColor=vec4(vec3(1.,.9,.45)*a,a); }'
  });
  const fireflies = new THREE.Points(ffGeo, ffMat); fireflies.frustumCulled = false; scene.add(fireflies);

  /* ---------- kamera: dráha podle scrollu ---------- */
  const camKeys = [
    [[6.0, 4.8, 15.5], [1.5, 4.8, 0]], [[-5.6, 5.4, 8.6], [0.4, 4.7, 0]], [[3.9, 4.3, 5.6], [1.3, 4.0, 0.2]],
    [[-1.6, 1.7, 7.2], [0.4, 4.3, 0]], [[-6.4, 2.2, 2.8], [0, 3.3, 0.3]], [[2.0, 1.0, 9.8], [0.3, 5.3, 0]]
  ];
  const camCurve = new THREE.CatmullRomCurve3(camKeys.map((k) => new THREE.Vector3(...k[0])), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(camKeys.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');

  /* ---------- stav, resize ---------- */
  let W_ = 1, H_ = 1;
  function resize() {
    W_ = window.innerWidth; H_ = window.innerHeight; renderer.setSize(W_, H_, false);
    camera.aspect = W_ / H_; camera.fov = camera.aspect < 1 ? 62 : 42; camera.updateProjectionMatrix();
    ffMat.uniforms.uScale.value = H_ * dpr * 0.5;
  }
  resize(); window.addEventListener('resize', resize, { passive: true });

  let target = 0, prog = (() => { try { return Math.min(1, Math.max(0, Number(sessionStorage.getItem('thw-prog')) || 0)); } catch (e) { return 0; } })(), mx = 0, my = 0, smx = 0, smy = 0, override = null;
  const readScroll = () => { const m = document.documentElement.scrollHeight - window.innerHeight; target = m > 0 ? MU.clamp(window.scrollY / m, 0, 1) : 0; };
  readScroll(); window.addEventListener('scroll', readScroll, { passive: true });
  if (!reduce) window.addEventListener('pointermove', (e) => { mx = (e.clientX / W_ - 0.5) * 2; my = (e.clientY / H_ - 0.5) * 2; }, { passive: true });
  let zoomTarget = 0, zoomT = 0;
  // cíl kamery v souřadnicích domku: monitor + týpek (na mobilu dál a středem na obě postavy)
  const zCam = new THREE.Vector3(), zTgt = new THREE.Vector3();
  function setZoomGoal() {
    if (W_ < 761 || camera.aspect < 1) { zCam.copy(W(-0.005, 0.74, 2.5)); zTgt.copy(W(-0.005, 0.7, 0.7)); }
    else { zCam.copy(W(-0.01, 0.72, 1.95)); zTgt.copy(W(-0.01, 0.7, 0.7)); }
  }
  const spacerEl = document.getElementById('zoom-spacer');
  const thoughtEl = document.getElementById('thought'), thoughtTxt = thoughtEl && thoughtEl.querySelector('.thought-txt');
  function readZoom() {
    if (!spacerEl || reduce) { zoomTarget = 0; return; }
    const top = spacerEl.getBoundingClientRect().top + window.scrollY, zEnd = top + spacerEl.offsetHeight - H_, y = window.scrollY;
    const up = MU.clamp(y / Math.max(1, zEnd), 0, 1), down = MU.clamp((y - zEnd) / (H_ * 0.8), 0, 1);
    zoomTarget = up * (1 - down * down * (3 - 2 * down));
    root.style.setProperty('--zp', zoomTarget.toFixed(3));
    root.classList.toggle('zoom-end', zoomTarget > 0.85);
    if (screenState !== (zoomTarget > 0.5 ? 1 : 0)) drawScreen(zoomTarget > 0.5 ? 1 : 0);
    if (thoughtTxt) { const t = zoomTarget > 0.5 ? 'Aha! Už vím.' : 'Jak se dělá web…?'; if (thoughtTxt.textContent !== t) thoughtTxt.textContent = t; }
  }
  setZoomGoal(); readZoom(); window.addEventListener('scroll', readZoom, { passive: true }); window.addEventListener('resize', () => { setZoomGoal(); readZoom(); }, { passive: true });
  if (reduce) { drawScreen(1); }
  
  window.__setScenePrg = (p) => { override = p; if (reduce) frame(performance.now(), true); };
  // dotyk: natočení telefonu a tažení prstem nahrazují myš
  if (!reduce) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      mx = MU.clamp(e.gamma / 28, -1, 1); my = MU.clamp((e.beta - 55) / 28, -1, 1);
    }, { passive: true });
  }
  const saveProg = () => { try { sessionStorage.setItem('thw-prog', String(prog)); } catch (e) {} };
  window.addEventListener('pagehide', saveProg); document.addEventListener('visibilitychange', () => { if (document.hidden) saveProg(); });

  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3(), cR = new THREE.Vector3(), tmpCol = new THREE.Color();
  function applyState(p, time, still) {
    const t = MU.smoothstep(p, 0.04, 0.88);
    mix(pal.top, t, skyMat.uniforms.top.value); mix(pal.horizon, t, skyMat.uniforms.hor.value);
    scene.fog.color.copy(skyMat.uniforms.hor.value);
    skyMat.uniforms.sunI.value = 1 - MU.smoothstep(t, 0.15, 0.7);
    skyMat.uniforms.sunDir.value.set(-0.55, 0.1 - t * 0.35, -0.83).normalize();
    hemi.color.copy(mix(pal.hemiSky, t, tmpCol)); hemi.groundColor.copy(mix(pal.hemiGround, t, new THREE.Color())); hemi.intensity = MU.lerp(0.95, 0.42, t);
    sun.color.copy(mix(pal.dir, t, new THREE.Color())); sun.intensity = MU.lerp(1.7, 0.45, t);
    hillMats.forEach((m) => mix(pal.hill, t, m.color)); mix(pal.ground, t, groundMat.color);
    const night = MU.smoothstep(t, 0.25, 1);
    houseLight.intensity = MU.lerp(0.5, 3.0, night); lanternLight.intensity = MU.lerp(0.2, 2.2, night);
    if (!still) { const fl = 1 + Math.sin(time * 7) * 0.03 + Math.sin(time * 13.3) * 0.02; houseLight.intensity *= fl; }
    mix(pal.bulb, night, bulbMat.color); mix(pal.win, night, winMat.color);
    glowPts.material.opacity = MU.lerp(0.12, 0.85, night); winGlow.material.opacity = MU.lerp(0.12, 0.7, night);
    ffMat.uniforms.uOpacity.value = MU.lerp(0.25, 1, night); starMat.opacity = MU.smoothstep(t, 0.4, 0.95);
    moonMat.opacity = moonGlowMat.opacity = 0; moonMat.opacity = MU.smoothstep(t, 0.45, 1); moonGlowMat.opacity = moonMat.opacity * 0.4;
  }

  function camera_(p, time) {
    const s = camCurve.getPoint(p), tg = tgtCurve.getPoint(p);
    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    const ze = reduce ? 0.6 : zoomT * zoomT * (3 - 2 * zoomT);
    tmpP.copy(s).lerp(zCam, ze); tmpT.copy(tg).lerp(zTgt, ze);
    const baseFov = camera.aspect < 1 ? 62 : 42, wantFov = MU.lerp(baseFov, camera.aspect < 1 ? 48 : 30, ze);
    if (Math.abs(camera.fov - wantFov) > 0.01) { camera.fov = wantFov; camera.updateProjectionMatrix(); }
    cR.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const pk = 1 - ze * 0.85; tmpP.addScaledVector(cR, smx * 0.7 * pk); tmpP.y += (-smy * 0.35 + Math.sin(time * 0.25) * (reduce ? 0 : 0.08)) * pk;
    camera.position.copy(tmpP); camera.lookAt(tmpT);
    // posun scény doprava na úvodu (text vlevo), na mobilu níž
    const hf = (1 - MU.smoothstep(p, 0.0, 0.12)) * (reduce ? 1 : 1 - ze);
    if (W_ > 1000) camera.setViewOffset(W_, H_, -W_ * 0.19 * hf, 0, W_, H_);
    else if (W_ <= 760) camera.setViewOffset(W_, H_, 0, H_ * 0.33 * hf, W_, H_);
    else camera.clearViewOffset();
  }


  /* ---------- myšlenková bublina ukotvená na okno (HTML overlay, projekce každý snímek) ---------- */
  const thought = document.getElementById('thought');
  const hintPos = new THREE.Vector3(0.12, 1.05, 0.64);
  const heroVisible = () => (window.scrollY < window.innerHeight * 0.8 || (!!document.getElementById('zoom-spacer') && zoomTarget > 0.02)) && !!document.getElementById('hero-title');
  function updateHint() {
    if (!thought) return;
    const show = heroVisible() && (reduce || zoomT < 0.97);
    thought.classList.toggle('on', show);
    if (!show) return;
    hintPos.set(0.12, 0.92, 0.7); house.localToWorld(hintPos); hintPos.project(camera);
    const x = (hintPos.x * 0.5 + 0.5) * W_, y = (-hintPos.y * 0.5 + 0.5) * H_;
    thought.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
  if (thought) thought.classList.add('is-live');
  if (reduce) { window.addEventListener('scroll', updateHint, { passive: true }); window.addEventListener('resize', updateHint, { passive: true }); }

  /* ---------- smyčka ---------- */
  let last = performance.now(), time = 0, acc = 0, slow = 0, frames = 0, running = true;
  function frame(now, force) {
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (!reduce) time += dt;
    uniforms.uTime.value = reduce ? 3 : time;
    zoomT = reduce ? 0.62 : zoomT + (zoomTarget - zoomT) * (1 - Math.exp(-dt * 5));
    const want = MU.lerp(override != null ? override : target, 0.62, zoomT);
    prog += (want - prog) * (reduce ? 1 : 1 - Math.exp(-dt * 3.2));
    applyState(prog, time, reduce);
    { const zv = reduce ? 0.6 : zoomT * zoomT * (3 - 2 * zoomT), vis = zv < 0.3; if (bulbs.visible !== vis) { bulbs.visible = glowPts.visible = winGlow.visible = vis; lightObjs.forEach((o) => { o.visible = vis; }); } }
    camera_(prog, time);
    { const pulse = reduce ? 1 : 1 + 0.16 * Math.sin(time * 2.4);
      winMat.color.multiplyScalar(pulse); winGlow.material.opacity *= pulse; }
    updateHint();
    if (!reduce) {
      updateLeaves(time, dt);
      ladder.rotation.z = Math.sin(time * 0.9) * 0.025; ladder.rotation.x = Math.sin(time * 0.7 + 1) * 0.02;
      swing.rotation.z = Math.sin(time * 1.1) * 0.12; swing.rotation.x = Math.sin(time * 0.8) * 0.05;
      const f = house.userData.flag; f.rotation.y = Math.sin(time * 3) * 0.35;
    } else if (force || !frame.drawn) { updateLeaves(2, 0); }
    renderer.render(scene, camera); frame.drawn = true;
    // adaptivní rozlišení: při pomalém vykreslování sníží pixel ratio
    if (!reduce && dt > 0.026) slow++; else slow = Math.max(0, slow - 0.2);
    if (slow > 30 && dpr > (isMobile ? 0.85 : 1)) { dpr = Math.max(isMobile ? 0.85 : 1, dpr - 0.2); renderer.setPixelRatio(dpr); resize(); slow = 0; }
  }
  if (reduce) {
    // jeden statický snímek, překreslení jen při změně velikosti
    frame(performance.now(), true);
    window.addEventListener('resize', () => frame(performance.now(), true), { passive: true });
  } else {
    const minDt = isMobile ? 1000 / 40 : 0;
    const loop = (now) => { requestAnimationFrame(loop); if (!running) return; if (now - last < minDt) return; frame(now); };
    requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => { running = !document.hidden; last = performance.now(); });
  }
  root.classList.add('webgl-ready'); window.__sceneReady = true;
}
