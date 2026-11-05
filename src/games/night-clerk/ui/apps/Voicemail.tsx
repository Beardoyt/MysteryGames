import { useState } from 'react'
import { VOICEMAILS } from '../../data/records.ts'
import { useGame } from '../ctx.ts'
import Line from '../Line.tsx'

export default function Voicemail() {
  const { sfx, s } = useGame()
  const [sel, setSel] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const vm = VOICEMAILS.find((v) => v.id === sel)
  const play = () => {
    if (!vm) return
    sfx('U11')
    setPlaying(true)
    setTimeout(() => {
      if (vm.kind === 'breath') { if (!s.settings.softScares) sfx('S2b') }
      else sfx(vm.kind === 'static' ? 'V_static' : vm.kind === 'robot' ? 'V_robot' : 'V_voice')
    }, 700)
    setTimeout(() => setPlaying(false), 3600)
  }
  return (
    <div className="nc-app">
      <div className="nc-split">
        <ul className="nc-list">
          {VOICEMAILS.map((v, n) => (
            <li key={v.id}>
              <button className={`nc-listbtn ${sel === v.id ? 'is-on' : ''}`} onClick={() => { setSel(v.id); setPlaying(false) }}>
                <b>#{n + 1} {v.from}</b><small>{v.when}</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="nc-reader">
          {vm ? (
            <>
              <div className="nc-tape">
                <button className="nc-btn" onClick={play} disabled={playing}>{playing ? '▮▮ Playing' : '▶ Play'}</button>
                <div className="nc-bar"><div className={playing ? 'is-run' : ''} /></div>
              </div>
              <div className="nc-dim">Transcript</div>
              {vm.lines.map((l, i) => <Line key={i} clue={vm.clueLine === i ? 10 : undefined}>{l}</Line>)}
            </>
          ) : <p className="nc-dim">Select a message.</p>}
        </div>
      </div>
    </div>
  )
}
