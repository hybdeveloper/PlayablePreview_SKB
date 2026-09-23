/* Minimal GitHub REST client for edit mode. Every change (upload, rename) is a
 * single commit built with the Git Data API, so one change = one deploy.
 * The token never leaves this browser except to api.github.com. */
(function (root) {
  'use strict';

  const API = 'https://api.github.com';
  const enc = p => p.split('/').map(encodeURIComponent).join('/');

  async function call(token, method, path, body) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body && JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) {
      let msg = `GitHub ${res.status}`;
      try { const j = await res.json(); if (j.message) msg += ': ' + j.message; } catch { /* no body */ }
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  const base = repo => `/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;

  async function checkAccess(token, repo) {
    const [r, user] = await Promise.all([call(token, 'GET', base(repo)), call(token, 'GET', '/user').catch(() => null)]);
    return { canPush: !!(r.permissions && r.permissions.push), login: user && user.login };
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  // makeEntries(listTree) returns the tree entries to apply on top of the branch
  // head. Retried once if the branch moved while we were committing.
  async function commitTree(token, repo, message, makeEntries) {
    const R = base(repo);
    for (let attempt = 0; ; attempt++) {
      const ref = await call(token, 'GET', `${R}/git/ref/heads/${enc(repo.branch)}`);
      const head = await call(token, 'GET', `${R}/git/commits/${ref.object.sha}`);
      const listTree = async () => {
        const t = await call(token, 'GET', `${R}/git/trees/${head.tree.sha}?recursive=1`);
        if (t.truncated) throw new Error('Repository is too large to list; rename it with git instead');
        return t.tree;
      };
      const tree = await call(token, 'POST', `${R}/git/trees`, { base_tree: head.tree.sha, tree: await makeEntries(listTree) });
      const commit = await call(token, 'POST', `${R}/git/commits`, { message, tree: tree.sha, parents: [ref.object.sha] });
      try {
        await call(token, 'PATCH', `${R}/git/refs/heads/${enc(repo.branch)}`, { sha: commit.sha });
        return commit.sha;
      } catch (e) {
        if (e.status !== 422 || attempt > 0) throw e;
      }
    }
  }

  // files: [{ path: repo path, file: File }]
  async function upload(token, repo, files, message, onProgress) {
    const entries = [];
    for (let i = 0; i < files.length; i++) {
      onProgress && onProgress(i, files.length, files[i].path);
      const blob = await call(token, 'POST', `${base(repo)}/git/blobs`, { content: await toBase64(files[i].file), encoding: 'base64' });
      entries.push({ path: files[i].path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    onProgress && onProgress(files.length, files.length, 'Committing…');
    return commitTree(token, repo, message, async () => entries);
  }

  // moves: [{ from, to }] repo paths; a path moves the file or everything under the folder.
  async function move(token, repo, moves, message) {
    return commitTree(token, repo, message, async listTree => {
      const all = (await listTree()).filter(e => e.type === 'blob');
      const under = (p, d) => p === d || p.startsWith(d + '/');
      const out = [];
      for (const { from, to } of moves) {
        if (all.some(e => under(e.path, to))) throw new Error(`"${to.split('/').pop()}" already exists`);
        const hits = all.filter(e => under(e.path, from));
        if (!hits.length) throw new Error(`"${from}" was not found in the repository`);
        for (const e of hits) {
          out.push({ path: to + e.path.slice(from.length), mode: e.mode, type: 'blob', sha: e.sha });
          out.push({ path: e.path, mode: e.mode, type: 'blob', sha: null });
        }
      }
      return out;
    });
  }

  // Commits on the branch that the published build (repo.commit) does not have yet.
  async function unpublished(token, repo) {
    const R = base(repo);
    const ref = await call(token, 'GET', `${R}/git/ref/heads/${enc(repo.branch)}`);
    if (!repo.commit || ref.object.sha === repo.commit) return { count: 0, head: ref.object.sha };
    try {
      const c = await call(token, 'GET', `${R}/compare/${repo.commit}...${ref.object.sha}`);
      return { count: c.ahead_by, head: ref.object.sha };
    } catch {
      return { count: 1, head: ref.object.sha };
    }
  }

  // Runs the deploy workflow (workflow_dispatch) on the branch.
  function publish(token, repo) {
    return call(token, 'POST', `${base(repo)}/actions/workflows/${encodeURIComponent(repo.workflow || 'deploy.yml')}/dispatches`, { ref: repo.branch });
  }

  root.PPGitHub = { checkAccess, upload, move, unpublished, publish };
})(self);
