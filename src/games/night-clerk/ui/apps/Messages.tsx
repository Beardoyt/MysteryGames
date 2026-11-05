import { useEffect, useRef, useState } from 'react'
import { choicesFor } from '../../state.ts'
import type { Contact } from '../../state.ts'
import { useGame } from '../ctx.ts'
import Line from '../Line.tsx'

const NAMES: Record<Contact, string> = { ray: 'RAY (mgr)', edna: 'EDNA · Rm 12', luis: 'LUIS (maint.)' }

export default function Messages() {
  const { s, dispatch, sfx } = useGame()
  const contacts = (['ray', 'edna', 'luis'] as Contact[]).filter((c) => s.chat[c].length > 0)
  const [sel, setSel] = useState<Contact | null>(null)
  const cur = sel ?? contacts[0] ?? null
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (cur && s.unread[cur]) dispatch({ type: 'READ_CHAT', contact: cur })
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [cur, s.chat, s.unread, dispatch])

  if (!cur) return <div className="nc-app"><p className="nc-dim">No messages yet.</p></div>
  const choices = choicesFor(s, cur)
  return (
    <div className="nc-app">
      <div className="nc-toolbar">
        {contacts.map((c) => (
          <button key={c} className={`nc-btn ${cur === c ? 'is-on' : ''}`} onClick={() => setSel(c)}>
            {NAMES[c]}{s.unread[c] > 0 && cur !== c ? ` (${s.unread[c]})` : ''}
          </button>
        ))}
      </div>
      <div className="nc-scroll nc-pager">
        {s.chat[cur].map((l, i) =>
          l.from === 'sys' ? (
            <div key={i} className="nc-sys">{l.text}</div>
          ) : (
            <Line key={i} clue={l.clue} className={`nc-msg is-${l.from}`}>
              <small>{l.from === 'you' ? 'YOU' : NAMES[cur]} {l.time}</small>
              {l.text}
            </Line>
          ),
        )}
        <div ref={endRef} />
      </div>
      {choices.length > 0 && (
        <div className="nc-choices">
          {choices.map((c) => (
            <button key={c.id} className="nc-btn" onClick={() => { sfx('U10'); dispatch({ type: 'CHOOSE', contact: cur, choice: c.id }); setTimeout(() => sfx('U9'), 500) }}>
              ▸ {c.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
