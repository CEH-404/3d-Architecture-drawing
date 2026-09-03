// Lightweight Web Audio API synthesizer for walking footsteps and architectural ambient tone

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playFootstepSound(floorMaterial: string = 'hardwood') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let freq = 120;
    let decay = 0.08;
    let type: OscillatorType = 'triangle';

    if (floorMaterial === 'marble' || floorMaterial === 'tile_slate') {
      freq = 240;
      decay = 0.05;
      filter.frequency.value = 1800;
    } else if (floorMaterial === 'carpet') {
      freq = 80;
      decay = 0.12;
      filter.frequency.value = 400;
    } else {
      freq = 140;
      decay = 0.07;
      filter.frequency.value = 900;
    }

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + decay);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + decay);
  } catch (e) {
    // Ignore audio errors if audio context is blocked
  }
}
