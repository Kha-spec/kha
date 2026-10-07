// Hệ thống hạt tương tác đồ họa và hiệu ứng nổ năng lượng
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.ambientParticles = [];
    this.resize();
    this.initAmbient();

    window.addEventListener('resize', () => this.resize());
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initAmbient() {
    this.ambientParticles = [];
    const count = Math.floor((this.canvas.width * this.canvas.height) / 18000);
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? 'rgba(0, 242, 254,' : 'rgba(157, 78, 221,',
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  // Nổ tung hạt năng lượng khi ăn quân
  explode(x, y, color = '#00f2fe', count = 35) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        gravity: 0.12
      });
    }
  }

  // Nổ pháo hoa chiến thắng
  fireworks() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const colors = ['#00f2fe', '#ffd166', '#ff3366', '#06d6a0', '#9d4edd'];
    
    for (let f = 0; f < 5; f++) {
      setTimeout(() => {
        const startX = Math.random() * (w * 0.6) + w * 0.2;
        const startY = Math.random() * (h * 0.5) + h * 0.15;
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        this.explode(startX, startY, chosenColor, 60);
      }, f * 350);
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ và cập nhật hạt môi trường nền
    for (let p of this.ambientParticles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.color} ${p.alpha})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#00f2fe';
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;

    // Vẽ và cập nhật hạt nổ (FX particles)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(this.loop);
  }
}

let fxSystem = null;
window.addEventListener('DOMContentLoaded', () => {
  fxSystem = new ParticleSystem('fx-canvas');
  window.fxSystem = fxSystem;
});
