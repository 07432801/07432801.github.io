/**
 * Kimi no Na wa (你的名字) — Shinkai Makoto Style Canvas
 *
 * Bokeh circles · God rays · Cloud wisps · Sparkles
 * All the signature visual elements of a Shinkai sky.
 */
(function () {
  'use strict';

  // ============================================================
  //  DYNAMIC FAVICON — animated comet on the browser tab
  // ============================================================
  const faviconEl = document.getElementById('dynamic-favicon');
  if (faviconEl) {
    const favCanvas = document.createElement('canvas');
    favCanvas.width = 64;
    favCanvas.height = 64;
    const fctx = favCanvas.getContext('2d');
    let favTime = 0;

    function drawFavicon() {
      favTime++;
      fctx.clearRect(0, 0, 64, 64);

      // Animate comet position
      const cx = 44 + Math.sin(favTime * 0.03) * 3;
      const cy = 18 + Math.cos(favTime * 0.035) * 4;

      // Trail gradient
      const grad = fctx.createLinearGradient(cx, cy, cx - 38, cy + 22);
      grad.addColorStop(0, 'rgba(255, 248, 224, 0.9)');
      grad.addColorStop(0.3, 'rgba(240, 160, 80, 0.5)');
      grad.addColorStop(0.7, 'rgba(139, 92, 246, 0.15)');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');

      // Trail
      fctx.strokeStyle = grad;
      fctx.lineWidth = 2.5;
      fctx.beginPath();
      fctx.moveTo(cx, cy);
      fctx.lineTo(cx - 40, cy + 24);
      fctx.stroke();

      // Second trail (split)
      fctx.strokeStyle = 'rgba(232, 145, 156, 0.3)';
      fctx.lineWidth = 1;
      fctx.beginPath();
      fctx.moveTo(cx - 1, cy + 2);
      fctx.lineTo(cx - 35, cy + 30);
      fctx.stroke();

      // Glow
      const glow = fctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      glow.addColorStop(0.4, 'rgba(255, 232, 192, 0.5)');
      glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
      fctx.fillStyle = glow;
      fctx.beginPath();
      fctx.arc(cx, cy, 12, 0, Math.PI * 2);
      fctx.fill();

      // Core
      fctx.fillStyle = '#fff';
      fctx.beginPath();
      fctx.arc(cx, cy, 2.8, 0, Math.PI * 2);
      fctx.fill();

      // Sparkle
      const spAlpha = 0.3 + Math.sin(favTime * 0.1) * 0.3;
      fctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, spAlpha)})`;
      fctx.beginPath();
      fctx.arc(cx - 10, cy - 2, 0.8, 0, Math.PI * 2);
      fctx.fill();

      faviconEl.href = favCanvas.toDataURL('image/png');
    }

    // Update favicon at ~10fps (every 6 frames at 60fps)
    let favFrameCounter = 0;
    const origAnimate = window._shinkaiAnimate;

    // We'll hook into the main animation loop below
    window._drawFavicon = drawFavicon;
    window._favFrameCounter = function() {
      favFrameCounter++;
      if (favFrameCounter >= 6) {
        favFrameCounter = 0;
        drawFavicon();
      }
    };
  }

  const canvas = document.getElementById('starry-sky');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let time = 0;

  // --- Resize ---
  function resize() {
    width  = window.innerWidth;
    height = window.innerHeight;
    canvas.width  = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resize);
  resize();

  // ============================================================
  //  1. BOKEH CIRCLE — out-of-focus light circles (Shinkai lens)
  // ============================================================
  class BokehCircle {
    constructor() {
      this.reset(true);
    }

    reset(init) {
      this.x      = Math.random() * width;
      this.y      = init ? Math.random() * height : Math.random() * height;
      this.radius = 15 + Math.random() * 55; // large, out-of-focus
      this.baseAlpha = Math.random() * 0.08 + 0.03;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.pulseSpeed = Math.random() * 0.008 + 0.003;
      this.pulseOffset = Math.random() * Math.PI * 2;
      // Colours: warm white / gold / soft pink / pale purple
      const r = Math.random();
      if (r < 0.4)       this.color = [255, 248, 235]; // warm white
      else if (r < 0.65) this.color = [255, 235, 210]; // golden
      else if (r < 0.85) this.color = [255, 225, 230]; // soft pink
      else               this.color = [235, 225, 255]; // pale purple
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(time * 0.003 + this.pulseOffset) * 0.2;
      if (this.y > height + this.radius) { this.y = -this.radius; this.x = Math.random() * width; }
      if (this.y < -this.radius)          { this.y = height + this.radius; this.x = Math.random() * width; }
      if (this.x > width + this.radius)   { this.x = -this.radius; }
      if (this.x < -this.radius)          { this.x = width + this.radius; }
    }

    draw() {
      const pulse = 1 + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.25;
      const alpha = this.baseAlpha * pulse;

      // Bokeh ring (hollow circle with bright edge)
      const grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.75,
                                             this.x, this.y, this.radius);
      grad.addColorStop(0, `rgba(${this.color.join(',')}, 0)`);
      grad.addColorStop(0.75, `rgba(${this.color.join(',')}, ${alpha * 0.6})`);
      grad.addColorStop(0.9, `rgba(${this.color.join(',')}, ${alpha})`);
      grad.addColorStop(1, `rgba(${this.color.join(',')}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ============================================================
  //  2. GOD RAY — sweeping diagonal light beam
  // ============================================================
  class GodRay {
    constructor() {
      this.reset();
      this.opacity = Math.random() * 0.04 + 0.02;
    }

    reset() {
      // Position along top or left edge
      if (Math.random() < 0.5) {
        this.x1 = Math.random() * width;
        this.y1 = -50;
        this.x2 = this.x1 + (Math.random() - 0.3) * width * 0.8;
        this.y2 = height + 50;
      } else {
        this.x1 = -50;
        this.y1 = Math.random() * height * 0.4;
        this.x2 = width + 50;
        this.y2 = this.y1 + (Math.random() + 0.2) * height * 0.6;
      }
      this.width = 30 + Math.random() * 80;
      this.drift = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.05 + 0.02;
    }

    update() {
      this.x1 += this.drift;
      this.x2 += this.drift;
      if (this.x1 > width + 200 || this.x2 < -200) this.reset();
    }

    draw() {
      const grad = ctx.createLinearGradient(this.x1, this.y1, this.x2, this.y2);
      grad.addColorStop(0, `rgba(255, 248, 235, 0)`);
      grad.addColorStop(0.4, `rgba(255, 248, 235, ${this.opacity * 1.4})`);
      grad.addColorStop(0.6, `rgba(255, 248, 235, ${this.opacity * 1.2})`);
      grad.addColorStop(1, `rgba(255, 248, 235, 0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
    }
  }

  // ============================================================
  //  3. CLOUD WISP — soft horizontal cloud band
  // ============================================================
  class CloudWisp {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
    }

    reset() {
      this.y      = Math.random() * height * 0.55 + height * 0.05;
      this.length = 120 + Math.random() * 280;
      this.height = 20 + Math.random() * 50;
      this.speed  = (Math.random() - 0.5) * 0.5;
      this.alpha  = Math.random() * 0.06 + 0.02;
    }

    update() {
      this.x += this.speed;
      if (this.x > width + this.length)  this.x = -this.length;
      if (this.x < -this.length)         this.x = width + this.length;
    }

    draw() {
      // Simplified cloud as overlapping ellipses
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      const steps = Math.floor(this.length / 40);
      for (let i = 0; i <= steps; i++) {
        const cx = this.x + (i / steps) * this.length;
        const cy = this.y + Math.sin(i * 2.2 + time * 0.002) * this.height * 0.35;
        const rx = this.length / steps * 1.3;
        const ry = this.height * (0.5 + Math.sin(i * 1.7) * 0.4);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ============================================================
  //  4. SPARKLE — tiny bright light point (sun on dust)
  // ============================================================
  class Sparkle {
    constructor() {
      this.reset(true);
    }

    reset(init) {
      this.x      = Math.random() * width;
      this.y      = init ? Math.random() * height : Math.random() * height;
      this.size   = Math.random() * 2 + 0.8;
      this.baseAlpha = Math.random() * 0.55 + 0.2;
      this.flickerSpeed = Math.random() * 0.05 + 0.02;
      this.flickerOffset = Math.random() * Math.PI * 2;
      // Bright warm tones
      const r = Math.random();
      if (r < 0.5)       this.color = [255, 248, 220]; // warm white
      else if (r < 0.8)  this.color = [255, 230, 180]; // gold
      else               this.color = [220, 210, 255]; // pale purple
    }

    update() {
      this.y -= 0.1 + Math.random() * 0.3;
      this.x += (Math.random() - 0.5) * 0.3;
      if (this.y < -10) { this.y = height + 10; this.x = Math.random() * width; }
    }

    draw() {
      const alpha = Math.max(0.1, Math.min(1,
        this.baseAlpha + Math.sin(time * this.flickerSpeed + this.flickerOffset) * 0.35
      ));

      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 6);
      glow.addColorStop(0, `rgba(${this.color.join(',')}, ${alpha * 0.6})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ============================================================
  //  5. LENS FLARE BURST — rare bright flash
  // ============================================================
  class LensFlare {
    constructor() {
      this.reset();
      this.life = 999; // start inactive
    }

    reset() {
      this.x       = Math.random() * width * 0.6 + width * 0.15;
      this.y       = Math.random() * height * 0.5 + height * 0.05;
      this.intensity = 0;
      this.life    = 0;
      this.maxLife = 120 + Math.random() * 180;
      this.cooldown = 300 + Math.random() * 600; // frames until next
      this.color = Math.random() < 0.5
        ? [255, 248, 235] // warm
        : [255, 235, 225]; // pink-warm
    }

    update() {
      if (this.life > this.maxLife + this.cooldown) {
        this.reset();
        return;
      }
      this.life++;

      if (this.life < 20) {
        this.intensity = this.life / 20;
      } else if (this.life < 40) {
        this.intensity = 1;
      } else if (this.life < this.maxLife) {
        this.intensity = Math.max(0, (this.maxLife - this.life) / (this.maxLife - 40));
      } else {
        this.intensity = 0;
      }
    }

    draw() {
      if (this.intensity < 0.02) return;

      const [r, g, b] = this.color;
      const I = this.intensity;

      // Bright center
      const core = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 80 * I);
      core.addColorStop(0, `rgba(255, 255, 255, ${I * 0.25})`);
      core.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${I * 0.12})`);
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 80 * I, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal streak
      const streak = ctx.createLinearGradient(this.x - 300, this.y, this.x + 300, this.y);
      streak.addColorStop(0, 'rgba(0,0,0,0)');
      streak.addColorStop(0.48, `rgba(${r}, ${g}, ${b}, ${I * 0.06})`);
      streak.addColorStop(0.5, `rgba(255, 255, 255, ${I * 0.1})`);
      streak.addColorStop(0.52, `rgba(${r}, ${g}, ${b}, ${I * 0.06})`);
      streak.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = streak;
      ctx.fillRect(this.x - 300, this.y - 8, 600, 16);
    }
  }

  // ============================================================
  //  INIT
  // ============================================================
  const bokehs   = Array.from({ length: 14 }, () => new BokehCircle());
  const godRays  = Array.from({ length: 6 },  () => new GodRay());
  const clouds   = Array.from({ length: 5 },  () => new CloudWisp());
  const sparkles = Array.from({ length: 80 }, () => new Sparkle());
  const flares   = Array.from({ length: 2 },  () => new LensFlare());

  // ============================================================
  //  MAIN LOOP
  // ============================================================
  function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);

    // Draw back-to-front
    for (const r of godRays)  { r.update(); r.draw(); }
    for (const c of clouds)   { c.update(); c.draw(); }
    for (const b of bokehs)   { b.update(); b.draw(); }
    for (const f of flares)   { f.update(); f.draw(); }
    for (const s of sparkles) { s.update(); s.draw(); }

    // Dynamic favicon update (~10fps)
    if (window._drawFavicon && window._favFrameCounter) {
      window._favFrameCounter();
    }

    requestAnimationFrame(animate);
  }
  animate();

  // ============================================================
  //  WECHAT QR CODE POPUP
  // ============================================================
  const wechatBtn   = document.getElementById('wechat-share-btn');
  const qrPopup     = document.getElementById('wechat-qr-popup');
  const qrImg       = document.getElementById('wechat-qr-img');
  const qrClose     = document.getElementById('wechat-qr-close');

  if (wechatBtn && qrPopup && qrImg && qrClose) {
    wechatBtn.addEventListener('click', () => {
      const url = wechatBtn.getAttribute('data-share-url');
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      qrPopup.classList.add('active');
    });

    qrClose.addEventListener('click', () => {
      qrPopup.classList.remove('active');
    });

    qrPopup.addEventListener('click', (e) => {
      if (e.target === qrPopup) qrPopup.classList.remove('active');
    });
  }

  // ============================================================
  //  COPY LINK BUTTON
  // ============================================================
  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = copyBtn.getAttribute('data-share-url');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.textContent = '已复制 ✓';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '复制链接';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = '已复制 ✓';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '复制链接';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  }

  // ============================================================
  //  MOBILE NAV TOGGLE
  // ============================================================
  const toggle = document.getElementById('mobile-nav-toggle');
  const nav    = document.getElementById('mobile-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const active = nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', active);

      const bars = toggle.querySelectorAll('.toggle-bar');
      if (active) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    nav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        const bars = toggle.querySelectorAll('.toggle-bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      });
    });
  }
})();
