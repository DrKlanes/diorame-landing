/* diorame.com · site.js (compartido ES / EN). Sin dependencias. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Idioma: recordar la elección ─────────────────────────────── */
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('diorame-lang', a.getAttribute('lang')); } catch (e) {}
    });
  });

  /* ── Móvil: enviarse el enlace (Diorame no funciona en móvil) ──── */
  var share = document.getElementById('share-btn');
  if (share) {
    share.addEventListener('click', function () {
      var url = 'https://diorame.com/';
      var done = function () {
        var label = share.firstChild;
        label.textContent = share.dataset.done + ' ';
      };
      if (navigator.share) {
        navigator.share({ title: 'Diorame', text: document.title, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(done, function () {});
      }
    });
  }

  /* ── Nav: filete al despegarse ─────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (nav) {
    var onNav = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onNav(); window.addEventListener('scroll', onNav, { passive: true });
  }

  /* ── Menú móvil ────────────────────────────────────────────────── */
  var mbtn = document.getElementById('menu-btn'), mpanel = document.getElementById('menu-panel');
  if (mbtn && mpanel) {
    var setMenu = function (open) {
      mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      mbtn.setAttribute('aria-label', open ? (mbtn.dataset.close || 'Close menu') : (mbtn.dataset.open || 'Abrir menú'));
      mpanel.hidden = !open;
    };
    mbtn.dataset.open = mbtn.getAttribute('aria-label');
    mbtn.addEventListener('click', function () { setMenu(mbtn.getAttribute('aria-expanded') !== 'true'); });
    mpanel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) { if (!mpanel.hidden && !nav.contains(e.target)) setMenu(false); });
  }

  /* ── Volver arriba: aparece pasado el primer pantallazo ─────────── */
  var toTop = document.getElementById('to-top');
  if (toTop) {
    var onTop = function () { toTop.classList.toggle('is-on', window.scrollY > window.innerHeight * 1.2); };
    onTop(); window.addEventListener('scroll', onTop, { passive: true });
  }

  /* ── Aparición al hacer scroll ─────────────────────────────────── */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Movimiento compartido: ratón (o balanceo) → --mx / --my ──────
     Lo usan el diorama del hero y la tipografía en capas (.inks). */
  var root = document.documentElement;
  var dio = document.getElementById('dio');
  var heroInks = document.querySelector('.hero .inks');
  var bandInks = document.getElementById('band-inks');
  var m = { x: 0, y: 0 }, mc = { x: 0, y: 0 }, mouse = null;
  var cur = { rx: 8, ry: -20, sep: 80 };
  var t0 = performance.now();
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  if (reduce) {
    if (dio) { dio.style.setProperty('--sep', '90px'); }
  } else {
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        mouse = { x: e.clientX / window.innerWidth * 2 - 1, y: e.clientY / window.innerHeight * 2 - 1 };
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', function () { mouse = null; });
    }

    var frame = function (now) {
      var t = (now - t0) / 1000;
      if (mouse) { m.x = mouse.x; m.y = mouse.y; }
      else { m.x = Math.sin(t * 0.45) * 0.6; m.y = Math.sin(t * 0.31) * 0.4; }
      mc.x += (m.x - mc.x) * 0.08;
      mc.y += (m.y - mc.y) * 0.08;
      root.style.setProperty('--mx', mc.x.toFixed(3));
      root.style.setProperty('--my', mc.y.toFixed(3));
      var vh = window.innerHeight;

      /* diorama: el scroll separa las capas */
      if (dio) {
        var r = dio.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          var p = clamp((vh * 0.5 - (r.top + r.height * 0.5)) / (vh * 0.7), 0, 1);
          var w = Math.min(1, dio.offsetWidth / 900);
          var tsep = (80 + p * 130) * w;
          var try_ = -20 + mc.x * 16;
          var trx = 8 - mc.y * 8 + p * 12;
          cur.rx += (trx - cur.rx) * 0.1;
          cur.ry += (try_ - cur.ry) * 0.1;
          cur.sep += (tsep - cur.sep) * 0.1;
          dio.style.setProperty('--rx', cur.rx.toFixed(2) + 'deg');
          dio.style.setProperty('--ry', cur.ry.toFixed(2) + 'deg');
          dio.style.setProperty('--sep', cur.sep.toFixed(1) + 'px');
          if (heroInks) heroInks.style.setProperty('--reg', (1 + p * 1.6).toFixed(3));
        }
      }
      /* banda: las pasadas de tinta entran en registro al llegar al centro */
      if (bandInks) {
        var b = bandInks.getBoundingClientRect();
        if (b.bottom > 0 && b.top < vh) {
          var d = Math.abs((b.top + b.height / 2) - vh / 2) / (vh / 2);
          bandInks.style.setProperty('--reg', (0.35 + clamp(d, 0, 1.2) * 1.4).toFixed(3));
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ── Super Riso: técnicas ─────────────────────────────────────── */
  var plate = document.getElementById('plate');
  if (plate) {
    var img = document.getElementById('plate-img');
    var tag = document.getElementById('plate-tag');
    var techs = document.querySelectorAll('.sr .tech');
    techs.forEach(function (b) {
      b.addEventListener('pointerenter', function () { var i = new Image(); i.src = b.dataset.big; }, { once: true });
      b.addEventListener('click', function () {
        img.srcset = b.dataset.src + ' 960w, ' + b.dataset.big + ' 1600w';
        img.src = b.dataset.src;
        img.alt = b.dataset.alt;
        tag.textContent = b.dataset.label;
        plate.dataset.big = b.dataset.big;
        techs.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      });
    });
    if (!finePointer) {
      var ht = document.getElementById('sr-hint-text');
      if (ht) ht.textContent = ht.dataset.touch;
    }
  }

  /* ── Dibuja: Blob o Brush ──────────────────────────────────────── */
  var dv = document.getElementById('draw-video');
  if (dv) {
    var dtag = document.getElementById('draw-tag');
    var tools = document.querySelectorAll('.draw .tech');
    tools.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        dv.poster = b.dataset.poster;
        dv.setAttribute('aria-label', b.dataset.alt);
        dv.src = b.dataset.video;
        dv.load();
        if (!reduce) { var pr = dv.play(); if (pr && pr.catch) pr.catch(function () {}); }
        dtag.textContent = b.dataset.label;
        tools.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      });
    });
  }

  /* ── Lupa ×2,4 sobre cualquier lámina con data-big ─────────────────
     Con ratón sigue al cursor; en táctil, un toque la muestra un momento. */
  document.querySelectorAll('.plate[data-big]').forEach(function (pl) {
    var loupe = pl.querySelector('.loupe');
    if (!loupe) return;
    var Z = 2.4, hideT = null;
    if (!finePointer) loupe.style.setProperty('--s', '160px');
    var place = function (cx, cy) {
      var r = pl.getBoundingClientRect();
      var x = cx - r.left, y = cy - r.top, s = loupe.offsetWidth;
      loupe.style.backgroundImage = 'url("' + pl.dataset.big + '")';
      loupe.style.backgroundSize = (r.width * Z) + 'px ' + (r.height * Z) + 'px';
      loupe.style.backgroundPosition = (s / 2 - x * Z) + 'px ' + (s / 2 - y * Z) + 'px';
      loupe.style.left = x + 'px';
      loupe.style.top = y + 'px';
      loupe.classList.add('is-on');
    };
    pl.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') place(e.clientX, e.clientY); });
    pl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') loupe.classList.remove('is-on'); });
    pl.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse') return;
      place(e.clientX, e.clientY);
      clearTimeout(hideT);
      hideT = setTimeout(function () { loupe.classList.remove('is-on'); }, 2200);
    });
  });

  /* ── Vídeos: solo se cargan y reproducen cuando se ven ─────────── */
  var vids = document.querySelectorAll('video.js-autoplay');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (!reduce) { v.preload = 'auto'; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } }
        else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ── Anima: flipbook con papel cebolla ─────────────────────────── */
  var flip = document.getElementById('flip');
  if (flip) {
    var bee = flip.querySelector('.flip-bee');
    var g1 = flip.querySelector('.g1'), g2 = flip.querySelector('.g2');
    var count = document.getElementById('flip-count');
    var N = 8, fi = 0, dir = 1, fps = 8, mode = 'loop', timer = null, onScreen = false;
    /* trayectoria en % del escenario: vuelo con subidas y bajadas */
    var pos = function (i) {
      var u = i / (N - 1);
      return { x: 6 + u * 66, y: 34 + Math.sin(u * Math.PI * 2) * -20, r: Math.sin(u * Math.PI * 2 + 1) * 10 + (i % 2 ? 4 : -4) };
    };
    var put = function (el, i) {
      var p = pos(i);
      el.style.left = p.x + '%';
      el.style.top = p.y + '%';
      el.style.transform = 'rotate(' + p.r.toFixed(1) + 'deg)';
    };
    var step = function () {
      var prev = fi - dir, prev2 = fi - 2 * dir;
      put(bee, fi);
      if (prev >= 0 && prev < N) { g1.style.visibility = 'visible'; put(g1, prev); } else g1.style.visibility = 'hidden';
      if (prev2 >= 0 && prev2 < N) { g2.style.visibility = 'visible'; put(g2, prev2); } else g2.style.visibility = 'hidden';
      count.textContent = (fi + 1) + ' / ' + N;
      if (mode === 'loop') { fi = (fi + 1) % N; dir = 1; }
      else { if (fi + dir >= N || fi + dir < 0) dir = -dir; fi += dir; }
    };
    var run = function () { clearInterval(timer); timer = null; if (onScreen && !reduce) timer = setInterval(step, 1000 / fps); };
    step();
    flip.querySelectorAll('[data-fps]').forEach(function (b) {
      b.addEventListener('click', function () {
        fps = +b.dataset.fps; run();
        flip.querySelectorAll('[data-fps]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      });
    });
    flip.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.mode; fi = 0; dir = 1;
        flip.querySelectorAll('[data-mode]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      });
    });
    var onion = document.getElementById('flip-onion');
    onion.addEventListener('click', function () {
      var on = onion.getAttribute('aria-pressed') !== 'true';
      onion.setAttribute('aria-pressed', on ? 'true' : 'false');
      flip.classList.toggle('no-onion', !on);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; run(); }).observe(flip);
    } else { onScreen = true; run(); }
  }

  /* ── Imprime: elegir el papel de la página ─────────────────────── */
  var papers = document.querySelectorAll('.paper');
  papers.forEach(function (b) {
    b.style.setProperty('--g', 'url("../assets/paper/' + b.dataset.paper + '-1024.webp")');
    b.addEventListener('click', function () {
      root.style.setProperty('--grain', 'url("../assets/paper/' + b.dataset.paper + '-1024.webp")');
      root.style.setProperty('--paper', b.dataset.color);
      papers.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });
})();
