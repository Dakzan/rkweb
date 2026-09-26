/* ============================================
   WHITE HOLE — Core JS v3
   Theme · Sidebar only · Particles · Cursor glow
   ============================================ */

(function () {
  'use strict';

  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('wh-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('wh-theme', next);
      if (window.spawnBurst) {
        window.spawnBurst(window.innerWidth - 50, window.innerHeight - 40, 16);
      }
    });
  }

  // ---- Sidebar only (no top menu) ----
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  function closeSidebar() {
    if (menuToggle) menuToggle.classList.remove('active');
    if (sidebar) {
      sidebar.classList.remove('expanded');
      sidebar.classList.remove('mobile-open');
    }
    document.body.classList.remove('sidebar-open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuToggle.classList.toggle('active');

      if (window.innerWidth > 900) {
        if (sidebar) sidebar.classList.toggle('expanded', isOpen);
        document.body.classList.toggle('sidebar-open', isOpen);
      } else {
        if (sidebar) sidebar.classList.toggle('mobile-open', isOpen);
      }

      if (isOpen && window.spawnBurst) {
        const rect = menuToggle.getBoundingClientRect();
        window.spawnBurst(rect.left + 24, rect.top + 24, 10);
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (!menuToggle || !menuToggle.classList.contains('active')) return;
    if (sidebar && sidebar.contains(e.target)) return;
    if (menuToggle.contains(e.target)) return;
    closeSidebar();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  });

  // ---- Cursor glow ----
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let gx = -999, gy = -999;
    let tx = -999, ty = -999;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    function animGlow() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      cursorGlow.style.left = gx + 'px';
      cursorGlow.style.top = gy + 'px';
      requestAnimationFrame(animGlow);
    }
    animGlow();
  }

  // ---- Particles ----
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;
  let mouse = { x: -999, y: -999 };
  let animId;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticle(x, y, burst = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? 1.2 + Math.random() * 3.5 : 0.12 + Math.random() * 0.35;
    // hues: cyan, blue, violet, teal, amber — NO pink
    const hues = [190, 210, 230, 260, 280, 45, 160];
    return {
      x: x ?? Math.random() * w,
      y: y ?? Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: burst ? 1.8 + Math.random() * 2.8 : 0.5 + Math.random() * 1.5,
      life: burst ? 35 + Math.random() * 45 : 180 + Math.random() * 280,
      maxLife: burst ? 90 : 460,
      hue: hues[Math.floor(Math.random() * hues.length)],
      burst,
      spin: (Math.random() - 0.5) * 0.08
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(100, Math.floor((w * h) / 14000));
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function spawnBurst(x, y, n = 20) {
    for (let i = 0; i < n; i++) {
      particles.push(createParticle(x, y, true));
    }
  }
  window.spawnBurst = spawnBurst;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const isLight = html.getAttribute('data-theme') === 'light';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vx += p.spin * 0.02;
      p.vy += p.spin * 0.02;

      if (p.burst) {
        p.vx *= 0.95;
        p.vy *= 0.95;
      } else {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          p.vx += (dx / dist) * 0.025;
          p.vy += (dy / dist) * 0.025;
        }
        p.vx *= 0.992;
        p.vy *= 0.992;
      }

      if (p.life <= 0 || p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) {
        if (p.burst) particles.splice(i, 1);
        else particles[i] = createParticle();
        continue;
      }

      const alpha = Math.min(1, p.life / (p.maxLife * 0.28)) * (isLight ? 0.4 : 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 85%, ${isLight ? 48 : 72}%, ${alpha})`;
      ctx.fill();

      // soft outer glow
      if (p.r > 1.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.15})`;
        ctx.fill();
      }
    }

    // connections
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        if (a.burst || b.burst) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.strokeStyle = `hsla(210, 70%, 65%, ${0.14 * (1 - d / 100) * (isLight ? 0.55 : 1)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  // Click ripple bursts
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .anime-card, .modal-content')) return;
    spawnBurst(e.clientX, e.clientY, 8);
  });

  resize();
  initParticles();
  draw();
})();
