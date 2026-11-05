import { useState } from 'react'
import { CARD_OWNERS, KEYCARD } from '../../data/records.ts'
import Line from '../Line.tsx'

export default function Keycard() {
  const [room, setRoom] = useState('all')
  const [card, setCard] = useState('all')
  const rooms = [...new Set(KEYCARD.map((r) => r.room))]
  const cards = [...new Set(KEYCARD.map((r) => r.card))].filter((c) => c !== '—')
  const rows = KEYCARD.filter((r) => (room === 'all' || r.room === room) && (card === 'all' || r.card === card))
  return (
    <div className="nc-app">
      <div className="nc-toolbar">
        <label>Room <select value={room} onChange={(e) => setRoom(e.target.value)}><option value="all">All</option>{rooms.map((r) => <option key={r}>{r}</option>)}</select></label>
        <label>Card <select value={card} onChange={(e) => setCard(e.target.value)}><option value="all">All</option>{cards.map((r) => <option key={r}>{r}</option>)}</select></label>
      </div>
      <div className="nc-scroll">
        <table className="nc-table">
          <thead><tr><th>Date</th><th>Time</th><th>Door</th><th>Card</th><th>Note</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <Line key={i} as="tr" clue={r.clue}>
                <td>{r.date}</td><td>{r.time}</td><td>{r.room}</td><td>{r.card}</td><td>{r.note}</td>
              </Line>
            ))}
          </tbody>
        </table>
      </div>
      <div className="nc-foot">{CARD_OWNERS}</div>
    </div>
  )
}
