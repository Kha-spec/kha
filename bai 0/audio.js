// Hệ thống âm thanh CyberChess - Sử dụng Web Audio API tổng hợp âm thanh thực tế & viễn tưởng đỉnh cao
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Âm thanh đi cờ: Tiếng gõ lực trầm kết hợp click sắc
  playMove() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Lực gõ trầm (Thud)
    const oscThud = this.ctx.createOscillator();
    const gainThud = this.ctx.createGain();
    oscThud.type = 'triangle';
    oscThud.frequency.setValueAtTime(140, now);
    oscThud.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gainThud.gain.setValueAtTime(0.5, now);
    gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    oscThud.connect(gainThud);
    gainThud.connect(this.ctx.destination);

    // Tiếng chạm gỗ (High click)
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'sine';
    oscClick.frequency.setValueAtTime(800, now);
    oscClick.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gainClick.gain.setValueAtTime(0.3, now);
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    oscClick.connect(gainClick);
    gainClick.connect(this.ctx.destination);

    oscThud.start(now);
    oscClick.start(now);
    oscThud.stop(now + 0.13);
    oscClick.stop(now + 0.06);
  }

  // Âm thanh ăn quân: Slash năng lượng + Sub Bass Explosion
  playCapture() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Laser slash
    const oscLaser = this.ctx.createOscillator();
    const gainLaser = this.ctx.createGain();
    oscLaser.type = 'sawtooth';
    oscLaser.frequency.setValueAtTime(1200, now);
    oscLaser.frequency.exponentialRampToValueAtTime(150, now + 0.18);

    gainLaser.gain.setValueAtTime(0.4, now);
    gainLaser.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    oscLaser.connect(gainLaser);
    gainLaser.connect(this.ctx.destination);

    // Bass Impact (Tiếng nổ trầm)
    const oscBass = this.ctx.createOscillator();
    const gainBass = this.ctx.createGain();
    oscBass.type = 'triangle';
    oscBass.frequency.setValueAtTime(120, now + 0.02);
    oscBass.frequency.exponentialRampToValueAtTime(25, now + 0.35);

    gainBass.gain.setValueAtTime(0.7, now + 0.02);
    gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscBass.connect(gainBass);
    gainBass.connect(this.ctx.destination);

    // Noise burst (tiếng vỡ vụn)
    const bufferSize = this.ctx.sampleRate * 0.1;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    oscLaser.start(now);
    oscBass.start(now + 0.02);
    whiteNoise.start(now);

    oscLaser.stop(now + 0.19);
    oscBass.stop(now + 0.36);
    whiteNoise.stop(now + 0.12);
  }

  // Âm thanh Chiếu tướng: Cảnh báo sonar căng thẳng
  playCheck() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    [440, 660, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.26);
    });
  }

  // Âm thanh Chiến thắng: Hợp âm Fanfare hùng tráng
  playVictory() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C, E, G, C, E, G, C

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.35, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.65);
    });
  }

  // Âm thanh Thất bại: Giảm tone bi tráng
  playDefeat() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [392.00, 369.99, 329.63, 293.66, 261.63, 220.00];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.25, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.36);
    });
  }

  // Click UI
  playClick() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }
}

const sounds = new SoundSystem();
window.sounds = sounds;
