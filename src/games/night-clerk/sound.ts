import { AudioEngine, burst, noise, tone } from '../../shared/audio/engine.ts'
import type { Recipe, SoundDef } from '../../shared/audio/engine.ts'

/**
 * Sound IDs follow the design doc (M = music, A = ambience, U = interface, S = story).
 * Everything here is a procedural placeholder. To use a real recording, add
 * `src: ['/audio/night-clerk/S1.ogg', '/audio/night-clerk/S1.mp3']` to its entry.
 */
export const audio = new AudioEngine()

const now = (c: AudioContext) => c.currentTime

/** A slow detuned pad that loops until stopped. Used for every placeholder music track. */
const pad = (notes: number[], opts: { detune?: number; pulse?: number; cutoff?: number } = {}): Recipe => (ctx, out) => {
  const g = ctx.createGain()
  g.gain.value = 0
  g.gain.setTargetAtTime(0.16, now(ctx), 1.5)
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = opts.cutoff ?? 900
  g.connect(f).connect(out)
  const oscs: OscillatorNode[] = []
  notes.forEach((n, i) => {
    for (const d of [-1, 1]) {
      const o = ctx.createOscillator()
      o.type = i === 0 ? 'triangle' : 'sawtooth'
      o.frequency.value = n
      o.detune.value = d * (opts.detune ?? 7) + (i * 3)
      const og = ctx.createGain()
      og.gain.value = i === 0 ? 0.5 : 0.12
      o.connect(og).connect(g)
      o.start()
      oscs.push(o)
    }
  })
  // slow filter movement keeps the pad alive
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.05
  const lg = ctx.createGain()
  lg.gain.value = 300
  lfo.connect(lg).connect(f.frequency)
  lfo.start()
  oscs.push(lfo)
  let timer: number | undefined
  if (opts.pulse) {
    const tick = () => {
      tone(ctx, out, 55, now(ctx), 0.25, { peak: 0.18, type: 'sine', to: 40 })
      timer = window.setTimeout(tick, opts.pulse)
    }
    timer = window.setTimeout(tick, 800)
  }
  return () => {
    window.clearTimeout(timer)
    g.gain.setTargetAtTime(0, now(ctx), 0.6)
    setTimeout(() => oscs.forEach((o) => o.stop()), 3000)
  }
}

const loopNoise = (type: BiquadFilterType, freq: number, gain: number, q = 0.7, lfoHz = 0): Recipe => (ctx, out) => {
  const n = noise(ctx)
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = ctx.createGain()
  g.gain.value = 0
  g.gain.setTargetAtTime(gain, now(ctx), 1)
  n.connect(f).connect(g).connect(out)
  n.start()
  let lfo: OscillatorNode | null = null
  if (lfoHz) {
    lfo = ctx.createOscillator()
    lfo.frequency.value = lfoHz
    const lg = ctx.createGain()
    lg.gain.value = gain * 0.6
    lfo.connect(lg).connect(g.gain)
    lfo.start()
  }
  return () => {
    g.gain.setTargetAtTime(0, now(ctx), 0.4)
    setTimeout(() => { n.stop(); lfo?.stop() }, 2000)
  }
}

const neon: Recipe = (ctx, out) => {
  const o = ctx.createOscillator()
  o.type = 'sawtooth'
  o.frequency.value = 120
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 240
  f.Q.value = 4
  const g = ctx.createGain()
  g.gain.value = 0
  g.gain.setTargetAtTime(0.03, now(ctx), 1)
  o.connect(f).connect(g).connect(out)
  o.start()
  return () => { g.gain.setTargetAtTime(0, now(ctx), 0.2); setTimeout(() => o.stop(), 1000) }
}

const clockTick: Recipe = (ctx, out) => {
  let t: number
  const tick = () => { burst(ctx, out, now(ctx), 0.03, { freq: 3000, q: 8, peak: 0.12 }); t = window.setTimeout(tick, 1000) }
  tick()
  return () => window.clearTimeout(t)
}

const trucks: Recipe = (ctx, out) => {
  let t: number
  const pass = () => {
    const at = now(ctx)
    const n = noise(ctx)
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(200, at)
    f.frequency.linearRampToValueAtTime(700, at + 3)
    f.frequency.linearRampToValueAtTime(150, at + 7)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(0.25, at + 3)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 7)
    n.connect(f).connect(g).connect(out)
    n.start(at)
    n.stop(at + 7.2)
    t = window.setTimeout(pass, 60000 + Math.random() * 60000)
  }
  t = window.setTimeout(pass, 15000)
  return () => window.clearTimeout(t)
}

const ring = (ctx: AudioContext, out: AudioNode, at: number) => {
  for (let i = 0; i < 20; i++) {
    tone(ctx, out, 440, at + i * 0.05, 0.04, { type: 'square', peak: 0.08 })
    tone(ctx, out, 480, at + i * 0.05, 0.04, { type: 'square', peak: 0.08 })
  }
}

const D: Record<string, SoundDef> = {
  // music
  M1: { bus: 'music', loop: true, recipe: pad([110, 164.8, 207.7, 277.2], { detune: 14, cutoff: 700 }) },
  M2: { bus: 'music', loop: true, recipe: pad([98, 146.8, 220, 246.9], { pulse: 2000 }) },
  M3: { bus: 'music', loop: true, recipe: pad([92.5, 138.6, 196, 233], { detune: 25, pulse: 1400, cutoff: 600 }) },
  M4: { bus: 'music', loop: true, recipe: pad([82.4, 123.5, 185, 220, 293.7], { pulse: 900, cutoff: 1200 }) },
  M5: { bus: 'music', loop: true, recipe: pad([41.2, 61.7], { detune: 4, cutoff: 300 }) },
  M6: { bus: 'music', loop: true, recipe: pad([130.8, 196, 261.6, 329.6], { detune: 6, cutoff: 1500 }) },
  M7: { bus: 'music', loop: true, recipe: pad([73.4, 110, 174.6], { pulse: 1100, cutoff: 500 }) },
  // ambience
  A1: { bus: 'amb', loop: true, recipe: neon },
  A2: { bus: 'amb', loop: true, recipe: loopNoise('highpass', 9000, 0.008) },
  A3: { bus: 'amb', loop: true, recipe: (ctx, out) => { const a = loopNoise('lowpass', 400, 0.06, 0.5, 0.07)(ctx, out); const b = trucks(ctx, out); return () => { a?.(); b?.() } } },
  A4: { bus: 'amb', loop: true, recipe: clockTick },
  A5: { bus: 'amb', loop: true, recipe: loopNoise('highpass', 2500, 0.05) },
  // interface
  U1: { bus: 'sfx', recipe: (c, o) => burst(c, o, now(c), 0.02, { freq: 2500, q: 3, peak: 0.25 }) },
  U2: { bus: 'sfx', recipe: (c, o) => tone(c, o, 900, now(c), 0.08, { to: 300, peak: 0.12, type: 'triangle' }) },
  U3: { bus: 'sfx', recipe: (c, o) => tone(c, o, 300, now(c), 0.06, { to: 700, peak: 0.08, type: 'triangle' }) },
  U4: { bus: 'sfx', recipe: (c, o) => { for (let i = 0; i < 7; i++) burst(c, o, now(c) + i * 0.045 + Math.random() * 0.02, 0.02, { freq: 1800, q: 6, peak: 0.12 }) } },
  U5: { bus: 'sfx', recipe: (c, o) => { tone(c, o, 330, now(c), 0.3, { type: 'square', peak: 0.08 }); tone(c, o, 311, now(c) + 0.12, 0.3, { type: 'square', peak: 0.06 }) } },
  U6: { bus: 'sfx', recipe: (c, o) => { burst(c, o, now(c), 0.12, { freq: 4000, q: 0.5, peak: 0.15 }); tone(c, o, 1800, now(c) + 0.1, 0.04, { peak: 0.15 }) } },
  U7: { bus: 'sfx', recipe: (c, o) => { burst(c, o, now(c), 0.05, { freq: 1500, peak: 0.3 }); tone(c, o, 196, now(c) + 0.05, 1.4, { peak: 0.2, type: 'triangle' }); tone(c, o, 293.7, now(c) + 0.08, 1.4, { peak: 0.12 }) } },
  U8: { bus: 'sfx', recipe: (c, o) => burst(c, o, now(c), 0.25, { freq: 3000, q: 0.4, peak: 0.12, attack: 0.05 }) },
  U9: { bus: 'sfx', recipe: (c, o) => { tone(c, o, 2200, now(c), 0.06, { type: 'square', peak: 0.06 }); tone(c, o, 2200, now(c) + 0.12, 0.06, { type: 'square', peak: 0.06 }) } },
  U10: { bus: 'sfx', recipe: (c, o) => burst(c, o, now(c), 0.015, { freq: 3500 + Math.random() * 1500, q: 4, peak: 0.08 }) },
  U11: { bus: 'sfx', recipe: (c, o) => { burst(c, o, now(c), 0.5, { freq: 1200, q: 2, peak: 0.08, attack: 0.2 }); burst(c, o, now(c) + 0.6, 0.02, { freq: 2000, peak: 0.3 }) } },
  U12: { bus: 'sfx', recipe: (c, o) => burst(c, o, now(c), 0.015, { freq: 5000, q: 10, peak: 0.12 }) },
  U13: { bus: 'sfx', recipe: (c, o) => { tone(c, o, 50, now(c), 0.3, { peak: 0.4, to: 30 }); burst(c, o, now(c) + 0.1, 1.6, { type: 'lowpass', freq: 600, peak: 0.08, attack: 1 }); tone(c, o, 1000, now(c) + 1.8, 0.15, { type: 'square', peak: 0.06 }) } },
  // story
  S1: { bus: 'sfx', recipe: (c, o) => { const t = now(c); [1, 2.76, 5.4, 8.9].forEach((m, i) => tone(c, o, 880 * m, t, 3 / (i + 1), { peak: 0.25 / (i + 1) })) } },
  S2: { bus: 'sfx', recipe: (c, o) => { ring(c, o, now(c)); ring(c, o, now(c) + 3) } },
  S2b: { bus: 'sfx', recipe: (c, o) => { const t = now(c); for (let i = 0; i < 3; i++) burst(c, o, t + i * 2.2, 1.4, { type: 'bandpass', freq: 700, q: 1, peak: 0.18, attack: 0.6 }); burst(c, o, t + 7, 0.02, { freq: 2000, peak: 0.3 }) } },
  S3: { bus: 'sfx', recipe: (c, o) => { burst(c, o, now(c), 0.02, { freq: 2500, peak: 0.4 }); burst(c, o, now(c) + 0.05, 2.5, { type: 'lowpass', freq: 300, peak: 0.5, attack: 0.02 }); tone(c, o, 46, now(c), 2.5, { peak: 0.4, type: 'sawtooth' }) } },
  S4: { bus: 'sfx', recipe: (c, o) => { tone(c, o, 120, now(c), 0.5, { type: 'sawtooth', to: 20, peak: 0.2 }); burst(c, o, now(c) + 0.4, 0.03, { freq: 1500, peak: 0.4 }) } },
  S5: { bus: 'sfx', recipe: (c, o) => { burst(c, o, now(c), 0.25, { type: 'lowpass', freq: 250, peak: 0.6 }); burst(c, o, now(c), 0.05, { freq: 800, peak: 0.2 }) } },
  S6: { bus: 'sfx', recipe: (c, o) => { for (let i = 0; i < 9; i++) tone(c, o, 3000 + Math.random() * 3000, now(c) + i * 0.06 + Math.random() * 0.04, 0.15, { peak: 0.06 }) } },
  S7: { bus: 'sfx', recipe: (c, o) => { for (let i = 0; i < 4; i++) burst(c, o, now(c) + i * 0.55, 0.12, { type: 'lowpass', freq: 500 + Math.random() * 200, peak: 0.35 }) } },
  S8: { bus: 'sfx', recipe: (c, o) => { for (let i = 0; i < 3; i++) { burst(c, o, now(c) + i * 1.1, 0.15, { type: 'lowpass', freq: 180, peak: 0.8 }); tone(c, o, 70, now(c) + i * 1.1, 0.2, { peak: 0.4 }) } } },
  S9: { bus: 'sfx', recipe: (c, o) => { burst(c, o, now(c), 0.6, { freq: 3000, q: 0.5, peak: 0.2, attack: 0.05 }); burst(c, o, now(c) + 0.8, 0.05, { freq: 1200, peak: 0.4 }); tone(c, o, 180, now(c) + 1.1, 1.6, { type: 'sawtooth', to: 260, peak: 0.06, attack: 0.3 }) } },
  S10: { bus: 'sfx', recipe: (c, o) => { const t = now(c); const os = c.createOscillator(); os.frequency.setValueAtTime(700, t); for (let i = 0; i < 6; i++) { os.frequency.linearRampToValueAtTime(1100, t + i * 1.2 + 0.6); os.frequency.linearRampToValueAtTime(700, t + i * 1.2 + 1.2) } const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 4); g.gain.exponentialRampToValueAtTime(0.0001, t + 7.5); os.connect(g).connect(o); os.start(t); os.stop(t + 7.6); for (let i = 0; i < 6; i++) tone(c, o, 3200 + Math.random() * 800, t + 7 + i * 0.3, 0.08, { to: 4200, peak: 0.05 }) } },
  // voicemail "voices"
  V_voice: { bus: 'sfx', recipe: (c, o) => { const t = now(c); for (let i = 0; i < 16; i++) tone(c, o, 140 + Math.random() * 80, t + i * 0.18, 0.14, { type: 'sawtooth', peak: 0.03 }) } },
  V_static: { bus: 'sfx', recipe: (c, o) => burst(c, o, now(c), 3, { type: 'highpass', freq: 1500, peak: 0.1, attack: 0.3 }) },
  V_robot: { bus: 'sfx', recipe: (c, o) => { const t = now(c); for (let i = 0; i < 12; i++) tone(c, o, [220, 247, 196][i % 3], t + i * 0.2, 0.17, { type: 'square', peak: 0.03 }) } },
}

audio.register(D)
