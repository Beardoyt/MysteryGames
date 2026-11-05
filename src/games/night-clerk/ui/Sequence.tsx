import { useEffect, useState } from 'react'
import CamCanvas from './CamCanvas.tsx'
import Typed from './Typed.tsx'
import type { CutId } from '../render/scenes.ts'
import { useGame } from './ctx.ts'

export interface Shot { cut: CutId; text: string; sfx?: string; caption?: string }

/** A sequence of still images with typed narration: used for the cold open and the walk to Room 14. */
export default function Sequence({ shots, onEnd, endLabel = 'Continue', skippable = true }: { shots: Shot[]; onEnd: () => void; endLabel?: string; skippable?: boolean }) {
  const { sfx } = useGame()
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState(false)
  const shot = shots[i]
  const next = () => {
    if (!typed) { setTyped(true); return }
    if (i < shots.length - 1) { setTyped(false); setI(i + 1) } else onEnd()
  }
  useEffect(() => { if (shot.sfx) sfx(shot.sfx) }, [i, shot.sfx, sfx])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (['ArrowRight', 'Enter', ' '].includes(e.key)) { e.preventDefault(); next() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })
  return (
    <div className="nc-seq" onClick={next}>
      <CamCanvas cut={shot.cut} label={shot.text} className="nc-seq-img" fps={10} />
      {shot.caption && <p className="nc-caption">{shot.caption}</p>}
      <p className="nc-seq-text">
        {typed ? shot.text : <Typed key={i} text={shot.text} onTick={() => sfx('U10')} onDone={() => setTyped(true)} />}
      </p>
      <div className="nc-seq-nav" onClick={(e) => e.stopPropagation()}>
        {skippable && <button className="nc-btn nc-ghost" onClick={onEnd}>Skip</button>}
        <span className="nc-dim">{i + 1} / {shots.length}</span>
        <button className="nc-btn" onClick={next} autoFocus>{i === shots.length - 1 && typed ? endLabel : 'Next ▸'}</button>
      </div>
    </div>
  )
}
