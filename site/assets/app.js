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
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    upload: 'M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z',
    folderUp: 'M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 3 4 4h-3v4h-2v-4H8l4-4z',
    fullscreenExit: 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
    trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    people: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
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
  function toast(msg, link) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('has-link', !!link);
    if (link) {
      const a = document.createElement('a');
      a.href = link; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Open link';
      a.addEventListener('click', () => t.classList.remove('show'));
      t.append(' ', a);
    }
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), link ? 8000 : 2400);
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
    protected: false,
    access: null,
    user: null,
    gh: store.get('gh', null),    // { token, login } for edit mode
    role: null,                   // owner | admin | editor | viewer (from the login)
    config: null,                 // owners only: the PREVIEW_ACCESS JSON, for the user manager
    openCta: store.get('openCta', true),
    pendingUpload: null,
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
    if (!state.manifest) return;
    const r = parseRoute();
    if (r.name === 'play') {
      const g = state.games.get(r.path);
      if (g) return openPlayer(g);
      if (state.protected && !state.user) { showLogin(true); return; }
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
    renderEditUI();
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
        return `<a class="folder-card" href="${href.folder(f.path)}" data-node="${esc(f.path)}" data-type="folder" title="${esc(f.path)}">
          ${icon('folder', 'folder-ic')}<span class="fc-name">${esc(f.name)}</span><span class="fc-meta">${n}</span>${moreBtn(f)}</a>`;
      }).join('')}</div>`;
    }
    if (games.length) {
      html += `<h2 class="section-title">Playables</h2><div class="game-grid">${games.map(g => `
        <a class="game-card" href="${href.play(g.path)}" data-node="${esc(g.path)}" data-type="game" title="${esc(g.path)}">
          <div class="thumb">${thumbHTML(g)}<span class="play-badge">${icon('play')}</span>${moreBtn(g)}
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
        return `<a class="list-row" href="${isFolder ? href.folder(n.path) : href.play(n.path)}" data-node="${esc(n.path)}" data-type="${n.type}" title="${esc(n.path)}">
          <span class="lr-name">${isFolder ? icon('folder', 'folder-ic') : htmlIcon}<span>${esc(isFolder ? n.name : n.title)}</span>
            ${!isFolder && n.kind === 'folder' ? '<em class="tag">folder</em>' : ''}${moreBtn(n)}</span>
          ${withLocation ? `<span class="lr-loc">${icon('folder', 'folder-ic sm')}${esc(loc || state.manifest.root.name)}</span>` : ''}
          <span class="lr-date">${fmtDate(n.modified)}</span>
          <span class="lr-size">${isFolder ? countGames(n) + ' items' : fmtSize(n.size)}</span>
        </a>`;
      }).join('')}
    </div>`;
  }

  /* ---------- player ---------- */


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
      ${g.owner ? `<dt>Uploaded by</dt><dd>${esc(g.owner)}</dd>` : ''}
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
    setFullscreen(false);
    document.body.classList.remove('playing', 'panel-open');
    document.title = 'Playable Preview';
  }

  // Real fullscreen where the browser allows it on an element; iPhone Safari only
  // allows it for <video>, so there the stage fills the window instead.
  const fullscreenEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const isFullscreen = () => !!fullscreenEl() || document.body.classList.contains('pseudo-full');
  function setFullscreen(on) {
    const pseudo = v => { document.body.classList.toggle('pseudo-full', v); layout(); };
    if (!on) {
      if (fullscreenEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      pseudo(false);
      return;
    }
    const req = els.stage.requestFullscreen || els.stage.webkitRequestFullscreen;
    if (!req) return pseudo(true);
    try {
      const p = req.call(els.stage);
      if (p && p.catch) p.catch(() => pseudo(true));
    } catch { pseudo(true); }
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
    // Protected / remote builds: the service worker fetches or decrypts files and injects the stub itself.
    if (state.protected || state.manifest.source) frame.src = url + (state.inject ? '?pp_inject=1' : '');
    else if (state.inject && html != null) frame.srcdoc = PPShared.injectHtml(html, absUrl(url));
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
    // Protected and remote games only open inside the app (its service worker serves them), so link the preview page.
    const locked = !!state.manifest.source || (state.protected && !PPShared.isUnder(g.path, state.access.public || []));
    const url = locked ? absUrl(href.play(g.path)) : absUrl(gameUrl(g));
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

  // Only store/web links: a javascript: URL opened from this page would run
  // with the preview's origin (and the GitHub token it holds).
  function ctaLink(url) {
    try {
      const u = new URL(url, location.href);
      return /^(https?|itms-apps|itms-appss|market):$/.test(u.protocol) ? u.href : null;
    } catch { return null; }
  }

  // The stub opens the link from the ad's click gesture when it can. If the
  // browser blocked that, retry here (user activation carries to the parent
  // frame in Chrome/Firefox), and fall back to a clickable link.
  function receiveCta(d) {
    const link = d.url ? ctaLink(d.url) : null;
    if (!state.openCta || !link) return toast('CTA clicked → ' + d.detail);
    if (d.opened) return toast('CTA → opening ' + link);
    let w = null;
    try { w = window.open(link, '_blank'); } catch { /* blocked */ }
    if (w) { try { w.opener = null; } catch { /* cross-origin */ } return toast('CTA → opening ' + link); }
    log('warn', 'Popup blocked for ' + link);
    toast('CTA → popup blocked.', link);
  }

  function onFrameMessage(e) {
    if (!state.frameEl || e.source !== state.frameEl.contentWindow) return;
    const d = e.data;
    if (!d || d.__pp !== 1) return;
    log(d.type, d.detail);
    if (d.type === 'cta') {
      receiveCta(d);
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
    $('#optCta').checked = state.openCta;
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
    $('#pFull').addEventListener('click', () => setFullscreen(!isFullscreen()));
    $('#pExitFull').addEventListener('click', () => setFullscreen(false));
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
    $('#optCta').addEventListener('change', e => { state.openCta = window.PP_OPEN_CTA = e.target.checked; store.set('openCta', state.openCta); });
    $('#logClear').addEventListener('click', () => { els.log.innerHTML = ''; });

    new ResizeObserver(() => layout()).observe(els.stage);
    window.addEventListener('message', onFrameMessage);
    window.addEventListener('hashchange', () => { state.navigated = true; render(); });

    document.addEventListener('keydown', e => {
      if (e.target.closest('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (state.current) {
        if (e.key === 'Escape' && document.body.classList.contains('pseudo-full')) setFullscreen(false);
        else if (e.key === 'Escape' && !fullscreenEl()) leavePlayer();
        else if (e.key === 'r' || e.key === 'R') loadGame();
        else if (e.key === 'o' || e.key === 'O') rotate();
      } else if (e.key === '/') {
        e.preventDefault();
        search.focus();
      }
    });
  }

  /* ---------- edit mode (rename / upload via the GitHub API) ---------- */

  const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // GitHub's per-file limit
  const JUNK = /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$/i;
  const isEditing = () => !!(state.gh && state.manifest && state.manifest.repo);
  const repoPath = p => [state.manifest.repo.games, p].filter(Boolean).join('/');
  // Every edit commit triggers the deploy workflow; awaitDeploy() refreshes the page when it lands.
  const byline = () => (state.user ? ` (by ${state.user} via Playable Preview)` : ' (via Playable Preview)');

  // Roles are enforced here in the page only: every non-viewer holds the same repo token.
  const ROLES = {
    owner: { label: 'Owner', desc: 'Everything, including renaming/deleting folders and managing users' },
    admin: { label: 'Admin', desc: 'Upload, rename and delete any playable; cannot change folders or users' },
    editor: { label: 'Editor', desc: 'Upload; rename and delete only the playables they uploaded' },
    viewer: { label: 'Viewer', desc: 'View only' },
  };
  // Without passwords, editing means pasting a token that can do anything anyway: owner.
  const role = () => (!isEditing() ? 'viewer' : state.protected ? state.role || 'viewer' : 'owner');
  const canUpload = () => role() !== 'viewer';
  // Upload/deploy progress (banners, "Saved: …" toasts) is shown to owners and admins only;
  // editors get a short "Uploaded" toast, plus errors.
  const showStatus = () => role() === 'owner' || role() === 'admin';
  function canChange(node) { // rename or delete
    if (!node || !node.path) return false;
    const r = role();
    if (node.type === 'folder') return r === 'owner';
    return r === 'owner' || r === 'admin' || (r === 'editor' && !!state.user && node.owner === state.user);
  }
  const under = (p, d) => p === d || p.startsWith(d + '/');
  // Who uploaded what: .pp-owners.json next to the games folder, keyed by path inside it.
  const ownersMeta = fn => ({
    path: [parentPath(state.manifest.repo.games || ''), '.pp-owners.json'].filter(Boolean).join('/'),
    update: o => { fn(o); return o; },
  });

  function moreBtn(node) {
    return isEditing() && node.path
      ? `<button class="more-btn" data-menu="${esc(node.path)}" data-type="${node.type}" aria-label="More actions">${icon('more')}</button>`
      : '';
  }

  function renderEditUI() {
    const repo = state.manifest && state.manifest.repo;
    // Password-protected sites grant editing through the login ("edit": true); the
    // manual token dialog is only offered on sites without passwords.
    $('#editBtn').hidden = !repo || (state.protected && !isEditing());
    $('#editBtn').classList.toggle('on', isEditing());
    $('#editActions').hidden = !canUpload() || state.route.name !== 'folder' || !!state.query.trim();
    document.body.classList.toggle('editing', isEditing());
  }

  function modal(html) {
    $('#modalCard').innerHTML = html;
    $('#modal').hidden = false;
    const first = $('#modalCard input:not([type=hidden])');
    if (first) setTimeout(() => { first.focus(); first.select && first.select(); }, 0);
  }
  const closeModal = () => { $('#modal').hidden = true; $('#modalCard').innerHTML = ''; $('#modalCard').classList.remove('wide'); };

  function openConnect() {
    const r = state.manifest.repo;
    const repoName = `${r.owner}/${r.name}`;
    if (state.gh && state.gh.fromLogin) {
      const r = ROLES[role()];
      modal(`<h2>${icon('edit')}Edit mode</h2>
        <p>You are signed in as <b>${esc(state.user)}</b> <em class="role">${r.label}</em></p>
        <p>${esc(r.desc)}.</p>
        <p class="muted">Right-click an item (or use its ⋮ button) to rename or delete it; use the upload buttons or drop files anywhere on a folder page. Changes are saved on GitHub and the site updates itself in about 30 seconds.</p>
        <div class="modal-actions">${state.config ? `<button class="pill-btn" data-act="users">${icon('people')}Manage users</button>` : ''}<button class="pill-btn primary" data-act="close">Done</button></div>`);
      return;
    }
    if (state.gh) {
      modal(`<h2>${icon('edit')}Edit mode</h2>
        <p>Connected as <b>@${esc(state.gh.login || 'unknown')}</b> to <b>${esc(repoName)}</b> (branch <code>${esc(r.branch)}</code>).</p>
        <p class="muted">Use the ⋮ button on any item to rename it, or the upload buttons in a folder. Each change is one commit; the site updates itself in about 30 seconds.</p>
        <div class="modal-actions"><button class="pill-btn" data-act="disconnect">Disconnect</button><button class="pill-btn primary" data-act="close">Done</button></div>`);
      return;
    }
    modal(`<h2>${icon('edit')}Connect GitHub to edit</h2>
      <p>Renaming and uploading commit straight to <b>${esc(repoName)}</b>. Paste a GitHub token that can write to this repository:</p>
      <ol class="steps">
        <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → Fine-grained tokens → Generate new token</a></li>
        <li><b>Repository access</b>: Only select repositories → <code>${esc(repoName)}</code></li>
        <li><b>Permissions → Contents</b>: Read and write → Generate, then copy the token</li>
      </ol>
      <form id="connectForm">
        <input type="password" id="ghToken" placeholder="github_pat_…" autocomplete="off" required>
        <div class="form-error" id="connectError"></div>
        <div class="modal-actions"><button type="button" class="pill-btn" data-act="close">Cancel</button><button class="pill-btn primary" id="connectBtn">Connect</button></div>
      </form>
      <p class="muted small">The token is stored only in this browser and sent only to api.github.com.</p>`);
  }

  async function connect(token) {
    const { canPush, login } = await PPGitHub.checkAccess(token, state.manifest.repo);
    if (!canPush) throw new Error('This token cannot write to the repository');
    state.gh = { token, login };
    store.set('gh', state.gh);
  }

  const nodeOf = (path, type) => (type === 'folder' ? state.folders.get(path) : state.games.get(path));
  const nodeHref = node => (node.type === 'folder' ? href.folder(node.path) : href.play(node.path));

  // Opened from the ⋮ button (anchored below it) or by right-click (at the cursor).
  function openMenu(node, at) {
    if (!node) return;
    const menu = $('#menu');
    menu.innerHTML = `<button data-act="open">${icon(node.type === 'folder' ? 'folder' : 'play')}Open</button>
      <button data-act="newtab">${icon('openNew')}Open in new tab</button>
      <button data-act="copy">${icon('link')}Copy link</button>
      ${canChange(node) ? `<hr><button data-act="rename">${icon('edit')}Rename</button>
        <button data-act="delete" class="danger">${icon('trash')}Delete</button>` : ''}`;
    menu.dataset.path = node.path;
    menu.dataset.type = node.type;
    menu.hidden = false;
    const x = at.rect ? at.rect.right - menu.offsetWidth : at.x;
    const y = at.rect ? at.rect.bottom + 4 : at.y;
    menu.style.top = Math.max(8, Math.min(y, innerHeight - menu.offsetHeight - 8)) + 'px';
    menu.style.left = Math.max(8, Math.min(x, innerWidth - menu.offsetWidth - 8)) + 'px';
  }
  const closeMenu = () => { $('#menu').hidden = true; };

  function splitExt(name) {
    const i = name.lastIndexOf('.');
    return i > 0 ? [name.slice(0, i), name.slice(i)] : [name, ''];
  }

  function openRename(node) {
    const isFile = node.type === 'game' && node.kind === 'file';
    const [base, ext] = isFile ? splitExt(node.name) : [node.name, ''];
    modal(`<h2>${icon('edit')}Rename</h2>
      <form id="renameForm" data-path="${esc(node.path)}" data-type="${node.type}">
        <div class="input-row"><input id="renameInput" value="${esc(base)}" required>${ext ? `<span class="ext">${esc(ext)}</span>` : ''}</div>
        <div class="form-error" id="renameError"></div>
        ${state.protected && node.type === 'folder' ? '<p class="muted small">If this folder is listed in the PREVIEW_ACCESS secret, update the secret with the new name too.</p>' : ''}
        <div class="modal-actions"><button type="button" class="pill-btn" data-act="close">Cancel</button><button class="pill-btn primary" id="renameBtn">Rename</button></div>
      </form>`);
  }

  async function doRename(node, newBase) {
    newBase = newBase.trim();
    if (!newBase || BAD_CHARS.test(newBase) || newBase === '.' || newBase === '..') throw new Error('Name cannot be empty or contain \\ / : * ? " < > | # %');
    const isFile = node.type === 'game' && node.kind === 'file';
    const ext = isFile ? splitExt(node.name)[1] : '';
    const newName = newBase + ext;
    if (newName === node.name) return null;
    const dir = parentPath(node.path);
    const sibling = p => (dir ? dir + '/' : '') + p;
    const parent = state.folders.get(dir);
    if (parent && parent.children.some(c => c !== node && c.name.toLowerCase() === newName.toLowerCase())) throw new Error(`"${newName}" already exists here`);

    const moves = [{ from: node.path, to: sibling(newName) }];
    const thumb = pairedThumb(node);
    if (thumb) moves.push({ from: thumb, to: sibling(newBase + splitExt(thumb)[1]) });
    const meta = ownersMeta(o => {
      for (const m of moves) for (const k of Object.keys(o)) if (under(k, m.from)) { o[m.to + k.slice(m.from.length)] = o[k]; delete o[k]; }
    });
    const msg = `Rename ${node.path} → ${newName}`;
    await PPGitHub.move(state.gh.token, state.manifest.repo, moves.map(m => ({ from: repoPath(m.from), to: repoPath(m.to) })), msg + byline(), meta);
    return msg;
  }

  // A single-file game's thumbnail shares its base name ("Foo.html" + "Foo.png"): keep them paired.
  function pairedThumb(node) {
    if (node.type !== 'game' || node.kind !== 'file' || !node.thumb || parentPath(node.thumb) !== parentPath(node.path)) return null;
    return splitExt(node.thumb.split('/').pop())[0] === splitExt(node.name)[0] ? node.thumb : null;
  }

  function openDelete(node) {
    const n = node.type === 'folder' ? countGames(node) : 0;
    modal(`<h2>${icon('trash')}Delete ${node.type === 'folder' ? 'folder' : 'playable'}?</h2>
      <p><b>${esc(node.path)}</b>${node.type === 'folder' ? ` and everything in it (${n} playable${n === 1 ? '' : 's'})` : ''} will be removed from the repository.</p>
      <p class="muted small">It stays in the git history, so it can still be restored with git.</p>
      <div class="form-error" id="delError"></div>
      <div class="modal-actions"><button class="pill-btn" data-act="close">Cancel</button><button class="pill-btn danger" data-act="delete" data-path="${esc(node.path)}" data-type="${node.type}">Delete</button></div>`);
  }

  // Delete closes the dialog at once and hides the item right away; the commit
  // runs in the background. Deletes are chained so quick successive ones don't
  // race each other for the branch head.
  let deleteChain = Promise.resolve();
  function startDelete(node) {
    closeModal();
    if (!node) return;
    const parent = state.folders.get(parentPath(node.path));
    if (parent) parent.children = parent.children.filter(c => c !== node);
    for (const map of [state.games, state.folders]) for (const k of [...map.keys()]) if (under(k, node.path)) map.delete(k);
    if (!state.current) render();
    toast(`Deleting ${node.name}…`);
    state.pendingChanges = (state.pendingChanges || 0) + 1;
    deleteChain = deleteChain.then(async () => {
      try {
        const msg = await doDelete(node);
        toast('Saved: ' + msg);
        awaitDeploy();
      } catch (e) {
        const hint = e.status === 401 && state.gh.fromLogin ? ' — the shared edit token is invalid or expired; ask the admin to update PREVIEW_EDIT_TOKEN.' : '';
        banner(`${icon('warn')}<span>Could not delete ${esc(node.path)}: ${esc(e.message + hint)}</span>`, 'warn');
        refreshData(); // bring the item back
      } finally {
        state.pendingChanges--;
      }
    });
  }

  async function doDelete(node) {
    if (!canChange(node)) throw new Error('You do not have permission to delete this');
    const paths = [node.path, pairedThumb(node)].filter(Boolean);
    const meta = ownersMeta(o => { for (const k of Object.keys(o)) if (paths.some(p => under(k, p))) delete o[k]; });
    const msg = `Delete ${node.path}`;
    await PPGitHub.remove(state.gh.token, state.manifest.repo, paths.map(repoPath), msg + byline(), meta);
    return msg;
  }

  // Characters that break file names on GitHub/Windows (\ / : * ? " < > |) or links to the file (# %).
  const BAD_CHARS = /[\\/:*?"<>|#%]/;
  const cleanName = s => s.replace(/[\\/:*?"<>|#%]+/g, '_').replace(/\s+/g, ' ').trim().replace(/^\.+/, '');

  // [{ rel, file }] relative to the current folder. Each loose file, and each
  // dropped folder (as a whole), gets a name field so it can be renamed first.
  function openUpload(items) {
    items = items.filter(i => !JUNK.test(i.rel));
    if (!items.length) return;
    const folder = state.route.name === 'folder' ? state.route.path : '';
    const total = items.reduce((s, i) => s + i.file.size, 0);
    const units = [];
    for (const i of items) {
      const slash = i.rel.indexOf('/');
      const key = slash > 0 ? i.rel.slice(0, slash) : i.rel;
      let u = units.find(x => x.key === key);
      if (!u) {
        const [base, ext] = slash > 0 ? [key, ''] : splitExt(key);
        u = { key, isDir: slash > 0, base, ext, size: 0, count: 0 };
        units.push(u);
      }
      i.unit = u;
      i.rest = slash > 0 ? i.rel.slice(slash) : '';
      u.size += i.file.size;
      u.count++;
    }
    state.pendingUpload = { folder, items, units };
    modal(`<h2>${icon('upload')}Upload ${items.length} file${items.length > 1 ? 's' : ''}</h2>
      <p>To <b>${esc(folder || state.manifest.root.name)}</b> · ${fmtSize(total)}</p>
      <ul class="file-list up-list" id="upList">${units.map((u, n) => `<li>${u.isDir ? icon('folder') : htmlIcon}
        <div class="input-row"><input class="up-name" data-u="${n}" value="${esc(cleanName(u.base) || 'file')}" aria-label="Name for ${esc(u.key)}" spellcheck="false">${u.ext ? `<span class="ext">${esc(u.ext)}</span>` : ''}</div>
        <small>${u.isDir ? `${u.count} files · ` : ''}${fmtSize(u.size)}</small></li>`).join('')}</ul>
      <div class="form-error" id="upError"></div>
      <p class="muted small" id="upNote"></p>
      <p class="muted small">Rename before uploading if a name clashes or has odd characters. A folder containing index.html becomes one playable.</p>
      <div class="modal-actions"><button class="pill-btn" data-act="close">Cancel</button><button class="pill-btn primary" data-act="upload" id="upBtn">Upload</button></div>`);
    $('#upList').oninput = uploadPlan;
    uploadPlan();
  }

  // Reads the name fields, shows what is wrong, and returns the final [{ rel, file }] (null if blocked).
  function uploadPlan() {
    const { folder, items, units } = state.pendingUpload;
    const errors = [];
    const inputs = [...document.querySelectorAll('.up-name')];
    const names = new Map();
    inputs.forEach(inp => {
      const u = units[inp.dataset.u];
      const base = inp.value.trim();
      u.name = base + u.ext;
      const bad = !base || base === '.' || base === '..' || BAD_CHARS.test(base);
      const dup = names.has(u.name.toLowerCase());
      names.set(u.name.toLowerCase(), true);
      inp.classList.toggle('bad', bad || dup);
      if (bad) errors.push(`"${base || u.key}": name cannot be empty or contain \\ / : * ? " < > | # %`);
      else if (dup) errors.push(`"${u.name}" is used twice in this upload`);
    });
    const plan = items.map(i => ({ rel: i.unit.name + i.rest, file: i.file }));
    const tooBig = plan.filter(i => i.file.size > MAX_UPLOAD_BYTES);
    if (tooBig.length) errors.push(`${tooBig.length} file(s) exceed GitHub's 100 MB limit: ${tooBig.map(i => i.rel).join(', ')}`);
    // Replacing a playable counts as changing it: editors may only replace their own.
    const taken = [...new Set(plan.map(i => {
      const p = [folder, i.rel].filter(Boolean).join('/');
      return [...state.games.values()].find(g => (g.kind === 'file' ? g.path === p : under(p, g.path)));
    }).filter(g => g && !canChange(g)))];
    if (taken.length) errors.push(`You cannot replace playables uploaded by someone else: ${taken.map(g => g.name + (g.owner ? ` (${g.owner})` : '')).join(', ')} — rename yours`);
    const here = state.folders.get(folder);
    const replaced = units.filter(u => here && here.children.some(c => c.name.toLowerCase() === (u.name || '').toLowerCase()));
    $('#upError').textContent = errors.join('\n');
    $('#upNote').textContent = replaced.length ? `Will replace: ${replaced.map(u => u.name).join(', ')}` : '';
    $('#upBtn').disabled = errors.length > 0;
    return errors.length ? null : plan;
  }

  // Upload queue: files go up one at a time; files dropped meanwhile join the
  // queue. When it runs dry, everything uploaded becomes ONE commit (one deploy)
  // and only then does the page wait for the build and refresh.
  const upQueue = { todo: [], done: [], failed: [], total: 0, busy: false };

  function enqueueUpload() {
    const items = uploadPlan();
    if (!items) return;
    const { folder } = state.pendingUpload;
    for (const i of items) upQueue.todo.push({ folder, path: [folder, i.rel].filter(Boolean).join('/'), file: i.file });
    upQueue.total += items.length;
    closeModal();
    if (upQueue.busy) { if (showStatus()) toast(`Added ${items.length} file${items.length > 1 ? 's' : ''} to the upload queue`); }
    else runUploadQueue();
  }
  // Nothing is committed until the queue ends, so leaving early loses the upload.
  window.addEventListener('beforeunload', e => { if (upQueue.busy) e.preventDefault(); });

  function uploadBanner(text) {
    if (!showStatus()) return;
    const n = upQueue.done.length + upQueue.failed.length;
    banner(`<span class="spinner"></span><span><b>Uploading ${Math.min(n + 1, upQueue.total)}/${upQueue.total}</b> · ${esc(text)}
      <span class="progress"><div style="width:${Math.round((n / upQueue.total) * 100)}%"></div></span></span>`, 'busy');
  }

  async function runUploadQueue() {
    upQueue.busy = true;
    const { token } = state.gh, repo = state.manifest.repo;
    while (upQueue.todo.length) {
      const item = upQueue.todo.shift();
      uploadBanner(item.path.split('/').pop());
      for (let attempt = 0; ; attempt++) {
        try {
          item.sha = await PPGitHub.uploadBlob(token, repo, item.file);
          upQueue.done.push(item);
          break;
        } catch (e) {
          if (attempt < 2 && !(e.status >= 400 && e.status < 500)) continue; // network / 5xx: retry
          item.error = e.message;
          upQueue.failed.push(item);
          break;
        }
      }
    }

    const done = [...new Map(upQueue.done.map(i => [i.path, i])).values()]; // same file twice: last wins
    const failed = upQueue.failed;
    let error = '';
    if (done.length) {
      if (showStatus()) banner(`<span class="spinner"></span><span><b>Saving ${done.length} file${done.length > 1 ? 's' : ''}…</b></span>`, 'busy');
      const folders = [...new Set(done.map(i => i.folder))];
      const msg = `Upload ${done.length} file${done.length > 1 ? 's' : ''} to ${folders.length === 1 ? folders[0] || '/' : folders.length + ' folders'}`;
      const meta = state.user ? ownersMeta(o => { for (const i of done) o[i.path] = state.user; }) : undefined;
      try {
        await PPGitHub.commitFiles(token, repo, done.map(i => ({ path: repoPath(i.path), sha: i.sha })), msg + byline(), meta);
        toast(showStatus() ? 'Saved: ' + msg : `Uploaded ${done.length} file${done.length > 1 ? 's' : ''}`);
        upQueue.done = [];
      } catch (e) {
        error = e.message; // keep the uploaded blobs so Retry only has to commit
      }
    }
    if (upQueue.todo.length && !error) { // files dropped while the commit was being saved
      upQueue.total = upQueue.todo.length + upQueue.failed.length;
      return runUploadQueue();
    }
    upQueue.failed = [];
    upQueue.total = upQueue.done.length;
    upQueue.busy = false;

    const failNote = failed.length
      ? `${failed.length} file${failed.length > 1 ? 's' : ''} failed to upload: ${failed.map(i => `${i.path} (${i.error})`).join(', ')}`
      : '';
    if (error) {
      banner(`${icon('warn')}<span>Upload could not be saved: ${esc(error)}</span><button class="pill-btn primary" data-act="upload-retry">Retry</button>`, 'warn');
    } else if (done.length || state.deployAfterQueue) {
      awaitDeploy(failNote);
    } else if (failNote) {
      banner(`${icon('warn')}<span>${esc(failNote)}</span>`, 'warn');
    }
  }

  async function filesFromDrop(dt) {
    const entries = [...dt.items].map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
    if (!entries.length) return [...dt.files].map(f => ({ rel: f.name, file: f }));
    const out = [];
    const walk = async (entry, prefix) => {
      if (entry.isFile) {
        out.push({ rel: prefix + entry.name, file: await new Promise((res, rej) => entry.file(res, rej)) });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        for (let batch; (batch = await new Promise((res, rej) => reader.readEntries(res, rej))).length;) {
          for (const e of batch) await walk(e, prefix + entry.name + '/');
        }
      }
    };
    for (const e of entries) await walk(e, '');
    return out;
  }

  /* ---------- user manager (owners): rewrites the PREVIEW_ACCESS secret ---------- */

  const listText = v => (Array.isArray(v) ? v : [v == null ? '*' : v]).map(f => f || '*').join(', ');
  const splitList = s => s.split(',').map(x => x.trim().replace(/^\/+|\/+$/g, '')).filter(Boolean);

  function userRowHTML(u) {
    const r = ROLES[u.role] ? u.role : u.edit === true ? 'owner' : 'viewer';
    return `<div class="user-row">
      <input class="u-name" placeholder="Username" value="${esc(u.name || '')}" required>
      <input class="u-pass" type="password" placeholder="Password" value="${esc(u.password || '')}" autocomplete="new-password" required>
      <select class="u-role" aria-label="Role">${Object.keys(ROLES).map(k => `<option value="${k}"${k === r ? ' selected' : ''}>${ROLES[k].label}</option>`).join('')}</select>
      <input class="u-folders" placeholder="Folders: * or A, B/C" value="${esc(listText(u.folders))}" list="folderList" title="Folders this user can see: * for all, or comma-separated paths">
      <button type="button" class="icon-btn" data-act="user-del" title="Remove user" aria-label="Remove user">${icon('trash')}</button>
    </div>`;
  }

  function openUsers() {
    const cfg = state.config || { users: [] };
    modal(`<h2>${icon('people')}Users &amp; permissions</h2>
      <form id="usersForm" autocomplete="off">
        <div class="user-head"><span>Username</span><span>Password</span><span>Role</span><span>Folders</span><span></span></div>
        <div class="users" id="usersList">${(cfg.users || []).map(userRowHTML).join('')}</div>
        <button type="button" class="pill-btn" data-act="user-add">${icon('add')}Add user</button>
        <label class="switch small"><input type="checkbox" id="showPass"><span></span>Show passwords</label>
        <label class="field">Public folders (no password needed)<input id="uPublic" value="${esc((cfg.public || []).join(', '))}" placeholder="None" list="folderList"></label>
        <datalist id="folderList"><option value="*">${[...state.folders.keys()].filter(Boolean).map(p => `<option value="${esc(p)}">`).join('')}</datalist>
        <dl class="role-help">${Object.values(ROLES).map(r => `<dt>${r.label}</dt><dd>${esc(r.desc)}</dd>`).join('')}</dl>
        <div class="form-error" id="usersError"></div>
        <p class="muted small">Saving writes the PREVIEW_ACCESS secret and rebuilds the site (under a minute), which also publishes any unpublished changes. Users sign in with their name + password; anyone whose name or password changed must sign in again.</p>
        <div class="modal-actions"><button type="button" class="pill-btn" data-act="close">Cancel</button><button class="pill-btn primary" id="usersBtn">Save &amp; publish</button></div>
      </form>`);
    $('#modalCard').classList.add('wide');
    $('#showPass').addEventListener('change', e => document.querySelectorAll('.u-pass').forEach(i => { i.type = e.target.checked ? 'text' : 'password'; }));
  }

  function addUserRow() {
    $('#usersList').insertAdjacentHTML('beforeend', userRowHTML({ role: 'viewer', folders: ['*'] }));
    const row = $('#usersList').lastElementChild;
    if ($('#showPass').checked) row.querySelector('.u-pass').type = 'text';
    row.querySelector('.u-name').focus();
  }

  async function saveUsers() {
    const btn = $('#usersBtn'), err = $('#usersError');
    const users = [...document.querySelectorAll('.user-row')].map(r => ({
      name: r.querySelector('.u-name').value.trim(),
      password: r.querySelector('.u-pass').value,
      role: r.querySelector('.u-role').value,
      folders: splitList(r.querySelector('.u-folders').value).length ? splitList(r.querySelector('.u-folders').value) : ['*'],
    }));
    const problem =
      users.find(u => !u.name || !u.password) ? 'Every user needs a name and a password' :
      new Set(users.map(u => u.name.toLowerCase())).size < users.length ? 'Two users have the same name; the name is the username, so each must be unique' :
      !users.some(u => u.role === 'owner' && u.folders.includes('*')) ? 'Keep at least one Owner with access to all folders (*)' : '';
    if (problem) { err.textContent = problem; return; }
    // Keep other settings (salt, editToken, …) and drop the legacy per-user "edit" flag.
    const cfg = { ...state.config, public: splitList($('#uPublic').value), users };
    btn.disabled = true;
    err.textContent = '';
    try {
      await PPGitHub.setSecret(state.gh.token, state.manifest.repo, 'PREVIEW_ACCESS', JSON.stringify(cfg, null, 2));
      await PPGitHub.publish(state.gh.token, state.manifest.repo);
      state.config = cfg;
      closeModal();
      toast('Users saved');
      awaitDeploy();
    } catch (e) {
      err.textContent = e.status === 403 || e.status === 404
        ? `${e.message} — the edit token needs “Secrets: Read and write” and “Actions: Read and write” on this repository.`
        : e.message;
      btn.disabled = false;
    }
  }

  function banner(html, kind) {
    const b = $('#banner');
    b.className = 'banner ' + (kind || '');
    b.innerHTML = html;
    b.hidden = !html;
  }

  // Edits deploy on their own; this catches commits whose deploy failed or was skipped.
  async function checkPending() {
    if (!isEditing() || !showStatus() || state.deploying || upQueue.busy) return;
    try {
      const { count } = await PPGitHub.unpublished(state.gh.token, state.manifest.repo);
      if (!count) return banner('');
      banner(`${icon('upload')}<span><b>${count} change${count > 1 ? 's' : ''} not published yet.</b> Saved on GitHub; the site still shows the previous version until you publish.</span>
        <button class="pill-btn primary" data-act="publish">Publish</button>`, 'pending');
    } catch { /* offline or no access: nothing to show */ }
  }

  async function publish(btn) {
    btn.disabled = true;
    try {
      await PPGitHub.publish(state.gh.token, state.manifest.repo);
      awaitDeploy();
    } catch (e) {
      btn.disabled = false;
      const hint = e.status === 403 || e.status === 404
        ? ' — the edit token also needs permission to run workflows (fine-grained: Actions “Read and write”; classic: repo scope).'
        : '';
      toast('Publish failed: ' + e.message + hint);
      banner(`${icon('warn')}<span>Publish failed: ${esc(e.message + hint)}</span><button class="pill-btn primary" data-act="publish">Retry</button>`, 'warn');
    }
  }

  // Poll manifest.json until a build newer than the latest edit is live, then
  // refresh the list in place. Quick successive edits share one poll loop: the
  // workflow cancels superseded runs, so only the last build matters. While the
  // upload queue is running nothing refreshes; the queue calls this when it ends.
  function awaitDeploy(note = '') {
    state.lastEdit = Date.now();
    if (upQueue.busy) { state.deployAfterQueue = true; return; }
    state.deployAfterQueue = false;
    const extra = note ? `<br><small>${esc(note)}</small>` : '';
    if (showStatus()) banner(`<span class="spinner"></span><span><b>Updating site…</b> Your change is saved; the page refreshes by itself when the new build is live (about 30 seconds).${extra}</span>`, 'busy');
    else if (note) banner(`${icon('warn')}<span>${esc(note)}</span>`, 'warn');
    if (state.deploying) return;
    state.deploying = true;
    const started = Date.now();
    const tick = async () => {
      if (upQueue.busy) { state.deploying = false; state.deployAfterQueue = true; return; }
      if (state.pendingChanges) return setTimeout(tick, 3000); // a delete is still committing
      try {
        const m = await (await fetch('manifest.json?t=' + Date.now(), { cache: 'no-store' })).json();
        if (m.generatedAt > state.lastEdit) {
          state.deploying = false;
          await refreshData();
          if (showStatus()) banner(`${icon(note ? 'warn' : 'check')}<span>Site updated.${extra}</span>`, note ? 'warn' : 'done');
          if (!note) setTimeout(() => { if (!state.deploying && $('#banner').classList.contains('done')) banner(''); }, 4000);
          return;
        }
      } catch { /* keep polling */ }
      if (Date.now() - started < 5 * 60 * 1000) setTimeout(tick, 3000);
      else {
        state.deploying = false;
        if (showStatus()) banner(`${icon('warn')}<span>Still rebuilding — check the Actions tab on GitHub.</span><button class="pill-btn" data-act="reload">Reload</button>`, 'warn');
      }
    };
    setTimeout(tick, 12000); // a deploy never lands sooner than this
  }

  // Re-read the manifest (and, on protected sites, access.json) without reloading the page.
  async function refreshData() {
    try {
      const m = await loadData();
      if (!m) return location.reload();
      state.manifest = m;
      state.folders.clear();
      state.games.clear();
      indexTree(m.root);
      if (state.current) { // don't restart the running playable
        const g = state.games.get(state.current.path);
        if (g) state.current = g;
      } else render();
    } catch {
      location.reload();
    }
  }

  async function runAction(btn, errorEl, fn) {
    btn.disabled = true;
    errorEl.textContent = '';
    try {
      const msg = await fn();
      closeModal();
      if (msg) { toast('Saved: ' + msg); awaitDeploy(); }
    } catch (e) {
      if (e.status === 401 && state.gh.fromLogin) {
        errorEl.textContent = 'The shared edit token is invalid or expired — ask the admin to update PREVIEW_EDIT_TOKEN.';
        btn.disabled = false;
        return;
      }
      if (e.status === 401) { state.gh = null; store.set('gh', null); renderEditUI(); }
      if (e.status === 403 && /personal access token/i.test(e.message)) {
        errorEl.textContent = 'The edit token cannot write to this repo. Create it from the repo owner’s account (fine-grained, Contents: Read and write) or use a classic token with the public_repo / repo scope.';
        btn.disabled = false;
        return;
      }
      errorEl.textContent = e.message;
      btn.disabled = false;
    }
  }

  function bindEditor() {
    $('#editBtn').addEventListener('click', openConnect);
    $('#upFiles').addEventListener('click', () => $('#fileInput').click());
    $('#upDir').addEventListener('click', () => $('#dirInput').click());
    for (const id of ['#fileInput', '#dirInput']) {
      $(id).addEventListener('change', e => {
        openUpload([...e.target.files].map(f => ({ rel: f.webkitRelativePath || f.name, file: f })));
        e.target.value = '';
      });
    }

    const content = $('#content');
    content.addEventListener('click', e => {
      const b = e.target.closest('[data-menu]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      openMenu(nodeOf(b.dataset.menu, b.dataset.type), { rect: b.getBoundingClientRect() });
    }, true);
    content.addEventListener('contextmenu', e => {
      const el = e.target.closest('[data-node]');
      if (!el) return;
      e.preventDefault();
      openMenu(nodeOf(el.dataset.node, el.dataset.type), { x: e.clientX, y: e.clientY });
    });
    // Files dropped anywhere on a folder page upload into that folder. Always swallow
    // file drops so a miss does not make the browser navigate to the file.
    const dropHint = $('#dropHint');
    let dragDepth = 0;
    const isFileDrag = e => [...e.dataTransfer.types].includes('Files');
    const dropTarget = () => (state.route.name === 'folder' && !state.current && !state.query.trim() && $('#modal').hidden ? state.route.path : null);
    const endDrag = () => { dragDepth = 0; dropHint.hidden = true; };
    document.addEventListener('dragenter', e => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      if (dragDepth++ || dropTarget() == null) return;
      closeMenu();
      dropHint.innerHTML = canUpload()
        ? `<div>${icon('upload')}<b>Drop to upload</b><span>to ${esc(dropTarget() || state.manifest.root.name)}</span></div>`
        : `<div>${icon('lock')}<b>Uploading needs edit rights</b><span>${state.protected ? 'Sign in with an owner, admin or editor account' : 'Turn on edit mode first'}</span></div>`;
      dropHint.classList.toggle('denied', !canUpload());
      dropHint.hidden = false;
    });
    document.addEventListener('dragleave', () => { if (dragDepth && --dragDepth <= 0) endDrag(); });
    document.addEventListener('dragover', e => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = canUpload() && dropTarget() != null ? 'copy' : 'none';
    });
    document.addEventListener('drop', async e => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      endDrag();
      if (canUpload() && dropTarget() != null) openUpload(await filesFromDrop(e.dataTransfer));
    });

    $('#menu').addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const m = $('#menu');
      const node = nodeOf(m.dataset.path, m.dataset.type);
      closeMenu();
      if (!node) return;
      if (b.dataset.act === 'open') location.hash = nodeHref(node);
      if (b.dataset.act === 'newtab') window.open(absUrl(nodeHref(node)), '_blank', 'noopener');
      if (b.dataset.act === 'rename') openRename(node);
      if (b.dataset.act === 'delete') openDelete(node);
      if (b.dataset.act === 'copy') {
        const link = absUrl(nodeHref(node));
        navigator.clipboard.writeText(link).then(() => toast('Link copied'), () => window.prompt('Copy link', link));
      }
    });
    document.addEventListener('click', e => { if (!e.target.closest('#menu, [data-menu]')) closeMenu(); });
    document.addEventListener('contextmenu', e => { if (!e.target.closest('#menu, [data-node]')) closeMenu(); });
    document.addEventListener('scroll', closeMenu, true);

    $('#modal').addEventListener('click', e => {
      if (e.target.id === 'modal') return closeModal();
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'close') closeModal();
      if (b.dataset.act === 'disconnect') { state.gh = null; store.set('gh', null); closeModal(); renderEditUI(); renderMain(); toast('Edit mode off'); }
      if (b.dataset.act === 'upload') enqueueUpload();
      if (b.dataset.act === 'delete') startDelete(nodeOf(b.dataset.path, b.dataset.type));
      if (b.dataset.act === 'users') openUsers();
      if (b.dataset.act === 'user-add') addUserRow();
      if (b.dataset.act === 'user-del') b.closest('.user-row').remove();
    });
    $('#modal').addEventListener('submit', async e => {
      e.preventDefault();
      if (e.target.id === 'connectForm') {
        const btn = $('#connectBtn');
        btn.disabled = true;
        try {
          await connect($('#ghToken').value.trim());
          closeModal();
          renderEditUI();
          renderMain();
          toast(`Edit mode on · @${state.gh.login}`);
        } catch (err) {
          $('#connectError').textContent = err.status === 401 ? 'Invalid token' : err.message;
          btn.disabled = false;
        }
      }
      if (e.target.id === 'usersForm') saveUsers();
      if (e.target.id === 'renameForm') {
        const f = e.target;
        const node = f.dataset.type === 'folder' ? state.folders.get(f.dataset.path) : state.games.get(f.dataset.path);
        runAction($('#renameBtn'), $('#renameError'), () => doRename(node, $('#renameInput').value));
      }
    });
    $('#banner').addEventListener('click', e => {
      if (e.target.closest('[data-act="reload"]')) location.reload();
      if (e.target.closest('[data-act="upload-retry"]') && !upQueue.busy) runUploadQueue();
      const p = e.target.closest('[data-act="publish"]');
      if (p) publish(p);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); if (!$('#modal').hidden) closeModal(); } }, true);
  }

  /* ---------- access control ---------- */

  // Protected builds need the service worker to control this page before any game loads.
  async function ensureServiceWorker() {
    if (!('serviceWorker' in navigator)) throw new Error('This browser does not support service workers');
    await navigator.serviceWorker.register('sw.js');
    const reg = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      const claimed = new Promise(res => navigator.serviceWorker.addEventListener('controllerchange', res, { once: true }));
      reg.active.postMessage({ type: 'claim' });
      await Promise.race([claimed, new Promise(res => setTimeout(res, 3000))]);
    }
    navigator.serviceWorker.controller?.postMessage({ type: 'refresh' });
  }

  function renderAccount() {
    const box = $('#account');
    box.hidden = !state.protected;
    if (!state.protected) return;
    box.innerHTML = state.user
      ? `<span class="avatar" style="--h:${hue(state.user)}">${esc(state.user.trim()[0] || '?').toUpperCase()}</span>
         <span class="acc-name">${esc(state.user)}${state.role && state.role !== 'viewer' ? ` <em class="role">${ROLES[state.role].label}</em>` : ''}</span>
         <button class="icon-btn" id="logout" title="Sign out" aria-label="Sign out">${icon('logout')}</button>`
      : `<button class="signin-btn" id="signin">${icon('lock')}Sign in</button>`;
  }

  function showLogin(dismissible) {
    const box = $('#login');
    box.hidden = false;
    $('#loginClose').hidden = !dismissible;
    $('#loginError').textContent = '';
    setTimeout(() => ($('#loginName').value ? $('#loginPass') : $('#loginName')).focus(), 0);
  }

  async function signIn(name, password) {
    const key = await PPShared.deriveKey(PPShared.loginSecret(state.access, name, password), state.access.kdf);
    const payload = await PPShared.unlock(state.access, key);
    if (!payload) return false;
    await PPShared.saveKey(key);
    location.reload();
    return true;
  }

  async function signOut() {
    await PPShared.clearKey();
    navigator.serviceWorker.controller?.postMessage({ type: 'refresh' });
    location.hash = '#/';
    location.reload();
  }

  function bindAuth() {
    $('#account').addEventListener('click', e => {
      if (e.target.closest('#logout')) signOut();
      else if (e.target.closest('#signin')) showLogin(true);
    });
    $('#loginClose').addEventListener('click', () => {
      $('#login').hidden = true;
      if (parseRoute().name === 'play') location.hash = '#/';
    });
    $('#loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      const name = $('#loginName'), input = $('#loginPass'), btn = $('#loginBtn');
      if (!name.value.trim() || !input.value) return;
      btn.disabled = true;
      $('#loginError').textContent = '';
      try {
        if (!(await signIn(name.value, input.value))) {
          $('#loginError').textContent = 'Wrong username or password';
          input.select();
        }
      } catch (err) {
        $('#loginError').textContent = 'Sign-in failed: ' + err.message;
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function loadData() {
    PPShared.init(new URL('./', location.href).href);
    const access = await PPShared.fetchAccess();
    if (!access) {
      const res = await fetch('manifest.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('manifest.json: HTTP ' + res.status);
      const m = await res.json();
      if (m.source) await ensureServiceWorker(); // it fetches the games from GitHub
      return m;
    }
    state.protected = true;
    state.access = access;
    state.gh = null; // on protected sites, editing comes only from an edit-enabled login
    await ensureServiceWorker();
    const key = await PPShared.loadKey();
    const payload = key && await PPShared.unlock(access, key);
    if (key && !payload) await PPShared.clearKey(); // password removed or changed
    if (payload) {
      state.user = payload.name;
      state.role = ROLES[payload.role] ? payload.role : payload.edit ? 'owner' : 'viewer'; // older builds: edit = owner
      state.config = state.role === 'owner' ? payload.config || null : null;
      // Non-viewers get the shared repo token inside their (password-encrypted) payload.
      state.gh = payload.edit ? { token: payload.edit.token, login: payload.name, fromLogin: true } : null;
      return payload.manifest;
    }
    if (!(access.public || []).length) return null; // nothing to show without a password
    const res = await fetch('manifest.json', { cache: 'no-cache' });
    return res.json();
  }

  async function init() {
    document.querySelectorAll('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));
    bind();
    bindAuth();
    bindEditor();
    window.PP_OPEN_CTA = state.openCta;
    let manifest;
    try {
      manifest = await loadData();
    } catch (e) {
      $('#content').innerHTML = `<div class="empty">${icon('warn')}<p>Could not load the playable list (${esc(e.message)})</p>
        <small>Run <code>node scripts/build.js</code> or start the dev server: <code>node scripts/serve.js</code>.</small></div>`;
      return;
    }
    renderAccount();
    if (!manifest) {
      document.body.classList.add('locked');
      showLogin(false);
      return;
    }
    state.manifest = manifest;
    indexTree(state.manifest.root);
    render();
    checkPending();
  }

  init();
})();
