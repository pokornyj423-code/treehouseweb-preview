/* Animace stránky (GSAP + ScrollTrigger): maskované nadpisy, odhalování, magnetická tlačítka, vlastní kurzor,
   přechody mezi stránkami (wipe se stromem), ovládání 3D scény. Bez GSAP nebo při prefers-reduced-motion zůstává vše statické a viditelné. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var setScrolled = function () { root.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.45 || !document.getElementById('hero-title')); };
  setScrolled(); window.addEventListener('scroll', setScrolled, { passive: true });

  // Posuvník času dne ovládá 3D scénu (3D web)
  var slider = document.querySelector('[data-scene-slider]');
  if (slider) {
    slider.addEventListener('input', function () { if (window.__setScenePrg) window.__setScenePrg(slider.value / 100); });
    var rb = document.querySelector('[data-scene-reset]');
    if (rb) rb.addEventListener('click', function () { slider.value = 0; if (window.__setScenePrg) window.__setScenePrg(null); });
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) { root.classList.remove('js-anim', 'wipe-in'); window.__fxReady = true; return; }
  window.__fxReady = true;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- přechody mezi stránkami ---------- */
  (function () {
    var wipe = document.createElement('div');
    wipe.className = 'wipe'; wipe.setAttribute('aria-hidden', 'true');
    wipe.innerHTML = '<div class="wipe-cols">' + '<i></i>'.repeat(6) + '</div><img class="wipe-mark" src="assets/images/treehouseweb-mark-light.svg" alt="" width="95" height="115">';
    document.body.appendChild(wipe);
    var cols = wipe.querySelectorAll('.wipe-cols i'), mark = wipe.querySelector('.wipe-mark');
    var entering = root.classList.contains('wipe-in');
    gsap.set(cols, { scaleY: entering ? 1 : 0, transformOrigin: entering ? '50% 0%' : '50% 100%' });
    gsap.set(mark, { opacity: entering ? 1 : 0, scale: entering ? 1 : 0.6 });
    if (entering) {
      root.classList.remove('wipe-in'); try { sessionStorage.removeItem('thw-wipe'); } catch (e) {}
      gsap.timeline({ delay: 0.1 }).to(mark, { opacity: 0, scale: 1.2, duration: 0.45, ease: 'power2.in' })
        .to(cols, { scaleY: 0, duration: 0.8, ease: 'power4.inOut', stagger: { each: 0.07, from: 'random' } }, '<0.1');
    }
    var going = false;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || going || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self' || a.hasAttribute('download') || a.getAttribute('aria-disabled') === 'true') return;
      var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
      if (u.pathname === location.pathname && u.search === location.search) return; // kotva na stejné stránce: plynulý scroll
      e.preventDefault(); going = true;
      try { sessionStorage.setItem('thw-wipe', '1'); } catch (err) {}
      gsap.set(cols, { transformOrigin: '50% 100%' });
      gsap.timeline({ onComplete: function () { location.href = a.href; } })
        .to(cols, { scaleY: 1, duration: 0.55, ease: 'power3.in', stagger: { each: 0.05, from: 'edges' } })
        .to(mark, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, '-=0.2');
      setTimeout(function () { location.href = a.href; }, 1800);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { going = false; gsap.set(cols, { scaleY: 0 }); gsap.set(mark, { opacity: 0 }); } });
  })();

  /* ---------- maskované odhalování nadpisů po slovech ---------- */
  function split(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.className = 'wi'; i.textContent = t; w.appendChild(i); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    return el.querySelectorAll('.wi');
  }
  var heads = document.querySelectorAll('[data-split], .section-heading h2, .pricing-head h2, .approach-section h2, .contact-intro h2, .cta-inner h2, .demo-intro h3, .service-row h2, .tl-item h2');
  heads.forEach(function (h) {
    var words = split(h);
    var isHero = h.dataset.split === 'hero';
    var vars = { yPercent: 118, rotate: 5, duration: 1.15, ease: 'power4.out', stagger: 0.07 };
    if (isHero) { vars.delay = 0.25 + (h.tagName === 'H2' ? 0.35 : 0); gsap.from(words, vars); }
    else { vars.scrollTrigger = { trigger: h, start: 'top 88%', once: true }; gsap.from(words, vars); }
  });

  /* ---------- hero, odhalování ---------- */
  var hero = gsap.utils.toArray('[data-hero]');
  if (hero.length) gsap.from(hero, { y: 42, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.5, clearProps: 'transform,opacity' });
  ST.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, overwrite: true }); }
  });
  gsap.utils.toArray('.steps li').forEach(function (li) {
    gsap.from(li, { x: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 92%', once: true } });
  });
  gsap.utils.toArray('.service, .project, .estimate-controls, .estimate-summary, #contact-form, .legal-page, .admin-wrap, .transformation').forEach(function (el) {
    if (el.closest('[data-reveal]')) return;
    gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
  });

  // větve se kreslí při scrollu
  gsap.utils.toArray('.branch-divider').forEach(function (svg) {
    var stem = svg.querySelector('path.b'), len = stem.getTotalLength();
    gsap.set(stem, { strokeDasharray: len, strokeDashoffset: len });
    var leaves = svg.querySelectorAll('path.l');
    gsap.set(leaves, { scale: 0, transformOrigin: 'center bottom' });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 92%', end: 'top 45%', scrub: 0.6 } })
      .to(stem, { strokeDashoffset: 0, ease: 'none', duration: 1 }).to(leaves, { scale: 1, stagger: 0.06, duration: 0.3, ease: 'back.out(2)' }, 0.2);
  });

  // časová osa postupu
  gsap.utils.toArray('.timeline').forEach(function (tl) {
    var fill = document.createElement('span'); fill.className = 'tl-fill'; fill.setAttribute('aria-hidden', 'true'); tl.appendChild(fill);
    gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: 'top', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 } });
  });

  // odpočet cen
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = Number(el.dataset.count), obj = { v: 0 };
    var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); };
    ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
      gsap.to(obj, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(obj.v); }, onComplete: function () { el.textContent = fmt(target); } });
    } });
  });

  /* ---------- jen myš: světlo, náklon, magnetická tlačítka, kurzor ---------- */
  if (fine) {
    document.querySelectorAll('.service, .glow').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' });
      gsap.set(el, { transformPerspective: 1200 });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 7); rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
      });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
    document.querySelectorAll('.button, .header-contact').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.28); qy((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
    // vlastní kurzor (systémový zůstává u polí formuláře)
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring'; dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.append(ring, dot);
    var dx = gsap.quickTo(dot, 'x', { duration: 0.06 }), dy = gsap.quickTo(dot, 'y', { duration: 0.06 });
    var rx2 = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' }), ry2 = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      root.classList.add('has-cursor'); dx(e.clientX); dy(e.clientY); rx2(e.clientX); ry2(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      ring.classList.toggle('is-link', !!(e.target.closest && e.target.closest('a, button, label, summary, [role="button"], input[type="range"]')));
    });
    document.addEventListener('pointerleave', function () { root.classList.remove('has-cursor'); });
  }
})();
