import type { AppId, DeductionId } from './data/clues.ts'
import { DEDUCTIONS } from './data/clues.ts'
import type { CamId } from './render/scenes.ts'
import type { GameState } from './state.ts'

/** The next concrete step for the player, plus what to highlight on screen. */
export interface Guide {
  text: string
  app?: AppId
  clue?: number
  cards?: number[]
  special?: 'sticky' | 'keyboard' | 'connect' | 'accuse' | 'chat'
  cctv?: { cam: CamId; min: number; max: number; zoom?: boolean }
}

export function guideFor(s: GameState, open: AppId[]): Guide {
  const has = (n: number) => s.clues.includes(n)
  const isOpen = (a: AppId) => open.includes(a)
  const inApp = (app: AppId, outside: string, inside: string, extra: Omit<Guide, 'text' | 'app'> = {}): Guide =>
    isOpen(app) ? { text: inside, ...extra } : { text: outside, app }

  const connect = (id: DeductionId, why: string): Guide => {
    const d = DEDUCTIONS.find((x) => x.id === id)!
    return isOpen('notebook')
      ? { text: `Tap clues ${d.cards.map((c) => '#' + c).join(', ')}, then press Connect.`, cards: d.cards, special: 'connect' }
      : { text: `${why} Open the Notebook to connect them.`, app: 'notebook' }
  }

  switch (s.chapter) {
    case 0:
      return { text: 'Raju left you a note. Open Staff Notes.', app: 'staff' }
    case 1:
      if (!has(1)) return inApp('register', 'Who was the missing guest? Open the Guest Register.', 'Tap the Room 9 guest to pin him as a clue.', { clue: 1 })
      if (!has(2)) return inApp('keycard', 'Did anyone go into Room 9 last night? Open the Keycard Log.', 'Tap the Room 9 entry in the middle of the night.', { clue: 2 })
      break
    case 2:
      if (!has(3)) return inApp('cctv', 'Room 9 opened at 3:12. Check the cameras. Open CCTV Viewer.', 'Go to the Walkway camera at 03:12 and pin that frame.', { cctv: { cam: 'walkway', min: 192, max: 192 } })
      if (!has(4)) return { text: 'Nobody on camera? Read the yellow note on the screen.', special: 'sticky' }
      if (!has(5)) return inApp('cctv', 'The camera is 20 minutes fast. Open CCTV Viewer again.', 'So real 3:12 shows as 03:32. Go there, turn on Zoom and tap the person.', { cctv: { cam: 'walkway', min: 212, max: 212, zoom: true } })
      if (!s.deductions.includes('A')) return connect('A', 'Those three camera clues fit together.')
      break
    case 3:
      if (!has(6)) return inApp('cctv', 'Who was the guest really? Look at his car. Open CCTV Viewer.', 'Lot camera: zoom in on the car parked in the middle.', { cctv: { cam: 'lot', min: -10, max: 999, zoom: true } })
      if (!has(7)) {
        if (!s.emailUnlocked && !isOpen('email')) return { text: 'Raju\'s email might explain it. Find his password under the keyboard, then open Email.', special: 'keyboard', app: 'email' }
        return inApp('email', 'Open Email.', s.emailUnlocked ? 'Check the Trash and tap the deleted email\'s first line.' : 'Type the password from under the keyboard.', { clue: 7, special: s.emailUnlocked ? undefined : 'keyboard' })
      }
      if (!has(8)) return inApp('maintenance', 'Was there really a fire? Open the Maintenance Log.', 'Tap the line about cleaning Room 14.', { clue: 8 })
      if (!s.deductions.includes('B')) return connect('B', 'Those three clues explain why.')
      break
    case 4:
      if (!has(11)) return inApp('keycard', 'Who else was awake at 3:20? Open the Keycard Log.', 'Tap the 3:20am entry.', { clue: 11 })
      if (!has(12)) return inApp('messages', 'Mrs. Iyer\'s door opened at 3:20. Ask her about it in Messages.', 'Pick Mrs. Iyer and ask about her door. Then tap what she saw.', { clue: 12, special: 'chat' })
      if (!s.deductions.includes('C')) return connect('C', 'Mrs. Iyer saw something.')
      return isOpen('notebook')
        ? { text: 'Press Accuse. Pick Raju and attach A, B and C.', special: 'accuse' }
        : { text: 'You can prove it now. Open the Notebook and press Accuse.', app: 'notebook' }
  }
  return { text: 'Check the Notebook.' }
}
