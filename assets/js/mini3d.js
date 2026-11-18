/* Malý 3D domek na stromě (ukázka na stránce 3D web): Three.js se načte líně až při zobrazení, pauza mimo viewport. */
(function () {
  var cv = document.querySelector('[data-mini3d]');
  if (!cv || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var started = false;
  new IntersectionObserver(function (en, ob) {
    if (!en[0].isIntersecting || started) return; started = true; ob.disconnect();
    import('three').then(function (T) {
      var r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); r.setSize(cv.width, cv.height, false);
      var s = new T.Scene(), cam = new T.PerspectiveCamera(35, cv.width / cv.height, .1, 50); cam.position.set(0, 2.2, 11); cam.lookAt(0, 1.6, 0);
      s.add(new T.AmbientLight(0xffffff, 1.4)); var d = new T.DirectionalLight(0xffffff, 1.5); d.position.set(4, 8, 6); s.add(d);
      var g = new T.Group(); s.add(g);
      var hullM = new T.MeshBasicMaterial({ color: 0x1b1220, side: T.BackSide });
      function add(geo, col, x, y, z, ry) {
        var m = new T.Mesh(geo, new T.MeshToonMaterial({ color: col })); m.position.set(x, y, z); if (ry) m.rotation.y = ry; g.add(m);
        var h = new T.Mesh(geo, hullM); h.position.copy(m.position); h.rotation.copy(m.rotation); h.scale.setScalar(1.07); g.add(h);
      }
      add(new T.CylinderGeometry(.6, 1, 3, 7), 0x7a4421, 0, 0, 0);
      add(new T.IcosahedronGeometry(2.2, 1), 0x3aa626, 0, 2.6, -.6);
      add(new T.BoxGeometry(1.8, 1.4, 1.5), 0xb97a43, 0, 2.5, .9);
      add(new T.ConeGeometry(1.7, 1, 4), 0x7b3f1c, 0, 3.7, .9, Math.PI / 4);
      var w = new T.Mesh(new T.PlaneGeometry(.7, .55), new T.MeshBasicMaterial({ color: 0xffd42a })); w.position.set(0, 2.5, 1.66); g.add(w);
      var on = true, t0 = performance.now();
      new IntersectionObserver(function (e) { on = e[0].isIntersecting; if (on) requestAnimationFrame(loop); }).observe(cv);
      function loop(n) { if (!on) return; requestAnimationFrame(loop); var t = (n - t0) / 1000; g.rotation.y = Math.sin(t * .6) * .9; g.position.y = Math.sin(t * 1.6) * .08; r.render(s, cam); }
      requestAnimationFrame(loop);
    }).catch(function () {});
  }, { rootMargin: '120px' }).observe(cv);
})();
