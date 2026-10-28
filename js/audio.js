/* ==========================================================================
   AUDIO ENGINE — 100% Web Audio API Synthesis
   ========================================================================== */

const AudioEngine = (() => {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let convolver = null;
  let rainNodes = null;
  let isMutedState = false;
  let lastRustleTime = 0;

  // Initialize stored mute state
  try {
    isMutedState = localStorage.getItem("audio_muted") === "true";
  } catch (e) {
    isMutedState = false;
  }

  function createReverbBuffer(context, duration = 3.0, decay = 2.0) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  }

  function unlock() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      ctx = new AudioContextClass();

      master = ctx.createGain();
      master.gain.value = isMutedState ? 0 : 0.7;
      master.connect(ctx.destination);

      // Generate 3 seconds of white noise buffer
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Convolver node for deep metallic / room reverb
      convolver = ctx.createGain();
      try {
        const convNode = ctx.createConvolver();
        convNode.buffer = createReverbBuffer(ctx, 3.2, 2.5);
        const wetGain = ctx.createGain();
        wetGain.gain.value = 0.45;
        convNode.connect(wetGain).connect(master);
        convolver = convNode;
      } catch (e) {
        convolver = master;
      }
    }

    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  function canPlay() {
    return ctx && !isMutedState && ctx.state === "running";
  }

  // Paper rustle during letter drag
  function rustle(deltaY = 10) {
    if (!canPlay()) return;
    const now = performance.now();
    if (now - lastRustleTime < 60) return;
    lastRustleTime = now;

    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200 + Math.random() * 1800;
    filter.Q.value = 0.9;

    const gain = ctx.createGain();
    const speedVol = Math.min(0.22, Math.max(0.04, Math.abs(deltaY) / 100));
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(speedVol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random() * 2);
    src.stop(t + 0.09);
  }

  // Paper flip sound for cards
  function paperFlip() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    // Noise whoosh
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(4200, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.12);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random() * 2);
    src.stop(t + 0.15);

    // Subtle low thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.06);
    oscGain.gain.setValueAtTime(0.18, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(oscGain).connect(master);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Rubber stamp impact thunk
  function stamp() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    // Lowpass noise slam
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    src.connect(filter).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.11);

    // Heavy 90Hz body thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(oscGain).connect(master);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Velvet curtain sweep
  function curtain() {
    if (!canPlay()) return;
    const t = ctx.currentTime;
    const dur = 1.3;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.25);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  // Heavy metal lever clunk
  function clunk() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter).connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.13);

    // Click snap
    const click = ctx.createBufferSource();
    click.buffer = noiseBuf;
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = "highpass";
    clickFilter.frequency.value = 1600;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.25, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    click.connect(clickFilter).connect(clickGain).connect(master);
    click.start(t);
    click.stop(t + 0.04);
  }

  // Low dark piano chord (C2, G2, C3, Eb3)
  function pianoChord() {
    if (!canPlay()) return;
    const freqs = [65.41, 97.99, 130.81, 155.56]; // C minor in low register
    const t = ctx.currentTime;

    freqs.forEach((freq, idx) => {
      // Triangle base
      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, t);

      // Slightly detuned second oscillator for beating thickness
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq + (Math.random() * 0.8 - 0.4), t);

      // Sine octave up for hammer sparkle
      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(freq * 2, t);

      const noteGain = ctx.createGain();
      const initialVol = 0.18 / (idx * 0.3 + 1);
      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.linearRampToValueAtTime(initialVol, t + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 5.2);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      osc3.connect(noteGain);

      noteGain.connect(master);
      if (convolver && convolver.buffer) {
        noteGain.connect(convolver);
      }

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      osc1.stop(t + 5.3);
      osc2.stop(t + 5.3);
      osc3.stop(t + 5.3);
    });
  }

  // Heavy metal plumb bell (inharmonic partials: fundamental, x2.0, x2.76, x5.4)
  function bell(fundFreq = 110) {
    if (!canPlay()) return;
    const t = ctx.currentTime;
    const partials = [
      { ratio: 1.0,  gain: 0.35, decay: 4.2 },
      { ratio: 2.0,  gain: 0.22, decay: 2.8 },
      { ratio: 2.76, gain: 0.16, decay: 1.8 },
      { ratio: 5.4,  gain: 0.09, decay: 0.9 }
    ];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(fundFreq * p.ratio, t);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(p.gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + p.decay);

      osc.connect(g);
      g.connect(master);
      if (convolver && convolver.buffer) {
        g.connect(convolver);
      }

      osc.start(t);
      osc.stop(t + p.decay + 0.1);
    });
  }

  // Continuous rain & wind atmosphere loop
  function startRain() {
    if (!ctx) unlock();
    if (!ctx || rainNodes) return;

    try {
      const t = ctx.currentTime;

      // 1. Rain hiss (looping noise -> highpass 1000Hz)
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = noiseBuf;
      rainSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "highpass";
      rainFilter.frequency.value = 1100;

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.0001, t);
      rainGain.gain.linearRampToValueAtTime(isMutedState ? 0 : 0.075, t + 3.0);

      rainSrc.connect(rainFilter).connect(rainGain).connect(master);
      rainSrc.start(t);

      // 2. Wind swell (looping noise -> lowpass 380Hz modulated with LFO 0.08Hz)
      const windSrc = ctx.createBufferSource();
      windSrc.buffer = noiseBuf;
      windSrc.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "lowpass";
      windFilter.frequency.value = 400;

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.0001, t);
      windGain.gain.linearRampToValueAtTime(isMutedState ? 0 : 0.09, t + 3.5);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;

      lfo.connect(lfoGain).connect(windGain.gain);
      windSrc.connect(windFilter).connect(windGain).connect(master);

      lfo.start(t);
      windSrc.start(t);

      rainNodes = { rainSrc, rainGain, windSrc, windGain, lfo };
    } catch (e) {
      console.warn("Rain audio start failed:", e);
    }
  }

  // Typewriter single keystroke
  function typeKey() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    // Small noise strike
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400 + Math.random() * 400;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    const vol = 0.1 + Math.random() * 0.08;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random());
    src.stop(t + 0.04);

    // Metal click
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1180 + Math.random() * 100, t);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    osc.connect(oscGain).connect(master);
    osc.start(t);
    osc.stop(t + 0.02);
  }

  // Carriage return bell (ping!)
  function carriageBell() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    osc1.frequency.setValueAtTime(2100, t);
    const osc2 = ctx.createOscillator();
    osc2.frequency.setValueAtTime(4200, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(master);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.8);
    osc2.stop(t + 0.8);
  }

  // Wooden desk drawer sliding sound
  function drawer() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, t);
    filter.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    src.connect(filter).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.13);

    const osc = ctx.createOscillator();
    const oscG = ctx.createGain();
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);
    oscG.gain.setValueAtTime(0.2, t);
    oscG.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscG).connect(master);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  let lastWipeTime = 0;
  // Glass wiping squeak/swish
  function glassWipe(speed = 100) {
    if (!canPlay()) return;
    const now = performance.now();
    if (now - lastWipeTime < 50) return;
    lastWipeTime = now;

    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800 + Math.random() * 300;
    filter.Q.value = 6;

    const gain = ctx.createGain();
    const vol = Math.min(0.15, Math.max(0.03, Math.abs(speed) / 400));
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random() * 2);
    src.stop(t + 0.07);
  }

  // Gas lamp hiss & flicker
  function gasFlicker() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random() * 2);
    src.stop(t + 0.32);
  }

  // Ceramic mask breaking into shards
  function ceramicBreak() {
    if (!canPlay()) return;
    const t = ctx.currentTime;

    [0, 0.025, 0.055].forEach((delay, idx) => {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 3000 + idx * 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28 / (idx + 1), t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);

      src.connect(filter).connect(gain).connect(master);
      src.start(t + delay);
      src.stop(t + delay + 0.06);
    });

    // Low crack thud
    const osc = ctx.createOscillator();
    const oscG = ctx.createGain();
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.09);
    oscG.gain.setValueAtTime(0.35, t);
    oscG.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(oscG).connect(master);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  function setMuted(muted) {
    isMutedState = muted;
    try {
      localStorage.setItem("audio_muted", muted ? "true" : "false");
    } catch (e) {}

    if (master) {
      master.gain.value = muted ? 0 : 0.7;
    }
  }

  function isMuted() {
    return isMutedState;
  }

  return {
    unlock,
    rustle,
    paperFlip,
    stamp,
    curtain,
    clunk,
    pianoChord,
    bell,
    startRain,
    typeKey,
    carriageBell,
    drawer,
    glassWipe,
    gasFlicker,
    ceramicBreak,
    setMuted,
    isMuted
  };
})();
