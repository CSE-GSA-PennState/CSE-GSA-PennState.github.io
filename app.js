const CONFIG = {
  email:             CONTACT.email,
  location:          CONTACT.location,
  links:             CONTACT.links,
  events:            EVENTS,
  resourcesSheetUrl: RESOURCES.sheetUrl,
  resources:         RESOURCES.list,
  content:           TEXT
};

(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var REDUCED = mq('(prefers-reduced-motion: reduce)').matches;
  var HOVERS  = mq('(hover: hover)').matches;
  var HAS_IO  = 'IntersectionObserver' in window;

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  var store = (function () {
    var ok = true, mem = {};
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch (e) { ok = false; }
    return {
      get: function (k, d) {
        try { if (!ok) return (k in mem) ? mem[k] : d; var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }
        catch (e) { return d; }
      },
      set: function (k, v) { try { if (ok) localStorage.setItem(k, JSON.stringify(v)); else mem[k] = v; } catch (e) { mem[k] = v; } }
    };
  })();

  function linkOf(key) { return ((CONFIG.links && CONFIG.links[key]) || '').trim(); }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  var ICONS = {
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    talk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></svg>',
    poster: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="4" height="8" rx="1"/><rect x="10" y="6" width="4" height="12" rx="1"/><rect x="16" y="13" width="4" height="5" rx="1"/><path d="M3 21h18"/></svg>'
  };
  function setText(id, val) { var el = document.getElementById(id); if (el && val != null) el.textContent = val; }
  function renderContent() {
    var c = CONFIG.content || {};

    if (c.meta) {
      if (c.meta.title) document.title = c.meta.title;
      var dMeta = $('meta[name="description"]'); if (dMeta && c.meta.description) dMeta.setAttribute('content', c.meta.description);
      var otMeta = $('meta[property="og:title"]'); if (otMeta && c.meta.ogTitle) otMeta.setAttribute('content', c.meta.ogTitle);
      var odMeta = $('meta[property="og:description"]'); if (odMeta && c.meta.ogDescription) odMeta.setAttribute('content', c.meta.ogDescription);
    }

    if (c.hero) {
      setText('heroEyebrow', c.hero.eyebrow);
      var headline = $('#headline');
      if (headline) {
        headline.textContent = '';
        headline.appendChild(document.createTextNode(c.hero.headlineBefore || ''));
        var accent = document.createElement('span'); accent.className = 'accent'; accent.textContent = c.hero.headlineAccent || '';
        headline.appendChild(accent);
        headline.appendChild(document.createTextNode(c.hero.headlineAfter || ''));
      }
      setText('heroLead', c.hero.lead);
    }

    if (c.quest) {
      setText('questTitle', c.quest.title);
      setText('questNote', c.quest.note);
      var qList = $('#questList');
      if (qList) {
        qList.innerHTML = (c.quest.steps || []).map(function (s, i) {
          return '<button class="quest__step" data-step="' + i + '" aria-pressed="false"><span class="quest__num">' + (i + 1) + '</span>'
            + '<span><b>' + esc(s.title) + '</b><small>' + esc(s.desc) + '</small></span></button>';
        }).join('');
      }
    }

    if (c.about) {
      setText('aboutEyebrow', c.about.eyebrow); setText('aboutHeading', c.about.heading); setText('aboutLead', c.about.lead);
      var aRows = $('#aboutRows');
      if (aRows) {
        aRows.innerHTML = (c.about.rows || []).map(function (r) {
          return '<article class="row" data-reveal><div class="row__ic">' + (ICONS[r.icon] || '') + '</div>'
            + '<div><h3 class="h-md">' + esc(r.title) + '</h3><p>' + esc(r.desc) + '</p></div></article>';
        }).join('');
      }
    }

    if (c.work) {
      setText('workEyebrow', c.work.eyebrow); setText('workHeading', c.work.heading);
      var wCards = $('#workCards');
      if (wCards) {
        wCards.innerHTML = (c.work.cards || []).map(function (card) {
          return '<article class="card" data-reveal><span class="card__tag">' + esc(card.tag) + '</span><h3>' + esc(card.title) + '</h3>'
            + '<p>' + esc(card.desc) + '</p></article>';
        }).join('');
      }
    }

    if (c.eventsSection) {
      setText('eventsEyebrow', c.eventsSection.eyebrow); setText('eventsHeading', c.eventsSection.heading); setText('eventsLead', c.eventsSection.lead);
    }

    if (c.symposium) {
      setText('symposiumEyebrow', c.symposium.eyebrow); setText('symposiumHeading', c.symposium.heading);
      setText('symposiumLead', c.symposium.lead); setText('symposiumNote', c.symposium.note);
      var subs = $('#symposiumSubs');
      if (subs) {
        subs.innerHTML =
          '<article class="sub" data-reveal><div class="sub__ic">' + ICONS.talk + '</div><h3>' + esc(c.symposium.oral.title) + '</h3>'
          + '<p>' + esc(c.symposium.oral.desc) + '</p><a class="btn btn--primary" data-link="abstractForm" data-magnet><span data-label="abstractCta"></span> ' + ARROW + '</a></article>'
          + '<article class="sub" data-reveal><div class="sub__ic">' + ICONS.poster + '</div><h3>' + esc(c.symposium.poster.title) + '</h3>'
          + '<p>' + esc(c.symposium.poster.desc) + '</p><a class="btn btn--ghost" data-link="posterForm" data-magnet><span data-label="posterCta"></span> ' + ARROW + '</a></article>';
      }
    }

    if (c.resourcesSection) {
      setText('resourcesEyebrow', c.resourcesSection.eyebrow); setText('resourcesHeading', c.resourcesSection.heading); setText('resourcesLead', c.resourcesSection.lead);
    }

    if (c.join) {
      setText('joinEyebrow', c.join.eyebrow); setText('joinHeading', c.join.heading); setText('joinLead', c.join.lead);
      var jCards = $('#joinCards');
      if (jCards) {
        jCards.innerHTML =
          '<div class="jcard jcard--lead" data-reveal><h3>' + esc(c.join.memberCard.title) + '</h3><p>' + esc(c.join.memberCard.desc) + '</p>'
          + '<a class="btn btn--primary btn--block" data-link="membership" data-magnet><span data-label="joinCta"></span> ' + ARROW + '</a></div>'
          + '<div class="jcard" data-reveal><h3>' + esc(c.join.discordCard.title) + '</h3><p>' + esc(c.join.discordCard.desc) + '</p>'
          + '<a class="btn btn--ghost btn--block" data-link="groupChat" data-magnet><span data-label="discordCta"></span> ' + ARROW + '</a></div>'
          + '<div class="jcard" data-reveal><h3>' + esc(c.join.positionsCard.title) + '</h3><p>' + esc(c.join.positionsCard.desc) + '</p>'
          + '<a class="btn btn--ghost btn--block" data-link="positions" data-magnet><span data-label="positionsCta"></span> ' + ARROW + '</a></div>';
      }
    }

    if (c.faq) {
      setText('faqEyebrow', c.faq.eyebrow); setText('faqHeading', c.faq.heading);
      var faqList = $('#faqList');
      if (faqList) {
        faqList.innerHTML = (c.faq.items || []).map(function (item) {
          return '<div class="faq__item" data-reveal><button class="faq__q" aria-expanded="false">' + esc(item.q)
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>'
            + '<div class="faq__a"><div><p>' + esc(item.a) + '</p></div></div></div>';
        }).join('');
      }
    }

    if (c.footer) setText('footBlurb', c.footer.blurb);

    var L = c.labels || {};
    $$('[data-label]').forEach(function (el) { var v = L[el.getAttribute('data-label')]; if (v != null) el.textContent = v; });
    var N = c.nav || {};
    $$('[data-nav]').forEach(function (el) { var v = N[el.getAttribute('data-nav')]; if (v != null) el.textContent = v; });
  }
  renderContent();

  var missing = [];
  function wireLinks(root) {
    root = root || document;
    $$('[data-link]', root).forEach(function (a) {
      var key = a.getAttribute('data-link'), url = linkOf(key);
      if (url) {
        a.setAttribute('href', url); a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer'); a.classList.remove('is-todo'); a.removeAttribute('aria-disabled');
      } else {
        a.classList.add('is-todo'); a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true');
        a.setAttribute('title', 'Set CONFIG.links.' + key + ' in index.html to switch this on');
        if (missing.indexOf('links.' + key) < 0) missing.push('links.' + key);
      }
    });
    $$('[data-mailto]', root).forEach(function (a) {
      var e = (CONFIG.email || '').trim();
      if (e) {
        var subj = a.getAttribute('data-subject');
        a.setAttribute('href', 'mailto:' + e + (subj ? ('?subject=' + encodeURIComponent(subj)) : ''));
        a.classList.remove('is-todo'); a.removeAttribute('aria-disabled');
      } else { a.classList.add('is-todo'); a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); }
    });
  }
  wireLinks(document);
  $$('[data-email]').forEach(function (a) {
    var e = (CONFIG.email || '').trim();
    if (e) { a.setAttribute('href', 'mailto:' + e); a.textContent = e; }
    else { a.classList.add('is-todo'); missing.push('email'); }
  });
  var footLoc = $('#footLoc'); if (footLoc) footLoc.textContent = CONFIG.location || '';
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  if (missing.length) console.warn('[CSE-GSA] Not set yet: ' + missing.join(', ') + '. Fill these into CONFIG in index.html.');

  (function () {
    var h = $('#headline'); if (!h) return;
    var kids = Array.prototype.slice.call(h.childNodes), out = [], i = 0;
    kids.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t.trim()) { out.push(document.createTextNode(t)); return; }
          var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = t; out.push(s);
        });
      } else {
        var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++);
        s.appendChild(node.cloneNode(true)); out.push(s);
      }
    });
    h.textContent = ''; out.forEach(function (n) { h.appendChild(n); });
  })();

  var nav = $('#nav'), pill = $('#pill'), ind = $('#ind'), prog = $('#prog');
  var navLinks = $$('.nav__link'), activeLink = null;
  function moveInd(el) {
    if (!el || !pill || !ind) { if (ind) ind.style.opacity = '0'; return; }
    var p = pill.getBoundingClientRect(), r = el.getBoundingClientRect();
    ind.style.width = r.width + 'px'; ind.style.transform = 'translateX(' + (r.left - p.left) + 'px)'; ind.style.opacity = '1';
  }
  navLinks.forEach(function (l) { l.addEventListener('mouseenter', function () { moveInd(l); }); });
  if (pill) pill.addEventListener('mouseleave', function () { moveInd(activeLink); });
  var ticking = false;
  function onScroll() {
    var d = document.documentElement, max = d.scrollHeight - d.clientHeight;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? d.scrollTop / max : 0) + ')';
    if (nav) nav.classList.toggle('is-stuck', d.scrollTop > 18);
    if (d.scrollTop < 140) { navLinks.forEach(function (l) { l.classList.remove('is-active'); }); activeLink = null; moveInd(null); }
  }
  window.addEventListener('scroll', function () { if (ticking) return; ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }, { passive: true });
  onScroll();
  if (HAS_IO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var l = navLinks.filter(function (x) { return x.getAttribute('href') === '#' + e.target.id; })[0];
        if (!l) return;
        navLinks.forEach(function (x) { x.classList.remove('is-active'); });
        l.classList.add('is-active'); activeLink = l; moveInd(l);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'events', 'symposium', 'resources', 'join', 'faq'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }
  window.addEventListener('resize', function () { moveInd(activeLink); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInd(activeLink); });

  var menu = $('#menu'), burger = $('#burger'), menuClose = $('#menuClose');
  function setMenu(open) { if (!menu) return; menu.classList.toggle('is-open', open); if (burger) burger.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('is-locked', open); }
  if (burger) burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  if (menuClose) menuClose.addEventListener('click', function () { setMenu(false); });
  $$('.menu__link').forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var graph = (function () {
    var noop = { pulse: function () {} };
    var cv = $('#graph'); if (!cv || !cv.getContext) return noop;
    var ctx = cv.getContext('2d'); if (!ctx) return noop;
    var AREAS = ['systems','machine learning','theory','security','HCI','networks','vision','robotics'];
    var W = 0, H = 0, nodes = [], rings = [], raf = 0, live = true, pulseStart = -1;
    var mouse = { x: -999, y: -999, on: false };
    var LINK = 138, REACH = 170;
    function build() {
      var n = Math.max(28, Math.min(96, Math.round(W * H / 12000)));
      var labelled = W > 820 ? 7 : 0; nodes = [];
      for (var i = 0; i < n; i++) {
        var hub = i < labelled;
        nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .24, vy: (Math.random() - .5) * .24,
          r: hub ? 3.0 : Math.random() * 1.4 + .8, hub: hub, label: hub ? AREAS[i % AREAS.length] : '', lit: 0 });
      }
    }
    function resize() {
      var r = cv.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(); if (REDUCED) frame(0);
    }
    function frame(now) {
      ctx.clearRect(0, 0, W, H);
      var wave = -1;
      if (pulseStart > 0) { wave = ((now - pulseStart) / 1000) * 780; if (wave > Math.sqrt(W * W + H * H)) pulseStart = -1; }
      var cx = W / 2, cy = H / 2, i, j, k, a, b, d, dx, dy;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i]; if (REDUCED) continue;
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) { a.vx *= -1; a.x = Math.max(0, Math.min(W, a.x)); }
        if (a.y < 0 || a.y > H) { a.vy *= -1; a.y = Math.max(0, Math.min(H, a.y)); }
        if (mouse.on) { dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy) || 1; if (d < REACH) { a.vx += (dx / d) * .012; a.vy += (dy / d) * .012; } }
        for (k = 0; k < rings.length; k++) { dx = a.x - rings[k].x; dy = a.y - rings[k].y; d = Math.sqrt(dx * dx + dy * dy) || 1; if (Math.abs(d - rings[k].r) < 26) { a.vx += (dx / d) * .5; a.vy += (dy / d) * .5; } }
        var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (sp > .75) { a.vx = a.vx / sp * .75; a.vy = a.vy / sp * .75; }
        if (sp < .05) { a.vx += (Math.random() - .5) * .05; a.vy += (Math.random() - .5) * .05; }
        a.vx *= .994; a.vy *= .994;
        if (wave > 0) { dx = a.x - cx; dy = a.y - cy; if (Math.abs(Math.sqrt(dx * dx + dy * dy) - wave) < 60) a.lit = 1; }
        a.lit *= .955;
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy); if (d > LINK) continue;
          var lit = Math.max(a.lit, b.lit); var al = (1 - d / LINK) * .34 + lit * .5;
          ctx.strokeStyle = lit > .05 ? 'rgba(127,176,255,' + Math.min(al, .95).toFixed(3) + ')' : 'rgba(150,190,230,' + al.toFixed(3) + ')';
          ctx.lineWidth = lit > .05 ? 1.15 : .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        if (mouse.on && !REDUCED) {
          dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < REACH) { ctx.strokeStyle = 'rgba(76,141,255,' + ((1 - d / REACH) * .6).toFixed(3) + ')'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i]; var near = 0;
        if (mouse.on && !REDUCED) { dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy); near = d < REACH ? 1 - d / REACH : 0; }
        var glow = Math.max(near, a.lit), rad = a.r + glow * 2.4;
        if (glow > .02) { ctx.beginPath(); ctx.arc(a.x, a.y, rad + 7 * glow, 0, Math.PI * 2); ctx.fillStyle = 'rgba(76,141,255,' + (.16 * glow).toFixed(3) + ')'; ctx.fill(); }
        ctx.beginPath(); ctx.arc(a.x, a.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = a.hub ? 'rgba(160,198,236,' + (.85 + .15 * glow).toFixed(3) + ')' : 'rgba(127,176,255,' + (.52 + .45 * glow).toFixed(3) + ')';
        ctx.fill();
        if (a.hub && a.label) {
          ctx.font = '600 11.5px "IBM Plex Mono", monospace'; ctx.save();
          ctx.shadowColor = 'rgba(2,10,24,.9)'; ctx.shadowBlur = 6;
          ctx.fillStyle = 'rgba(196,218,244,' + (.66 + .32 * glow).toFixed(3) + ')';
          ctx.fillText(a.label, a.x + 10, a.y + 3.5); ctx.restore();
        }
      }
      for (i = rings.length - 1; i >= 0; i--) {
        var R = rings[i]; R.r += 5.5; R.a *= .955;
        ctx.beginPath(); ctx.arc(R.x, R.y, R.r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(76,141,255,' + R.a.toFixed(3) + ')'; ctx.lineWidth = 1.3; ctx.stroke();
        if (R.a < .02) rings.splice(i, 1);
      }
      if (!REDUCED && live) raf = requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', function () { cancelAnimationFrame(raf); resize(); if (!REDUCED && live) raf = requestAnimationFrame(frame); });
    if (!REDUCED) {
      raf = requestAnimationFrame(frame);
      cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
      cv.addEventListener('pointerleave', function () { mouse.on = false; });
      var hero = $('#top');
      if (hero) hero.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a, button, input, .quest, .term')) return;
        var r = cv.getBoundingClientRect(); var x = e.clientX - r.left, y = e.clientY - r.top;
        if (x < 0 || y < 0 || x > W || y > H) return;
        rings.push({ x: x, y: y, r: 4, a: .55 });
        if (nodes.length < 130) nodes.push({ x: x, y: y, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: 1.9, hub: false, label: '', lit: 1 });
      });
      if (HAS_IO) new IntersectionObserver(function (es) { live = es[0].isIntersecting; cancelAnimationFrame(raf); if (live) raf = requestAnimationFrame(frame); }, { threshold: 0 }).observe(cv);
      document.addEventListener('visibilitychange', function () { cancelAnimationFrame(raf); if (!document.hidden && live) raf = requestAnimationFrame(frame); });
    }
    return { pulse: function () { if (REDUCED) return; pulseStart = performance.now(); rings.push({ x: W / 2, y: H / 2, r: 6, a: .5 }); } };
  })();

  $$('[data-stagger]').forEach(function (g) { $$('[data-reveal]', g).forEach(function (el, i) { el.style.setProperty('--d', (i * 80) + 'ms'); }); });
  function reveal(root) {
    var items = $$('[data-reveal]', root || document);
    if (REDUCED || !HAS_IO) { items.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add('is-in'); o.unobserve(e.target); }); }, { threshold: .1, rootMargin: '0px 0px -60px' });
    items.forEach(function (e) { if (!e.classList.contains('is-in')) io.observe(e); });
  }
  function spotlight(root) {
    if (!HOVERS || REDUCED) return;
    $$('.card, .evt, .res, .jcard, .sub', root || document).forEach(function (c) {
      if (c.__spot) return; c.__spot = true;
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
  }
  if (HOVERS && !REDUCED) {
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .14) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  (function () {
    var steps = $$('.quest__step'), fill = $('#questFill'), count = $('#questCount'), note = $('#questNote');
    var done = store.get('csegsa.quest', []) || [];
    var BASE = (CONFIG.content && CONFIG.content.quest && CONFIG.content.quest.note) || '';
    var WIN = (CONFIG.content && CONFIG.content.quest && CONFIG.content.quest.noteWin) || '';
    function paint(celebrate) {
      steps.forEach(function (s) {
        var i = +s.getAttribute('data-step'), on = done.indexOf(i) > -1;
        s.classList.toggle('is-done', on); s.setAttribute('aria-pressed', String(on)); s.querySelector('.quest__num').textContent = on ? '\u2713' : String(i + 1);
      });
      if (fill) fill.style.width = (done.length / steps.length * 100) + '%';
      if (count) count.textContent = done.length + '/' + steps.length;
      var win = done.length === steps.length;
      if (note) { note.classList.toggle('is-win', win); note.textContent = win ? WIN : BASE; }
      if (win && celebrate) graph.pulse();
    }
    steps.forEach(function (s) { s.addEventListener('click', function () { var i = +s.getAttribute('data-step'), at = done.indexOf(i); if (at > -1) done.splice(at, 1); else done.push(i); store.set('csegsa.quest', done); paint(true); }); });
    paint(false);
  })();

  $$('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement, open = item.classList.contains('is-open');
      $$('.faq__item').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('.faq__q').setAttribute('aria-expanded', 'false'); });
      if (!open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });
  var CATS = [{k:'all',l:'All'},{k:'social',l:'Social'},{k:'professional',l:'Professional'},{k:'wellness',l:'Wellness'},{k:'service',l:'Service'}];
  var evCat = 'all', evWhen = 'upcoming', evtList = $('#evtList');
  var MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  function icsText(ev) {
    var s = new Date(ev.start), e = new Date(s.getTime() + (ev.minutes || 90) * 60000);
    var z = function (d) { return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; };
    var q = function (t) { return String(t == null ? '' : t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); };
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CSE-GSA//Penn State//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
      'UID:' + Math.random().toString(36).slice(2) + '@cse-gsa.psu','DTSTAMP:' + z(new Date()),'DTSTART:' + z(s),'DTEND:' + z(e),
      'SUMMARY:' + q('CSE-GSA: ' + ev.title),'LOCATION:' + q(ev.location),'DESCRIPTION:' + q(ev.description),'END:VEVENT','END:VCALENDAR'].join('\r\n');
  }
  function download(ev) {
    try {
      var blob = new Blob([icsText(ev)], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.ics';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    } catch (e) { console.warn('[CSE-GSA] Calendar download blocked here; works on the live site.', e); }
  }
  function upcomingList() {
    var now = Date.now();
    return (CONFIG.events || []).map(function (e) { var t = new Date(e.start).getTime(); return Object.assign({}, e, { _t: isNaN(t) ? 0 : t }); })
      .filter(function (e) { return e._t >= now; }).sort(function (a, b) { return a._t - b._t; });
  }
  function fmtDate(t) { var d = new Date(t); return WD[d.getDay()] + ' ' + MO[d.getMonth()] + ' ' + d.getDate() + ', ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function setWhen(w) { evWhen = w; $$('#evtWhen button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-when') === w)); }); renderEvents(); }
  function renderEvents() {
    if (!evtList) return;
    var now = Date.now();
    var all = (CONFIG.events || []).map(function (e) { var t = new Date(e.start).getTime(); return Object.assign({}, e, { _t: isNaN(t) ? 0 : t }); });
    var list = all.filter(function (e) { if ((e._t >= now ? 'upcoming' : 'past') !== evWhen) return false; return evCat === 'all' || e.category === evCat; });
    list.sort(function (a, b) { return evWhen === 'upcoming' ? a._t - b._t : b._t - a._t; });
    if (!list.length) {
      evtList.innerHTML = '<div class="empty" data-reveal><h3 class="h-md">' + (evWhen === 'upcoming' ? 'Nothing scheduled right now.' : 'No past events in this category.') + '</h3><p>'
        + (evWhen === 'upcoming' ? 'Join the Discord and we will post the next one there.' : 'Try another category, or see what is coming up.') + '</p>'
        + (evWhen === 'upcoming' ? '<a class="btn btn--primary" data-link="groupChat">Open the Discord</a>' : '<button class="btn btn--ghost" id="toUpcoming">See upcoming events</button>') + '</div>';
      wireLinks(evtList); var back = $('#toUpcoming'); if (back) back.addEventListener('click', function () { setWhen('upcoming'); }); reveal(evtList); return;
    }
    evtList.innerHTML = list.map(function (e) {
      var d = new Date(e._t), past = e._t < now;
      var time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      var rsvp = (e.rsvp || linkOf('eventRsvpForm')).trim();
      return '<article class="evt' + (past ? ' is-past' : '') + '" data-reveal>'
        + '<div class="evt__date"><span class="evt__mo">' + MO[d.getMonth()] + '</span><span class="evt__dy">' + d.getDate() + '</span><span class="evt__wd">' + WD[d.getDay()] + '</span></div>'
        + '<div class="evt__body"><h3>' + esc(e.title) + '</h3><div class="evt__meta"><span>' + time + '</span>'
        + (e.location ? '<span>' + esc(e.location) + '</span>' : '') + '<span class="tag">' + esc(e.category || '') + '</span></div><p>' + esc(e.description) + '</p></div>'
        + '<div class="evt__act">'
        + (!past && rsvp ? '<a class="btn btn--primary btn--sm" href="' + esc(rsvp) + '" target="_blank" rel="noopener noreferrer">RSVP</a>' : '')
        + (!past ? '<button class="btn btn--ghost btn--sm" data-ics="' + esc(e.title) + '">Add to calendar</button>' : '') + '</div></article>';
    }).join('');
    $$('[data-ics]', evtList).forEach(function (b) { b.addEventListener('click', function () { var t = b.getAttribute('data-ics'); var ev = list.filter(function (x) { return x.title === t; })[0]; if (ev) download(ev); }); });
    spotlight(evtList); reveal(evtList);
  }
  (function () {
    var box = $('#evtFilters');
    if (box) {
      box.innerHTML = CATS.map(function (c) { return '<button class="f-chip" data-cat="' + c.k + '" aria-pressed="' + (c.k === 'all') + '">' + c.l + '</button>'; }).join('');
      box.addEventListener('click', function (e) { var b = e.target.closest('.f-chip'); if (!b) return; evCat = b.getAttribute('data-cat'); $$('.f-chip', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); renderEvents(); });
    }
    var seg = $('#evtWhen'); if (seg) seg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setWhen(b.getAttribute('data-when')); });
    renderEvents();
  })();

  var RES = (CONFIG.resources || []).slice();
  var resCat = 'All', resQ = '';
  var resGrid = $('#resGrid'), resFilters = $('#resFilters'), resCountEl = $('#resCount');
  function parseCSV(text) {
    var rows = [], row = [], f = '', i = 0, inQ = false, c;
    while (i < text.length) {
      c = text.charAt(i);
      if (inQ) { if (c === '"') { if (text.charAt(i + 1) === '"') { f += '"'; i += 2; continue; } inQ = false; i++; continue; } f += c; i++; continue; }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ',') { row.push(f); f = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(f); f = ''; rows.push(row); row = []; i++; continue; }
      f += c; i++;
    }
    row.push(f); rows.push(row);
    return rows.filter(function (r) { return r.some(function (x) { return String(x).trim() !== ''; }); });
  }
  function rowsToResources(rows) {
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
    var iT = head.indexOf('title'), iD = head.indexOf('description'), iU = head.indexOf('url'), iC = head.indexOf('category'), iG = head.indexOf('tags');
    if (iT < 0 || iU < 0) return [];
    return rows.slice(1).map(function (r) {
      var get = function (n) { return n >= 0 && r[n] != null ? String(r[n]).trim() : ''; };
      return { title: get(iT), description: get(iD), url: get(iU), category: get(iC) || 'Other', tags: get(iG) ? get(iG).split(',').map(function (t) { return t.trim(); }).filter(Boolean) : [] };
    }).filter(function (x) { return x.title && x.url; });
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function renderFilters() {
    if (!resFilters) return;
    var cats = ['All']; RES.forEach(function (r) { if (r.category && cats.indexOf(r.category) < 0) cats.push(r.category); });
    if (cats.indexOf(resCat) < 0) resCat = 'All';
    resFilters.innerHTML = cats.map(function (c) { return '<button class="f-chip" data-cat="' + esc(c) + '" aria-pressed="' + (c === resCat) + '">' + esc(c) + '</button>'; }).join('');
  }
  function renderRes() {
    if (!resGrid) return;
    var q = resQ.trim().toLowerCase();
    var list = RES.filter(function (r) { if (resCat !== 'All' && r.category !== resCat) return false; if (!q) return true; return [r.title, r.description, r.category, (r.tags || []).join(' ')].join(' ').toLowerCase().indexOf(q) > -1; });
    if (resCountEl) resCountEl.textContent = list.length + ' of ' + RES.length + ' shown';
    if (!list.length) {
      resGrid.innerHTML = '<div class="empty" data-reveal><h3 class="h-md">Nothing matches that.</h3><p>Try a shorter word, clear the filter, or tell us what we are missing.</p><a class="btn btn--primary" data-mailto data-subject="Resource for CSE-GSA">Email us a resource</a></div>';
      wireLinks(resGrid); reveal(resGrid); return;
    }
    resGrid.innerHTML = list.map(function (r) {
      var h = host(r.url);
      return '<a class="res" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer" data-reveal>'
        + '<div class="res__top"><span class="tag">' + esc(r.category || 'Other') + '</span><svg class="res__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></div>'
        + '<h3>' + esc(r.title) + '</h3><p>' + esc(r.description) + '</p>'
        + ((r.tags && r.tags.length) ? '<div class="res__tags">' + r.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '')
        + (h ? '<span class="res__host">' + esc(h) + '</span>' : '') + '</a>';
    }).join('');
    spotlight(resGrid); reveal(resGrid);
  }
  if (resFilters) resFilters.addEventListener('click', function (e) { var b = e.target.closest('.f-chip'); if (!b) return; resCat = b.getAttribute('data-cat'); $$('.f-chip', resFilters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); renderRes(); });
  var search = $('#resSearch');
  if (search) {
    search.addEventListener('input', function () { resQ = search.value; renderRes(); });
    document.addEventListener('keydown', function (e) { var ae = document.activeElement || document.body; if (e.key === '/' && ae !== search && !/^(INPUT|TEXTAREA)$/.test(ae.tagName)) { e.preventDefault(); search.focus(); } });
  }
  (function loadResources() {
    var url = (CONFIG.resourcesSheetUrl || '').trim(); renderFilters();
    if (!url || typeof fetch !== 'function') { renderRes(); return; }
    if (resGrid) resGrid.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
    fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (text) { var data = rowsToResources(parseCSV(text)); if (data.length) RES = data; else console.warn('[CSE-GSA] Sheet loaded but had no usable rows. Header must be: title, description, url, category, tags'); })
      .catch(function (err) { console.warn('[CSE-GSA] Could not read the resources sheet, showing the built-in list instead.', err); })
      .then(function () { renderFilters(); renderRes(); });
  })();

  (function () {
    var term = $('#term'), body = $('#termBody'), out = $('#termOut'), text = $('#termText'), hidden = $('#termHidden'), chipBox = $('#termChips');
    if (!term || !hidden) return;
    var buf = '', hist = [], hi = -1;
    var A = function (href, label) { return '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>'; };
    function scrollDown() { body.scrollTop = body.scrollHeight; }
    function print(html, cls) { var div = document.createElement('div'); div.className = 'l' + (cls ? ' ' + cls : ''); div.innerHTML = html; out.appendChild(div); scrollDown(); }
    function goto(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); }

    var COMMANDS = {
      help: function () {
        print('available commands:', 'muted');
        print('about      what CSE-GSA is');
        print('events     the next thing on the calendar');
        print('symposium  present your research');
        print('resources  jump to the resource library');
        print('join       how to become a member');
        print('socials    discord, instagram, linkedin');
        print('contact    email us');
        print('clear      clear the screen');
      },
      about: function () { print('CSE-GSA is the graduate student association for Computer Science and Engineering at Penn State.'); },
      events: function () {
        var up = upcomingList();
        if (!up.length) { print('no events scheduled right now. try', 'muted'); return; }
        print('next up: ' + esc(up[0].title));
        print('         ' + fmtDate(up[0]._t) + (up[0].location ? ', ' + esc(up[0].location) : ''), 'muted');
        print('scrolling to events...', 'muted'); goto('events');
      },
      symposium: function () { print('give a talk or present a poster at the research symposium.'); print('scrolling to symposium...', 'muted'); goto('symposium'); },
      resources: function () { print(RES.length + ' resources available.'); print('scrolling to resources...', 'muted'); goto('resources'); },
      join: function () {
        var m = linkOf('membership');
        if (m) print('register here: ' + A(m, m)); else print('membership link not configured yet.', 'warn');
        print('scrolling to join...', 'muted'); goto('join');
      },
      socials: function () {
        var d = linkOf('groupChat'), ig = linkOf('instagram'), li = linkOf('linkedin');
        if (d) print('discord    ' + A(d, d)); if (ig) print('instagram  ' + A(ig, ig)); if (li) print('linkedin   ' + A(li, li));
        if (!d && !ig && !li) print('no socials configured yet.', 'warn');
      },
      contact: function () { var e = (CONFIG.email || '').trim(); if (e) print('email: ' + A('mailto:' + e, e)); else print('no email configured yet.', 'warn'); },
      whoami: function () { print('visitor@cse-gsa (prospective member)'); },
      ls: function () { print('about  events  symposium  resources  join  faq', 'muted'); },
      clear: function () { out.innerHTML = ''; }
    };

    function run(raw) {
      var cmd = String(raw || '').trim();
      if (!cmd) return;
      print('<span class="term__prompt">visitor@cse-gsa:~$</span> <span class="cmd">' + esc(cmd) + '</span>');
      hist.push(cmd); hi = hist.length;
      var name = cmd.split(/\s+/)[0].toLowerCase();
      if (name === 'sudo') { print('permission denied. try \'join\' instead.', 'warn'); return; }
      if (COMMANDS[name]) COMMANDS[name](); else print('command not found: ' + esc(name) + '. type \'help\'.', 'warn');
    }

    function render() { text.textContent = buf; }
    hidden.addEventListener('input', function () { buf = hidden.value; render(); scrollDown(); });
    hidden.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); run(buf); buf = ''; hidden.value = ''; render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) { hi--; buf = hist[hi] || ''; hidden.value = buf; render(); } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < hist.length - 1) { hi++; buf = hist[hi] || ''; } else { hi = hist.length; buf = ''; } hidden.value = buf; render(); }
    });
    body.addEventListener('click', function (e) { if (e.target.closest('a')) return; hidden.focus(); });

    var QUICK = ['help', 'events', 'join', 'socials', 'resources', 'clear'];
    chipBox.innerHTML = QUICK.map(function (c) { return '<button class="term__chip" data-cmd="' + c + '">' + c + '</button>'; }).join('');
    chipBox.addEventListener('click', function (e) { var b = e.target.closest('.term__chip'); if (!b) return; run(b.getAttribute('data-cmd')); hidden.focus(); });

    function boot() {
      var lines = [
        { t: 'cse-gsa shell ready', c: 'muted' },
        { t: 'type a command or tap one below. try \'help\'.', c: 'muted' }
      ];
      if (REDUCED) { lines.forEach(function (l) { print(esc(l.t), l.c); }); return; }
      var i = 0;
      (function next() {
        if (i >= lines.length) return;
        print(esc(lines[i].t), lines[i].c); i++;
        setTimeout(next, 380);
      })();
    }
    boot();
  })();

  reveal(document);
  spotlight(document);
})();
