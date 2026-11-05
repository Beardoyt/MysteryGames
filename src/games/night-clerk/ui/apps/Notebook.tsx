import { useState } from 'react'
import { DEDUCTIONS, clueById } from '../../data/clues.ts'
import { useGame } from '../ctx.ts'

export default function Notebook({ onAccuse }: { onAccuse: () => void }) {
  const { s, dispatch, sfx, status } = useGame()
  const [sel, setSel] = useState<number[]>([])
  const [shake, setShake] = useState(false)
  const [snap, setSnap] = useState<string | null>(null)
  const [drag, setDrag] = useState<number | null>(null)

  const test = (cards: number[]) => {
    const set = [...new Set(cards)].sort()
    const hit = DEDUCTIONS.find((d) => d.cards.length === set.length && d.cards.every((c) => set.includes(c)))
    if (hit && !s.deductions.includes(hit.id)) {
      sfx('U7'); sfx('U4')
      dispatch({ type: 'DEDUCE', id: hit.id })
      setSnap(hit.id)
      setTimeout(() => setSnap(null), 1600)
      status(`Deduction: ${hit.result}.`)
      setSel([])
      return true
    }
    const partial = DEDUCTIONS.some((d) => !s.deductions.includes(d.id) && set.every((c) => d.cards.includes(c)) && set.length < d.cards.length)
    if (partial) { setSel(set); status('These might go together. Is something missing?'); return false }
    if (hit) status('You already worked that one out.')
    else status('These don\'t connect.')
    sfx('U8')
    setShake(true)
    setTimeout(() => setShake(false), 450)
    setSel([])
    return false
  }

  const toggle = (id: number) => { sfx('U1'); setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]) }

  return (
    <div className="nc-app nc-notebook">
      <div className="nc-toolbar">
        <button className="nc-btn" disabled={sel.length < 2} onClick={() => test(sel)}>🔗 Connect selected ({sel.length})</button>
        {sel.length > 0 && <button className="nc-btn" onClick={() => setSel([])}>Clear</button>}
        {s.chapter >= 4 && <button className="nc-btn nc-accuse-btn" onClick={onAccuse}>⚖ Accuse…</button>}
      </div>
      <div className={`nc-cork ${shake ? 'is-shake' : ''}`}>
        {s.clues.length === 0 && <p className="nc-cork-empty">Click a suspicious line in any app to pin it here.</p>}
        {[...s.clues].sort((a, b) => a - b).map((id) => {
          const c = clueById(id)
          return (
            <button
              key={id}
              draggable
              onDragStart={() => setDrag(id)}
              onDragEnd={() => setDrag(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (drag !== null && drag !== id) test([...sel, drag, id]) }}
              className={`nc-card ${sel.includes(id) ? 'is-sel' : ''}`}
              onClick={() => toggle(id)}
              aria-pressed={sel.includes(id)}
            >
              <span className="nc-card-n">#{id}</span>
              <span className="nc-card-t">“{c.text}”</span>
              <small>{c.source}</small>
            </button>
          )
        })}
      </div>
      {s.deductions.length > 0 && (
        <div className="nc-deds">
          {DEDUCTIONS.filter((d) => s.deductions.includes(d.id)).map((d) => (
            <div key={d.id} className={`nc-ded ${snap === d.id ? 'is-snap' : ''}`}>
              <b>{d.id}. {d.title}</b> <span className="nc-tag">{d.slot}</span>
              <div>{d.result}</div>
              <small>from clues {d.cards.map((c) => '#' + c).join(' + ')}</small>
            </div>
          ))}
        </div>
      )}
      <div className="nc-foot">Select cards and press Connect, or drag one card onto another.</div>
    </div>
  )
}
