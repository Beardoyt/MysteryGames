import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { APP_INFO, APP_UNLOCK, CHAPTERS, fmtClock } from '../data/clues.ts'
import type { AppId } from '../data/clues.ts'
import { clockOf } from '../state.ts'
import { guideFor } from '../guide.ts'
import { Ctx, useGame } from './ctx.ts'
import Events from './Events.tsx'
import Register from './apps/Register.tsx'
import Keycard from './apps/Keycard.tsx'
import Cctv from './apps/Cctv.tsx'
import Email from './apps/Email.tsx'
import Voicemail from './apps/Voicemail.tsx'
import Maintenance from './apps/Maintenance.tsx'
import Staff from './apps/Staff.tsx'
import Messages from './apps/Messages.tsx'
import Notebook from './apps/Notebook.tsx'
import Settings from './apps/Settings.tsx'
import Accuse from './apps/Accuse.tsx'

interface Win { id: AppId; x: number; y: number; z: number }
const ORDER: AppId[] = ['staff', 'messages', 'register', 'keycard', 'cctv', 'voicemail', 'email', 'maintenance', 'notebook', 'settings']
const SIZE: Partial<Record<AppId, [number, number]>> = { cctv: [560, 560], notebook: [660, 560], settings: [380, 400] }

export interface DesktopApi { open: (id: AppId) => void }

export default function Desktop({ onQuit, register, statusMsg, saving, accuseOpen, setAccuseOpen }: {
  onQuit: () => void
  register: (api: DesktopApi) => void
  statusMsg: string
  saving: boolean
  accuseOpen: boolean
  setAccuseOpen: (v: boolean) => void
}) {
  const game = useGame()
  const { s, sfx, status, pin, dispatch } = game
  const [wins, setWins] = useState<Win[]>([])
  const [menu, setMenu] = useState(false)
  const [tray, setTray] = useState(false)
  const [hintOn, setHintOn] = useState(false)
  const [flick, setFlick] = useState(false)
  const zTop = useRef(10)
  const screenRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  // keep windows below the NEXT bar, however many lines it wraps to
  useLayoutEffect(() => {
    const el = nextRef.current, scr = screenRef.current
    if (!el || !scr) return
    const ro = new ResizeObserver(() => scr.style.setProperty('--nexth', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const open = useCallback((id: AppId) => {
    if (APP_UNLOCK[id] > s.chapter) { sfx('U5'); status(`${APP_INFO[id].name} is locked for now.`); return }
    setMenu(false)
    setWins((ws) => {
      const z = ++zTop.current
      if (ws.some((w) => w.id === id)) return ws.map((w) => (w.id === id ? { ...w, z } : w))
      const n = ws.length
      return [...ws, { id, x: 24 + (n % 5) * 28, y: 16 + (n % 5) * 24, z }]
    })
    sfx('U2')
    if (s.settings.crt) { setFlick(true); setTimeout(() => setFlick(false), 120) }
  }, [s.chapter, s.settings.crt, sfx, status])

  useEffect(() => register({ open }), [register, open])

  const close = (id: AppId) => { sfx('U3'); setWins((ws) => ws.filter((w) => w.id !== id)) }
  const focus = (id: AppId) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zTop.current } : w)))

  // first moment on the desktop: open Staff Notes so new players have somewhere to start
  useEffect(() => {
    if (s.chapter === 0) open('staff')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // if guided mode is off, show the next step after 2 quiet minutes
  useEffect(() => {
    setHintOn(false)
    if (!s.settings.hints || s.settings.guided) return
    const t = setTimeout(() => setHintOn(true), 2 * 60 * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.clues.length, s.deductions.length, s.chapter, s.settings.hints])

  const drag = (id: AppId, e: React.PointerEvent) => {
    if (window.innerWidth < 760) return
    const w = wins.find((x) => x.id === id)!
    const sx = e.clientX - w.x, sy = e.clientY - w.y
    focus(id)
    const move = (ev: PointerEvent) => setWins((ws) => ws.map((x) => (x.id === id ? { ...x, x: Math.max(-200, ev.clientX - sx), y: Math.max(0, ev.clientY - sy) } : x)))
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const body = (id: AppId): ReactNode => {
    switch (id) {
      case 'register': return <Register />
      case 'keycard': return <Keycard />
      case 'cctv': return <Cctv />
      case 'email': return <Email />
      case 'voicemail': return <Voicemail />
      case 'maintenance': return <Maintenance />
      case 'staff': return <Staff />
      case 'messages': return <Messages />
      case 'notebook': return <Notebook onAccuse={() => setAccuseOpen(true)} />
      case 'settings': return <Settings onQuit={onQuit} />
    }
  }

  const openIds = wins.map((w) => w.id)
  const nextStep = guideFor(s, openIds)
  const guide = s.settings.guided || hintOn ? nextStep : null
  const glow = (on: boolean) => (on ? 'is-guide' : '')
  const welcomed = s.flags.includes('welcomed')

  const unreadTotal = s.unread.ray + s.unread.edna + s.unread.luis
  const lampFlicker = s.activeEvent === 'bell' || s.activeEvent === 'beam' || s.activeEvent === 'reboot'

  return (
    <Ctx.Provider value={{ ...game, guide }}>
    <div className={`nc-room ${lampFlicker ? 'is-flicker' : ''}`}>
      <div className="nc-lamp" aria-hidden />
      <div className="nc-monitor">
        <div ref={screenRef} className={`nc-screen ${s.settings.crt ? 'crt' : ''} ${flick ? 'is-flick' : ''} ${s.activeEvent === 'reboot' ? 'is-off' : ''}`}>
          <div className="nc-wall">
            <div className="nc-logo">DeskOS<span>98</span></div>
            <div className="nc-icons">
              {ORDER.map((id) => {
                const locked = APP_UNLOCK[id] > s.chapter
                return (
                  <button key={id} className={`nc-icon ${locked ? 'is-locked' : ''} ${glow(guide?.app === id && !openIds.includes(id))}`} onDoubleClick={() => open(id)} onClick={() => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760 ? open(id) : undefined} onKeyDown={(e) => e.key === 'Enter' && open(id)}>
                    <span className="nc-icon-img">{locked ? '🔒' : APP_INFO[id].icon}</span>
                    <span>{APP_INFO[id].name}{id === 'messages' && unreadTotal > 0 ? ` (${unreadTotal})` : ''}</span>
                  </button>
                )
              })}
            </div>
            <button className={`nc-sticky nc-sticky-mon ${glow(guide?.special === 'sticky')}`} onClick={() => { sfx('U1'); pin(4) }}>
              CCTV clock still 20 min fast, fix it. — R
            </button>
          </div>

          {wins.map((w) => {
            const [ww, wh] = SIZE[w.id] ?? [520, 420]
            return (
              <section key={w.id} className="nc-win" style={{ left: w.x, top: w.y, zIndex: w.z, width: ww, height: wh }} onPointerDown={() => focus(w.id)} aria-label={APP_INFO[w.id].name}>
                <header className="nc-title" onPointerDown={(e) => drag(w.id, e)}>
                  <span>{APP_INFO[w.id].icon} {APP_INFO[w.id].name}</span>
                  <button className="nc-x" onClick={() => close(w.id)} aria-label={`Close ${APP_INFO[w.id].name}`}>✕</button>
                </header>
                <div className="nc-win-body">{body(w.id)}</div>
              </section>
            )
          })}

          {accuseOpen && <Accuse onClose={() => setAccuseOpen(false)} />}

          {menu && (
            <div className="nc-menu" role="menu">
              {ORDER.map((id) => (
                <button key={id} role="menuitem" className={`${APP_UNLOCK[id] > s.chapter ? 'is-locked' : ''} ${glow(guide?.app === id)}`} onClick={() => open(id)}>
                  {APP_UNLOCK[id] > s.chapter ? '🔒' : APP_INFO[id].icon} {APP_INFO[id].name}
                </button>
              ))}
              <hr />
              <button role="menuitem" onClick={() => { setMenu(false); setHintOn(true) }}>💡 Show me what to do</button>
              <button role="menuitem" onClick={onQuit}>⏻ Save &amp; quit</button>
            </div>
          )}

          <footer className="nc-taskbar">
            <button className={`nc-start ${menu ? 'is-on' : ''} ${glow(!!guide?.app && !openIds.includes(guide.app) && wins.length > 0 && !menu)}`} onClick={() => { sfx('U1'); setMenu(!menu) }} aria-expanded={menu}>▤ Desk</button>
            <div className="nc-tasks">
              {wins.map((w) => (
                <button key={w.id} className="nc-task" onClick={() => focus(w.id)}>{APP_INFO[w.id].icon} <span>{APP_INFO[w.id].name}</span></button>
              ))}
            </div>
            <div className="nc-tray">
              {saving && <span className="nc-floppy" title="Saved">💾</span>}
              <span title={`Chapter ${s.chapter}: ${CHAPTERS[s.chapter].title}`} className="nc-chapter">Ch.{s.chapter}</span>
              {!s.settings.guided && <button className="nc-trayicon" onClick={() => setHintOn(true)} aria-label="Hint">💡</button>}
              <button className="nc-trayicon" onClick={() => open('settings')} aria-label="Volume and settings">🔈</button>
              <span className="nc-clock">{fmtClock(clockOf(s))}</span>
            </div>
          </footer>
          {statusMsg && <div className="nc-status" aria-live="polite">{statusMsg}</div>}
          <div ref={nextRef} className="nc-next" aria-live="polite">
            {guide ? <><b>NEXT ▸</b> {guide.text}</> : <><b>GOAL ▸</b> {CHAPTERS[s.chapter].goal}</>}
            {!guide && <button className="nc-next-hint" onClick={() => setHintOn(true)}>💡 Hint</button>}
          </div>
          {!welcomed && (
            <div className="nc-event" role="dialog" aria-label="How to play">
              <div className="nc-event-box nc-welcome">
                <h2>You're the night clerk.</h2>
                <p>A guest vanished from <b>Room 9</b> last night. The police think he just left.</p>
                <p>Use this computer to find out what really happened.</p>
                <ul>
                  <li><b>Tap</b> an app to open it.</li>
                  <li><b>Tap</b> anything suspicious to save it as a clue.</li>
                  <li>Follow the <b>NEXT</b> bar at the top. Glowing things are what to tap.</li>
                </ul>
                <button className="nc-btn nc-big" autoFocus onClick={() => { sfx('U1'); dispatch({ type: 'FLAG', flag: 'welcomed' }) }}>Start my shift</button>
              </div>
            </div>
          )}
          <Events />
        </div>
        <div className="nc-bezel-label">SITARA · DESK 1</div>
      </div>
      <div className="nc-desk">
        <span className="nc-mug" aria-hidden>☕</span>
        <button className={`nc-deskbtn ${glow(guide?.special === 'keyboard' && !tray)}`} onClick={() => { sfx('U1'); setTray(!tray) }}>⌨ Look under the keyboard</button>
        <button className="nc-deskbtn" onClick={() => sfx('S1')} aria-label="Ring the desk bell">🛎</button>
        {tray && (
          <div className="nc-sticky nc-sticky-tray">
            email pw: <b>sitara14</b><br />(don't lose this again!!) — R
          </div>
        )}
      </div>
    </div>
    </Ctx.Provider>
  )
}
