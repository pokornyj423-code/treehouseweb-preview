/* Mobilní fullscreen menu: aria-expanded, focus trap, Esc, zamknutí scrollu, zavření po kliknutí / změně velikosti. */
(function () {
  'use strict';
  var btn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  if (!btn || !nav) return;
  var mq = window.matchMedia('(max-width: 980px)');
  var main = document.getElementById('main');
  var footer = document.querySelector('.site-footer');
  var open = false, lastScroll = 0;
  function focusables() { return [btn].concat([].slice.call(nav.querySelectorAll('a[href]'))).filter(function (el) { return el.offsetParent !== null || el === btn; }); }
  function set(state) {
    open = state;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Zavřít navigaci' : 'Otevřít navigaci');
    btn.title = btn.getAttribute('aria-label');
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    [main, footer].forEach(function (el) { if (!el) return; if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    if (open) { var first = nav.querySelector('a[href]'); if (first && mq.matches) setTimeout(function () { first.focus(); }, 60); }
  }
  btn.addEventListener('click', function () { set(!open); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { set(false); btn.focus(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  var onChange = function () { if (!mq.matches && open) set(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
  window.addEventListener('pageshow', function () { if (open) set(false); });
})();
