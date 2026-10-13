// Premium Studio-Grade Web Audio Synthesizer for Block Blast
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public warmUp() {
    this.initCtx();
  }

  // Soft tactile mechanical click
  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.035);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {}
  }

  // Pick up block (soft air lift swoosh)
  public playPick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(540, t + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  // Tactile satisfying ceramic/wood thud on block placement
  public playPlace() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Deep resonant woody knock
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(240, t);
      osc1.frequency.exponentialRampToValueAtTime(95, t + 0.09);

      gain1.gain.setValueAtTime(0.32, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      // 2. High crisp snap transient
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1100, t);
      osc2.frequency.exponentialRampToValueAtTime(320, t + 0.035);

      gain2.gain.setValueAtTime(0.16, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.1);
      osc2.stop(t + 0.04);
    } catch {}
  }

  // Line Clear: Lush marimba / crystal pentatonic arpeggio
  public playClear(lines: number, combo: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Beautiful harmonic frequencies: C5, D5, E5, G5, A5, C6, D6, E6, G6
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];

      const baseIdx = Math.min((combo - 1) * 2, scale.length - 4);
      const notesToPlay = Math.min(3 + lines, 6);

      // Warm bass foundation note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(261.63, t); // C4
      bassGain.gain.setValueAtTime(0.2, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(t);
      bassOsc.stop(t + 0.4);

      // Marimba chime sequence
      for (let i = 0; i < notesToPlay; i++) {
        const noteIdx = (baseIdx + i) % scale.length;
        const freq = scale[noteIdx];
        const noteStart = t + i * 0.048;

        const osc = this.ctx.createOscillator();
        const oscHarmonic = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Fundamental
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Gentle 2nd harmonic for bell warmth
        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(freq * 2, noteStart);

        noteGain.gain.setValueAtTime(0, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.18, noteStart + 0.012);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.42);

        osc.connect(noteGain);
        oscHarmonic.connect(noteGain);
        noteGain.connect(this.ctx.destination);

        osc.start(noteStart);
        oscHarmonic.start(noteStart);
        osc.stop(noteStart + 0.43);
        oscHarmonic.stop(noteStart + 0.43);
      }
    } catch {}
  }

  // Jubilant combo fanfare
  public playComboFanfare(combo: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Majestic chord voicings
      const chords = [
        [523.25, 659.25, 783.99, 1046.5], // C major
        [587.33, 739.99, 880.0, 1174.66], // D major
        [659.25, 830.61, 987.77, 1318.51], // E major
        [783.99, 987.77, 1174.66, 1567.98], // G major sparkle
      ];
      const chord = chords[Math.max(0, Math.min(combo - 2, chords.length - 1))];

      chord.forEach((freq, idx) => {
        const noteStart = t + idx * 0.035;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.16, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.56);
      });
    } catch {}
  }

  // Game over gentle melancholic cadence
  public playGameOver() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [440.0, 392.0, 349.23, 311.13, 261.63];

      notes.forEach((freq, idx) => {
        const start = t + idx * 0.14;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
