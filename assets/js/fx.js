/* Animace stránky (GSAP + ScrollTrigger). Bez GSAP nebo při prefers-reduced-motion zůstává vše statické a viditelné. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var setScrolled = function () { document.documentElement.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.45 || !document.getElementById('hero-title')); };
  setScrolled(); window.addEventListener('scroll', setScrolled, { passive: true });
  var root = document.documentElement;
  if (reduce || !window.gsap || !window.ScrollTrigger) { root.classList.remove('js-anim'); window.__fxReady = true; return; }
  window.__fxReady = true;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var fine = window.matchMedia('(pointer: fine)').matches;

  // Hero – postupný nástup
  var hero = gsap.utils.toArray('[data-hero]');
  if (hero.length) gsap.from(hero, { y: 42, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.15, clearProps: 'transform,opacity' });

  // Odhalení prvků při scrollu
  ST.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.14, overwrite: true }); }
  });
  gsap.utils.toArray('.steps li').forEach(function (li, i) {
    gsap.from(li, { x: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray('.service, .project, .estimate-controls, .estimate-summary, #contact-form, .legal-page, .admin-wrap, .transformation').forEach(function (el) {
    if (el.closest('[data-reveal]')) return;
    gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // Větve – kreslení při scrollu
  gsap.utils.toArray('.branch-divider').forEach(function (svg) {
    var stem = svg.querySelector('path.b');
    var len = stem.getTotalLength();
    gsap.set(stem, { strokeDasharray: len, strokeDashoffset: len });
    var leaves = svg.querySelectorAll('path.l');
    gsap.set(leaves, { scale: 0, transformOrigin: 'center bottom' });
    var tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 92%', end: 'top 45%', scrub: 0.6 } });
    tl.to(stem, { strokeDashoffset: 0, ease: 'none', duration: 1 }).to(leaves, { scale: 1, stagger: 0.06, duration: 0.3, ease: 'back.out(2)' }, 0.2);
  });

  // Ceny – odpočet čísel
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = Number(el.dataset.count), obj = { v: 0 };
    var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); };
    ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(obj, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(obj.v); }, onComplete: function () { el.textContent = fmt(target); } });
    } });
  });

  // Světlo za kurzorem a jemný 3D náklon karet
  if (fine) {
    document.querySelectorAll('.service, .glow').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' });
      gsap.set(el, { transformPerspective: 1200 });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
      });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }
})();
