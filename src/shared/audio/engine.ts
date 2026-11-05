import { Howl } from 'howler'

/**
 * Shared audio engine for every game.
 *
 * Each sound ID can be backed by a real file (played with Howler) or, until real
 * assets exist, by a procedural Web Audio "recipe". Swapping in a real file is a
 * one-line change in the game's manifest; no game code has to change.
 */
export type Bus = 'music' | 'sfx' | 'amb'
export type Stop = () => void
/** A one-shot recipe plays and ends by itself. A loop recipe returns a stop function. */
export type Recipe = (ctx: AudioContext, out: AudioNode) => Stop | void

export interface SoundDef {
  bus: Bus
  /** optional real audio files (ogg first, mp3 fallback) */
  src?: string[]
  recipe?: Recipe
  loop?: boolean
  volume?: number
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private buses = {} as Record<Bus, GainNode>
  private vols: Record<Bus, number> = { music: 0.6, sfx: 0.8, amb: 0.6 }
  private defs: Record<string, SoundDef> = {}
  private howls: Record<string, Howl> = {}
  private loops: Record<string, Stop> = {}
  private musicId: string | null = null

  register(defs: Record<string, SoundDef>) {
    Object.assign(this.defs, defs)
  }

  /** Must be called from a user gesture (click/key) because of browser autoplay rules. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      this.ctx = new Ctx()
      const master = this.ctx.createGain()
      master.connect(this.ctx.destination)
      for (const b of ['music', 'sfx', 'amb'] as Bus[]) {
        const g = this.ctx.createGain()
        g.gain.value = this.vols[b]
        g.connect(master)
        this.buses[b] = g
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setVolumes(v: Partial<Record<Bus, number>>) {
    Object.assign(this.vols, v)
    if (!this.ctx) return
    for (const b of Object.keys(v) as Bus[]) {
      this.buses[b].gain.setTargetAtTime(this.vols[b], this.ctx.currentTime, 0.05)
    }
    for (const [id, h] of Object.entries(this.howls)) {
      const d = this.defs[id]
      h.volume((d.volume ?? 1) * this.vols[d.bus])
    }
  }

  play(id: string) {
    const d = this.defs[id]
    if (!d || !this.ctx) return
    if (d.src?.length) {
      this.howl(id, d).play()
      return
    }
    d.recipe?.(this.ctx, this.buses[d.bus])
  }

  startLoop(id: string) {
    if (this.loops[id] || !this.ctx) return
    const d = this.defs[id]
    if (!d) return
    if (d.src?.length) {
      const h = this.howl(id, d)
      h.loop(true)
      const sid = h.play()
      h.fade(0, (d.volume ?? 1) * this.vols[d.bus], 1500, sid)
      this.loops[id] = () => {
        h.fade(h.volume(), 0, 800, sid)
        setTimeout(() => h.stop(sid), 850)
      }
      return
    }
    const stop = d.recipe?.(this.ctx, this.buses[d.bus])
    if (stop) this.loops[id] = stop
  }

  stopLoop(id: string) {
    this.loops[id]?.()
    delete this.loops[id]
  }

  stopAll() {
    for (const id of Object.keys(this.loops)) this.stopLoop(id)
    this.musicId = null
  }

  /** Switch background music. Pass null for silence (used before scares). */
  music(id: string | null) {
    if (id === this.musicId) return
    if (this.musicId) this.stopLoop(this.musicId)
    this.musicId = id
    if (id) this.startLoop(id)
  }

  /** Temporarily duck music to silence (scare beats), then bring it back. */
  duckMusic(ms: number) {
    if (!this.ctx) return
    const g = this.buses.music.gain
    const t = this.ctx.currentTime
    g.cancelScheduledValues(t)
    g.setTargetAtTime(0, t, 0.08)
    g.setTargetAtTime(this.vols.music, t + ms / 1000, 0.8)
  }

  private howl(id: string, d: SoundDef) {
    if (!this.howls[id]) {
      this.howls[id] = new Howl({ src: d.src!, volume: (d.volume ?? 1) * this.vols[d.bus] })
    }
    return this.howls[id]
  }
}

/* ---------- small helpers for procedural placeholder sounds ---------- */

let noiseBuf: AudioBuffer | null = null
export function noise(ctx: AudioContext): AudioBufferSourceNode {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  s.loop = true
  return s
}

export function env(ctx: AudioContext, out: AudioNode, at: number, a: number, d: number, peak = 1) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + Math.max(a, 0.001))
  g.gain.exponentialRampToValueAtTime(0.0001, at + a + d)
  g.connect(out)
  return g
}

export function tone(
  ctx: AudioContext, out: AudioNode, freq: number, at: number, dur: number,
  opts: { type?: OscillatorType; peak?: number; attack?: number; to?: number } = {},
) {
  const o = ctx.createOscillator()
  o.type = opts.type ?? 'sine'
  o.frequency.setValueAtTime(freq, at)
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, at + dur)
  const g = env(ctx, out, at, opts.attack ?? 0.005, dur, opts.peak ?? 0.3)
  o.connect(g)
  o.start(at)
  o.stop(at + dur + (opts.attack ?? 0.005) + 0.05)
}

export function burst(
  ctx: AudioContext, out: AudioNode, at: number, dur: number,
  opts: { type?: BiquadFilterType; freq?: number; q?: number; peak?: number; attack?: number } = {},
) {
  const n = noise(ctx)
  const f = ctx.createBiquadFilter()
  f.type = opts.type ?? 'bandpass'
  f.frequency.value = opts.freq ?? 1000
  f.Q.value = opts.q ?? 1
  const g = env(ctx, out, at, opts.attack ?? 0.003, dur, opts.peak ?? 0.3)
  n.connect(f).connect(g)
  n.start(at, Math.random())
  n.stop(at + dur + 0.1)
}
