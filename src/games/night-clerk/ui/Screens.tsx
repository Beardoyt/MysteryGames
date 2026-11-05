import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sequence from './Sequence.tsx'
import type { Shot } from './Sequence.tsx'
import Typed from './Typed.tsx'
import CamCanvas from './CamCanvas.tsx'
import { useGame } from './ctx.ts'

export function Title({ hasSave, onContinue, onNew }: { hasSave: boolean; onContinue: () => void; onNew: () => void }) {
  const { s } = useGame()
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="nc-title-screen">
      <CamCanvas cut="sign" label="The Pinecrest Motor Inn sign, buzzing in the dark" className="nc-title-bg" fps={10} />
      <div className="nc-title-box">
        <h1>The Night Clerk</h1>
        <p className="nc-dim">Pinecrest Motor Inn · October 15, 1998 · 11pm to 7am</p>
        <div className="nc-title-btns">
          {hasSave && <button className="nc-btn nc-big" onClick={onContinue} autoFocus>Continue shift</button>}
          {!confirm ? (
            <button className="nc-btn nc-big" onClick={() => (hasSave ? setConfirm(true) : onNew())} autoFocus={!hasSave}>New shift</button>
          ) : (
            <div className="nc-confirm">
              <p>Start over? Your saved shift will be erased.</p>
              <button className="nc-btn" onClick={onNew}>Yes, start over</button>
              <button className="nc-btn" onClick={() => setConfirm(false)}>Keep my save</button>
            </div>
          )}
          <Link className="nc-btn nc-ghost" to="/">← All games</Link>
        </div>
        {s.finished && <p className="nc-dim">You found him. Thanks for playing.</p>}
        <p className="nc-small">Best with headphones. Suggested age 13+. No timer: play at your own pace.</p>
      </div>
    </div>
  )
}

const INTRO: Shot[] = [
  { cut: 'highway', text: 'Route 9. Forty miles of nothing between Harlow Ridge and anywhere.' },
  { cut: 'sign', text: 'The Pinecrest Motor Inn. Sixteen rooms. One of them has been taped shut since summer.' },
  { cut: 'car', text: 'Last night, a man checked into Room 9.' },
  { cut: 'door14', text: 'This morning, he was gone. His car wasn\'t.' },
  { cut: 'monitor', text: 'Second shift. Eleven to seven. Just you and the desk.', sfx: 'U13' },
]
export function Intro({ onEnd }: { onEnd: () => void }) {
  return <Sequence shots={INTRO} onEnd={onEnd} endLabel="Switch on the monitor" />
}

const WALK: Shot[] = [
  { cut: 'cabinet', text: 'Room 14. A brass key. Nobody ever made a keycard for it.', sfx: 'S6' },
  { cut: 'walkway', text: 'Neon hum. Your own footsteps. Rain on the railing.', sfx: 'S7' },
  { cut: 'walkway', text: 'Something knocking, very softly.', sfx: 'S8', caption: '[three slow knocks]' },
  { cut: 'tape', text: 'The tape comes away easily. Someone has peeled it off before.', sfx: 'S9' },
  { cut: 'key', text: 'The old lock turns.' },
  { cut: 'open', text: 'No soot. No burn marks. The bed is still made. There was never a fire.' },
  { cut: 'owen', text: 'A man, tied to a chair, squinting into your flashlight. "...You\'re not Doyle."' },
  { cut: 'owen', text: '"Took you long enough. Did you get my call?"' },
]
export function Walk({ onEnd }: { onEnd: () => void }) {
  return <Sequence shots={WALK} onEnd={onEnd} endLabel="Call the police" skippable={false} />
}

export function Epilogue({ onFinish }: { onFinish: () => void }) {
  const { s, sfx } = useGame()
  const lines = [
    '6:41am. Harlow Ridge police arrive. Raymond Doyle is arrested at the county line in a car that isn\'t his.',
    'Owen Marsh, insurance adjuster, is treated for a concussion and released. His photos of Room 14 close claim 14-0098.',
    ...(s.deductions.includes('D') ? ['Luis Ortega is not charged. He starts locking the laundry room.'] : []),
    'Edna Kowal\'s back rent is forgiven by the new owners.',
    'The 2:50am call on the desk line was Owen\'s phone, dialing from his pocket while he picked the lock.',
    'Room 14 is never repaired. There was nothing to repair.',
  ]
  const [n, setN] = useState(1)
  const [typing, setTyping] = useState(true)
  useEffect(() => { sfx('S10') }, [sfx])
  const finished = n >= lines.length && !typing
  return (
    <div className="nc-epilogue">
      <CamCanvas cut="police" label="Police lights fill the motel lot" className="nc-seq-img" fps={6} />
      <div className="nc-log">
        <div className="nc-dim">SHIFT LOG · 10/16/98</div>
        {lines.slice(0, n).map((l, i) => (
          <p key={i}>{i === n - 1 && typing ? <Typed text={l} speed={28} onTick={() => sfx('U10')} onDone={() => setTyping(false)} /> : l}</p>
        ))}
      </div>
      {!finished ? (
        <button className="nc-btn" autoFocus onClick={() => { if (typing) setTyping(false); else { setN(n + 1); setTyping(true) } }}>Next ▸</button>
      ) : (
        <div className="nc-credits">
          <h2>The Night Clerk</h2>
          <p>Thank you for working the night shift.</p>
          <p className="nc-dim">Story, design and code: the After Hours team · Placeholder art and sound generated in your browser</p>
          <button className="nc-btn nc-big" onClick={onFinish}>Back to the title</button>
        </div>
      )}
    </div>
  )
}
