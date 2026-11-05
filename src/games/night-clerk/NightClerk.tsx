import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { clueById } from './data/clues.ts'
import type { AppId } from './data/clues.ts'
import { eraseSave, hasFinished, loadSave, loadSettings, newGame, persist, reducer } from './state.ts'
import type { GameState } from './state.ts'
import { audio } from './sound.ts'
import { Ctx } from './ui/ctx.ts'
import type { GameCtx } from './ui/ctx.ts'
import Desktop from './ui/Desktop.tsx'
import type { DesktopApi } from './ui/Desktop.tsx'
import { Epilogue, Intro, Title, Walk } from './ui/Screens.tsx'
import './nightclerk.css'

function init(): GameState {
  return { ...newGame(loadSettings(), hasFinished()), screen: 'title' }
}

export default function NightClerk() {
  const [s, dispatch] = useReducer(reducer, undefined, init)
  const [statusMsg, setStatusMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [accuseOpen, setAccuseOpen] = useState(false)
  const [hasSave, setHasSave] = useState(() => !!loadSave())
  const desk = useRef<DesktopApi | null>(null)
  const statusT = useRef<number | undefined>(undefined)

  // autosave + floppy icon whenever progress changes
  const progressKey = `${s.screen}|${s.chapter}|${s.clues.length}|${s.deductions.length}|${s.flags.length}|${s.emailUnlocked}|${s.finished}`
  useEffect(() => {
    if (s.screen === 'title') return
    persist(s)
    setSaving(true)
    const t = setTimeout(() => setSaving(false), 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressKey])
  useEffect(() => { persist({ ...s, screen: 'title' }) /* settings only */ }, [s.settings]) // eslint-disable-line react-hooks/exhaustive-deps

  // audio volumes
  useEffect(() => { audio.setVolumes({ music: s.settings.music, sfx: s.settings.sfx, amb: s.settings.amb }) }, [s.settings.music, s.settings.sfx, s.settings.amb])

  // browsers only allow sound after a user gesture
  useEffect(() => {
    const unlock = () => audio.unlock()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); audio.stopAll() }
  }, [])

  // music + ambience follow the story
  const rain = s.chapter >= 3 || s.events.includes('beam')
  useEffect(() => {
    const sync = () => {
      const scr = s.screen
      let m: string | null = 'M1'
      if (scr === 'desktop') m = accuseOpen ? 'M7' : s.chapter <= 1 ? 'M2' : s.chapter === 2 ? (s.events.includes('beam') ? 'M3' : 'M2') : s.chapter === 3 ? 'M3' : 'M4'
      if (scr === 'walk') m = 'M5'
      if (scr === 'epilogue') m = 'M6'
      audio.music(m)
      const amb = scr === 'desktop' || scr === 'walk'
      for (const [id, on] of [['A1', amb], ['A2', scr === 'desktop'], ['A3', amb], ['A4', scr === 'desktop' && (s.chapter === 3 || s.chapter === 4)], ['A5', amb && rain]] as const) {
        if (on) audio.startLoop(id)
        else audio.stopLoop(id)
      }
    }
    sync()
    // retry once audio is unlocked by the first click
    window.addEventListener('pointerdown', sync, { once: true })
    return () => window.removeEventListener('pointerdown', sync)
  }, [s.screen, s.chapter, accuseOpen, rain, s.events])

  const status = useCallback((msg: string) => {
    setStatusMsg(msg)
    window.clearTimeout(statusT.current)
    statusT.current = window.setTimeout(() => setStatusMsg(''), 5000)
  }, [])
  const sfx = useCallback((id: string) => audio.play(id), [])

  const pin = useCallback((id: number) => {
    const c = clueById(id)
    if (s.clues.includes(id)) return status('Already pinned to your Notebook.')
    if (c.chapter > s.chapter) return status('Hm. That might matter later.')
    sfx('U6')
    setTimeout(() => sfx('U4'), 250)
    dispatch({ type: 'PIN', clue: id })
    status(`📌 Pinned to Notebook: “${c.text}”`)
  }, [s.clues, s.chapter, sfx, status])

  const ctx: GameCtx = useMemo(() => ({
    s, dispatch, pin, status, sfx,
    open: (app: AppId) => desk.current?.open(app),
  }), [s, pin, status, sfx])

  const register = useCallback((api: DesktopApi) => { desk.current = api }, [])

  useEffect(() => { if (s.screen !== 'desktop') setAccuseOpen(false) }, [s.screen])

  const quit = () => { persist(s); setHasSave(true); setAccuseOpen(false); dispatch({ type: 'SCREEN', screen: 'title' }) }

  let view
  switch (s.screen) {
    case 'title':
      view = (
        <Title
          hasSave={hasSave}
          onContinue={() => { const save = loadSave(); if (save) dispatch({ type: 'LOAD', state: { ...save, screen: save.screen === 'intro' ? 'intro' : save.screen } }) }}
          onNew={() => { eraseSave(); setHasSave(false); dispatch({ type: 'NEW_GAME' }) }}
        />
      )
      break
    case 'intro': view = <Intro onEnd={() => dispatch({ type: 'SCREEN', screen: 'desktop' })} />; break
    case 'desktop':
      view = <Desktop onQuit={quit} register={register} statusMsg={statusMsg} saving={saving} accuseOpen={accuseOpen} setAccuseOpen={setAccuseOpen} />
      break
    case 'walk': view = <Walk onEnd={() => dispatch({ type: 'SCREEN', screen: 'epilogue' })} />; break
    case 'epilogue':
      view = <Epilogue onFinish={() => { persist({ ...s, finished: true, screen: 'title' }); dispatch({ type: 'FINISH' }); eraseSave(); setHasSave(false) }} />
      break
  }

  return (
    <Ctx.Provider value={ctx}>
      <div className={`nc-root ${s.settings.largeText ? 'is-large' : ''} ${s.settings.crt ? '' : 'no-fx'}`}>{view}</div>
    </Ctx.Provider>
  )
}
