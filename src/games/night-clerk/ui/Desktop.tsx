import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { APP_INFO, APP_UNLOCK, CHAPTERS, fmtClock } from '../data/clues.ts'
import type { AppId } from '../data/clues.ts'
import { clockOf, hintFor } from '../state.ts'
import { useGame } from './ctx.ts'
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
  const { s, sfx, status, pin } = useGame()
  const [wins, setWins] = useState<Win[]>([])
  const [menu, setMenu] = useState(false)
  const [tray, setTray] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [flick, setFlick] = useState(false)
  const zTop = useRef(10)
  const screenRef = useRef<HTMLDivElement>(null)

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

  // gentle hint after 5 quiet minutes
  useEffect(() => {
    setHint(null)
    if (!s.settings.hints) return
    const t = setTimeout(() => setHint(hintFor(s)), 5 * 60 * 1000)
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

  const unreadTotal = s.unread.ray + s.unread.edna + s.unread.luis
  const lampFlicker = s.activeEvent === 'bell' || s.activeEvent === 'beam' || s.activeEvent === 'reboot'

  return (
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
                  <button key={id} className={`nc-icon ${locked ? 'is-locked' : ''}`} onDoubleClick={() => open(id)} onClick={() => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760 ? open(id) : undefined} onKeyDown={(e) => e.key === 'Enter' && open(id)}>
                    <span className="nc-icon-img">{locked ? '🔒' : APP_INFO[id].icon}</span>
                    <span>{APP_INFO[id].name}{id === 'messages' && unreadTotal > 0 ? ` (${unreadTotal})` : ''}</span>
                  </button>
                )
              })}
            </div>
            <button className="nc-sticky nc-sticky-mon" onClick={() => { sfx('U1'); pin(4) }}>
              CCTV clock still 20 min fast, fix it. — R
            </button>
            {hint && (
              <button className="nc-sticky nc-sticky-hint" onClick={() => setHint(null)} aria-live="polite">
                {hint}<small> (click to dismiss)</small>
              </button>
            )}
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
                <button key={id} role="menuitem" className={APP_UNLOCK[id] > s.chapter ? 'is-locked' : ''} onClick={() => open(id)}>
                  {APP_UNLOCK[id] > s.chapter ? '🔒' : APP_INFO[id].icon} {APP_INFO[id].name}
                </button>
              ))}
              <hr />
              <button role="menuitem" onClick={() => { setMenu(false); setHint(hintFor(s) ?? 'You have what you need. Check the Notebook.') }}>💡 I'm stuck</button>
              <button role="menuitem" onClick={onQuit}>⏻ Save &amp; quit</button>
            </div>
          )}

          <footer className="nc-taskbar">
            <button className={`nc-start ${menu ? 'is-on' : ''}`} onClick={() => { sfx('U1'); setMenu(!menu) }} aria-expanded={menu}>▤ Desk</button>
            <div className="nc-tasks">
              {wins.map((w) => (
                <button key={w.id} className="nc-task" onClick={() => focus(w.id)}>{APP_INFO[w.id].icon} <span>{APP_INFO[w.id].name}</span></button>
              ))}
            </div>
            <div className="nc-tray">
              {saving && <span className="nc-floppy" title="Saved">💾</span>}
              <span title={`Chapter ${s.chapter}: ${CHAPTERS[s.chapter].title}`} className="nc-chapter">Ch.{s.chapter}</span>
              <button className="nc-trayicon" onClick={() => open('settings')} aria-label="Volume and settings">🔈</button>
              <span className="nc-clock">{fmtClock(clockOf(s))}</span>
            </div>
          </footer>
          <div className="nc-status" aria-live="polite">{statusMsg || CHAPTERS[s.chapter].goal}</div>
          <Events />
        </div>
        <div className="nc-bezel-label">PINECREST · DESK 1</div>
      </div>
      <div className="nc-desk">
        <span className="nc-mug" aria-hidden>☕</span>
        <button className="nc-deskbtn" onClick={() => { sfx('U1'); setTray(!tray) }}>⌨ Look under the keyboard</button>
        <button className="nc-deskbtn" onClick={() => sfx('S1')} aria-label="Ring the desk bell">🛎</button>
        {tray && (
          <div className="nc-sticky nc-sticky-tray">
            email pw: <b>pinecrest14</b><br />(don't lose this again!!) — R
          </div>
        )}
      </div>
    </div>
  )
}
