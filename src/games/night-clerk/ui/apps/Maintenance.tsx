import { MAINTENANCE } from '../../data/records.ts'
import Line from '../Line.tsx'

export default function Maintenance() {
  return (
    <div className="nc-app">
      <div className="nc-scroll nc-paper">
        <div className="nc-dim">MAINT.TXT · S. Kale</div>
        {MAINTENANCE.map((l, i) => <Line key={i} clue={l.clue}><span className="nc-mono">{l.date}</span>  {l.text}</Line>)}
      </div>
    </div>
  )
}
