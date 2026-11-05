import { useEffect } from 'react'
import { STAFF_NOTES } from '../../data/records.ts'
import { useGame } from '../ctx.ts'
import Line from '../Line.tsx'

export default function Staff() {
  const { dispatch, s } = useGame()
  useEffect(() => {
    if (s.handoverRead) return
    const t = setTimeout(() => dispatch({ type: 'READ_HANDOVER' }), 2500)
    return () => clearTimeout(t)
  }, [dispatch, s.handoverRead])
  return (
    <div className="nc-app">
      <div className="nc-scroll nc-paper">
        {STAFF_NOTES.map((n, i) => (
          <div key={i} className="nc-note">
            <div className="nc-dim">{n.author} · {n.when}</div>
            {n.lines.map((l, j) => <Line key={j} clue={l.clue}>{l.text}</Line>)}
          </div>
        ))}
      </div>
    </div>
  )
}
