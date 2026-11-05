import { useMemo, useState } from 'react'
import { REGISTER } from '../../data/records.ts'
import Line from '../Line.tsx'

export default function Register() {
  const [q, setQ] = useState('')
  const [desc, setDesc] = useState(true)
  const rows = useMemo(() => {
    const f = REGISTER.filter((r) => `${r.name} ${r.room} ${r.date} ${r.pay} ${r.plate}`.toLowerCase().includes(q.toLowerCase()))
    const key = (d: string) => { const [m, dd, y] = d.split('/'); return y + m + dd }
    const mins = (t: string) => { const m = t.match(/(\d+):(\d+)(am|pm)/); return m ? ((+m[1] % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + +m[2] : 0 }
    return f.sort((a, b) => (desc ? -1 : 1) * (key(a.date).localeCompare(key(b.date)) || mins(a.time) - mins(b.time)))
  }, [q, desc])
  return (
    <div className="nc-app">
      <div className="nc-toolbar">
        <label>Search <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="name, room, plate…" /></label>
        <button className="nc-btn" onClick={() => setDesc(!desc)}>Date {desc ? '▼' : '▲'}</button>
      </div>
      <div className="nc-scroll">
        <table className="nc-table">
          <thead><tr><th>Date</th><th>Time</th><th>Guest</th><th>Rm</th><th>Nts</th><th>Paid</th><th>Plate</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <Line key={i} as="tr" clue={r.clue}>
                <td>{r.date}</td><td>{r.time}</td><td>{r.name}</td><td>{r.room}</td><td>{r.nights}</td><td>{r.pay}</td><td>{r.plate}</td>
              </Line>
            ))}
          </tbody>
        </table>
      </div>
      <div className="nc-foot">{rows.length} entries · Hotel Sitara guest register</div>
    </div>
  )
}
