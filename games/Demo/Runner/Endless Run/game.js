(function () {
  var STORE = 'https://apps.apple.com/app/id000000000';
  var c = document.getElementById('c'), ctx = c.getContext('2d');
  var W, H, ground, player, obstacles, speed, dist, over, last;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ground = H * 0.78;
  }

  function reset() {
    var s = Math.min(W, H) * 0.09;
    player = { x: W * 0.2, y: ground - s, s: s, vy: 0 };
    obstacles = []; speed = W * 0.45; dist = 0; over = false;
  }

  function jump() {
    if (over) return;
    document.getElementById('hint').hidden = true;
    if (player.y >= ground - player.s - 1) player.vy = -H * 1.35;
  }

  function step(t) {
    var dt = Math.min(0.033, (t - (last || t)) / 1000); last = t;
    if (!over) {
      dist += dt * 10; speed += dt * 8;
      player.vy += H * 3.6 * dt; player.y = Math.min(ground - player.s, player.y + player.vy * dt);
      if (!obstacles.length || obstacles[obstacles.length - 1].x < W - W * (0.45 + Math.random() * 0.4)) {
        var h = player.s * (0.7 + Math.random() * 0.6);
        obstacles.push({ x: W + 20, w: player.s * 0.7, h: h });
      }
      obstacles.forEach(function (o) { o.x -= speed * dt; });
      obstacles = obstacles.filter(function (o) { return o.x + o.w > 0; });
      obstacles.forEach(function (o) {
        if (player.x + player.s * 0.85 > o.x && player.x + player.s * 0.15 < o.x + o.w && player.y + player.s > ground - o.h) end();
      });
    }
    draw();
    requestAnimationFrame(step);
  }

  function draw() {
    ctx.fillStyle = '#87d0ff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5bb85c'; ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = '#3f8f40'; ctx.fillRect(0, ground, W, 6);
    ctx.fillStyle = '#ff6a3d'; ctx.fillRect(player.x, player.y, player.s, player.s);
    ctx.fillStyle = '#fff'; ctx.fillRect(player.x + player.s * 0.55, player.y + player.s * 0.2, player.s * 0.2, player.s * 0.2);
    ctx.fillStyle = '#6b3f1f';
    obstacles.forEach(function (o) { ctx.fillRect(o.x, ground - o.h, o.w, o.h); });
    ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(Math.min(W, H) * 0.06) + 'px system-ui';
    ctx.fillText(Math.floor(dist) + 'm', 16, Math.min(W, H) * 0.09);
  }

  function end() {
    over = true;
    document.getElementById('dist').textContent = Math.floor(dist);
    document.getElementById('end').hidden = false;
  }

  document.getElementById('cta').addEventListener('click', function () {
    if (window.mraid) mraid.open(STORE); else window.open(STORE);
  });
  addEventListener('pointerdown', function (e) { if (!e.target.closest('#end')) jump(); });
  addEventListener('resize', function () { resize(); reset(); });

  function start() { resize(); reset(); requestAnimationFrame(step); }
  if (window.mraid && mraid.getState() === 'loading') mraid.addEventListener('ready', start); else start();
})();
