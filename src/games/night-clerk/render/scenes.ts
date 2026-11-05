/* Procedural placeholder art. Every "photo" in the game is drawn here on a small
   320x240 canvas, then grain, scanlines and a burned-in timestamp are added.
   Real stills can replace these later by drawing an <img> in CamCanvas instead. */

export const W = 320
export const H = 240

export type CamId = 'walkway' | 'lot' | 'lobby'
export type CutId =
  | 'highway' | 'sign' | 'car' | 'door14' | 'monitor'
  | 'cabinet' | 'walkway' | 'tape' | 'key' | 'open' | 'owen'
  | 'ray' | 'edna' | 'luis' | 'police'

export interface CamOpts {
  cam: CamId
  /** camera-clock minutes after midnight (negative = before midnight) */
  stamp: number
  live?: boolean
  zoom?: { x: number; y: number; k: number } | null
  beam?: boolean
  rayAtCar?: boolean
  frame?: number
}

type Ctx = CanvasRenderingContext2D

const VP = { x: 210, y: 112 }
const F = 120
const P = (x: number, y: number, z: number) => [VP.x + (x * F) / z, VP.y + (y * F) / z] as const

function poly(c: Ctx, pts: (readonly [number, number])[], fill: string) {
  c.beginPath()
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
  c.closePath()
  c.fillStyle = fill
  c.fill()
}

/** where the clue details sit in camera space, for zoom checks */
export function figurePoint() { const z = 1.3 + 1.05 + 0.3; const [x, y] = P(-2.2, 1.5, z); return { x: x - 17.5 / z, y: y - 29.5 / z } }
export const CAR_PASS = { x: 142, y: 150 }

export const WALK_DOORS = [8, 9, 10, 11, 12, 13, 14]
const doorZ = (i: number) => 1.3 + i * 1.05

function walkway(c: Ctx, o: CamOpts) {
  c.fillStyle = '#121212'
  c.fillRect(0, 0, W, H)
  // ceiling, floor, wall
  poly(c, [P(-3, -1.6, 0.6), P(3, -1.6, 0.6), P(3, -1.6, 12), P(-3, -1.6, 12)], '#1c1c1c')
  poly(c, [P(-3, 1.5, 0.6), P(3, 1.5, 0.6), P(3, 1.5, 12), P(-3, 1.5, 12)], '#2c2c2c')
  poly(c, [P(-3, -1.6, 0.6), P(-3, 1.5, 0.6), P(-3, 1.5, 12), P(-3, -1.6, 12)], '#3a3a3a')
  // railing on the right
  for (let z = 1; z < 12; z += 0.8) {
    const [x1, y1] = P(2.6, 0.2, z)
    const [, y2] = P(2.6, 1.5, z)
    c.fillStyle = '#4a4a4a'
    c.fillRect(x1, y1, Math.max(1, 3 / z), y2 - y1)
  }
  c.strokeStyle = '#555'
  c.lineWidth = 2
  c.beginPath(); c.moveTo(...P(2.6, 0.2, 0.8)); c.lineTo(...P(2.6, 0.2, 12)); c.stroke()
  // ceiling lights + pools of light
  for (const z of [1.8, 4.2, 6.6]) {
    const [lx, ly] = P(-1, -1.55, z)
    const [fx, fy] = P(-1, 1.5, z)
    const g = c.createRadialGradient(fx, fy, 2, fx, fy, 90 / z)
    g.addColorStop(0, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#ddd'
    c.fillRect(lx - 8 / z, ly, 16 / z, 3 / z + 1)
  }
  // doors
  WALK_DOORS.forEach((room, i) => {
    const z0 = doorZ(i)
    const z1 = z0 + 0.6
    const pts = [P(-3, -0.9, z0), P(-3, 1.5, z0), P(-3, 1.5, z1), P(-3, -0.9, z1)]
    poly(c, pts, room === 14 ? '#2a2a2a' : '#5b5b5b')
    const [nx, ny] = P(-3, -1.15, z0 + 0.3)
    c.fillStyle = '#ddd'
    c.font = `${Math.max(5, Math.round(16 / z0))}px monospace`
    c.textAlign = 'center'
    c.fillText(String(room), nx, ny)
    if (room === 14) {
      c.strokeStyle = '#9a9a9a'
      c.lineWidth = Math.max(1, 3 / z0)
      c.beginPath()
      c.moveTo(...pts[0]); c.lineTo(...pts[2])
      c.moveTo(...pts[1]); c.lineTo(...pts[3])
      c.stroke()
    }
  })
  // figure at 03:32 camera time: Ray limping away from Room 9
  if (!o.live && o.stamp === 212) {
    const z = doorZ(1) + 0.3
    const [fx, fy] = P(-2.2, 1.5, z)
    const s = 1 / z
    c.fillStyle = '#0b0b0b'
    // body leaning (limp)
    c.beginPath()
    c.ellipse(fx, fy - 70 * s, 13 * s, 16 * s, 0.15, 0, Math.PI * 2) // hood
    c.fill()
    poly(c, [[fx - 20 * s, fy - 58 * s], [fx + 18 * s, fy - 55 * s], [fx + 16 * s, fy - 8 * s], [fx - 14 * s, fy - 10 * s]], '#0b0b0b')
    c.fillRect(fx - 12 * s, fy - 10 * s, 9 * s, 10 * s)
    c.fillRect(fx + 3 * s, fy - 12 * s, 9 * s, 12 * s)
    // the bag
    c.fillRect(fx + 16 * s, fy - 36 * s, 16 * s, 20 * s)
    // brass key tag glint
    c.fillStyle = '#cfcfcf'
    c.fillRect(fx - 22 * s, fy - 34 * s, 9 * s, 9 * s)
    if (o.zoom) {
      c.fillStyle = '#111'
      c.font = `bold ${4.2 * s}px monospace`
      c.textAlign = 'center'
      c.fillText('MGR', fx - 17.5 * s, fy - 28.5 * s)
    }
  }
  if (o.beam) {
    const [bx, by] = P(-3, 0.3, doorZ(6) + 0.3)
    const g = c.createRadialGradient(bx, by, 1, bx, by, 26)
    g.addColorStop(0, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.4)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, W, H)
  }
}

function car(c: Ctx, x: number, y: number, w: number, h: number, shade: string, pass = false, zoom = false) {
  c.fillStyle = shade
  c.fillRect(x, y, w, h)
  c.fillStyle = '#111'
  c.fillRect(x + w * 0.12, y + h * 0.18, w * 0.76, h * 0.22) // windshield
  c.fillRect(x + w * 0.12, y + h * 0.68, w * 0.76, h * 0.16)
  c.fillStyle = '#ddd'
  c.fillRect(x + 2, y + 1, 4, 2)
  c.fillRect(x + w - 6, y + 1, 4, 2)
  if (pass) {
    c.fillStyle = '#f2f2f2'
    c.fillRect(x + w * 0.55, y + h * 0.31, w * 0.22, h * 0.07)
    if (zoom) {
      c.fillStyle = '#111'
      c.font = `bold ${h * 0.03}px monospace`
      c.textAlign = 'left'
      c.fillText('HALVORSEN', x + w * 0.555, y + h * 0.345)
      c.fillText('MUTUAL', x + w * 0.555, y + h * 0.375)
    }
  }
}

function lot(c: Ctx, o: CamOpts) {
  c.fillStyle = '#262626'
  c.fillRect(0, 0, W, H)
  // grass verge & highway at top
  c.fillStyle = '#151515'
  c.fillRect(0, 0, W, 34)
  c.fillStyle = '#6a6a6a'
  for (let x = 0; x < W; x += 24) c.fillRect(x, 16, 12, 2)
  // lamp pool
  const g = c.createRadialGradient(170, 140, 10, 170, 140, 150)
  g.addColorStop(0, 'rgba(255,255,255,0.22)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  // parking lines
  c.fillStyle = '#9a9a9a'
  for (let i = 0; i < 7; i++) c.fillRect(20 + i * 46, 120, 2, 80)
  // Edna's car always there (slot 0); Owen's car arrives at 23:50 camera time (slot 2)
  car(c, 26, 128, 36, 66, '#5a5a5a')
  if (o.stamp >= -10 || o.live) car(c, 118, 128, 36, 66, '#7e7e7e', true, !!o.zoom)
  if (o.stamp < 200 && !o.live) car(c, 210, 128, 36, 66, '#444')
  // motel sign post
  c.fillStyle = '#888'
  c.fillRect(290, 40, 4, 80)
  c.fillStyle = '#bbb'
  c.fillRect(270, 40, 44, 18)
  c.fillStyle = '#222'
  c.font = '8px monospace'
  c.textAlign = 'center'
  c.fillText('PINECREST', 292, 52)
  if (o.rayAtCar) {
    c.fillStyle = '#080808'
    c.beginPath(); c.ellipse(166, 150, 6, 7, 0, 0, Math.PI * 2); c.fill()
    c.fillRect(160, 156, 13, 26)
  }
}

function lobby(c: Ctx, o: CamOpts) {
  c.fillStyle = '#2a2a2a'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#3a3a3a'
  c.fillRect(0, 150, W, 90)
  // glass door
  c.fillStyle = '#0d0d0d'
  c.fillRect(30, 50, 60, 110)
  c.strokeStyle = '#777'
  c.strokeRect(30, 50, 60, 110)
  c.fillStyle = '#777'
  c.font = '7px monospace'
  c.textAlign = 'center'
  c.fillText('NIGHT BELL', 60, 100)
  // counter
  c.fillStyle = '#585858'
  c.fillRect(140, 120, 170, 50)
  c.fillStyle = '#6d6d6d'
  c.fillRect(136, 114, 178, 8)
  // bell
  c.fillStyle = '#bbb'
  c.beginPath(); c.arc(170, 113, 5, Math.PI, 0); c.fill()
  // key board on the back wall
  c.fillStyle = '#4a4a4a'
  c.fillRect(200, 40, 90, 50)
  for (let i = 0; i < 16; i++) {
    c.fillStyle = i === 13 ? '#4a4a4a' : '#999'
    c.fillRect(206 + (i % 8) * 10, 50 + Math.floor(i / 8) * 18, 3, 8)
  }
  // Ray at the desk until he closes it (12:58 real = 01:18 camera)
  if (!o.live && o.stamp < 78) {
    c.fillStyle = '#0c0c0c'
    c.beginPath(); c.ellipse(240, 92, 10, 12, 0, 0, Math.PI * 2); c.fill()
    c.fillRect(226, 102, 30, 18)
  }
}

export function drawCam(c: Ctx, o: CamOpts) {
  c.save()
  if (o.zoom) {
    c.translate(W / 2, H / 2)
    c.scale(o.zoom.k, o.zoom.k)
    c.translate(-o.zoom.x, -o.zoom.y)
  }
  if (o.cam === 'walkway') walkway(c, o)
  else if (o.cam === 'lot') lot(c, o)
  else lobby(c, o)
  c.restore()
  grain(c, o.frame ?? 0, 0.32)
  // burned-in timestamp
  const label = { walkway: 'CAM2 WALKWAY', lot: 'CAM3 LOT', lobby: 'CAM1 LOBBY' }[o.cam]
  c.fillStyle = 'rgba(0,0,0,0.5)'
  c.fillRect(0, H - 14, W, 14)
  c.fillStyle = '#f0f0f0'
  c.font = '9px monospace'
  c.textAlign = 'left'
  c.fillText(label + (o.zoom ? '  ZOOM x' + o.zoom.k : ''), 4, H - 4)
  c.textAlign = 'right'
  c.fillText(o.live ? `● LIVE  ${camStamp(o.stamp)}` : `10-15-98  ${camStamp(o.stamp)}:07`, W - 4, H - 4)
}

export function camStamp(min: number) {
  const m = ((min % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** grain + scanlines + vignette; turns everything into a grubby 90s still */
export function grain(c: Ctx, seed: number, amount: number, tint?: [number, number, number] | 'color') {
  const img = c.getImageData(0, 0, W, H)
  const d = img.data
  let s = (seed * 7919 + 13) >>> 0
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0
    const n = ((s >>> 24) - 128) * amount
    const y = (i / 4 / W) | 0
    const scan = y % 2 ? 0.88 : 1
    const x = (i / 4) % W
    const vx = (x - W / 2) / (W / 2), vy = (y - H / 2) / (H / 2)
    const vig = 1 - Math.min(0.75, (vx * vx + vy * vy) * 0.38)
    if (tint === 'color') {
      for (let k = 0; k < 3; k++) d[i + k] = (d[i + k] + n * 0.6) * scan * vig
      continue
    }
    let l = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11 + n) * scan * vig
    l = l * 0.85 + 12 // low contrast
    if (tint) {
      d[i] = l * tint[0]; d[i + 1] = l * tint[1]; d[i + 2] = l * tint[2]
    } else {
      d[i] = d[i + 1] = d[i + 2] = l
    }
  }
  c.putImageData(img, 0, 0)
}

/* ------------------------------ cutaways ------------------------------ */

const WARM: [number, number, number] = [1.05, 0.92, 0.78]
const COLD: [number, number, number] = [0.85, 0.95, 1.08]

export function drawCut(c: Ctx, id: CutId, frame = 0) {
  c.save()
  c.fillStyle = '#0a0a0a'
  c.fillRect(0, 0, W, H)
  let tint: [number, number, number] | 'color' | undefined = COLD
  switch (id) {
    case 'highway': {
      c.fillStyle = '#141414'; c.fillRect(0, 0, W, 120)
      poly(c, [[130, 120], [190, 120], [320, 240], [0, 240]], '#262626')
      c.fillStyle = '#bbb'
      for (let i = 0; i < 6; i++) { const t = (i + (frame % 20) / 20) / 6; c.fillRect(160 - 1 - t * 2, 120 + t * t * 120, 2 + t * 6, 4 + t * 14) }
      c.fillStyle = '#e8c070'; c.fillRect(250, 104, 3, 3)
      for (let i = 0; i < 40; i++) { c.fillStyle = '#333'; c.fillRect((i * 53) % W, (i * 31) % 100, 1, 1) }
      tint = WARM
      break
    }
    case 'sign': {
      c.fillStyle = '#0e0e0e'; c.fillRect(0, 0, W, H)
      c.fillStyle = '#333'; c.fillRect(156, 140, 8, 100)
      c.strokeStyle = '#7fd0c6'; c.lineWidth = 3; c.strokeRect(70, 60, 180, 80)
      c.fillStyle = frame % 37 < 3 ? '#2a4a46' : '#9ff0e4'
      c.font = 'bold 24px serif'; c.textAlign = 'center'
      c.fillText('PINECREST', 160, 98)
      c.font = '14px serif'; c.fillStyle = '#e5b25a'
      c.fillText('MOTOR INN · VACANCY', 160, 124)
      tint = 'color'
      break
    }
    case 'car': {
      c.fillStyle = '#202020'; c.fillRect(0, 140, W, 100)
      c.fillStyle = '#4a4a4a'; c.fillRect(70, 110, 180, 50); c.fillRect(110, 80, 100, 34)
      c.fillStyle = '#111'; c.fillRect(118, 86, 84, 24)
      c.fillStyle = '#000'; c.beginPath(); c.arc(110, 160, 18, 0, 7); c.arc(210, 160, 18, 0, 7); c.fill()
      c.fillStyle = '#eee'; c.fillRect(170, 98, 22, 8)
      break
    }
    case 'door14':
    case 'tape': {
      c.fillStyle = '#3b3b3b'; c.fillRect(0, 0, W, H)
      c.fillStyle = '#5a5248'; c.fillRect(100, 30, 120, 210)
      c.fillStyle = '#d8d0b0'; c.font = 'bold 26px monospace'; c.textAlign = 'center'; c.fillText('14', 160, 70)
      c.fillStyle = '#c9a227'; c.fillRect(196, 140, 8, 8)
      c.save(); c.translate(160, 150)
      for (const r of [0.5, -0.5]) {
        c.save(); c.rotate(r); c.fillStyle = id === 'tape' ? '#b8a03c' : '#d9c24a'
        c.fillRect(-120, -7, 240, 14)
        c.fillStyle = '#111'; c.font = 'bold 9px sans-serif'; c.fillText('DO NOT ENTER   DO NOT ENTER', 0, 3); c.restore()
      }
      c.restore()
      if (id === 'tape') { const g = c.createRadialGradient(160, 140, 5, 160, 140, 120); g.addColorStop(0, 'rgba(255,240,200,.35)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = g; c.fillRect(0, 0, W, H) }
      tint = WARM
      break
    }
    case 'monitor': {
      c.fillStyle = '#1a1612'; c.fillRect(0, 0, W, H)
      c.fillStyle = '#b9ae94'; c.fillRect(70, 40, 180, 140)
      c.fillStyle = frame > 10 ? '#1f6f69' : '#050505'; c.fillRect(84, 52, 152, 110)
      c.fillStyle = '#c9bea2'; c.fillRect(110, 180, 100, 14)
      c.fillStyle = '#d6b48c'; c.beginPath(); c.ellipse(250, 200, 30, 14, -0.5, 0, 7); c.fill()
      tint = WARM
      break
    }
    case 'cabinet': {
      c.fillStyle = '#2d2a26'; c.fillRect(0, 0, W, H)
      c.fillStyle = '#4b463e'; c.fillRect(60, 30, 200, 180)
      for (let i = 0; i < 16; i++) {
        const x = 80 + (i % 4) * 46, y = 50 + Math.floor(i / 4) * 40
        c.fillStyle = '#888'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill()
        c.fillStyle = i === 13 ? '#c9a227' : '#777'; c.fillRect(x - 3, y + 4, i === 13 ? 8 : 6, i === 13 ? 18 : 14)
        c.fillStyle = '#ddd'; c.font = '7px monospace'; c.textAlign = 'center'; c.fillText(String(i + 1), x + 12, y + 3)
      }
      tint = WARM
      break
    }
    case 'walkway': {
      walkway(c, { cam: 'walkway', stamp: 0, beam: false })
      const g = c.createRadialGradient(150, 160, 4, 150, 160, 90)
      g.addColorStop(0, 'rgba(255,240,200,.5)'); g.addColorStop(1, 'rgba(0,0,0,.75)')
      c.fillStyle = g; c.fillRect(0, 0, W, H)
      tint = WARM
      break
    }
    case 'key': {
      c.fillStyle = '#4d453a'; c.fillRect(0, 0, W, H)
      c.fillStyle = '#2a2622'; c.beginPath(); c.arc(160, 120, 40, 0, 7); c.fill()
      c.fillStyle = '#c9a227'
      c.save(); c.translate(160, 120); c.rotate((frame % 30) / 30 * 0.6)
      c.fillRect(-4, -6, 70, 12); c.beginPath(); c.arc(80, 0, 16, 0, 7); c.fill(); c.restore()
      tint = WARM
      break
    }
    case 'open': {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H)
      poly(c, [[100, 30], [140, 40], [140, 230], [100, 240]], '#5a5248')
      const g = c.createRadialGradient(200, 140, 5, 200, 140, 80)
      g.addColorStop(0, 'rgba(255,240,200,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g; c.fillRect(0, 0, W, H)
      c.fillStyle = '#4a4a4a'; c.fillRect(170, 150, 90, 40) // untouched bed
      c.fillStyle = '#6a6a6a'; c.fillRect(170, 140, 90, 12)
      tint = WARM
      break
    }
    case 'owen': {
      c.fillStyle = '#050505'; c.fillRect(0, 0, W, H)
      const g = c.createRadialGradient(160, 110, 5, 160, 110, 110)
      g.addColorStop(0, 'rgba(255,240,210,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g; c.fillRect(0, 0, W, H)
      c.fillStyle = '#2b2b2b'; c.fillRect(120, 150, 80, 80) // chair
      c.fillStyle = '#7a6a5a'; c.beginPath(); c.ellipse(160, 95, 22, 27, 0, 0, 7); c.fill()
      c.fillStyle = '#ddd'; c.fillRect(140, 104, 40, 8) // gag
      c.fillStyle = '#3a3f4a'; c.fillRect(130, 120, 60, 70)
      c.strokeStyle = '#b8a070'; c.lineWidth = 3
      for (let y = 135; y < 185; y += 12) { c.beginPath(); c.moveTo(126, y); c.lineTo(194, y + 4); c.stroke() }
      c.fillStyle = '#111'; c.fillRect(148, 88, 6, 3); c.fillRect(166, 88, 6, 3)
      tint = WARM
      break
    }
    case 'police': {
      lot(c, { cam: 'lot', stamp: 400, live: true })
      c.fillStyle = frame % 10 < 5 ? 'rgba(255,40,40,.35)' : 'rgba(40,80,255,.35)'
      c.fillRect(0, 0, W, H)
      tint = 'color'
      break
    }
    case 'ray':
    case 'edna':
    case 'luis': {
      lobby(c, { cam: 'lobby', stamp: 999 })
      const sh = { ray: { w: 26, h: 30, y: 70, hair: '#1a1a1a' }, edna: { w: 20, h: 24, y: 82, hair: '#bdbdbd' }, luis: { w: 22, h: 28, y: 74, hair: '#0d0d0d' } }[id]
      c.fillStyle = '#6d6d6d'
      c.beginPath(); c.ellipse(160, sh.y + 40, sh.w, sh.h, 0, 0, 7); c.fill()
      c.fillStyle = sh.hair
      c.beginPath(); c.ellipse(160, sh.y + 22, sh.w + 2, sh.h / 2, 0, Math.PI, 0); c.fill()
      c.fillStyle = '#3e3e3e'
      c.fillRect(160 - sh.w * 1.8, sh.y + 40 + sh.h, sh.w * 3.6, 120)
      if (id === 'ray') { c.fillStyle = '#c9c9c9'; c.fillRect(160 + sh.w, sh.y + 100, 6, 10) }
      if (id === 'luis') { c.fillStyle = '#999'; c.fillRect(150, sh.y + 90, 20, 4) }
      if (id === 'edna') { c.fillStyle = '#999'; c.strokeStyle = '#999'; c.beginPath(); c.arc(150, sh.y + 40, 5, 0, 7); c.arc(170, sh.y + 40, 5, 0, 7); c.stroke() }
      tint = undefined
      break
    }
  }
  c.restore()
  grain(c, frame, 0.22, tint)
}
