(() => {
/*
  taste-skill motion.js - the moving half of the micro-interaction layer (motion.css is the rest).
  Load it once, after system.js (motion.css needs no attribute; <html data-motion="off"> turns the layer off, JS too):
    <script type="module" src="assets/motion/motion.js"></script>
  It starts by itself. references/motion.md says what moves and how fast.

  - the hero's entrance: .hero[data-enter] enters once on load (the h1 line by line, then the lead,
    the buttons and the facts, the picture settling), about 1.1 s, when the head line set html.m-enter
    before the first paint:
    <script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>

  - nav: .m-menu-open from the moment a menu starts to show (150ms of intent), so the next word swaps the panel at once
    instead of waiting 150ms again; it stays while the pointer is on the word or its panel.
  - tabs: every .tabs[role=tablist] gets one indicator that slides to the selected tab (system.js
    still selects; this follows aria-selected).
  - numbers: [data-m-count] on a stat ticks from 0 to its own text once, when 60% of it is on
    screen (1.2 s, ease-out); prefix, suffix, decimals and thousands separators are kept. The
    number's width is measured once the web fonts are in and again when it is first seen (a stat
    in a hidden tab), so nothing beside it moves; a stat the observer never reports shows its own
    text after 6 s on screen. A headless screenshot (HeadlessChrome) sees the final number unless
    <html data-motion="live">.
  - loops: [data-m-loop] marks a panel (or any box) whose CSS keyframe loops the page wrote itself;
    they pause off screen, restart when the pointer enters the card around them, and get the
    system's pause button (one per panel, shared with ui.js). ui.js restarts its own fragments.
  - switches: a click on .m-switch flips aria-checked unless a handler before it called
    preventDefault().
  Under prefers-reduced-motion: no entrance, no indicator travel, no tick, no loops, no restart.
*/
const html = document.documentElement;
const reducedQ = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedQ.matches;
const shot = () => /HeadlessChrome/.test(navigator.userAgent) && html.dataset.motion !== 'live';
const jump = (el, on) => { el.classList.toggle('is-jump', on); };

/* ---------------------------------------------------------------- nav */
function nav() {
  const bar = document.querySelector('.nav');
  const links = bar?.querySelector('.nav__links');
  if (!links || bar.dataset.mNav) return;
  bar.dataset.mNav = '1';   // no pill under the words (ST-08, ST-11): system.css draws their underline

  // one menu open: the next word swaps the panel at once (figma.com); leaving the bar closes softly
  let t = 0;
  bar.querySelectorAll('.nav__item').forEach(item => {
    const has = !!item.querySelector('.nav__menu');
    item.addEventListener('pointerenter', () => {
      clearTimeout(t);
      // 150ms: the panel has started to show (motion.css lets it finish its own fade)
      if (has) t = setTimeout(() => bar.classList.add('m-menu-open'), 150);
      else bar.classList.remove('m-menu-open');
    });
  });
  bar.addEventListener('pointerleave', () => { clearTimeout(t); bar.classList.remove('m-menu-open'); });
}

/* ---------------------------------------------------------------- tabs */
function tabs() {
  document.querySelectorAll('.tabs[role="tablist"], [role="tablist"].m-tabs').forEach(list => {
    if (!list.querySelector('[role="tab"]') || list.querySelector(':scope > .m-tab-ind')) return;
    const ind = document.createElement('span');
    ind.className = 'm-tab-ind';
    ind.setAttribute('aria-hidden', 'true');
    list.prepend(ind);
    list.classList.add('m-has-ind');
    let instant = true, at = null;
    const set = (b, sx = 1, sy = 1) => {
      ind.style.setProperty('--x', `${b.x}px`); ind.style.setProperty('--y', `${b.y}px`);
      ind.style.setProperty('--w', `${b.w}px`); ind.style.setProperty('--h', `${b.h}px`);
      ind.style.setProperty('--sx', String(sx)); ind.style.setProperty('--sy', String(sy));
    };
    // the pill travels by transform only: it takes the new tab's size at once, is drawn scaled to the
    // old tab's size at the old place, and settles to scale 1 at the new place (motion.css)
    const place = () => {
      const sel = list.querySelector('[role="tab"][aria-selected="true"]');
      if (!sel) { ind.style.opacity = '0'; return; }
      ind.style.opacity = '';
      const to = { x: sel.offsetLeft, y: sel.offsetTop, w: sel.offsetWidth, h: sel.offsetHeight };
      if (instant || reduced() || !at || !to.w || !to.h) { jump(ind, true); set(to); ind.getBoundingClientRect(); jump(ind, false); }
      else {
        jump(ind, true);
        set({ ...to, x: at.x, y: at.y }, at.w / to.w, at.h / to.h);
        ind.getBoundingClientRect();
        jump(ind, false);
        set(to);
      }
      at = to;
      instant = false;
    };
    place();
    new MutationObserver(place).observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    new ResizeObserver(() => { instant = true; place(); }).observe(list);
    document.fonts?.ready.then(() => { instant = true; place(); });
  });
}

/* ---------------------------------------------------------------- numbers */
// the first number in the element's text: "8,402", "4.2", "64%", "EUR 1.200", "12k"
// separators: . , and the no-break spaces (U+00A0, U+202F); a plain space ends the number ("12 4 h" is 12)
const NUM = /\d+(?:[.,\u00A0\u202F]\d+)*/;
function parse(text) {
  const m = text.match(NUM);
  if (!m) return null;
  const raw = m[0];
  const seps = raw.match(/[^\d]/g) || [];
  let dec = '', group = '', decimals = 0;
  const lastSep = raw.search(/[^\d](?=\d+$)/);
  if (lastSep >= 0) {
    const tail = raw.length - lastSep - 1;
    // a last separator before exactly three digits groups thousands; otherwise it is the decimal point
    if (tail === 3 && !(seps.length === 1 && raw[lastSep] === '.' && /^0/.test(raw))) group = raw[lastSep];
    else { dec = raw[lastSep]; decimals = tail; group = seps.length > 1 ? seps[0] : ''; }
  }
  const intPart = dec ? raw.slice(0, lastSep) : raw;
  const value = parseFloat(intPart.replace(/[^\d]/g, '') + (dec ? '.' + raw.slice(lastSep + 1) : ''));
  return { index: m.index, raw, value, dec, group, decimals };
}
function format(v, p) {
  let [i, d] = v.toFixed(p.decimals).split('.');
  if (p.group) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, p.group);
  return d ? i + p.dec + d : i;
}
// the web fonts, or 3 s at most: a number measured in the fallback font comes out narrower
const fontsIn = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(r => setTimeout(r, 3000))]);
function counts() {
  const els = [...document.querySelectorAll('[data-m-count]')].filter(el => !el.__mCount);
  if (!els.length || reduced() || shot()) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.__mCount?.hit(); }), { threshold: 0.6 });
  const ro = new ResizeObserver(es => es.forEach(e => e.target.__mCount?.arm()));
  const items = [];
  els.forEach(el => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node, p;
    while ((node = walk.nextNode()) && !(p = parse(node.data))) { /* next */ }
    if (!node || !p) return;
    // the number gets its own span, as wide as the final number and right-aligned, so nothing beside it
    // moves. Until it is measured it shows its own text, never a 0
    const after = node.splitText(p.index);
    after.splitText(p.raw.length);
    const span = document.createElement('span');
    span.className = 'm-count__n';
    span.style.display = 'inline-block';
    span.style.textAlign = 'right';
    span.textContent = p.raw;
    after.replaceWith(span);
    const ms = +el.dataset.mCount || 1200;
    let state = 'wait', timer = 0;          // wait (own text) -> armed (0, width held) -> run -> done
    const stop = () => { clearTimeout(timer); io.unobserve(el); ro.unobserve(el); };
    const onScreen = () => {
      const r = span.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && document.visibilityState === 'visible';
    };
    // the safety net: a stat on screen for 6 s that the observer never reported shows its own text
    const watch = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (state !== 'armed') return;
        if (onScreen()) { state = 'done'; stop(); span.textContent = p.raw; } else watch();
      }, 6000);
    };
    const ctl = {
      /** measure the final number in the page's font and hold its width; false while it has none (hidden) */
      arm() {
        if (state === 'run' || state === 'done') return false;
        span.textContent = p.raw;
        span.style.minWidth = '';
        const w = span.getBoundingClientRect().width;
        if (!w) { state = 'wait'; clearTimeout(timer); return false; }
        span.style.minWidth = `${w}px`;
        span.textContent = format(0, p);
        if (state !== 'armed') { state = 'armed'; watch(); }
        return true;
      },
      /** print: stop waiting and show the written number */
      show() { if (state === 'done') return; state = 'done'; stop(); span.textContent = p.raw; },
      /** first seen: measure again (a font or a tab that changed since), then tick once */
      hit() {
        if (state === 'run' || state === 'done' || !ctl.arm()) return;
        state = 'run';
        stop();
        const t0 = performance.now();
        const step = now => {
          const k = Math.min(1, (now - t0) / ms);
          span.textContent = k < 1 ? format(p.value * (1 - Math.pow(1 - k, 4)), p) : p.raw;
          if (k < 1) requestAnimationFrame(step); else state = 'done';
        };
        requestAnimationFrame(step);
      },
    };
    el.__mCount = ctl;
    items.push(el);
  });
  // measured only once the fonts are in; the resize observer measures again when a hidden stat shows
  fontsIn().then(() => items.forEach(el => { el.__mCount.arm(); ro.observe(el); io.observe(el); }));
  // a printed page never scrolls the stats into view: each prints its own number
  addEventListener('beforeprint', () => items.forEach(el => el.__mCount.show()));
}

/* ---------------------------------------------------------------- loops inside cards */
const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4.25" y="3.25" width="2.75" height="9.5" rx="0.9"/><rect x="9" y="3.25" width="2.75" height="9.5" rx="0.9"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.25 3.7v8.6c0 .62.68 1 1.2.66l6.5-4.3c.47-.31.47-1 0-1.32l-6.5-4.3c-.52-.34-1.2.04-1.2.66Z"/></svg>';
const boxOf = el => el.closest('[data-ui-pause-host], .panel__screen, .panel, .frame') || el;
const hostOf = el => el.closest('.card, .tile, .menu-card, a') || boxOf(el);

function restart(loop) {
  if (reduced() || loop.classList.contains('is-m-paused')) return;
  // the page's keyframe loops only: a hover transition in the panel (the pause button's) is no cycle.
  // ui.js fragments in the card restart by themselves
  const anims = loop.getAnimations({ subtree: true }).filter(a => typeof CSSAnimation === 'function' && a instanceof CSSAnimation);
  if (!anims.length) return;
  const dur = a => Number(a.effect?.getComputedTiming().duration) || 0;
  const main = anims.reduce((m, a) => (dur(a) > dur(m) ? a : m));
  const d = dur(main), t = Number(main.currentTime) || 0;
  // restart only when the cycle is past its first quarter, so a quick in-and-out never stutters
  if (!d || (t % d) / d > 0.25) anims.forEach(a => { a.currentTime = 0; });
}
function setPaused(box, paused) {
  box.querySelectorAll('[data-m-loop]').forEach(l => l.classList.toggle('is-m-paused', paused));
  if (box.matches('[data-m-loop]')) box.classList.toggle('is-m-paused', paused);
}
function pauseButton(loop) {
  const box = boxOf(loop);
  if (box.querySelector(':scope > .loop-pause')) return;   // ui.js or the page put one there: it is shared
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'loop-pause m-own';
  const show = paused => {
    btn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
    btn.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} animation`);
    btn.title = btn.getAttribute('aria-label');
    btn.classList.toggle('is-paused', paused);
  };
  show(false);
  if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
  box.append(btn);
  btn.__show = show;
}
function loops() {
  const els = [...document.querySelectorAll('[data-m-loop]')].filter(el => !el.__mLoop);
  if (!els.length) return;
  if (reduced() || matchMedia('(max-width: 639px)').matches) return;   // motion.css holds them on their finished picture
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-m-off', !e.isIntersecting)), { rootMargin: '48px' });
  els.forEach(el => {
    el.__mLoop = true;
    io.observe(el);
    pauseButton(el);
    hostOf(el).addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') restart(el); });   // a mouse or pen, never a tap
    hostOf(el).addEventListener('focusin', e => { if (!e.target.closest('.loop-pause')) restart(el); });
  });
}
// one listener for every pause button: its own (m-own) toggles; a ui.js one is mirrored after ui.js ran
document.addEventListener('click', e => {
  const btn = e.target.closest('.loop-pause');
  if (!btn) return;
  const box = btn.parentElement;
  if (btn.classList.contains('m-own')) {
    const paused = !btn.classList.contains('is-paused');
    btn.__show(paused);
    setPaused(box, paused);
    box.querySelectorAll('[data-ui]').forEach(r => { try { paused ? r.__ui?.pause() : r.__ui?.resume(); } catch { /* none */ } });
  } else setPaused(box, btn.classList.contains('is-paused'));
});

/* ---------------------------------------------------------------- switches */
document.addEventListener('click', e => {
  const sw = e.target.closest('.m-switch');
  if (!sw || e.defaultPrevented) return;
  sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
});

/* ---------------------------------------------------------------- the hero's entrance */
// Once, on load (motion.md, The hero's entrance): the h1 rises line by line out of its masks, then what
// follows it (the lead, each button, the facts) fades up 60ms apart, while the picture settles from a
// slight scale; about 1.1 s in all, ease-out, transform and opacity only. motion.css hides the words
// (never the picture) only while the head line's html.m-enter is on and its 700ms safety mark
// (m-enter-done) is not; the picture waits at its start scale and settles by a CSS transition, so it
// never blinks however late this file is. Without script, under reduced motion and in print the hero
// simply stands; when this file is later than the mark, the words fade in by CSS and the hero stands.
// The h1 gets its word masks for the length of the entrance and its own nodes back afterwards.
const ENTER_MEDIA = '[data-enter-media], .hero__bg, .hero__media, .hero__stage, .hero__art, .hero__window, .hero-visual, .ly-collage';
const ENTER_TEXT = 'h1 ~ *, :has(> h1) ~ *, :has(~ h1)';
const ENTER_LEAF = 'p, dl, ul, ol, a, button, img, picture, video, figure, blockquote, h2, h3, .pill, .btn';
function maskWords(h1) {
  // an h1 another script reworks (layout.js: a live word, letters, a picture in the line) rises whole
  if (h1.matches('[data-ly-letters], [data-enter-whole]') || h1.querySelector('.ly-word, .ly-pic, .ly-mark, svg, img')) return null;
  const own = document.createDocumentFragment();
  own.append(...h1.childNodes);
  const copy = own.cloneNode(true);
  const words = [];
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 1) return walk(n);
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const w = document.createElement('span'), i = document.createElement('span');
      w.className = 'm-w'; i.className = 'm-w__in'; i.textContent = part;
      w.append(i); frag.append(w); words.push(w);
    });
    n.replaceWith(frag);
  });
  walk(copy);
  const label = h1.hasAttribute('aria-label');
  if (!label) h1.setAttribute('aria-label', own.textContent.replace(/\s+/g, ' ').trim());
  h1.append(copy);
  h1.querySelectorAll('.m-w').forEach(w => w.setAttribute('aria-hidden', 'true'));
  // words grouped into the lines the browser set them on
  const lines = [];
  let top = null;
  words.forEach(w => { const t = w.getBoundingClientRect().top; if (top === null || Math.abs(t - top) > 3) { lines.push([]); top = t; } lines[lines.length - 1].push(w.firstChild); });
  return { lines, restore() { h1.replaceChildren(own); if (!label) h1.removeAttribute('aria-label'); } };
}
function enterSteps(hero, h1, media) {
  // what follows (and precedes) the h1 in its column, as whole blocks in reading order; a box of
  // layout (a div with no words of its own) is opened, a button row gives one step a button.
  // A picture, window or collage (or a box round one) is never opened: it stands as one block and
  // settles by itself (motion.css), even when it carries words of its own (a menu card, a note)
  const out = [];
  const take = el => {
    if (el === h1 || el.contains(h1) || out.includes(el) || el.matches('img, picture, video, canvas, .frame__img')) return;
    if (media.includes(el) || media.some(m => el.contains(m))) return;
    if (el.matches('.btn-row')) { [...el.children].forEach(take); return; }
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (own || !el.children.length || el.matches(ENTER_LEAF)) out.push(el);
    else [...el.children].forEach(take);
  };
  hero.querySelectorAll(ENTER_TEXT).forEach(take);
  return out.filter(el => !el.closest('[aria-hidden="true"]') && !out.some(o => o !== el && o.contains(el)))
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
function enter() {
  const hero = document.querySelector('.hero[data-enter]:not([data-enter="off"])');
  if (!hero || hero.classList.contains('is-entered') || hero.classList.contains('is-entering')) return;
  // still: the picture takes its place at once (no settle); otherwise the CSS settle and fade run out first
  const done = (still = false) => { if (still) hero.classList.add('is-still'); hero.classList.add('is-entered'); };
  const late = () => setTimeout(done, 1150);
  // the head line did not run, reduced motion, a headless shot (it sees the hero at rest, as it sees the
  // final number, unless data-motion="live") or the visitor is already below the hero (a reload half way
  // down): the hero stands as written. The safety mark has passed: motion.css is fading the words in and
  // settling the picture; the hero is marked done once they are through
  if (!html.classList.contains('m-enter') || reduced() || shot() || hero.getBoundingClientRect().bottom < 0) return done(true);
  if (html.classList.contains('m-enter-done')) return late();
  const h1 = hero.querySelector('h1');
  if (!h1) return done(true);
  const media = [...hero.querySelectorAll(ENTER_MEDIA)].filter((m, i, all) => !all.some(o => o !== m && o.contains(m)));
  const steps = enterSteps(hero, h1, media);
  const EASE = 'cubic-bezier(.22, 1, .36, 1)';
  const anims = [];
  let masks = null, over = false;
  const finish = () => {
    if (over) return;
    over = true;
    anims.forEach(a => { try { a.cancel(); } catch { /* gone */ } });
    masks?.restore();
    hero.classList.remove('is-entering');
    done();
  };
  // the fonts first (a line set in the fallback face breaks elsewhere), 250ms at most: the words are
  // hidden meanwhile, so nothing is seen twice
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(r => setTimeout(r, 250))]).then(() => {
    if (html.classList.contains('m-enter-done') && !hero.classList.contains('is-entering')) { over = true; return late(); }   // the safety mark won: CSS shows it
    masks = maskWords(h1);
    // .is-entering ends the CSS hold: the words are held by their animations from here, and the
    // picture starts its CSS settle in the same frame
    hero.classList.add('is-entering');
    const lines = masks ? masks.lines : [[h1]];
    const lineStep = Math.min(80, 240 / Math.max(1, lines.length - 1));
    // a word starts wholly below its mask, which reaches .12em under the line: no tops show before it rises
    lines.forEach((ws, k) => ws.forEach(w => anims.push(w.animate(masks
      ? [{ transform: 'translateY(calc(100% + .2em))' }, { transform: 'none' }]
      : [{ transform: 'translateY(.35em)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 700, delay: 80 + k * lineStep, easing: EASE, fill: 'both' }))));
    // a line above the h1 (a notice, a pill) comes with its first line; what follows starts as its
    // last line is half way up
    const after = 80 + (lines.length - 1) * lineStep + 220;
    let k = 0;
    steps.forEach(el => {
      const above = !!(el.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING);
      // the rise is added to whatever transform the part has of its own; the fade replaces its opacity
      const t = { duration: 520, delay: above ? 40 : after + Math.min(k++, 6) * 60, easing: EASE, fill: 'both' };
      anims.push(el.animate([{ opacity: 0 }, { opacity: 1 }], t), el.animate([{ transform: 'translateY(12px)' }, { transform: 'none' }], { ...t, composite: 'add' }));
    });
    // a panel the words sit on stands from the first paint (it was never hidden, so it never blinks);
    // the pictures settle by CSS over 1.1 s: the hero is done when both are through
    anims.push({ finished: new Promise(r => setTimeout(r, 1150)), cancel() {} });
    Promise.all(anims.map(a => a.finished)).then(finish, finish);
  }).catch(finish);
  setTimeout(finish, 2400);   // whatever stalls (a hidden tab), the hero stands after 2.4 s
}

/* ---------------------------------------------------------------- start */
function init() {
  if (html.dataset.motion === 'off') { html.classList.add('m-enter-done'); return; }
  if (!html.hasAttribute('data-motion')) html.setAttribute('data-motion', '');
  try { enter(); } catch (e) { console.warn('motion.js: enter', e); document.querySelector('.hero[data-enter]')?.classList.add('is-entered'); }
  try { nav(); } catch (e) { console.warn('motion.js: nav', e); }
  try { tabs(); } catch (e) { console.warn('motion.js: tabs', e); }
  try { counts(); } catch (e) { console.warn('motion.js: counts', e); }
  try { loops(); } catch (e) { console.warn('motion.js: loops', e); }
}
/** call again after the page adds markup (a tab list, a stat, a loop) */
const refresh = init;


if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

})();
(() => {
const lib = (() => {
/*
  moments/lib.js - the few helpers every moment shares (taste-skill). One ES module, no dependencies.

  reduced()            true under prefers-reduced-motion: a moment then shows its finished state only
  phone()              true on a phone: under 640px wide, or a touch screen in landscape under 500px tall
                       (a phone turned sideways). A moment shows its finished state there too, unless
                       its module says `const phone = true` (word-highlight, picture-develops,
                       photo-chapters: light enough to run there).
  still()              reduced() || phone(): the one question every moment asks. The loader (moments.js)
                       hands each moment a lib whose reduced() answers still() (only reduced() for a
                       moment that runs on a phone), so a moment written against reduced() is static
                       where it must be, and sets data-moment-still on its host ("reduced" or "phone").
                       The answer is taken once, when the page loads.
  coarse()             true on a touch screen (no hover moments there)
  inCard(el)           true when el is, or sits in, a card, a plan, a result or a bento cell: nothing
                       on a card ever moves on scroll, so the loader leaves such a moment still
  scrub(el, fn, opts)  calls fn(progress, rect) from a requestAnimationFrame while el is near the
                       screen. mode 'hold' (default): 0 when el's top reaches the viewport top, 1 when
                       its bottom reaches the viewport bottom (a pinned stage's run). mode 'view': 0 when
                       el's top enters at the bottom edge, 1 when its bottom leaves at the top.
                       Returns { destroy, update }. Nothing is captured: the page scrolls natively.
  once(el, fn, opts)   fn once: when `threshold` of el is on screen, or el covers that share of the screen (a
                       target taller than the screen can never show it), or part of it has stayed on screen
                       for opts.rescue ms (3000), or the observer has not reported at all after 1.5 s of a
                       visible page. Nothing waits for ever. Returns { destroy }.
  split(el, unit)      wraps the words ('words') or letters ('chars') of el in spans
                       (.mo-w, .mo-c, each with an inner .mo-i that moves) and keeps the text readable:
                       the host gets aria-label, the spans aria-hidden. Returns the inner spans.
  lines(words)         groups word spans into lines by their offsetTop; returns an array of arrays.
  fontsReady(ms)       resolves when the fonts are loaded, or after ms.
  clamp, lerp, ease    the maths.
*/
const rq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
const reduced = () => !!(rq && rq.matches);
const pq = typeof matchMedia === 'function' ? [matchMedia('(max-width: 639px)'), matchMedia('(pointer: coarse) and (max-height: 499px) and (max-width: 959px)')] : [];
const phone = () => pq.some(q => q.matches);
const still = () => reduced() || phone();
const stillWhy = () => (reduced() ? 'reduced' : phone() ? 'phone' : '');
const inCard = el => !!(el && el.closest && el.closest('.card, .plan, .result, .knock, [data-card], .bento > *'));
const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  out: t => 1 - Math.pow(1 - t, 3),
  quint: t => 1 - Math.pow(1 - t, 5),
  expo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  smooth: (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); },
};

function scrub(el, fn, { mode = 'hold', margin = '25% 0px' } = {}) {
  // on from the start, with the scroll listener: an observer that never reports (a dead stub, a page it cannot reach) leaves the
  // moment following the scroll instead of frozen at its first state; the observer turns it off when the target is far away
  let on = true, raf = 0, last = -1;
  const tick = () => {
    raf = 0;
    if (!on) return;
    const r = el.getBoundingClientRect(), vh = innerHeight;
    let p = mode === 'view' ? (vh - r.top) / (vh + r.height) : -r.top / Math.max(1, r.height - vh);
    p = clamp(p);
    if (p !== last) { last = p; fn(p, r); }
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const io = new IntersectionObserver(es => {
    on = es[es.length - 1].isIntersecting;
    removeEventListener('scroll', req); removeEventListener('resize', req);
    if (on) { addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); req(); }
  }, { rootMargin: margin });
  io.observe(el);
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); req();
  return {
    update: () => { last = -1; req(); },
    destroy() { io.disconnect(); removeEventListener('scroll', req); removeEventListener('resize', req); if (raf) cancelAnimationFrame(raf); },
  };
}

function once(el, fn, { threshold = 0.35, margin = '0px', rescue = 3000 } = {}) {
  // fn runs once when `threshold` of el is on screen, or el covers that share of the screen (a target taller
  // than the screen can never show `threshold` of itself), or any part of it has stayed on screen for `rescue`
  // ms. An observer that has not reported at all after 1.5 s of a visible page runs fn too: nothing waits for ever
  let timer = 0, starve = 0, done = false;
  const go = () => { if (done) return; done = true; clearTimeout(timer); clearTimeout(starve); io.disconnect(); fn(); };
  const steps = [0];
  for (let t = 0.1; t < threshold - 1e-6; t += 0.1) steps.push(+t.toFixed(2));
  steps.push(threshold);
  const io = new IntersectionObserver(es => {
    clearTimeout(starve);
    const e = es[es.length - 1];
    if (!e.isIntersecting) { clearTimeout(timer); timer = 0; return; }
    const vh = e.rootBounds ? e.rootBounds.height : innerHeight;
    if (e.intersectionRatio >= threshold || e.intersectionRect.height >= vh * threshold) return go();
    if (!timer) timer = setTimeout(go, rescue);
  }, { threshold: steps, rootMargin: margin });
  const wait = () => { starve = setTimeout(() => (document.hidden ? wait() : go()), 1500); };
  wait();
  io.observe(el);
  return { destroy() { done = true; clearTimeout(timer); clearTimeout(starve); io.disconnect(); } };
}

function split(el, unit = 'words') {
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const inners = [];
  const wrap = (text, cls) => {
    const s = document.createElement('span');
    s.className = cls;
    const i = document.createElement('span');
    i.className = 'mo-i';
    i.textContent = text;
    s.append(i);
    inners.push(i);
    return s;
  };
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          if (unit === 'chars') {
            const w = document.createElement('span');
            w.className = 'mo-w';
            for (const ch of part) w.append(wrap(ch, 'mo-c'));
            frag.append(w);
          } else frag.append(wrap(part, 'mo-w'));
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('mo-w')) {
        // a link or button inside keeps its name: its words are hidden with the rest, so it is named first
        if (n.matches('a[href], button') && !n.getAttribute('aria-label') && n.textContent.trim()) n.setAttribute('aria-label', n.textContent.replace(/\s+/g, ' ').trim());
        walk(n);
      }
    });
  };
  walk(el);
  el.querySelectorAll('.mo-w').forEach(w => w.setAttribute('aria-hidden', 'true'));
  return inners;
}

function lines(words) {
  const out = [];
  let top = null;
  for (const w of words) {
    const t = w.offsetTop;
    if (top === null || Math.abs(t - top) > 2) { out.push([]); top = t; }
    out[out.length - 1].push(w);
  }
  return out;
}

const fontsReady = (ms = 900) => Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, ms))]);

/*
  blocks(root, skip)   the section's words and pictures as whole blocks, for a moment that uncovers a section with a
                       clip (a disc, a line): a block is a heading, paragraph, list item, button, link, picture, UI
                       window or any element that carries text of its own, outermost first (a frame with its own
                       text is one block). A clip that slices through a block cuts its words mid-move, so such a
                       moment keeps each block invisible until the clip has passed the whole of it, then fades it
                       in whole. Returns { list, measure, set, release }:
    list      [{ el, l, t, r, b }] with the box of each block in root's own coordinates (set by measure)
    measure() reads the boxes again (call when the root's size changes or the fonts arrive)
    set(fn)   fn(block) -> opacity 0-1 for every block; 1 puts the element's own inline opacity back
    release() every block as it was
  skip: elements (the moment's own layers) that are never a block.
*/
const BLOCK = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,label,a,button,img,picture,video,canvas,svg,table,figure,.frame,.dw,[data-moment-block]';
function blocks(root, skip = []) {
  const list = [];
  const walk = el => {
    for (const c of el.children) {
      if (skip.includes(c) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(c.tagName)) continue;
      const own = [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (c.matches(BLOCK) || own) list.push({ el: c, was: c.style.opacity, l: 0, t: 0, r: 0, b: 0 });
      else walk(c);
    }
  };
  walk(root);
  const measure = () => {
    const rr = root.getBoundingClientRect();
    for (const b of list) {
      const r = b.el.getBoundingClientRect();
      b.l = r.left - rr.left; b.t = r.top - rr.top; b.r = r.right - rr.left; b.b = r.bottom - rr.top;
    }
  };
  measure();
  const set = fn => { for (const b of list) { const o = fn(b); b.el.style.opacity = o >= 0.999 ? b.was : (o <= 0 ? '0' : o.toFixed(3)); } };
  const release = () => { for (const b of list) b.el.style.opacity = b.was; };
  return { list, measure, set, release };
}

return {phone,reduced,phone,still,stillWhy,inCard,coarse,clamp,lerp,ease,scrub,once,split,lines,fontsReady,blocks};
})();
(() => { /*
  word-highlight - one statement's words turn from grey to ink, word by word, as the statement crosses
  the middle of the screen. Scrubbed to the scrollbar (it runs back when the visitor scrolls up); a
  <strong> word turns to the accent instead of the ink. For the one statement a page stands on, 12 to
  40 words, on its own ground or beside one picture.

    <section class="section" data-moment="word-highlight">
      <div class="container"><p class="mo-wh__text">Give tasks to <strong>Relay</strong> like a teammate …</p></div>
    </section>

  opts: from 0.85 (the statement's top at this share of the screen's height turns the first word),
        to 0.45 (its bottom at this share turns the last).
  Reduced motion, no script: the whole statement in ink. It runs on a phone too (one paragraph's
  colours, no layout, no pin).
*/
const phone = true;
function mount (root, opts, lib) {
  const text = root.matches('p, h2, h3, blockquote') ? root : (root.querySelector('.mo-wh__text') || [...root.querySelectorAll('p, h2, h3, blockquote')].find(p => !p.matches('.t-label, .t-small, .muted')));
  if (!text) return {};
  root.classList.add('mo-wh');
  const words = lib.split(text, 'words').map(i => i.parentElement);
  if (lib.reduced()) { words.forEach(w => w.classList.add('is-on')); root.classList.add('is-done'); return {}; }
  const from = opts.from ?? 0.85, to = opts.to ?? 0.45;
  let n = -1;
  const s = lib.scrub(text, (p, r) => {
    const vh = innerHeight, start = vh * from, end = vh * to;
    const t = lib.clamp((start - r.top) / Math.max(1, (start - end) + r.height));
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;   // page bottom: it can climb no further, the statement stands in full ink
    const k = atEnd ? words.length : Math.round(t * words.length);
    if (k === n) return;
    n = k;
    words.forEach((w, i) => w.classList.toggle('is-on', i < k));
  }, { mode: 'view' });
  return { destroy: s.destroy };
}

 document.querySelectorAll('[data-moment="word-highlight"]').forEach(element => {
 mount(element, {}, {...lib, reduced: lib.reduced});
 element.dataset.momentMounted = '1';
 });
})();
(() => { /*
  pinned-chapters - one section holds on screen while the visitor scrolls through its three (2 to 4)
  steps: the step in hand opens its two lines at the left, the one visual at the right changes to that
  step's picture or screen with a short crossfade and settle. The page scrolls natively (the stage is
  position: sticky); nothing else on the page moves. From 1024px on a screen at least 640px tall;
  otherwise, under reduced motion and without script the section is static: from 640px a row per
  step (text left, visual right, at most 30svh tall), below that every step stands with its visual
  under it (16:9).

    <section class="section" data-moment="pinned-chapters">
      <div class="container mo-pc__grid">
        <div class="mo-pc__text">
          <h2>How editors work with it</h2>
          <ol class="mo-pc__steps">
            <li class="mo-pc__step">
              <h3>Step title</h3><p>Two lines.</p>
              <figure class="mo-pc__visual"><img …></figure>          its picture, or a drawn window
            </li>
            …
          </ol>
        </div>
        <div class="mo-pc__visuals frame"></div>                     the shared frame, empty in the HTML
      </div>
    </section>

  The stage holds for one screen of scroll, so the live section is exactly two screens (layout-v4.md);
  with 2 to 4 steps each step gets a quarter to a half of a screen of scroll.
*/
function mount (root, opts, lib) {
  const steps = [...root.querySelectorAll('.mo-pc__step')];
  const frame = root.querySelector('.mo-pc__visuals');
  const figures = steps.map(s => s.querySelector('.mo-pc__visual'));
  if (steps.length < 2 || !frame || figures.some(f => !f)) return {};
  const homes = figures.map(f => f.parentElement);
  // the section stays exactly two screens (layout-v4.md: 1H or 2H), so the stage holds for one screen of scroll
  const hold = 1;
  root.style.setProperty('--mo-hold', String(hold));
  // each step's lines in a span of their own, so a closed step can collapse to nothing (moment.css)
  steps.forEach(s => {
    const p = s.querySelector('p');
    if (!p || p.querySelector('.mo-pc__p-in')) return;
    const w = document.createElement('span');
    w.className = 'mo-pc__p-in';
    while (p.firstChild) w.append(p.firstChild);
    p.append(w);
  });
  const grid = root.querySelector('.mo-pc__grid');
  let live = false, scrubber = null, k = -1;
  const wide = () => matchMedia('(min-width: 1024px)').matches;
  const fits = () => !lib.reduced() && wide() && innerHeight >= 640;
  const show = i => {
    if (i === k) return;
    k = i;
    steps.forEach((s, n) => s.classList.toggle('is-on', n === i));
    figures.forEach((f, n) => { f.classList.toggle('is-on', n === i); f.classList.toggle('is-past', n < i); });
  };
  const go = () => {
    if (live) return;
    live = true;
    // the scrub first: if it throws (no IntersectionObserver), nothing has been moved or hidden yet
    scrubber = lib.scrub(root, p => show(Math.min(steps.length - 1, Math.floor(p * steps.length))));
    root.classList.add('is-live');
    grid?.setAttribute('data-edge-free', '');   // live the grid is one screen of a two-screen section: the layout check skips it (the rest rows are checked)
    figures.forEach(f => frame.append(f));
    show(0);   // step 1 open before the first scroll tick: a scrub that never ticks still shows a step and its visual
  };
  const rest = () => {
    if (!live) return;
    live = false;
    root.classList.remove('is-live');
    grid?.removeAttribute('data-edge-free');
    scrubber?.destroy(); scrubber = null;
    figures.forEach((f, n) => { homes[n].append(f); f.classList.remove('is-on', 'is-past'); });
    steps.forEach(s => s.classList.remove('is-on'));
    k = -1;
  };
  const sync = () => { const f = fits(); if (f) go(); else rest(); root.classList.toggle('is-static', !f && wide()); };
  sync();
  let t = 0;
  const onResize = () => { clearTimeout(t); t = setTimeout(sync, 120); };
  addEventListener('resize', onResize);
  const rq = matchMedia('(prefers-reduced-motion: reduce)');
  rq.addEventListener('change', sync);   // a preference changed after load: go static (or live) at once
  return { destroy() { removeEventListener('resize', onResize); rq.removeEventListener('change', sync); rest(); root.classList.remove('is-static'); } };
}

 document.querySelectorAll('[data-moment="pinned-chapters"]').forEach(element => {
 mount(element, {}, {...lib, reduced: lib.still});
 element.dataset.momentMounted = '1';
 });
})();
})();