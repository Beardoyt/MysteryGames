import { useState } from 'react'
import CamCanvas from '../CamCanvas.tsx'
import { CAR_PASS, camStamp, figurePoint } from '../../render/scenes.ts'
import type { CamId } from '../../render/scenes.ts'
import { useGame } from '../ctx.ts'

// a still every 10 minutes (camera clock, which runs 20 min fast) plus two motion-triggered frames
const STAMPS = (() => {
  const a: number[] = []
  for (let m = -40; m <= 440; m += 10) a.push(m)
  a.push(192, 212)
  return a.sort((x, y) => x - y)
})()
const MOTION = new Set([192, 212])

// remember where the player left the viewer between openings
const memory = { cam: 'walkway' as CamId, i: 0 }

export default function Cctv() {
  const { pin, status, sfx } = useGame()
  const [cam, setCamState] = useState<CamId>(memory.cam)
  const [i, setIState] = useState(memory.i)
  const setCam = (c: CamId) => { memory.cam = c; setCamState(c) }
  const setI = (n: number) => { memory.i = n; setIState(n) }
  const [zoomOn, setZoomOn] = useState(false)
  const [zoom, setZoom] = useState<{ x: number; y: number; k: number } | null>(null)
  const stamp = STAMPS[i]

  const go = (n: number) => {
    const j = Math.max(0, Math.min(STAMPS.length - 1, n))
    if (j !== i) sfx('U12')
    setI(j)
    setZoom(null)
  }
  const near = (p: { x: number; y: number }) => zoom && Math.hypot(zoom.x - p.x, zoom.y - p.y) < 40

  const pinFrame = () => {
    if (cam === 'walkway' && stamp === 192) return pin(3)
    if (cam === 'walkway' && stamp === 212) {
      if (near(figurePoint())) return pin(5)
      return status('Someone is there, carrying something. Something small glints at their hip. Try zooming in on it.')
    }
    if (cam === 'lot' && stamp >= -10) {
      if (near(CAR_PASS)) return pin(6)
      return status('The guest\'s car. There\'s a pass on the dashboard, too small to read. Zoom in.')
    }
    status('Nothing you can use in this frame.')
  }

  return (
    <div className="nc-app nc-cctv">
      <div className="nc-toolbar">
        {(['walkway', 'lot', 'lobby'] as CamId[]).map((c) => (
          <button key={c} className={`nc-btn ${cam === c ? 'is-on' : ''}`} onClick={() => { setCam(c); setZoom(null); sfx('U12') }}>
            {c === 'walkway' ? 'CAM2 Walkway' : c === 'lot' ? 'CAM3 Lot' : 'CAM1 Lobby'}
          </button>
        ))}
      </div>
      <div className={`nc-cam-wrap ${zoomOn ? 'is-zoom' : ''}`}>
        <CamCanvas
          cam={{ cam, stamp, zoom }}
          label={`${cam} camera at ${camStamp(stamp)}${zoom ? ', zoomed' : ''}`}
          onClick={(x, y) => {
            if (!zoomOn) return
            sfx('U12')
            setZoom(zoom ? null : { x, y, k: 3 })
          }}
        />
        {MOTION.has(stamp) && <span className="nc-motion">MOTION</span>}
      </div>
      <div className="nc-toolbar">
        <button className="nc-btn" onClick={() => go(i - 1)} aria-label="Previous frame">◀</button>
        <input
          type="range" min={0} max={STAMPS.length - 1} value={i}
          onChange={(e) => go(+e.target.value)} aria-label="Time" className="nc-slider"
        />
        <button className="nc-btn" onClick={() => go(i + 1)} aria-label="Next frame">▶</button>
        <span className="nc-mono">{camStamp(stamp)}</span>
      </div>
      <div className="nc-toolbar">
        <button className={`nc-btn ${zoomOn ? 'is-on' : ''}`} onClick={() => { setZoomOn(!zoomOn); setZoom(null) }}>🔍 Zoom tool {zoomOn ? 'ON' : 'off'}</button>
        <button className="nc-btn" onClick={pinFrame}>📌 Pin this frame</button>
      </div>
      <div className="nc-foot">{zoomOn ? 'Click the image to zoom in on a spot. Click again to zoom out.' : 'Archive: night of Oct 14–15. Times are the camera\'s own clock.'}</div>
    </div>
  )
}
