/* All the in-world documents the desk computer holds. A `clue` field marks the
   line that becomes a clue card when clicked. */

export interface RegisterRow { date: string; time: string; name: string; room: number; nights: number; pay: string; plate: string; clue?: number }

export const REGISTER: RegisterRow[] = [
  { date: '10/12/98', time: '6:10pm', name: 'T. Banerjee', room: 3, nights: 1, pay: 'CASH', plate: 'WB-02 4404' },
  { date: '10/13/98', time: '8:42pm', name: 'Patil Transport', room: 7, nights: 2, pay: 'VISA', plate: 'MH-12 T 118' },
  { date: '10/14/98', time: '5:55pm', name: 'M. D\'Souza', room: 5, nights: 1, pay: 'CHEQUE', plate: 'GA-01 772' },
  { date: '10/14/98', time: '11:41pm', name: 'D. Sharma', room: 9, nights: 1, pay: 'CASH', plate: '(none)', clue: 1 },
  { date: '02/11/98', time: '—', name: 'K. Iyer (lives here)', room: 12, nights: 240, pay: 'MONTHLY', plate: '—' },
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

export const CARD_OWNERS = 'MASTER-1 = Raju (manager) · MASTER-2 = Sunil (room boy) · G = guest card'

export interface Email { id: string; from: string; subject: string; date: string; body: string[]; clueLine?: number; folder: 'inbox' | 'trash' }

export const EMAILS: Email[] = [
  { id: 'e3', folder: 'inbox', from: 'K. Doshi', subject: 're: the money', date: 'Oct 9', body: ['The bank called again. When does the money come?'] },
  { id: 'e4', folder: 'inbox', from: 'Bharat General Insurance', subject: 'Room 14 fire claim', date: 'Sep 30', body: ['Your ₹8 lakh claim for the Room 14 fire is under review.'] },
  { id: 'e6', folder: 'trash', from: 'Bharat General Insurance', subject: 'Inspector visit', date: 'Oct 13', clueLine: 0, body: ['Adjuster A. Mehta will visit without warning to inspect Room 14.', 'Do not repair the room.'] },
]
export const EMAIL_PASSWORD = 'sitara14'

export interface Voicemail { id: number; from: string; when: string; lines: string[]; clueLine?: number; kind: 'voice' | 'breath' | 'static' | 'robot' }

export const VOICEMAILS: Voicemail[] = [
  { id: 2, from: 'Mrs. Iyer (Room 12)', when: 'Oct 14, 9pm', kind: 'voice', lines: ['"Raju, the geyser in my room is broken. Again."'] },
  { id: 3, from: 'Unknown', when: 'Oct 15, 2:50am', kind: 'breath', lines: ['[breathing... a door creaks... click]'] },
  { id: 4, from: 'Pooja (Sunil\'s sister)', when: 'Oct 15, 8:30am', kind: 'voice', clueLine: 0, lines: ['"Thanks for staying at my party till 4am, bhaiya!"'] },
]

export interface LogLine { date: string; text: string; clue?: number }

export const MAINTENANCE: LogLine[] = [
  { date: '07/23', text: 'Rm 14 "fire". Raju put it out himself. No smoke smell??' },
  { date: '07/24', text: 'Rm 14: no cleanup needed, Raju says keep it locked.', clue: 8 },
  { date: '08/19', text: 'Store room left unlocked. Lock is broken.' },
  { date: '09/16', text: 'CCTV clock running fast. Told Raju.' },
]

export const STAFF_NOTES: { author: string; when: string; lines: { text: string; clue?: number; handover?: boolean }[] }[] = [
  {
    author: 'RAJU', when: 'tonight',
    lines: [
      { text: 'Desk is yours till 7am.', handover: true },
      { text: 'Room 9 guest skipped out last night. Police already came. Nothing to worry about.' },
      { text: 'Room 14 is OFF LIMITS. — Raju' },
    ],
  },
  {
    author: 'SUNIL', when: 'this morning',
    lines: [{ text: 'Room 9 bed made wrong, not my work.', clue: 9 }],
  },
]
