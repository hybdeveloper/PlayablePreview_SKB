/* Playable Preview — Drive-style browser + AppLovin-style player. No build step. */
(() => {
  'use strict';

  const APPLOVIN_MAX_BYTES = 5 * 1024 * 1024;

  const DEVICES = [
    { id: 'iphone15', name: 'iPhone 15', w: 393, h: 852, radius: 46, notch: 'island' },
    { id: 'iphonese', name: 'iPhone SE', w: 375, h: 667, radius: 8, notch: 'none' },
    { id: 'pixel7', name: 'Pixel 7', w: 412, h: 915, radius: 34, notch: 'punch' },
    { id: 'galaxys23', name: 'Galaxy S23', w: 360, h: 780, radius: 32, notch: 'punch' },
    { id: 'ipad', name: 'iPad 10.2"', w: 810, h: 1080, radius: 18, notch: 'none', tablet: true },
  ];

  const P = {
    menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    play: 'M8 5v14l11-7z',
    search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    folder: 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
    caret: 'M10 17l5-5-5-5v10z',
    chevron: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    grid: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z',
    list: 'M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z',
    arrowUp: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    reload: 'M17.65 6.35A7.958 7.958 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    rotate: 'M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77a1.49 1.49 0 0 0-2.12 0L1.75 8.11a1.49 1.49 0 0 0 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29A10.487 10.487 0 0 1 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z',
    fullscreen: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
    openNew: 'M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
    tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
    portrait: 'M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z',
    landscape: 'M1 7v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2zm18 0v10H5V7h14z',
    check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    empty: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z',
  };
  const icon = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[name]}"/></svg>`;
  const htmlIcon = `<svg class="i file-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="#e8710a"/><path fill="#fff" transform="translate(4.8 4.8) scale(.6)" d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`;

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pp.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pp.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const encodePath = p => p.split('/').map(encodeURIComponent).join('/');
  const href = {
    folder: p => (p ? '#/f/' + encodePath(p) : '#/'),
    play: p => '#/p/' + encodePath(p),
  };
  const gameUrl = g => 'games/' + encodePath(g.entry);
  const absUrl = u => new URL(u, location.href).href;
  const parentPath = p => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const isCompact = () => matchMedia('(max-width: 800px)').matches;

  function fmtSize(b) {
    if (b == null) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(b < 10240 ? 1 : 0) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  }
  function fmtDate(ms) {
    if (!ms) return '—';
    const d = new Date(ms), now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
  }
  function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- state ---------- */
  const state = {
    manifest: null,
    folders: new Map(),
    games: new Map(),
    route: { name: 'folder', path: '' },
    query: '',
    view: store.get('view', 'grid'),
    sort: store.get('sort', { key: 'name', dir: 1 }),
    expanded: new Set(),
    device: store.get('device', DEVICES[0].id),
    landscape: store.get('landscape', false),
    inject: store.get('inject', true),
    showFrame: store.get('frame', true),
    current: null,
    frameEl: null,
    loadToken: 0,
    navigated: false,
  };

  function indexTree(node) {
    if (node.type === 'folder') {
      state.folders.set(node.path, node);
      node.children.forEach(indexTree);
    } else {
      state.games.set(node.path, node);
    }
  }

  /* ---------- routing ---------- */
  function parseRoute() {
    const m = location.hash.match(/^#\/(f|p|recent)(?:\/(.*))?$/);
    if (!m) return { name: 'folder', path: '' };
    const path = (m[2] || '').split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch { return s; } }).join('/');
    return { name: m[1] === 'f' ? 'folder' : m[1] === 'p' ? 'play' : 'recent', path };
  }

  function render() {
    const r = parseRoute();
    if (r.name === 'play') {
      const g = state.games.get(r.path);
      if (g) return openPlayer(g);
      toast('Playable not found: ' + r.path);
      location.replace(href.folder(parentPath(r.path)));
      return;
    }
    closePlayer();
    if (r.name === 'folder' && !state.folders.has(r.path)) r.path = '';
    state.route = r;
    if (r.name === 'folder') {
      let p = '';
      for (const seg of r.path.split('/').filter(Boolean)) { p = p ? p + '/' + seg : seg; state.expanded.add(p); }
    }
    renderSidebar();
    renderMain();
    document.body.classList.remove('drawer-open');
  }

  /* ---------- sidebar ---------- */
  function treeHTML(folder, depth) {
    return folder.children.filter(c => c.type === 'folder').map(f => {
      const hasSubs = f.children.some(c => c.type === 'folder');
      const open = state.expanded.has(f.path);
      const active = state.route.name === 'folder' && !state.query && state.route.path === f.path;
      return `<div class="tree-row${active ? ' active' : ''}" style="--d:${depth}">
          ${hasSubs ? `<button class="caret${open ? ' open' : ''}" data-toggle="${esc(f.path)}" aria-label="Expand">${icon('caret')}</button>` : '<span class="caret"></span>'}
          <a href="${href.folder(f.path)}" title="${esc(f.name)}">${icon('folder', 'folder-ic')}<span>${esc(f.name)}</span></a>
        </div>${hasSubs && open ? treeHTML(f, depth + 1) : ''}`;
    }).join('');
  }

  function renderSidebar() {
    const root = state.manifest.root;
    $('#tree').innerHTML = treeHTML(root, 0) || '<p class="tree-empty">No folders yet</p>';
    document.querySelectorAll('[data-nav]').forEach(a => {
      const on = !state.query && (a.dataset.nav === 'recent' ? state.route.name === 'recent' : state.route.name === 'folder' && state.route.path === '');
      a.classList.toggle('active', on);
    });
    $('#stats').textContent = `${state.manifest.count} playable${state.manifest.count === 1 ? '' : 's'} · built ${fmtDate(state.manifest.generatedAt)}`;
  }

  /* ---------- main listing ---------- */
  function sortItems(items) {
    const { key, dir } = state.sort;
    return [...items].sort((a, b) =>
      (a.type === b.type ? 0 : a.type === 'folder' ? -1 : 1) ||
      dir * (key === 'name' ? collator.compare(a.title, b.title) : (a[key] || 0) - (b[key] || 0)) ||
      collator.compare(a.title, b.title));
  }

  function countGames(folder) {
    return folder.children.reduce((n, c) => n + (c.type === 'game' ? 1 : countGames(c)), 0);
  }

  function crumbsHTML(path) {
    const parts = [`<a href="#/">${esc(state.manifest.root.name)}</a>`];
    let p = '';
    for (const seg of path.split('/').filter(Boolean)) {
      p = p ? p + '/' + seg : seg;
      parts.push(`<a href="${href.folder(p)}">${esc(seg)}</a>`);
    }
    return parts.join(icon('chevron', 'sep'));
  }

  function thumbHTML(g) {
    if (g.thumb) return `<img src="games/${encodePath(g.thumb)}" alt="" loading="lazy">`;
    const h = hue(g.path);
    return `<div class="thumb-ph" style="--h:${h}"><span>${esc((g.title.trim()[0] || '?').toUpperCase())}</span></div>`;
  }

  function renderMain() {
    const r = state.route;
    const q = state.query.trim();
    let items, crumbs, withLocation = false, sorted = true;

    if (q) {
      const fq = fold(q);
      items = [...state.folders.values(), ...state.games.values()].filter(n => n.path && (fold(n.title).includes(fq) || fold(n.name).includes(fq)));
      crumbs = `<span>Search results for “${esc(q)}”</span>`;
      withLocation = true;
    } else if (r.name === 'recent') {
      items = [...state.games.values()].sort((a, b) => b.modified - a.modified).slice(0, 60);
      crumbs = '<span>Recent</span>';
      withLocation = true;
      sorted = false;
    } else {
      items = state.folders.get(r.path).children;
      crumbs = crumbsHTML(r.path);
    }
    if (sorted) items = sortItems(items);

    $('#crumbs').innerHTML = crumbs;
    document.querySelectorAll('#viewToggle button').forEach(b => b.classList.toggle('on', b.dataset.view === state.view));
    $('#sortKey').value = state.sort.key;
    $('#sortKey').disabled = $('#sortDir').disabled = !sorted;
    $('#sortDir').classList.toggle('desc', state.sort.dir < 0);

    const content = $('#content');
    if (!items.length) {
      content.innerHTML = `<div class="empty">${icon('empty')}<p>${q ? 'No playables match your search' : 'This folder is empty'}</p>
        ${q ? '' : '<small>Put <code>.html</code> files or folders with an <code>index.html</code> into <code>games/</code> and push.</small>'}</div>`;
      return;
    }
    content.innerHTML = state.view === 'list' ? listHTML(items, withLocation, sorted) : gridHTML(items, withLocation);
  }

  function gridHTML(items, withLocation) {
    const folders = items.filter(i => i.type === 'folder');
    const games = items.filter(i => i.type === 'game');
    let html = '';
    if (folders.length) {
      html += `<h2 class="section-title">Folders</h2><div class="folder-grid">${folders.map(f => {
        const n = countGames(f);
        return `<a class="folder-card" href="${href.folder(f.path)}" title="${esc(f.path)}">
          ${icon('folder', 'folder-ic')}<span class="fc-name">${esc(f.name)}</span><span class="fc-meta">${n}</span></a>`;
      }).join('')}</div>`;
    }
    if (games.length) {
      html += `<h2 class="section-title">Playables</h2><div class="game-grid">${games.map(g => `
        <a class="game-card" href="${href.play(g.path)}" title="${esc(g.path)}">
          <div class="thumb">${thumbHTML(g)}<span class="play-badge">${icon('play')}</span>
            ${g.kind === 'folder' ? '<span class="kind-badge">folder</span>' : ''}</div>
          <div class="gc-foot">${htmlIcon}<div class="gc-text"><span class="gc-name">${esc(g.title)}</span>
            <span class="gc-meta">${withLocation ? esc(parentPath(g.path) || state.manifest.root.name) : `${fmtSize(g.size)} · ${fmtDate(g.modified)}`}</span></div></div>
        </a>`).join('')}</div>`;
    }
    return html;
  }

  function listHTML(items, withLocation, sortable) {
    const head = (key, label) => sortable
      ? `<button data-sort="${key}" class="lh-${key}${state.sort.key === key ? ' on' + (state.sort.dir < 0 ? ' desc' : '') : ''}">${label}${icon('arrowUp', 'sort-ic')}</button>`
      : `<span class="lh-${key}">${label}</span>`;
    return `<div class="list${withLocation ? ' with-loc' : ''}">
      <div class="list-head">${head('name', 'Name')}${withLocation ? '<span class="lh-loc">Location</span>' : ''}${head('modified', 'Modified')}${head('size', 'Size')}</div>
      ${items.map(n => {
        const isFolder = n.type === 'folder';
        const loc = parentPath(n.path);
        return `<a class="list-row" href="${isFolder ? href.folder(n.path) : href.play(n.path)}" title="${esc(n.path)}">
          <span class="lr-name">${isFolder ? icon('folder', 'folder-ic') : htmlIcon}<span>${esc(isFolder ? n.name : n.title)}</span>
            ${!isFolder && n.kind === 'folder' ? '<em class="tag">folder</em>' : ''}</span>
          ${withLocation ? `<span class="lr-loc">${icon('folder', 'folder-ic sm')}${esc(loc || state.manifest.root.name)}</span>` : ''}
          <span class="lr-date">${fmtDate(n.modified)}</span>
          <span class="lr-size">${isFolder ? countGames(n) + ' items' : fmtSize(n.size)}</span>
        </a>`;
      }).join('')}
    </div>`;
  }

  /* ---------- player ---------- */

  // Runs inside the playable's iframe (serialised into the page). Mimics the
  // MRAID container AppLovin provides and reports activity to the preview.
  function mraidStub() {
    if (window.__ppStub) return;
    window.__ppStub = true;
    var post = function (type, detail) {
      try { parent.postMessage({ __pp: 1, type: type, detail: String(detail == null ? '' : detail) }, '*'); } catch (e) { /* ignore */ }
    };
    var listeners = {}, state = 'loading', viewable = false;
    var orientation = { allowOrientationChange: true, forceOrientation: 'none' };
    var size = function () { return { width: window.innerWidth, height: window.innerHeight }; };
    var rect = function () { var s = size(); return { x: 0, y: 0, width: s.width, height: s.height }; };
    function fire(ev) {
      var args = Array.prototype.slice.call(arguments, 1);
      (listeners[ev] || []).slice().forEach(function (fn) {
        try { fn.apply(window, args); } catch (e) { post('error', (e && e.stack) || e); }
      });
    }
    window.mraid = {
      getVersion: function () { return '3.0'; },
      getState: function () { return state; },
      getPlacementType: function () { return 'interstitial'; },
      isViewable: function () { return viewable; },
      getMaxSize: size,
      getScreenSize: size,
      getCurrentPosition: rect,
      getDefaultPosition: rect,
      getExpandProperties: function () { var s = size(); return { width: s.width, height: s.height, useCustomClose: false, isModal: true }; },
      setExpandProperties: function () {},
      getResizeProperties: function () { return {}; },
      setResizeProperties: function () {},
      getOrientationProperties: function () { return orientation; },
      setOrientationProperties: function (p) { orientation = p || orientation; post('mraid', 'setOrientationProperties(' + JSON.stringify(p) + ')'); },
      getCurrentAppOrientation: function () { var s = size(); return { orientation: s.width > s.height ? 'landscape' : 'portrait', locked: false }; },
      getAudioVolumePercentage: function () { return 100; },
      supports: function (f) { return f === 'inlineVideo'; },
      addEventListener: function (ev, fn) {
        if (typeof fn !== 'function') return;
        (listeners[ev] = listeners[ev] || []).push(fn);
        post('mraid', 'addEventListener("' + ev + '")');
      },
      removeEventListener: function (ev, fn) {
        if (!listeners[ev]) return;
        listeners[ev] = fn ? listeners[ev].filter(function (f) { return f !== fn; }) : [];
      },
      open: function (url) { post('cta', 'mraid.open(' + (url || '') + ')'); },
      close: function () { post('close', 'mraid.close()'); },
      unload: function () { post('close', 'mraid.unload()'); },
      expand: function () { post('mraid', 'expand()'); },
      resize: function () { post('mraid', 'resize()'); },
      useCustomClose: function (v) { post('mraid', 'useCustomClose(' + v + ')'); },
      playVideo: function (url) { post('mraid', 'playVideo(' + url + ')'); },
      storePicture: function (url) { post('mraid', 'storePicture(' + url + ')'); },
      createCalendarEvent: function () { post('mraid', 'createCalendarEvent()'); },
    };
    if (!window.ExitApi) window.ExitApi = { exit: function () { post('cta', 'ExitApi.exit()'); } };
    window.open = function (url) { post('cta', 'window.open(' + (url || '') + ')'); return null; };
    window.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t !== window && (t.src || t.href)) post('error', 'Failed to load ' + (t.src || t.href));
      else post('error', (e.message || 'Error') + (e.lineno ? ' (line ' + e.lineno + ')' : ''));
    }, true);
    window.addEventListener('unhandledrejection', function (e) { post('error', 'Unhandled rejection: ' + ((e.reason && e.reason.message) || e.reason)); });
    ['error', 'warn'].forEach(function (k) {
      var orig = console[k];
      console[k] = function () {
        post('console', k + ': ' + Array.prototype.map.call(arguments, String).join(' '));
        return orig.apply(console, arguments);
      };
    });
    var ready = function () {
      setTimeout(function () {
        state = 'default'; viewable = true;
        post('event', 'ready → stateChange(default) → viewableChange(true)');
        fire('ready'); fire('stateChange', 'default'); fire('viewableChange', true);
      }, 0);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
    var last = '';
    window.addEventListener('resize', function () {
      var s = size(), key = s.width + 'x' + s.height;
      if (key === last) return;
      last = key;
      fire('sizeChange', s.width, s.height);
    });
  }

  function injectHtml(html, baseHref) {
    const tag = `<base href="${esc(baseHref)}"><script>(${mraidStub.toString()})();<\/script>`;
    const m = html.match(/<head\b[^>]*>/i) || html.match(/<html\b[^>]*>/i) || html.match(/<!doctype[^>]*>/i);
    if (!m) return tag + html;
    const at = m.index + m[0].length;
    return html.slice(0, at) + tag + html.slice(at);
  }

  const els = {};

  function openPlayer(g) {
    const first = state.current !== g;
    state.current = g;
    els.player.hidden = false;
    document.body.classList.add('playing');
    document.title = `${g.title} · Playable Preview`;
    if (!first) return;

    if (g.orientation === 'landscape' || g.orientation === 'portrait') state.landscape = g.orientation === 'landscape';
    $('#pTitle').textContent = g.title;
    $('#pPath').textContent = g.path;
    els.open.href = gameUrl(g);
    const folder = parentPath(g.path);
    $('#info').innerHTML = `
      <dt>Type</dt><dd>${g.kind === 'file' ? 'Single HTML file' : 'HTML folder (index.html)'}</dd>
      <dt>Size</dt><dd>${fmtSize(g.size)}</dd>
      <dt>Modified</dt><dd>${new Date(g.modified).toLocaleString()}</dd>
      <dt>Folder</dt><dd><a href="${href.folder(folder)}">${esc(folder || state.manifest.root.name)}</a></dd>
      ${g.description ? `<dt>Notes</dt><dd>${esc(g.description)}</dd>` : ''}`;
    els.log.innerHTML = '';
    renderChecks(g, null);
    renderQR(g);
    syncControls();
    layout();
    loadGame();
  }

  function closePlayer() {
    if (!state.current) return;
    state.current = null;
    state.loadToken++;
    if (state.frameEl) { state.frameEl.remove(); state.frameEl = null; }
    els.player.hidden = true;
    document.body.classList.remove('playing', 'panel-open');
    document.title = 'Playable Preview';
  }

  function leavePlayer() {
    if (!state.current) return;
    if (state.navigated) history.back();
    else location.hash = href.folder(parentPath(state.current.path));
  }

  async function loadGame() {
    const g = state.current;
    const token = ++state.loadToken;
    if (state.frameEl) state.frameEl.remove();

    const frame = document.createElement('iframe');
    frame.title = g.title;
    frame.allow = 'autoplay; fullscreen; accelerometer; gyroscope; clipboard-write';
    state.frameEl = frame;

    const url = gameUrl(g);
    const t0 = performance.now();
    let html = null;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (e) {
      log('error', `Could not fetch ${g.entry} (${e.message})`);
    }
    if (token !== state.loadToken) return;

    renderChecks(g, html);
    if (state.inject && html != null) frame.srcdoc = injectHtml(html, absUrl(url));
    else frame.src = url;
    frame.addEventListener('load', () => {
      if (token === state.loadToken) log('info', `Loaded in ${Math.round(performance.now() - t0)} ms`);
    }, { once: true });
    els.screen.prepend(frame);
    log('info', `Loading ${g.entry}${state.inject && html != null ? ' (MRAID stub injected)' : ''}`);
  }

  function renderChecks(g, html) {
    const rows = [
      g.size <= APPLOVIN_MAX_BYTES
        ? ['ok', `Size ${fmtSize(g.size)} (≤ 5 MB)`]
        : ['warn', `Size ${fmtSize(g.size)} exceeds 5 MB`],
      g.kind === 'file'
        ? ['ok', 'Single self-contained HTML']
        : ['warn', 'Multi-file build — AppLovin needs one HTML file'],
    ];
    if (html != null) {
      rows.push(/mraid\s*\.\s*open\s*\(/.test(html)
        ? ['ok', 'CTA uses mraid.open()']
        : ['warn', g.kind === 'file' ? 'No mraid.open() call found' : 'No mraid.open() in index.html (other files not scanned)']);
      const ext = (html.match(/(?:src|href)\s*=\s*["']https?:\/\//gi) || []).length + (html.match(/url\(\s*["']?https?:\/\//gi) || []).length;
      rows.push(ext ? ['warn', `${ext} external resource URL${ext > 1 ? 's' : ''}`] : ['ok', 'No external resource URLs']);
    }
    $('#checks').innerHTML = rows.map(([s, t]) => `<li class="${s}">${icon(s === 'ok' ? 'check' : 'warn')}<span>${esc(t)}</span></li>`).join('');
  }

  function renderQR(g) {
    const url = absUrl(gameUrl(g));
    const box = $('#qr');
    if (window.qrcode) {
      const qr = window.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } else {
      box.innerHTML = '<span class="muted">QR unavailable</span>';
    }
    const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);
    $('#qrNote').innerHTML = local
      ? 'On localhost: open this page via your LAN IP so your phone can reach it.'
      : `<a href="${esc(url)}" target="_blank" rel="noopener">Open direct link</a>`;
  }

  function log(type, msg) {
    const li = document.createElement('li');
    li.className = 'log-' + type;
    li.innerHTML = `<time>${new Date().toLocaleTimeString([], { hour12: false })}</time><b>${esc(type)}</b><span>${esc(msg)}</span>`;
    els.log.prepend(li);
    while (els.log.children.length > 200) els.log.lastChild.remove();
  }

  function onFrameMessage(e) {
    if (!state.frameEl || e.source !== state.frameEl.contentWindow) return;
    const d = e.data;
    if (!d || d.__pp !== 1) return;
    log(d.type, d.detail);
    if (d.type === 'cta') {
      toast('CTA clicked → ' + d.detail);
      els.device.classList.remove('cta-flash');
      void els.device.offsetWidth;
      els.device.classList.add('cta-flash');
    } else if (d.type === 'close') {
      toast('Ad requested close');
    }
  }

  function currentDevice() { return DEVICES.find(d => d.id === state.device) || DEVICES[0]; }

  function layout() {
    if (!state.current) return;
    const stage = els.stage;
    const dev = currentDevice();
    const compact = isCompact();
    const framed = state.showFrame && !compact;
    els.device.classList.toggle('framed', framed);
    els.device.classList.toggle('landscape', !compact && state.landscape);
    els.notch.className = 'notch ' + (framed ? dev.notch : 'none');
    if (compact) {
      // Phone: the game simply fills the stage.
      for (const el of [els.wrap, els.device, els.screen]) Object.assign(el.style, { width: '100%', height: '100%', padding: '0', borderRadius: '0', transform: 'none' });
      $('#dims').textContent = '';
      return;
    }
    const [w, h] = state.landscape ? [dev.h, dev.w] : [dev.w, dev.h];

    const bezel = framed ? (dev.tablet ? 20 : 12) : 0;
    const fullW = w + bezel * 2, fullH = h + bezel * 2;
    const pad = 40;
    const scale = Math.max(0.1, Math.min(1, (stage.clientWidth - pad * 2) / fullW, (stage.clientHeight - pad * 2 - 24) / fullH));

    Object.assign(els.wrap.style, { width: fullW * scale + 'px', height: fullH * scale + 'px' });
    Object.assign(els.device.style, {
      width: fullW + 'px', height: fullH + 'px', padding: bezel + 'px',
      borderRadius: framed ? dev.radius + bezel + 'px' : '0', transform: `scale(${scale})`,
    });
    Object.assign(els.screen.style, { width: w + 'px', height: h + 'px', borderRadius: framed ? dev.radius + 'px' : '0' });
    $('#dims').textContent = `${dev.name} · ${w} × ${h} · ${Math.round(scale * 100)}%`;
  }

  function syncControls() {
    $('#deviceList').innerHTML = DEVICES.map(d =>
      `<button data-device="${d.id}" class="${d.id === state.device ? 'on' : ''}"><span>${esc(d.name)}</span><small>${d.w}×${d.h}</small></button>`).join('');
    document.querySelectorAll('#orient button').forEach(b => b.classList.toggle('on', (b.dataset.orient === 'landscape') === state.landscape));
    $('#optInject').checked = state.inject;
    $('#optFrame').checked = state.showFrame;
  }

  function rotate() {
    state.landscape = !state.landscape;
    store.set('landscape', state.landscape);
    syncControls();
    layout();
  }

  /* ---------- wiring ---------- */
  function bind() {
    Object.assign(els, {
      player: $('#player'), stage: $('#stage'), wrap: $('#deviceWrap'), device: $('#device'),
      screen: $('#screen'), notch: $('#notch'), log: $('#log'), open: $('#pOpen'),
    });

    const search = $('#search');
    search.addEventListener('input', () => {
      state.query = search.value;
      $('#searchClear').hidden = !search.value;
      if (state.route.name === 'play') return;
      renderSidebar();
      renderMain();
    });
    $('#searchClear').addEventListener('click', () => { search.value = ''; search.dispatchEvent(new Event('input')); search.focus(); });
    document.querySelectorAll('[data-nav]').forEach(a => a.addEventListener('click', () => {
      if (state.query) { search.value = ''; search.dispatchEvent(new Event('input')); }
    }));

    $('#tree').addEventListener('click', e => {
      const t = e.target.closest('[data-toggle]');
      if (!t) {
        if (e.target.closest('a') && state.query) { search.value = ''; search.dispatchEvent(new Event('input')); }
        return;
      }
      const p = t.dataset.toggle;
      state.expanded.has(p) ? state.expanded.delete(p) : state.expanded.add(p);
      renderSidebar();
    });

    $('#viewToggle').addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (!b) return;
      state.view = b.dataset.view;
      store.set('view', state.view);
      renderMain();
    });
    $('#sortKey').addEventListener('change', e => { state.sort = { key: e.target.value, dir: e.target.value === 'name' ? 1 : -1 }; store.set('sort', state.sort); renderMain(); });
    $('#sortDir').addEventListener('click', () => { state.sort = { ...state.sort, dir: -state.sort.dir }; store.set('sort', state.sort); renderMain(); });
    $('#content').addEventListener('click', e => {
      const b = e.target.closest('[data-sort]');
      if (!b) return;
      const key = b.dataset.sort;
      state.sort = state.sort.key === key ? { key, dir: -state.sort.dir } : { key, dir: key === 'name' ? 1 : -1 };
      store.set('sort', state.sort);
      renderMain();
    });

    $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('drawer-open'));
    $('#scrim').addEventListener('click', () => document.body.classList.remove('drawer-open'));

    // player
    $('#pBack').addEventListener('click', leavePlayer);
    $('#pReload').addEventListener('click', () => { loadGame(); toast('Reloaded'); });
    $('#pRotate').addEventListener('click', rotate);
    $('#pFull').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (els.stage.requestFullscreen) els.stage.requestFullscreen().catch(() => toast('Fullscreen not available'));
    });
    $('#pCopy').addEventListener('click', () => {
      navigator.clipboard.writeText(location.href).then(() => toast('Preview link copied'), () => window.prompt('Copy link', location.href));
    });
    $('#pPanel').addEventListener('click', () => document.body.classList.toggle('panel-open'));
    $('#deviceList').addEventListener('click', e => {
      const b = e.target.closest('[data-device]');
      if (!b) return;
      state.device = b.dataset.device;
      store.set('device', state.device);
      syncControls();
      layout();
    });
    $('#orient').addEventListener('click', e => {
      const b = e.target.closest('[data-orient]');
      if (b && (b.dataset.orient === 'landscape') !== state.landscape) rotate();
    });
    $('#optInject').addEventListener('change', e => { state.inject = e.target.checked; store.set('inject', state.inject); loadGame(); });
    $('#optFrame').addEventListener('change', e => { state.showFrame = e.target.checked; store.set('frame', state.showFrame); layout(); });
    $('#logClear').addEventListener('click', () => { els.log.innerHTML = ''; });

    new ResizeObserver(() => layout()).observe(els.stage);
    window.addEventListener('message', onFrameMessage);
    window.addEventListener('hashchange', () => { state.navigated = true; render(); });

    document.addEventListener('keydown', e => {
      if (e.target.closest('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (state.current) {
        if (e.key === 'Escape' && !document.fullscreenElement) leavePlayer();
        else if (e.key === 'r' || e.key === 'R') loadGame();
        else if (e.key === 'o' || e.key === 'O') rotate();
      } else if (e.key === '/') {
        e.preventDefault();
        search.focus();
      }
    });
  }

  async function init() {
    document.querySelectorAll('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));
    bind();
    try {
      const res = await fetch('manifest.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.manifest = await res.json();
    } catch (e) {
      $('#content').innerHTML = `<div class="empty">${icon('warn')}<p>Could not load <code>manifest.json</code> (${esc(e.message)})</p>
        <small>Run <code>node scripts/build.js</code> or start the dev server: <code>node scripts/serve.js</code>.</small></div>`;
      return;
    }
    indexTree(state.manifest.root);
    render();
  }

  init();
})();
