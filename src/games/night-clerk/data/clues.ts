export type AppId =
  | 'register' | 'keycard' | 'cctv' | 'email' | 'voicemail'
  | 'maintenance' | 'staff' | 'messages' | 'notebook' | 'settings'

export interface Clue {
  id: number
  text: string
  app: AppId | 'desktop'
  chapter: number
  /** shown on the card under the quote */
  source: string
}

export const CLUES: Clue[] = [
  { id: 1, text: 'D. Sharma, Room 9, cash, 11:41pm', app: 'register', chapter: 1, source: 'Guest Register' },
  { id: 2, text: 'Room 9 opened 3:12am, MASTER-2', app: 'keycard', chapter: 1, source: 'Keycard Log' },
  { id: 3, text: 'Walkway cam 03:12, nobody there', app: 'cctv', chapter: 2, source: 'CCTV · Walkway' },
  { id: 4, text: 'Sticky note: "CCTV clock 20 min fast"', app: 'desktop', chapter: 2, source: 'Monitor sticky note' },
  { id: 5, text: 'Walkway cam 03:32, hooded figure, MGR key tag', app: 'cctv', chapter: 2, source: 'CCTV · Walkway (zoom)' },
  { id: 6, text: 'Bharat General Insurance pass on the dashboard', app: 'cctv', chapter: 3, source: 'CCTV · Lot (zoom)' },
  { id: 7, text: 'Adjuster A. Mehta visiting for the Room 14 claim', app: 'email', chapter: 3, source: 'Email · Trash' },
  { id: 8, text: 'Room 14: no cleanup needed. Keep locked', app: 'maintenance', chapter: 3, source: 'Maintenance Log' },
  { id: 9, text: 'Room 9 bed made wrong, not my work', app: 'staff', chapter: 4, source: 'Staff Notes' },
  { id: 10, text: 'Thanks for staying till 4, bhaiya', app: 'voicemail', chapter: 4, source: 'Voicemail' },
  { id: 11, text: 'Room 12 opened 3:20am', app: 'keycard', chapter: 4, source: 'Keycard Log' },
  { id: 12, text: 'I saw Raju with a bag', app: 'messages', chapter: 4, source: 'Messages · Mrs. Iyer' },
]

export type DeductionId = 'A' | 'B' | 'C' | 'D'
export type Slot = 'Opportunity' | 'Motive' | 'Lie' | 'Optional'

export interface Deduction {
  id: DeductionId
  title: string
  cards: number[]
  result: string
  slot: Slot
}

export const DEDUCTIONS: Deduction[] = [
  { id: 'A', title: 'The ghost explained', cards: [3, 4, 5], result: 'Someone with a manager\'s key was at Room 9 at 3:12', slot: 'Opportunity' },
  { id: 'B', title: 'The fake fire', cards: [6, 7, 8], result: 'Room 14 was never burned, and an adjuster came to prove it', slot: 'Motive' },
  { id: 'C', title: 'Mrs. Iyer\'s secret', cards: [11, 12], result: 'Raju was up at 3:20 with the guest\'s bag', slot: 'Lie' },
  { id: 'D', title: 'Sunil was set up', cards: [2, 9, 10], result: 'Sunil\'s card was used, but Sunil wasn\'t there', slot: 'Optional' },
]

export const clueById = (id: number) => CLUES.find((c) => c.id === id)!

export interface Chapter {
  n: number
  title: string
  start: number // minutes after midnight, 22:58 = -62
  end: number
  goal: string
}

/** Clock minutes are relative to midnight (negative = before midnight). */
export const CHAPTERS: Chapter[] = [
  { n: 0, title: 'Cold open', start: -62, end: -60, goal: 'Read Raju\'s handover note in Staff Notes.' },
  { n: 1, title: 'Handover', start: -60, end: 60, goal: 'Find out what happened to the guest in Room 9.' },
  { n: 2, title: 'The ghost', start: 60, end: 195, goal: 'Explain the 3:12 door that the camera doesn\'t show.' },
  { n: 3, title: 'The claim', start: 195, end: 270, goal: 'Find out why anyone would want the guest gone.' },
  { n: 4, title: 'The witness', start: 270, end: 360, goal: 'Get the witness to talk, then file your report.' },
  { n: 5, title: 'Room 14', start: 360, end: 400, goal: 'Room 14.' },
]

export const APP_UNLOCK: Record<AppId, number> = {
  staff: 0, messages: 0, notebook: 0, settings: 0,
  register: 1, keycard: 1,
  cctv: 2, voicemail: 2,
  email: 3, maintenance: 3,
}

export const APP_INFO: Record<AppId, { name: string; icon: string }> = {
  register: { name: 'Guest Register', icon: '📒' },
  keycard: { name: 'Keycard Log', icon: '🔑' },
  cctv: { name: 'CCTV Viewer', icon: '📹' },
  email: { name: 'Email', icon: '✉' },
  voicemail: { name: 'Voicemail', icon: '☎' },
  maintenance: { name: 'Maintenance Log', icon: '🔧' },
  staff: { name: 'Staff Notes', icon: '📝' },
  messages: { name: 'Messages', icon: '📟' },
  notebook: { name: 'Notebook', icon: '📌' },
  settings: { name: 'Settings', icon: '⚙' },
}

export function fmtClock(min: number) {
  let m = ((min % 1440) + 1440) % 1440
  const h24 = Math.floor(m / 60)
  m = m % 60
  const ap = h24 >= 12 ? 'PM' : 'AM'
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}
