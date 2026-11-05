import { CHAPTERS, DEDUCTIONS } from './data/clues.ts'
import type { DeductionId } from './data/clues.ts'
import { loadJSON, saveJSON, removeKey } from '../../shared/storage.ts'

export type Contact = 'ray' | 'edna' | 'luis'
export interface ChatLine { from: 'them' | 'you' | 'sys'; text: string; time: string; clue?: number }
export type EventId = 'bell' | 'phone' | 'beam' | 'ray4am' | 'reboot'
export type Screen = 'title' | 'intro' | 'desktop' | 'walk' | 'epilogue'

export interface Settings {
  music: number; sfx: number; amb: number
  crt: boolean; largeText: boolean; hints: boolean; softScares: boolean
}

export interface GameState {
  v: 1
  screen: Screen
  chapter: number
  clues: number[]
  deductions: DeductionId[]
  pinsInChapter: number
  clockFloor: number
  handoverRead: boolean
  emailUnlocked: boolean
  flags: string[]
  chat: Record<Contact, ChatLine[]>
  unread: Record<Contact, number>
  events: string[]
  activeEvent: EventId | null
  accuseTries: number
  finished: boolean
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  music: 0.5, sfx: 0.8, amb: 0.6, crt: true, largeText: false, hints: true, softScares: false,
}

export function newGame(settings: Settings = DEFAULT_SETTINGS, finished = false): GameState {
  return {
    v: 1, screen: 'intro', chapter: 0, clues: [], deductions: [], pinsInChapter: 0,
    clockFloor: -62, handoverRead: false, emailUnlocked: false, flags: [],
    chat: { ray: [], edna: [], luis: [] }, unread: { ray: 0, edna: 0, luis: 0 },
    events: [], activeEvent: null, accuseTries: 0, finished, settings,
  }
}

const SAVE_KEY = 'night-clerk:save'
const SETTINGS_KEY = 'night-clerk:settings'
const FINISHED_KEY = 'night-clerk:finished'

export function loadSave(): GameState | null {
  const s = loadJSON<GameState>(SAVE_KEY)
  return s && s.v === 1 ? s : null
}
export function persist(s: GameState) {
  // the title/intro screens are not "progress"; everything else autosaves
  if (s.screen !== 'title') saveJSON(SAVE_KEY, { ...s, activeEvent: null })
  saveJSON(SETTINGS_KEY, s.settings)
  if (s.finished) saveJSON(FINISHED_KEY, true)
}
export function eraseSave() { removeKey(SAVE_KEY) }
export function loadSettings(): Settings { return { ...DEFAULT_SETTINGS, ...(loadJSON<Settings>(SETTINGS_KEY) ?? {}) } }
export function hasFinished() { return !!loadJSON<boolean>(FINISHED_KEY) }

export function clockOf(s: GameState) {
  const ch = CHAPTERS[s.chapter]
  const t = Math.min(ch.start + s.pinsInChapter * 12, ch.end - 5)
  return Math.max(t, s.clockFloor, ch.start)
}

/* ------------------------------ actions ------------------------------ */

export type Action =
  | { type: 'NEW_GAME' }
  | { type: 'LOAD'; state: GameState }
  | { type: 'SCREEN'; screen: Screen }
  | { type: 'READ_HANDOVER' }
  | { type: 'PIN'; clue: number }
  | { type: 'DEDUCE'; id: DeductionId }
  | { type: 'CHOOSE'; contact: Contact; choice: string }
  | { type: 'READ_CHAT'; contact: Contact }
  | { type: 'UNLOCK_EMAIL' }
  | { type: 'EVENT_DONE' }
  | { type: 'ACCUSE'; ok: boolean }
  | { type: 'FINISH' }
  | { type: 'SETTINGS'; patch: Partial<Settings> }

const has = (s: GameState, f: string) => s.flags.includes(f)
const T = (s: GameState) => {
  // formatted shift-clock string for chat timestamps
  const m = ((clockOf(s) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60), mm = m % 60
  return `${h % 12 || 12}:${String(mm).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`
}

function say(s: GameState, c: Contact, lines: Omit<ChatLine, 'time'>[], time?: string): GameState {
  const t = time ?? T(s)
  const added = lines.map((l) => ({ ...l, time: t }))
  const fromThem = added.filter((l) => l.from === 'them').length
  return {
    ...s,
    chat: { ...s.chat, [c]: [...s.chat[c], ...added] },
    unread: { ...s.unread, [c]: s.unread[c] + fromThem },
  }
}
const flag = (s: GameState, f: string): GameState => (has(s, f) ? s : { ...s, flags: [...s.flags, f] })

/** Chat choices the player can currently pick, per contact. */
export function choicesFor(s: GameState, c: Contact): { id: string; text: string }[] {
  if (c === 'ray') {
    if (s.chapter >= 1 && !has(s, 'ray1'))
      return [{ id: 'good', text: 'All good.' }, { id: 'asked', text: 'Someone asked about Room 9.' }]
    return []
  }
  if (s.chapter < 4) return []
  if (c === 'edna') {
    if (has(s, 'edna_talked')) return []
    if (has(s, 'edna_hurt')) return [{ id: 'please', text: 'Nobody\'s blaming you. What did you see?' }]
    if (has(s, 'edna_door'))
      return [{ id: 'lock', text: 'The lock did. What did you see?' }, { id: 'hurt', text: 'Did you hurt that man?' }]
    const o: { id: string; text: string }[] = []
    if (!has(s, 'edna_tell')) o.push({ id: 'tell', text: 'I\'ll tell Ray.' })
    if (s.clues.includes(11)) o.push({ id: 'door', text: 'Your door opened at 3:20 last night.' })
    return o
  }
  if (c === 'luis') {
    if (!has(s, 'luis_card') && s.clues.includes(2))
      return [{ id: 'card', text: 'Your master card opened Room 9 at 3am.' }]
    return []
  }
  return []
}

function choose(s: GameState, c: Contact, id: string): GameState {
  const text = choicesFor(s, c).find((o) => o.id === id)?.text
  if (!text) return s
  s = say(s, c, [{ from: 'you', text }])
  switch (`${c}:${id}`) {
    case 'ray:good': return flag(say(s, c, [{ from: 'them', text: 'good.' }]), 'ray1')
    case 'ray:asked': return flag(say(s, c, [{ from: 'them', text: 'nobody asked about room 9. go to sleep on the desk if you want, just don\'t touch 14.' }]), 'ray1')
    case 'edna:tell': return flag(say(s, c, [{ from: 'them', text: 'Don\'t bother.' }, { from: 'sys', text: 'Edna has gone quiet.' }]), 'edna_tell')
    case 'edna:door': return flag(say(s, c, [{ from: 'them', text: '...Who told you that.' }]), 'edna_door')
    case 'edna:hurt': return flag(say(s, c, [{ from: 'them', text: 'Hurt him? I\'m seventy-one.' }]), 'edna_hurt')
    case 'edna:lock':
    case 'edna:please':
      return flag(say(s, c, [
        { from: 'them', text: 'I\'m two months behind on rent. He said he\'d throw me out on the road.' },
        { from: 'them', text: 'I saw Ray with a bag. A man\'s bag. Coming out of 9.', clue: 12 },
      ]), 'edna_talked')
    case 'luis:card':
      return flag(say(s, c, [
        { from: 'them', text: 'No way. I was at my sister\'s till 4.' },
        { from: 'them', text: 'Card stays on the hook in laundry. I don\'t lock it, ok? Don\'t tell Ray.' },
      ]), 'luis_card')
  }
  return s
}

function setChapter(s: GameState, n: number): GameState {
  return { ...s, chapter: n, pinsInChapter: 0, clockFloor: CHAPTERS[n].start }
}
function fire(s: GameState, e: EventId, floor: number): GameState {
  return { ...s, activeEvent: e, events: [...s.events, e], clockFloor: Math.max(s.clockFloor, floor) }
}
const fired = (s: GameState, e: string) => s.events.includes(e)

/** The "director": story beats and chapter changes that follow from the current state. */
function direct(s: GameState): GameState {
  if (s.screen !== 'desktop' || s.activeEvent) return s
  // chapter transitions
  if (s.chapter === 0 && s.handoverRead) {
    s = setChapter(s, 1)
    s = say(s, 'ray', [{ from: 'them', text: 'you good? don\'t touch the camera settings, they\'re fine' }], '11:02pm')
  }
  if (s.chapter === 1 && s.clues.includes(1) && s.clues.includes(2)) {
    s = setChapter(s, 2)
    if (!fired(s, 'bell')) return fire(s, 'bell', 60)
  }
  if (s.chapter === 2 && s.deductions.includes('A')) {
    s = setChapter(s, 3)
    s = say(s, 'ray', [
      { from: 'them', text: 'why are you in the camera files' },
      { from: 'sys', text: 'Ray is typing…' },
      { from: 'sys', text: 'Ray stopped typing.' },
    ], '3:20am')
  }
  if (s.chapter === 3 && s.deductions.includes('B')) {
    s = setChapter(s, 4)
    s = say(s, 'edna', [{ from: 'them', text: 'Is that the new night person? Ice machine is still broken.' }])
    s = say(s, 'luis', [{ from: 'them', text: 'hey, Ray said there\'s a new night person. welcome. don\'t eat the vending machine crackers.' }])
  }
  // in-chapter scares
  if (s.chapter === 2 && !fired(s, 'phone') && s.pinsInChapter >= 1) return fire(s, 'phone', 170)
  if (s.chapter === 2 && fired(s, 'phone') && !fired(s, 'beam') && s.pinsInChapter >= 2) return fire(s, 'beam', 192)
  if (s.chapter === 3 && !fired(s, 'ray4am') && s.pinsInChapter >= 1) {
    s = fire(s, 'ray4am', 240)
    return say(s, 'ray', [{ from: 'them', text: 'heading out for a bit. watch the desk.' }], '4:00am')
  }
  if (s.chapter === 4 && !fired(s, 'reboot') && s.clues.includes(11)) return fire(s, 'reboot', 315)
  return s
}

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'NEW_GAME': return newGame(s.settings, s.finished || hasFinished())
    case 'LOAD': return { ...a.state, settings: s.settings }
    case 'SCREEN': return direct({ ...s, screen: a.screen })
    case 'READ_HANDOVER': return s.handoverRead ? s : direct({ ...s, handoverRead: true })
    case 'PIN': {
      if (s.clues.includes(a.clue)) return s
      return direct({ ...s, clues: [...s.clues, a.clue], pinsInChapter: s.pinsInChapter + 1 })
    }
    case 'DEDUCE': {
      const d = DEDUCTIONS.find((x) => x.id === a.id)!
      if (s.deductions.includes(a.id) || !d.cards.every((c) => s.clues.includes(c))) return s
      return direct({ ...s, deductions: [...s.deductions, a.id], pinsInChapter: s.pinsInChapter + 1 })
    }
    case 'CHOOSE': return direct(choose(s, a.contact, a.choice))
    case 'READ_CHAT': return s.unread[a.contact] ? { ...s, unread: { ...s.unread, [a.contact]: 0 } } : s
    case 'UNLOCK_EMAIL': return { ...s, emailUnlocked: true }
    case 'EVENT_DONE': return direct({ ...s, activeEvent: null })
    case 'ACCUSE':
      if (!a.ok) return { ...s, accuseTries: s.accuseTries + 1 }
      return { ...setChapter(s, 5), screen: 'walk' }
    case 'FINISH': return { ...s, finished: true, screen: 'title' }
    case 'SETTINGS': return { ...s, settings: { ...s.settings, ...a.patch } }
  }
}

/* ------------------------------ hints ------------------------------ */

export function hintFor(s: GameState): string | null {
  const need = (id: number) => !s.clues.includes(id)
  const ded = (id: DeductionId) => !s.deductions.includes(id)
  switch (s.chapter) {
    case 0: return 'Open Staff Notes from the Desk menu. Ray left you something.'
    case 1:
      if (need(1)) return 'Guest Register: who checked into Room 9 last night? Click a line to pin it.'
      if (need(2)) return 'Keycard Log: somebody opened Room 9 in the middle of the night.'
      return null
    case 2:
      if (need(3)) return 'CCTV Viewer, Walkway camera: what does it show at 03:12?'
      if (need(4)) return 'That sticky note on the monitor. Click it.'
      if (need(5)) return 'CCTV Walkway, a bit later than 03:12. Try the zoom tool.'
      if (ded('A')) return 'Notebook: select your three camera clues and press Connect.'
      return null
    case 3:
      if (need(6)) return 'CCTV Lot camera. Zoom in on the guest\'s car.'
      if (need(7)) return 'Email. Ray\'s password is on a note under the keyboard. Check the Trash.'
      if (need(8)) return 'Maintenance Log, back in July. What did Luis write about Room 14?'
      if (ded('B')) return 'Notebook: connect the car pass, the email and the maintenance line.'
      return null
    case 4:
      if (need(11)) return 'Keycard Log again. Who else opened a door around 3:20?'
      if (need(12)) return 'Messages: talk to Edna. You know her door opened.'
      if (ded('C')) return 'Notebook: connect Edna\'s door and what she saw.'
      return 'Notebook: press Accuse and file your report.'
  }
  return null
}
