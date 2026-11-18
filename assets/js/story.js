/* „Světlo v okně“: zoom 3D kamery k oknu domku, scénka člověka u počítače (problém) → Tree House Web (řešení) + CTA.
   Dialog s focus trapem, Esc a tlačítkem „Zpět ven“. Při prefers-reduced-motion se kamera nezoomuje a scénka se přepíná bez animací. */
(function () {
  'use strict';
  var dlg = document.getElementById('winview');
  if (!dlg) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var steps = dlg.querySelectorAll('.wv-step'), dots = dlg.querySelectorAll('.wv-dots i');
  var closeBtn = dlg.querySelector('.wv-close'), nextBtn = dlg.querySelector('.wv-next');
  var isOpen = false, opener = null, timer = 0, t2 = 0;
  var bg = [document.querySelector('.site-header'), document.getElementById('main'), document.querySelector('.site-footer')];

  function setStep(n) {
    dlg.classList.toggle('is-solved', n === 2);
    steps.forEach(function (s, i) {
      var on = i === n - 1; s.classList.toggle('is-active', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      s.querySelectorAll('a,button').forEach(function (el) { el.tabIndex = on ? 0 : -1; });
    });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === n - 1); });
    if (n === 2) clearTimeout(timer);
  }
  function open(btn) {
    if (isOpen) return; isOpen = true; opener = btn || document.activeElement;
    dlg.hidden = false; root.classList.add('win-open');
    bg.forEach(function (el) { if (el) el.setAttribute('inert', ''); });
    var scene3d = root.classList.contains('webgl-ready');
    if (window.__zoomWindow) window.__zoomWindow(true);
    setStep(1);
    var delay = reduce || !scene3d ? 0 : 1000;
    t2 = setTimeout(function () {
      dlg.classList.add('is-open'); closeBtn.focus({ preventScroll: true });
      if (!reduce) timer = setTimeout(function () { setStep(2); }, 5600);
    }, delay);
  }
  function close() {
    if (!isOpen) return; isOpen = false; clearTimeout(timer); clearTimeout(t2);
    dlg.classList.remove('is-open'); if (window.__zoomWindow) window.__zoomWindow(false);
    setTimeout(function () {
      dlg.hidden = true; root.classList.remove('win-open');
      bg.forEach(function (el) { if (el) el.removeAttribute('inert'); });
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }, reduce ? 0 : 550);
  }
  document.querySelectorAll('[data-open-window]').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  closeBtn.addEventListener('click', close);
  if (nextBtn) nextBtn.addEventListener('click', function () { setStep(2); var a = dlg.querySelector('.wv-step.is-active a'); if (a) a.focus(); });
  dlg.querySelectorAll('[data-close-window]').forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = [].slice.call(dlg.querySelectorAll('a[href],button')).filter(function (el) { return el.tabIndex >= 0 && !el.closest('[aria-hidden="true"]') && el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.__openWindowStory = function () { open(document.activeElement); };
  setStep(1);
})();
