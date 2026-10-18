/* NomadSwipe landing: swipe demo deck. Physics use the app's own Discover numbers. */
(function () {
  'use strict';
  var sec = document.getElementById('demo');
  var deck = sec && sec.querySelector('[data-deck]');
  if (!deck || !('animate' in Element.prototype)) return;

  var root = document.documentElement;
  var DESK = matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)');
  var cards = [].slice.call(deck.querySelectorAll('.deck-card'));
  var end = deck.querySelector('.deck-end');
  var ctl = sec.querySelector('.deck-ctl');
  var live = sec.querySelector('.deck-live');
  var toast = sec.querySelector('.deck-toast');
  var count = sec.querySelector('.deck-count');
  var slotsEl = [].slice.call(sec.querySelectorAll('.deck-tray li'));
  var cs = getComputedStyle(root);
  function tok(n, f) { var v = cs.getPropertyValue(n).trim(); return v || f; }
  var LIN = CSS.supports('transition-timing-function', 'linear(0, 1)');
  var E = {
    arrive: tok('--arrive', 'cubic-bezier(.16,1,.3,1)'),
    leave: tok('--leave', 'cubic-bezier(.7,0,.84,0)'),
    move: tok('--move', 'cubic-bezier(.65,0,.35,1)'),
    snap: LIN ? tok('--sp-snap', 'cubic-bezier(.25,.9,.4,1)') : 'cubic-bezier(.25,.9,.4,1)',
    throw: 'cubic-bezier(.25,.9,.4,1)'
  };
  var SS = parseFloat(tok('--slot-scale', '.038')), SY = parseFloat(tok('--slot-y', '13')), SF = parseFloat(tok('--slot-fade', '.08'));
  // App springs {damping, stiffness, mass}: SNAP is the Discover snap-back, RISE the kit HERO spring.
  var SNAP = { c: 20, k: 220, m: 0.8, clamp: true }, PRESS = { c: 16, k: 380, m: 1 }, RELEASE = { c: 20, k: 280, m: 1 },
    RISE = { c: 18, k: 100, m: 1 }, FOLLOW = { c: 26, k: 420, m: 1 };
  var W = deck.offsetWidth || 340;
  // Rotation or a 600/900px breakpoint changes the card width: thresholds and fly-out read W.
  var rz = 0;
  addEventListener('resize', function () {
    if (rz) return;
    rz = requestAnimationFrame(function () { rz = 0; W = deck.offsetWidth || 340; if (!drag && !exiting) layout(null); });
  }, { passive: true });
  function motion() { return root.classList.contains('motion'); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---- spring integrator: semi-implicit Euler, fixed 1/120 s substeps ---- */
  function S(p, eps) { return { p: p, v: 0, t: p, on: false, wait: 0, cfg: RISE, side: 0, eps: eps }; }
  function aim(s, t, cfg, wait, v) {
    s.t = t; s.cfg = cfg; s.wait = (wait || 0) / 1000; if (v !== undefined) s.v = v;
    s.side = Math.sign(s.p - t); s.on = Math.abs(s.p - t) > s.eps || Math.abs(s.v) > s.eps;
  }
  function stepS(s, h) {
    if (s.wait > 0) { s.wait -= h; return; }
    var c = s.cfg; s.v += ((-c.k * (s.p - s.t)) - c.c * s.v) / c.m * h; s.p += s.v * h;
    if ((c.clamp && s.side && Math.sign(s.p - s.t) !== s.side) || (Math.abs(s.p - s.t) < s.eps && Math.abs(s.v) < s.eps * 20)) { s.p = s.t; s.v = 0; s.on = false; }
  }
  var KEYS = ['X', 'Y', 'S', 'O', 'R', 'P'];
  var M = new Map();
  function slot(i) { var j = Math.min(i, 3); return { X: 0, Y: j * SY, S: 1 - j * SS, O: i <= 2 ? 1 - i * SF : 0, R: 0 }; }
  function model(el) {
    var m = { X: S(0, 0.05), Y: S(0, 0.05), S: S(1, 0.0004), O: S(0, 0.001), R: S(0, 0.01), P: S(1, 0.0004), vis: null, el: el };
    if (el !== end) {
      var tint = document.createElement('span'); tint.className = 'deck-tint'; tint.setAttribute('aria-hidden', 'true');
      var a = document.createElement('span'); a.className = 'deck-stamp deck-stamp--save'; a.textContent = 'SAVE'; a.setAttribute('aria-hidden', 'true');
      var b = document.createElement('span'); b.className = 'deck-stamp deck-stamp--skip'; b.textContent = 'SKIP'; b.setAttribute('aria-hidden', 'true');
      el.append(tint, a, b); m.tint = tint; m.save = a; m.skip = b; m.sign = 0;
    }
    M.set(el, m); return m;
  }
  function place(el, pose) { var m = M.get(el); KEYS.forEach(function (k) { if (k in pose) { m[k].p = m[k].t = pose[k]; m[k].v = 0; m[k].on = false; } }); write(el); }
  function tf(x, y, rot, sc) { return 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + rot.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')'; }
  function rotOf(m) { return motion() ? m.X.p * 14 / W + m.R.p : 0; }
  function write(el) {
    var m = M.get(el), o = clamp(m.O.p, 0, 1);
    el.style.transform = tf(m.X.p, m.Y.p, rotOf(m), m.S.p * m.P.p);
    el.style.opacity = o.toFixed(3);
    var tone = Math.min(2, Math.round((1 - m.S.p) / SS)); // depth by tone step, not shadow; set only on slot change
    if (tone !== m.tone) { m.tone = tone; el.style.filter = tone ? 'brightness(' + (1 - tone * 0.03) + ')' : ''; }
    var vis = o < 0.002 ? 'hidden' : '';
    if (vis !== m.vis) { el.style.visibility = vis; m.vis = vis; }
    if (m.save) {
      var r = m.quiet ? 0 : clamp(Math.abs(m.X.p) / (0.24 * W), 0, 1), sg = Math.sign(m.X.p);
      if (sg && sg !== m.sign) { m.sign = sg; m.tint.classList.toggle('is-skip', sg < 0); }
      m.save.style.opacity = sg > 0 ? r.toFixed(3) : 0;
      m.skip.style.opacity = sg < 0 ? r.toFixed(3) : 0;
      m.tint.style.opacity = (r * 0.05).toFixed(3);
    }
  }

  /* ---- one rAF loop, alive only while a pointer is down or a spring moves ---- */
  var raf = 0, last = 0, acc = 0, H = 1 / 120, moving = new Set();
  function kick(el) { if (el) moving.add(el); if (!raf && !document.hidden) { last = performance.now(); acc = 0; raf = requestAnimationFrame(tick); } }
  function tick(now) {
    raf = -1; // truthy while ticking, so kick() inside this tick only enlists
    acc += clamp((now - last) / 1000, 0, 1 / 30); last = now;
    var n = 0; while (acc >= H) { acc -= H; n++; }
    if (drag && drag.live) dragFrame();
    moving.forEach(function (el) {
      var m = M.get(el), on = false;
      for (var k = 0; k < 6; k++) { var s = m[KEYS[k]]; if (s.on) { for (var i = 0; i < n && s.on; i++) stepS(s, H); on = on || s.on; } }
      write(el);
      if (!on && !(drag && drag.el === el)) moving.delete(el);
    });
    raf = moving.size || drag ? requestAnimationFrame(tick) : 0;
  }

  /* ---- deck state ---- */
  var gen = 0, top = 0, saved = [], flying = [], queued = null, exiting = 0, done = false, touched = false;
  function stack() { var s = cards.slice(top); s.push(end); return s; }
  // .is-next lets the card beneath show its text while it rises (CSS hides covered back-card text).
  function next(on) { var n = stack()[1]; if (n) n.classList.toggle('is-next', on); }
  function layout(cfg, wait, stagger) {
    stack().forEach(function (el, i) {
      var m = M.get(el), p = slot(i);
      el.style.zIndex = 20 - i; el.classList.remove('is-next');
      if (i === 0) el.removeAttribute('inert'); else el.setAttribute('inert', '');
      if (!cfg) { place(el, p); return; }
      ['X', 'Y', 'S', 'O', 'R'].forEach(function (k) { aim(m[k], p[k], cfg, (wait || 0) + i * (stagger || 0)); });
      kick(el);
    });
  }

  /* ---- drag: pointermove stores samples, one rAF writes ---- */
  var drag = null;
  deck.addEventListener('pointerdown', function (e) {
    if (done || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    var el = e.target.closest('.deck-card');
    if (!el || el !== cards[top]) return;
    touched = true; cancelHint(); next(true);
    var m = M.get(el); m.quiet = false;
    drag = { el: el, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: m.X.p, dy: 0, live: false, s: [], rm: !motion() };
    drag.bx = m.X.p; drag.by = m.Y.p;
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ }
    if (!drag.rm) { aim(m.P, 0.985, PRESS); kick(el); }
  }, { passive: true });
  deck.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.live) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { drag.live = true; drag.x0 += Math.sign(dx) * 8; dx -= Math.sign(dx) * 8; drag.el.classList.add('is-drag'); }
      else if (Math.abs(dy) > 8) { abandon(e); return; }
      else return;
    }
    drag.dx = dx; drag.dy = dy;
    var t = e.timeStamp; drag.s.push([t, dx]);
    while (drag.s.length > 2 && t - drag.s[0][0] > 80) drag.s.shift();
    kick(drag.el);
  }, { passive: true });
  deck.addEventListener('pointerup', release, { passive: true });
  deck.addEventListener('pointercancel', function (e) { if (drag && e.pointerId === drag.id) { drag.live = false; settle(drag.el, 0); drag = null; } }, { passive: true });
  function abandon(e) {
    try { drag.el.releasePointerCapture(e.pointerId); } catch (_) { /* not captured */ }
    var m = M.get(drag.el); aim(m.P, 1, RELEASE); kick(drag.el); drag = null; next(false);
  }
  function dragFrame() {
    var m = M.get(drag.el);
    m.X.p = drag.bx + drag.dx; m.Y.p = drag.by + drag.dy * 0.25; m.X.on = m.Y.on = false;
    if (drag.rm) return;
    follow(Math.min(1, Math.abs(m.X.p) / (0.24 * W)));
  }
  // Follow-through: the cards beneath rise toward the next slot as the top card travels.
  function follow(p) {
    stack().slice(1, 4).forEach(function (el, j) {
      var i = j + 1, a = slot(i), b = slot(i - 1), m = M.get(el);
      aim(m.Y, a.Y + (b.Y - a.Y) * p, FOLLOW); aim(m.S, a.S + (b.S - a.S) * p, FOLLOW); aim(m.O, a.O + (b.O - a.O) * p, FOLLOW);
      kick(el);
    });
  }
  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag, m = M.get(d.el); drag = null;
    d.el.classList.remove('is-drag');
    if (!d.live) { aim(m.P, 1, RELEASE); kick(d.el); next(false); return; }
    var x = d.bx + d.dx, s = d.s, vx = 0; // not m.X.p: the last move may not have reached a frame yet
    if (s.length > 1) { var a = s[0], b = s[s.length - 1]; if (b[0] > a[0]) vx = (b[1] - a[1]) / (b[0] - a[0]) * 1000; }
    if (Math.abs(x) > 0.24 * W || (Math.abs(vx) > 800 && Math.sign(vx) === Math.sign(x))) commit(x > 0 ? 1 : -1, { vx: vx, drag: true });
    else settle(d.el, vx);
  }
  function settle(el, vx) {
    var m = M.get(el);
    el.classList.remove('is-drag'); next(false);
    aim(m.X, 0, SNAP, 0, vx); aim(m.Y, 0, SNAP); aim(m.P, 1, RELEASE);
    kick(el);
    stack().slice(1).forEach(function (c, j) { var p = slot(j + 1), n = M.get(c); aim(n.Y, p.Y, SNAP); aim(n.S, p.S, SNAP); aim(n.O, p.O, SNAP); kick(c); });
  }

  /* ---- commit: event first (card still in place), then the exit ---- */
  function commit(dir, o) {
    o = o || {};
    if (done || top >= cards.length) return;
    var el = cards[top], m = M.get(el), id = el.getAttribute('data-id'), name = el.querySelector('h3').textContent;
    var isSave = dir > 0, rm = !motion();
    if (isSave) saved.push(id);
    document.dispatchEvent(new CustomEvent('deck:swipe', { detail: { dir: isSave ? 'save' : 'skip', id: id, saved: saved.length } }));
    live.textContent = isSave ? 'Saved ' + name + '. ' + saved.length + (saved.length === 1 ? ' place' : ' places') + ' in your trip.' : 'Skipped ' + name + '.';
    if (isSave && !DESK.matches) { flyToTray(el, saved.length - 1, rm); showToast(); }
    var lastCard = top === cards.length - 1;
    top++;
    if (top > cards.length - 3) buildEnd(); // the end card peeks from slot 2, so keep its copy current
    if (lastCard) { end.hidden = false; done = true; ctl.setAttribute('inert', ''); queued = null; }
    KEYS.forEach(function (k) { m[k].on = false; });
    moving.delete(el);
    el.style.zIndex = 30; el.setAttribute('inert', ''); el.classList.add('is-exiting');
    var from = tf(m.X.p, m.Y.p, rotOf(m), m.S.p * m.P.p), anim;
    var off = 1.35 * W * dir, rot = rm ? 0 : 18.9 * dir;
    exiting++;
    if (rm) {
      anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
    } else if (o.drag) {
      var rem = Math.abs(off - m.X.p), dur = clamp(rem / Math.max(Math.abs(o.vx), 1.35 * W / 0.15) * 1000, 120, 220);
      stamp(m, dir, 0);
      anim = el.animate([{ transform: from, opacity: 1 }, { opacity: 1, offset: 0.6 }, { transform: tf(off, m.Y.p, rot + m.R.p, 0.985), opacity: 0 }], { duration: dur, easing: E.throw, fill: 'forwards' });
    } else {
      var ax = -10 * dir;
      stamp(m, dir, 80);
      anim = el.animate([
        { transform: from, opacity: 1, easing: E.move },
        { transform: tf(ax, 0, ax * 14 / W, 1), opacity: 1, offset: 0.25, easing: E.leave },
        { opacity: 1, offset: 0.7 },
        { transform: tf(off, 0, rot, 1), opacity: 0 }
      ], { duration: 320, fill: 'forwards' });
    }
    flying.push(anim);
    var g = gen;
    // Promotion: the next card is live the moment its spring starts.
    if (rm) layout(null); else layout(RISE, o.drag ? 0 : 80, 40);
    if (lastCard) riseRows(rm, o.drag ? 0 : 80);
    anim.finished.then(function () {
      el.classList.remove('is-exiting');
      flying.splice(flying.indexOf(anim), 1); exiting--;
      [m.save, m.skip, m.tint].forEach(function (x) { x.getAnimations().forEach(function (a) { a.cancel(); }); });
      if (g !== gen) return;
      anim.cancel(); place(el, { X: off, Y: 0, S: 1, O: 0, R: 0, P: 1 }); el.style.zIndex = '';
      if (lastCard) {
        document.dispatchEvent(new CustomEvent('deck:done', { detail: { saved: saved.slice() } }));
        if (!o.drag) end.querySelector('h3').focus({ preventScroll: true });
      } else if (queued !== null && !exiting) { var q = queued; queued = null; commit(q, { key: true }); }
    }, function () { exiting--; el.classList.remove('is-exiting'); });
  }
  function stamp(m, dir, delay) {
    var el = dir > 0 ? m.save : m.skip;
    el.animate([{ opacity: el.style.opacity || 0 }, { opacity: 1 }], { duration: 60, delay: delay, fill: 'forwards' });
    m.tint.classList.toggle('is-skip', dir < 0);
    m.tint.animate([{ opacity: m.tint.style.opacity || 0 }, { opacity: 0.05 }], { duration: 80, delay: delay, fill: 'forwards' });
  }
  function press(dir) {
    if (done) return;
    touched = true; cancelHint();
    if (exiting) { if (queued === null) queued = dir; return; } // buffer one press
    next(true); commit(dir, { key: true });
  }
  ctl.querySelector('[data-deck-skip]').addEventListener('click', function () { press(-1); });
  ctl.querySelector('[data-deck-save]').addEventListener('click', function () { press(1); });
  deck.addEventListener('keydown', function (e) {
    if (e.target !== deck || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault(); press(e.key === 'ArrowRight' ? 1 : -1);
  });

  /* ---- thumbnails, tray flight, toast ---- */
  function thumb(card, cls) {
    var img = card.querySelector('figure img'), t;
    if (img) { t = document.createElement('img'); t.src = img.currentSrc || img.src; t.alt = ''; t.width = 40; t.height = 40; t.decoding = 'async'; }
    else { t = document.createElement('span'); t.textContent = card.querySelector('h3').textContent.charAt(0); }
    t.className = cls; t.setAttribute('aria-hidden', 'true');
    return t;
  }
  function flyToTray(card, i, rm) {
    var li = slotsEl[i]; if (!li) return;
    var g = gen, n = saved.length;
    var fill = function () { if (g !== gen) return; li.textContent = ''; li.appendChild(thumb(card, 'deck-thumb')); li.classList.add('is-full'); if (rm) { tick2(n, rm); li.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }); } };
    if (rm) { fill(); return; }
    setTimeout(function () { if (g === gen) tick2(n, rm); }, 320); // the 100ms roll-out lands the new count as the thumb lands (420ms)
    var src = (card.querySelector('figure') || card.querySelector('.deck-card__type')).getBoundingClientRect(), dst = li.getBoundingClientRect();
    var f = thumb(card, 'deck-fly'), x0 = src.left + src.width / 2 - 28, y0 = src.top + src.height / 2 - 28;
    var x1 = dst.left + dst.width / 2 - 28, y1 = dst.top + dst.height / 2 - 28, k = dst.width / 56;
    f.width = 56; f.height = 56; sec.appendChild(f); // inside #demo, under .deck-ctl, so it passes behind the buttons
    var a = f.animate([
      { transform: 'translate3d(' + x0 + 'px,' + y0 + 'px,0) scale(1)', opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { transform: 'translate3d(' + (x0 + x1) / 2 + 'px,' + ((y0 + y1) / 2 - 24) + 'px,0) scale(' + (1 + k) / 2 + ')', offset: 0.5 },
      { transform: 'translate3d(' + x1 + 'px,' + y1 + 'px,0) scale(' + k + ')', opacity: 1 }
    ], { duration: 420, easing: E.move });
    a.finished.then(function () { f.remove(); fill(); }, function () { f.remove(); });
  }
  function setCount() { count.textContent = ''; var z = document.createElement('span'); z.textContent = '0'; count.appendChild(z); }
  function tick2(n, rm) {
    var old = count.firstElementChild || count, nu = document.createElement('span'); nu.textContent = n;
    if (rm || !count.firstElementChild) { count.textContent = ''; count.appendChild(nu); return; }
    old.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-8px)', opacity: 0 }], { duration: 100, easing: E.leave }).finished.then(function () {
      count.textContent = ''; count.appendChild(nu);
      nu.animate([{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: E.arrive });
    }, function () {});
  }
  var toastAnim = null;
  function showToast() {
    if (toastAnim) toastAnim.cancel();
    toastAnim = toast.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none', offset: 180 / 2160 }, { opacity: 1, transform: 'none', offset: 1980 / 2160 }, { opacity: 0, transform: 'none' }], { duration: 2160, easing: 'linear' });
  }

  /* ---- end card ---- */
  function buildEnd() {
    var n = saved.length, h = end.querySelector('h3'), sub = end.querySelector('.deck-end__sub'), list = end.querySelector('.deck-end__list'), note = end.querySelector('.deck-end__note');
    h.textContent = n ? 'Your Lisbon trip' : 'Nothing kept this round.';
    sub.textContent = n ? n + (n === 1 ? ' place saved' : ' places saved') : 'The app deals a whole city of real places.';
    list.textContent = ''; list.hidden = !n; note.hidden = !n; list.classList.toggle('is-two', n > 3);
    saved.forEach(function (id) {
      var c = deck.querySelector('.deck-card[data-id="' + id + '"]'), li = document.createElement('li'), t = document.createElement('span');
      var b = document.createElement('b'), sm = document.createElement('small');
      b.textContent = c.querySelector('h3').textContent; sm.textContent = c.querySelector('.deck-card__cat').textContent;
      t.append(b, sm); li.append(thumb(c, 'deck-thumb'), t); list.appendChild(li);
    });
  }
  function riseRows(rm, wait) {
    [].forEach.call(end.querySelectorAll('.deck-end__list li'), function (li, i) {
      li.animate(rm ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: rm ? 160 : 300, delay: rm ? 0 : wait + 260 + i * 60, easing: E.arrive, fill: 'backwards' });
    });
  }
  end.querySelector('.deck-again').addEventListener('click', function () {
    gen++;
    flying.slice().forEach(function (a) { a.finish(); a.cancel(); });
    var rm = !motion();
    saved = []; top = 0; done = false; queued = null;
    slotsEl.forEach(function (li) { li.textContent = ''; li.classList.remove('is-full'); });
    setCount();
    ctl.removeAttribute('inert');
    deck.focus({ preventScroll: true });
    var me = M.get(end);
    if (rm) { layout(null); end.hidden = true; return; }
    // Deal the six back in from the left, last card first, 80 ms apart; the end card sinks away.
    cards.slice(0, 3).forEach(function (el) { place(el, { X: -1.35 * W, Y: 0, S: 1, O: 0, R: 0, P: 1 }); });
    aim(me.O, 0, FOLLOW); kick(end);
    stack().forEach(function (el, i) {
      var m = M.get(el), p = slot(i);
      el.style.zIndex = 20 - i;
      if (i === 0) el.removeAttribute('inert'); else el.setAttribute('inert', '');
      if (el === end) return;
      var w = (2 - Math.min(i, 2)) * 80; m.quiet = true;
      ['X', 'Y', 'S', 'O', 'R'].forEach(function (k) { aim(m[k], p[k], RISE, w); });
      kick(el);
    });
    setTimeout(function () { if (!done) { end.hidden = true; place(end, slot(cards.length)); } }, 600);
  });

  /* ---- deal-in and hint when the deck first enters ---- */
  var hintT = 0, hintAnims = [];
  function cancelHint() { clearTimeout(hintT); hintT = 0; hintAnims.forEach(function (a) { a.cancel(); }); hintAnims = []; }
  function hint() {
    hintT = 0;
    if (touched || done || document.hidden || !motion()) return;
    var el = cards[top], m = M.get(el), base = tf(0, 0, 0, 1), r = 28 * 14 / W;
    hintAnims = [
      el.animate([{ transform: base, easing: E.move }, { transform: tf(28, 0, r, 1), offset: 260 / 484, easing: E.snap }, { transform: base }], { duration: 484 }),
      m.save.animate([{ opacity: 0, easing: E.move }, { opacity: 0.3, offset: 260 / 484 }, { opacity: 0 }], { duration: 484 })
    ];
  }
  function dealIn() {
    sec.classList.add('is-in');
    if (!motion()) return;
    var tilt = [-1, 2, -3];
    stack().slice(0, 3).forEach(function (el, i) {
      var p = slot(i), m = M.get(el);
      place(el, { X: 0, Y: p.Y - 32, S: p.S, O: 0, R: tilt[i] }); m.quiet = true;
      // top card first, then the stack slots in behind it: no card ever fades over another's text
      ['Y', 'R'].forEach(function (k) { aim(m[k], p[k], RISE, 380 + i * 160); });
      aim(m.O, p.O, FOLLOW, 380 + i * 160);
      kick(el);
    });
    hintT = setTimeout(hint, 1200);
  }

  /* ---- init ---- */
  cards.forEach(model); model(end);
  end.hidden = false;
  layout(null);
  if (motion()) stack().slice(0, 3).forEach(function (el, i) { place(el, { Y: slot(i).Y - 32, O: 0 }); });
  setCount();
  sec.setAttribute('data-ready', '');
  if ('ResizeObserver' in window) new ResizeObserver(function (en) { var w = en[0].contentRect.width; if (w) { W = w; stack().forEach(write); } }).observe(deck);
  var seen = false;
  if (!('IntersectionObserver' in window)) { seen = true; dealIn(); } else new IntersectionObserver(function (en) {
    var vis = en[0].isIntersecting;
    if (vis && !seen && en[0].intersectionRatio >= 0.35) { seen = true; dealIn(); }
    if (!vis) cancelHint();
  }, { threshold: [0, 0.35] }).observe(deck);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelHint(); if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else if (moving.size) kick();
  });
}());
