import { useState } from 'react'
import { EMAILS, EMAIL_PASSWORD } from '../../data/records.ts'
import { useGame } from '../ctx.ts'
import Line from '../Line.tsx'

export default function Email() {
  const { s, dispatch, sfx, status, guide } = useGame()
  const [pw, setPw] = useState('')
  const [folder, setFolder] = useState<'inbox' | 'trash'>('inbox')
  const [sel, setSel] = useState<string | null>(null)

  if (!s.emailUnlocked) {
    return (
      <form
        className="nc-app nc-login"
        onSubmit={(e) => {
          e.preventDefault()
          if (pw.trim().toLowerCase() === EMAIL_PASSWORD) { sfx('U4'); dispatch({ type: 'UNLOCK_EMAIL' }) }
          else { sfx('U5'); status('Wrong password. Ray must have written it down somewhere.'); setPw('') }
        }}
      >
        <p><b>DeskMail</b> · user: <span className="nc-mono">rdoyle</span></p>
        <label>Password <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        <button className="nc-btn" type="submit">Log in</button>
      </form>
    )
  }
  const list = EMAILS.filter((m) => m.folder === folder)
  const mail = EMAILS.find((m) => m.id === sel)
  return (
    <div className="nc-app">
      <div className="nc-toolbar">
        <button className={`nc-btn ${folder === 'inbox' ? 'is-on' : ''}`} onClick={() => { setFolder('inbox'); setSel(null) }}>Inbox</button>
        <button className={`nc-btn ${folder === 'trash' ? 'is-on' : ''} ${guide?.clue === 7 && folder !== 'trash' ? 'is-guide' : ''}`} onClick={() => { setFolder('trash'); setSel(null) }}>Trash</button>
      </div>
      <div className="nc-split">
        <ul className="nc-list">
          {list.map((m) => (
            <li key={m.id}>
              <button className={`nc-listbtn ${sel === m.id ? 'is-on' : ''} ${guide?.clue === 7 && m.clueLine !== undefined && sel !== m.id ? 'is-guide' : ''}`} onClick={() => { setSel(m.id); sfx('U1') }}>
                <b>{m.from}</b><span>{m.subject}</span><small>{m.date}</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="nc-reader">
          {mail ? (
            <>
              <div className="nc-mailhead"><b>{mail.subject}</b><br />From: {mail.from} · {mail.date}</div>
              {mail.body.map((l, i) => <Line key={i} clue={mail.clueLine === i ? 7 : undefined}>{l}</Line>)}
            </>
          ) : <p className="nc-dim">Select a message.</p>}
        </div>
      </div>
    </div>
  )
}
