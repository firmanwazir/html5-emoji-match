/**
 * audio.js — Web Audio API synthesized sound effects
 * No external files needed
 */

class AudioEngine {
  constructor() {
    this._ctx = null;
    this.enabled = true;
    this._masterGain = null;
    this._initContext();
  }

  _initContext() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this._ctx = new AC();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = 0.5;
      this._masterGain.connect(this._ctx.destination);
    } catch(e) { /* silent */ }
  }

  _resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  _tone(freq, type='sine', duration=0.15, volume=0.3, delay=0) {
    if (!this._ctx || !this.enabled) return;
    this._resume();
    const t = this._ctx.currentTime + delay;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  _noise(duration=0.1, volume=0.2, delay=0) {
    if (!this._ctx || !this.enabled) return;
    this._resume();
    const t = this._ctx.currentTime + delay;
    const bufferSize = this._ctx.sampleRate * duration;
    const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this._ctx.createGain();
    const filter = this._ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    source.start(t);
  }

  // === Background Music (BGM) ===
  _playBGMStep() {
    if (!this.enabled || !this.bgmPlaying || !this._ctx) return;
    
    // Simple happy chord progression: C, F, G, C (arpeggiated)
    const melody = [
      261.63, 329.63, 392.00, 523.25, // C
      349.23, 440.00, 523.25, 698.46, // F
      392.00, 493.88, 587.33, 783.99, // G
      261.63, 329.63, 392.00, 523.25  // C
    ];
    
    const freq = melody[this.bgmStep % melody.length];
    this._tone(freq, 'sine', 0.2, 0.05); // low volume
    
    this.bgmStep++;
    // schedule next note in 250ms (Tempo ~120BPM)
    this.bgmTimer = setTimeout(() => this._playBGMStep(), 250);
  }

  startBGM() {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;
    this._resume();
    this._playBGMStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    clearTimeout(this.bgmTimer);
  }

  // === Sound effects ===

  playPop(index=0) {
    // Ascending pop based on index (combo feel)
    const freq = 500 + index * 60;
    this._tone(freq, 'sine', 0.12, 0.25);
    this._tone(freq * 1.5, 'sine', 0.08, 0.1, 0.05);
  }

  playCombo(level=2) {
    // Rising arpeggio
    const notes = [523, 659, 784, 1047, 1319];
    for (let i = 0; i < Math.min(level, notes.length); i++) {
      this._tone(notes[i], 'triangle', 0.2, 0.2, i * 0.07);
    }
  }

  playRocket() {
    // Whoosh up
    if (!this._ctx || !this.enabled) return;
    this._resume();
    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playBomb() {
    // Explosion: noise burst
    this._noise(0.25, 0.4);
    this._tone(80, 'sine', 0.4, 0.3, 0.02);
  }

  playRainbow() {
    // Magical glissando
    const freqs = [261, 330, 392, 523, 659, 784, 1047];
    freqs.forEach((f, i) => {
      this._tone(f, 'sine', 0.25, 0.2, i * 0.05);
    });
  }

  playPartyStart() {
    // Fanfare
    const melody = [523, 659, 784, 1047];
    melody.forEach((f, i) => {
      this._tone(f, 'triangle', 0.25, 0.35, i * 0.1);
    });
    this._tone(1047, 'triangle', 0.5, 0.4, 0.45);
    this._noise(0.1, 0.15, 0.2);
  }

  playWin() {
    // Happy jingle
    const melody = [523, 659, 784, 659, 784, 1047];
    const durations = [0.15, 0.15, 0.15, 0.15, 0.15, 0.4];
    let t = 0;
    melody.forEach((f, i) => {
      this._tone(f, 'triangle', durations[i], 0.3, t);
      t += durations[i] * 0.9;
    });
  }

  playLose() {
    // Sad descending
    const melody = [523, 440, 370, 294];
    melody.forEach((f, i) => {
      this._tone(f, 'triangle', 0.3, 0.25, i * 0.18);
    });
  }

  playSwap() {
    this._tone(400, 'sine', 0.08, 0.15);
    this._tone(350, 'sine', 0.08, 0.1, 0.05);
  }

  playInvalid() {
    this._tone(180, 'square', 0.1, 0.15);
    this._tone(150, 'square', 0.1, 0.12, 0.1);
  }

  playBooster() {
    this._tone(784, 'triangle', 0.2, 0.3);
    this._tone(1047, 'triangle', 0.2, 0.25, 0.12);
  }

  playPartyTick() {
    // Rapid pops during party
    this._tone(800 + Math.random() * 400, 'sine', 0.06, 0.1);
  }

  setEnabled(val) {
    this.enabled = val;
    if (this._masterGain) {
      this._masterGain.gain.value = val ? 0.5 : 0;
    }
    if (!val) {
      this.stopBGM();
    } else {
      // It's possible the user wants BGM when re-enabling
      this.startBGM();
    }
  }

  setVolume(val) {
    if (this._masterGain) this._masterGain.gain.value = val;
  }
}

const Audio = new AudioEngine();
export default Audio;
