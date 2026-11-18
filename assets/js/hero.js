/* Hero hlavní stránky: fotka/ilustrace přes celou obrazovku + lehké vrstvy (CSS + canvas 2D).
   Parallax, Ken Burns, dýchání světla v okně a lampiček, světlušky a padající listy, pomalý zoom k oknu při scrollu.
   Bez Three.js. prefers-reduced-motion: statický obrázek (jen vypočtená poloha záře), žádný zoom ani částice. */
(function () {
  'use strict';
  var stage = document.querySelector('[data-ph]');
  if (!stage) return;
  var root = document.documentElement;
  var section = stage.parentElement;
  var img = stage.querySelector('.ph-img');
  var zoomEl = stage.querySelector('.ph-zoom');
  var mist = stage.querySelector('.ph-mist');
  var cv = stage.querySelector('.ph-fx');
  var content = section.querySelector('.ph-content');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mq = window.matchMedia('(max-width: 760px)');
  var cfg = JSON.parse(stage.getAttribute('data-cfg'));
  // cfg: {d:{w:[x,y], p:[x,y], ratio, lamps:[[x,y,r]...]}, m:{...}}  (souřadnice v poměru k obrázku)
  var W = 0, H = 0, X = 0, Y = 0, lampEls = [], mob = mq.matches;

  function layout() {
    mob = mq.matches;
    var c = mob ? cfg.m : cfg.d;
    var r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    var s = Math.max(W / c.ratio, H), dw = s * c.ratio, dh = s;
    var ox = (W - dw) * c.p[0], oy = (H - dh) * c.p[1];
    X = ox + c.w[0] * dw; Y = oy + c.w[1] * dh;
    stage.style.setProperty('--wx', X.toFixed(1) + 'px');
    stage.style.setProperty('--wy', Y.toFixed(1) + 'px');
    stage.style.setProperty('--wr', (dh * 0.20).toFixed(1) + 'px');
    img.style.objectPosition = (c.p[0] * 100) + '% ' + (c.p[1] * 100) + '%';
    // lampičky
    lampEls.forEach(function (e) { e.remove(); }); lampEls = [];
    (c.lamps || []).forEach(function (l, i) {
      var e = document.createElement('i');
      e.className = 'ph-lamp'; e.setAttribute('aria-hidden', 'true');
      e.style.left = (ox + l[0] * dw).toFixed(1) + 'px'; e.style.top = (oy + l[1] * dh).toFixed(1) + 'px';
      e.style.setProperty('--lr', (dh * l[2]).toFixed(1) + 'px'); e.style.animationDelay = (-i * 1.7) + 's';
      zoomEl.appendChild(e); lampEls.push(e);
    });
    sizeCanvas();
  }

  /* ---------- canvas: světlušky + listy ---------- */
  var ctx = cv && cv.getContext ? cv.getContext('2d') : null, dpr = 1, glow, leafSprites = [], flies = [], leaves = [];
  function sprite() {
    glow = document.createElement('canvas'); glow.width = glow.height = 48;
    var g = glow.getContext('2d'), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    gr.addColorStop(0, 'rgba(255,244,190,1)'); gr.addColorStop(.18, 'rgba(255,214,110,.85)'); gr.addColorStop(.5, 'rgba(255,180,70,.22)'); gr.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 48, 48);
    ['#b5b560', '#d9a441', '#86a24f', '#c58a3a'].forEach(function (col) {
      var c = document.createElement('canvas'); c.width = 28; c.height = 28; var q = c.getContext('2d');
      q.translate(14, 14); q.fillStyle = col; q.beginPath(); q.moveTo(-11, 0); q.quadraticCurveTo(0, -11, 11, 0); q.quadraticCurveTo(0, 11, -11, 0); q.fill();
      q.strokeStyle = 'rgba(40,30,10,.55)'; q.lineWidth = 1; q.beginPath(); q.moveTo(-10, 0); q.lineTo(10, 0); q.stroke();
      leafSprites.push(c);
    });
  }
  function seed() {
    var nf = mob ? 12 : 28, nl = mob ? 4 : 9; flies = []; leaves = [];
    for (var i = 0; i < nf; i++) flies.push({ x: Math.random(), y: 0.35 + Math.random() * 0.65, ph: Math.random() * 6.28, sp: 0.15 + Math.random() * 0.35, r: 0.7 + Math.random() * 1.1, bl: 0.4 + Math.random() * 0.9 });
    for (var j = 0; j < nl; j++) leaves.push(newLeaf(true));
  }
  function newLeaf(init) {
    return { x: 0.35 + Math.random() * 0.65, y: init ? Math.random() : -0.05 - Math.random() * 0.1, vy: 0.012 + Math.random() * 0.02, sw: 0.02 + Math.random() * 0.035, ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 1.4, s: 0.7 + Math.random() * 0.7, sp: leafSprites[(Math.random() * leafSprites.length) | 0] };
  }
  function sizeCanvas() {
    if (!ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, mob ? 1 : 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    seed();
  }
  var running = false, last = 0, acc = 0, t0 = performance.now();
  function draw(now) {
    if (!running) return;
    if (root.classList.contains('ph-live')) { running = false; return; }
    requestAnimationFrame(draw);
    var dt = Math.min((now - last) / 1000, 0.1);
    if (mob) { acc += dt; if (acc < 1 / 30) return; dt = acc; acc = 0; }
    last = now;
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, cv.width, cv.height);
    var k = dpr;
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i];
      f.ph += dt * f.sp;
      var x = (f.x + Math.sin(f.ph * 1.3) * 0.035 + Math.sin(f.ph * 0.37) * 0.05) * W;
      var y = (f.y + Math.cos(f.ph * 1.1) * 0.03 - ((t * 0.004 * f.sp) % 1) * 0) * H;
      var a = Math.max(0, Math.sin(t * f.bl * 1.6 + f.ph * 3)); a = a * a;
      var sz = (10 + f.r * 9) * k;
      ctx.globalAlpha = 0.12 + a * 0.88;
      ctx.drawImage(glow, x * k - sz / 2, y * k - sz / 2, sz, sz);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (var j = 0; j < leaves.length; j++) {
      var l = leaves[j];
      l.y += l.vy * dt; l.ph += dt * 0.9; l.rot += l.vr * dt; l.x -= dt * 0.004;
      if (l.y > 1.05) { leaves[j] = newLeaf(false); continue; }
      var lx = (l.x + Math.sin(l.ph) * l.sw) * W, ly = l.y * H, ls = (mob ? 11 : 14) * l.s * k;
      ctx.save(); ctx.translate(lx * k, ly * k); ctx.rotate(l.rot + Math.sin(l.ph * 1.7) * 0.6);
      ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(l.ph * 1.2)));
      ctx.globalAlpha = Math.min(1, (1.0 - l.y) * 4) * 0.85;
      ctx.drawImage(l.sp, -ls / 2, -ls / 2, ls, ls);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  function setRunning(on) {
    if (!ctx || reduce) return;
    if (on && !running) { running = true; last = performance.now(); requestAnimationFrame(draw); }
    else if (!on) running = false;
  }

  /* ---------- scroll zoom + parallax ---------- */
  var tz = 1, z = 1, py = 0, tpy = 0, mx = 0, my = 0, tmx = 0, tmy = 0, pr = 0, raf = 0;
  function target() {
    var sy = window.scrollY, h = stage.offsetHeight || 1;
    pr = Math.min(Math.max(sy / (h * 0.95), 0), 1);
    var e = pr * pr * (3 - 2 * pr);
    tz = 1 + e * (mob ? 0.75 : 0.95);
    tpy = Math.min(sy, h) * 0.18;
    if (content) {
      content.style.opacity = String(Math.max(0, 1 - pr * 1.5).toFixed(3));
      content.style.transform = 'translate3d(0,' + (-pr * 36).toFixed(1) + 'px,0)';
    }
  }
  function tick() {
    raf = 0;
    var k = 0.09;
    z += (tz - z) * k; py += (tpy - py) * k; mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    zoomEl.style.transform = 'translate3d(' + (mx * -10).toFixed(2) + 'px,' + (py + my * -6).toFixed(2) + 'px,0) scale(' + z.toFixed(4) + ')';
    if (mist) mist.style.transform = 'translate3d(' + (mx * -22).toFixed(2) + 'px,' + (py * 0.6 + my * -10).toFixed(2) + 'px,0)';
    if (cv) cv.style.transform = 'translate3d(' + (mx * -30).toFixed(2) + 'px,' + (py * 0.85 + my * -14).toFixed(2) + 'px,0)';
    if (Math.abs(tz - z) > 0.0006 || Math.abs(tpy - py) > 0.1 || Math.abs(tmx - mx) > 0.002 || Math.abs(tmy - my) > 0.002) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  /* ---------- start ---------- */
  layout();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); target(); kick(); }, 120); }, { passive: true });
  if (img.complete) root.classList.add('ph-ready'); else img.addEventListener('load', function () { root.classList.add('ph-ready'); }, { once: true });
  img.addEventListener('error', function () { root.classList.add('ph-ready'); });
  if (reduce) { root.classList.add('ph-static'); return; }
  (function loadScene() {
    var ok = false; try { var c = document.createElement('canvas'); ok = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) {}
    if (!ok || navigator.connection && navigator.connection.saveData) return;
    var go = function () { import('./scene-kid.js').catch(function () { root.classList.remove('ph-live'); }); };
    var idle = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(go, { timeout: 1500 }); };
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });
  })();
  sprite(); sizeCanvas();
  target(); z = tz; tick();
  window.addEventListener('scroll', function () { target(); kick(); }, { passive: true });
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      if (window.scrollY > H) return;
      tmx = (e.clientX / window.innerWidth - 0.5) * 2; tmy = (e.clientY / window.innerHeight - 0.5) * 2; kick();
    }, { passive: true });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { setRunning(en[0].isIntersecting && !document.hidden); }, { threshold: 0 }).observe(section);
  } else setRunning(true);
  document.addEventListener('visibilitychange', function () { setRunning(!document.hidden); });
  mq.addEventListener && mq.addEventListener('change', function () { layout(); target(); kick(); });
})();
