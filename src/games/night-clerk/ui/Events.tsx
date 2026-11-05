import { useEffect, useState } from 'react'
import { audio } from '../sound.ts'
import CamCanvas from './CamCanvas.tsx'
import { useGame } from './ctx.ts'

/** Scripted scare beats. Each one silences the music first; the silence is part of the scare. */
export default function Events() {
  const { s, dispatch, sfx } = useGame()
  const ev = s.activeEvent
  const soft = s.settings.softScares
  const [step, setStep] = useState(0)
  const done = () => { setStep(0); dispatch({ type: 'EVENT_DONE' }) }

  useEffect(() => {
    if (!ev) return
    setStep(0)
    audio.duckMusic(6000)
    if (ev === 'bell') setTimeout(() => sfx('S1'), 600)
    if (ev === 'phone') sfx(soft ? 'U9' : 'S2')
    if (ev === 'beam') { if (soft) { dispatch({ type: 'EVENT_DONE' }); return } sfx('S3') }
    if (ev === 'ray4am') { sfx('U9'); setTimeout(() => sfx('S5'), 1800) }
    if (ev === 'reboot') {
      sfx('U4'); sfx('S4')
      setTimeout(() => { setStep(1); sfx('U13') }, 2200)
      setTimeout(() => dispatch({ type: 'EVENT_DONE' }), 5200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev])

  if (!ev) return null

  if (ev === 'reboot') {
    return (
      <div className="nc-reboot" role="alert">
        {step === 0 ? <p className="nc-caption">[the power hum cuts out]</p> : (
          <pre>{'DeskOS 98  v4.10\nMemory test ........ 16384K OK\nRestoring session ... OK\n\nYour progress was saved before the power dropped.'}</pre>
        )}
      </div>
    )
  }

  const card = (img: React.ReactNode, lines: string[], button = 'Back to the desk') => (
    <div className="nc-event" role="dialog" aria-live="assertive">
      <div className="nc-event-box">
        {img}
        {lines.map((l, i) => <p key={i} className={l.startsWith('[') ? 'nc-caption' : ''}>{l}</p>)}
        <button className="nc-btn" autoFocus onClick={done}>{button}</button>
      </div>
    </div>
  )

  if (ev === 'bell')
    return card(<CamCanvas cam={{ cam: 'lobby', stamp: 80, live: true }} label="Lobby camera, live: the lobby is empty" />,
      ['[the desk bell rings once]', 'It is 1:00am. You look up from the screen.', 'The lobby is empty. The night bell door is locked. Nobody is at the desk.'])

  if (ev === 'phone') {
    if (soft) return card(null, ['[the desk phone rings once, then stops]', '2:50am.'])
    if (step === 0)
      return (
        <div className="nc-event" role="dialog">
          <div className="nc-event-box">
            <p className="nc-caption">[the desk phone is ringing]</p>
            <p>2:50am. Line 1. No caller ID.</p>
            <div className="nc-row-btns">
              <button className="nc-btn" autoFocus onClick={() => { setStep(1); sfx('S2b') }}>Pick up</button>
              <button className="nc-btn" onClick={done}>Let it ring</button>
            </div>
          </div>
        </div>
      )
    return card(null, ['[breathing]', '[a door creaking somewhere]', '[a click. The line goes dead.]'], 'Hang up')
  }

  if (ev === 'beam')
    return card(<CamCanvas cam={{ cam: 'walkway', stamp: 192 + 20, live: true, beam: true }} label="Walkway camera, live: a flashlight beam on the Room 14 door" />,
      ['[a flashlight click]', 'On the live walkway camera, a beam of light sweeps across the door of Room 14.', 'You blink. The walkway is dark again.'])

  if (ev === 'ray4am')
    return card(<CamCanvas cam={{ cam: 'lot', stamp: 260, live: true, rayAtCar: true }} label="Lot camera, live: Raju standing by the missing guest's car" />,
      ['[pager chirp]  RAJU: heading out for a bit. watch the desk.', '[a car door slams, far away. No engine.]', 'On the lot camera, Raju stands next to the missing guest\'s car. Then he limps back toward his apartment.'])

  return null
}
