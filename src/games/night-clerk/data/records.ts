/* All the in-world documents the desk computer holds. A `clue` field marks the
   line that becomes a clue card when clicked. */

export interface RegisterRow { date: string; time: string; name: string; room: number; nights: number; pay: string; plate: string; clue?: number }

export const REGISTER: RegisterRow[] = [
  { date: '10/12/98', time: '6:10pm', name: 'T. Bellamy', room: 3, nights: 1, pay: 'VISA', plate: 'KRT-404' },
  { date: '10/13/98', time: '8:42pm', name: 'Sunrise Haulage', room: 7, nights: 2, pay: 'VISA', plate: 'TRK-118' },
  { date: '10/14/98', time: '5:55pm', name: 'M. Cruz', room: 5, nights: 1, pay: 'MC', plate: 'BNE-772' },
  { date: '10/14/98', time: '11:41pm', name: 'D. Price', room: 9, nights: 1, pay: 'CASH', plate: '(none)', clue: 1 },
  { date: '02/11/98', time: '—', name: 'E. Kowal (lives here)', room: 12, nights: 240, pay: 'MONTHLY', plate: 'BKT-311' },
]

export interface KeyRow { date: string; time: string; room: string; card: string; note: string; clue?: number }

export const KEYCARD: KeyRow[] = [
  ['10/14', '11:48pm', '9', 'G-9A', 'guest'],
  ['10/15', '12:58am', 'OFFICE', 'MASTER-1', 'desk closed'],
  ['10/15', '3:12am', '9', 'MASTER-2', 'staff'],
  ['10/15', '3:20am', '12', 'G-12A', 'guest'],
  ['10/15', '3:47am', 'APT', 'MASTER-1', 'staff'],
  ['10/15', '7:10am', '9', 'MASTER-2', 'cleaning'],
].map(([date, time, room, card, note]) => {
  const row: KeyRow = { date, time, room, card, note }
  if (date === '10/15' && time === '3:12am') row.clue = 2
  if (date === '10/15' && time === '3:20am') row.clue = 11
  return row
})

export const CARD_OWNERS = 'MASTER-1 = Ray (manager) · MASTER-2 = Luis (cleaner) · G = guest card'

export interface Email { id: string; from: string; subject: string; date: string; body: string[]; clueLine?: number; folder: 'inbox' | 'trash' }

export const EMAILS: Email[] = [
  { id: 'e3', folder: 'inbox', from: 'K. Doyle', subject: 're: the money', date: 'Oct 9', body: ['The bank called again. When does the money come?'] },
  { id: 'e4', folder: 'inbox', from: 'Halvorsen Mutual', subject: 'Room 14 fire claim', date: 'Sep 30', body: ['Your $80,000 claim for the Room 14 fire is under review.'] },
  { id: 'e6', folder: 'trash', from: 'Halvorsen Mutual', subject: 'Inspector visit', date: 'Oct 13', clueLine: 0, body: ['Adjuster O. Marsh will visit without warning to inspect Room 14.', 'Do not repair the room.'] },
]
export const EMAIL_PASSWORD = 'pinecrest14'

export interface Voicemail { id: number; from: string; when: string; lines: string[]; clueLine?: number; kind: 'voice' | 'breath' | 'static' | 'robot' }

export const VOICEMAILS: Voicemail[] = [
  { id: 2, from: 'Edna (Room 12)', when: 'Oct 14, 9pm', kind: 'voice', lines: ['"Ray, somebody parked in my spot. Again."'] },
  { id: 3, from: 'Unknown', when: 'Oct 15, 2:50am', kind: 'breath', lines: ['[breathing... a door creaks... click]'] },
  { id: 4, from: 'Marisol (Luis\'s sister)', when: 'Oct 15, 8:30am', kind: 'voice', clueLine: 0, lines: ['"Thanks for staying at my party till 4am, little brother!"'] },
]

export interface LogLine { date: string; text: string; clue?: number }

export const MAINTENANCE: LogLine[] = [
  { date: '07/23', text: 'Rm 14 "fire". Ray put it out himself. No smoke smell??' },
  { date: '07/24', text: 'Rm 14: no cleanup needed, Ray says keep it locked.', clue: 8 },
  { date: '08/19', text: 'Laundry door left unlocked. Lock is broken.' },
  { date: '09/16', text: 'CCTV clock running fast. Told Ray.' },
]

export const STAFF_NOTES: { author: string; when: string; lines: { text: string; clue?: number; handover?: boolean }[] }[] = [
  {
    author: 'RAY', when: 'tonight',
    lines: [
      { text: 'Desk is yours till 7am.', handover: true },
      { text: 'Room 9 guest skipped out last night. Cops already came. Nothing to worry about.' },
      { text: 'Room 14 is OFF LIMITS. — Ray' },
    ],
  },
  {
    author: 'LUIS', when: 'this morning',
    lines: [{ text: 'Room 9 bed made wrong, not my work.', clue: 9 }],
  },
]
