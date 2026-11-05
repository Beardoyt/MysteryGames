/* All the in-world documents the desk computer holds. A `clue` field marks the
   line that becomes a clue card when clicked. */

export interface RegisterRow { date: string; time: string; name: string; room: number; nights: number; pay: string; plate: string; clue?: number }

const names = [
  'T. Bellamy', 'R. & J. Okafor', 'Sunrise Haulage (driver)', 'M. Cruz', 'P. Lindqvist', 'K. Han', 'D. Whitcomb',
  'L. Ferreira', 'G. Sato', 'A. Novak', 'B. Mendez', 'W. Ashby', 'C. Duplessis', 'H. Grant', 'J. Abara',
  'S. Petrov', 'E. Moynihan', 'N. Clarke', 'Tri-County Survey Co.', 'F. Ibarra', 'V. Lund', 'O. Pike', 'Y. Kim',
  'R. Castellano', 'I. Brandt', 'M. Rourke', 'Q. Tran', 'U. Osei', 'D. Halloran', 'Z. Mercer', 'A. Delacroix',
  'J. Varga', 'T. Nwosu', 'S. Lark', 'P. Ruiz', 'B. Healy', 'K. Morrow', 'E. Ström', 'L. Quinn',
]
const rooms = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 15, 16]
function rand(seed: number) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280 }
const r = rand(1998)

export const REGISTER: RegisterRow[] = (() => {
  const rows: RegisterRow[] = []
  let ni = 0
  for (let day = 1; day <= 14; day++) {
    const count = day === 14 ? 2 : 2 + Math.floor(r() * 2)
    for (let i = 0; i < count && ni < names.length; i++) {
      const hh = 15 + Math.floor(r() * 7)
      const mm = Math.floor(r() * 60)
      rows.push({
        date: `10/${String(day).padStart(2, '0')}/98`,
        time: `${hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')}pm`,
        name: names[ni++],
        room: rooms[Math.floor(r() * rooms.length)],
        nights: 1 + Math.floor(r() * 2),
        pay: r() > 0.35 ? 'VISA' : r() > 0.5 ? 'MC' : 'CASH',
        plate: `${'ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(r() * 23)]}${'ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(r() * 23)]}${'ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(r() * 23)]}-${100 + Math.floor(r() * 899)}`,
      })
    }
  }
  rows.push({ date: '10/14/98', time: '11:41pm', name: 'D. Price', room: 9, nights: 1, pay: 'CASH', plate: '(not given)', clue: 1 })
  rows.push({ date: '02/11/98', time: '—', name: 'E. Kowal (long stay)', room: 12, nights: 240, pay: 'MONTHLY', plate: 'BKT-311' })
  return rows
})()

export interface KeyRow { date: string; time: string; room: string; card: string; note: string; clue?: number }

export const KEYCARD: KeyRow[] = [
  ['10/14', '6:02pm', '3', 'G-3A', 'guest'], ['10/14', '6:40pm', '7', 'G-7A', 'guest'], ['10/14', '7:15pm', 'LAUNDRY', '—', 'door unlocked, no read'],
  ['10/14', '7:51pm', '12', 'G-12A', 'guest'], ['10/14', '8:20pm', '5', 'G-5A', 'guest'], ['10/14', '8:22pm', '5', 'G-5B', 'guest'],
  ['10/14', '9:03pm', 'OFFICE', 'MASTER-1', 'staff'], ['10/14', '9:10pm', '3', 'G-3A', 'guest'], ['10/14', '9:44pm', '11', 'G-11A', 'guest'],
  ['10/14', '10:05pm', '12', 'G-12A', 'guest'], ['10/14', '10:30pm', 'ICE RM', '—', 'push door'], ['10/14', '10:52pm', '7', 'G-7A', 'guest'],
  ['10/14', '11:20pm', '11', 'G-11A', 'guest'], ['10/14', '11:48pm', '9', 'G-9A', 'guest'], ['10/14', '11:59pm', '12', 'G-12A', 'guest'],
  ['10/15', '12:02am', '9', 'G-9A', 'guest'], ['10/15', '12:31am', '5', 'G-5A', 'guest'], ['10/15', '12:58am', 'OFFICE', 'MASTER-1', 'staff · desk closed'],
  ['10/15', '1:04am', 'APT', 'MASTER-1', 'staff'], ['10/15', '1:26am', '3', 'G-3A', 'guest'], ['10/15', '2:15am', '11', 'G-11A', 'guest'],
  ['10/15', '3:12am', '9', 'MASTER-2', 'staff'], ['10/15', '3:20am', '12', 'G-12A', 'guest'], ['10/15', '3:47am', 'APT', 'MASTER-1', 'staff'],
  ['10/15', '5:02am', 'LAUNDRY', '—', 'door unlocked, no read'], ['10/15', '5:30am', '7', 'G-7A', 'guest · checkout'], ['10/15', '5:58am', '3', 'G-3A', 'guest · checkout'],
  ['10/15', '6:20am', '1', 'MASTER-2', 'staff · clean'], ['10/15', '6:41am', '2', 'MASTER-2', 'staff · clean'], ['10/15', '7:10am', '9', 'MASTER-2', 'staff · clean'],
  ['10/15', '7:42am', '5', 'MASTER-2', 'staff · clean'], ['10/15', '8:15am', 'OFFICE', 'MASTER-1', 'staff'], ['10/15', '9:02am', 'OFFICE', 'MASTER-1', 'staff · police'],
  ['10/15', '9:20am', '9', 'MASTER-1', 'staff · police w/ mgr'], ['10/15', '11:00am', '11', 'G-11A', 'guest · checkout'], ['10/15', '2:40pm', '12', 'G-12A', 'guest'],
  ['10/15', '4:15pm', 'APT', 'MASTER-1', 'staff'], ['10/15', '6:10pm', '4', 'G-4A', 'guest'], ['10/15', '7:30pm', '12', 'G-12A', 'guest'],
  ['10/15', '9:48pm', '4', 'G-4A', 'guest'], ['10/15', '10:50pm', 'OFFICE', 'MASTER-1', 'staff · handover'],
].map(([date, time, room, card, note]) => {
  const row: KeyRow = { date, time, room, card, note }
  if (date === '10/15' && time === '3:12am') row.clue = 2
  if (date === '10/15' && time === '3:20am') row.clue = 11
  return row
})

export const CARD_OWNERS = 'MASTER-1 = R. Doyle (Mgr) · MASTER-2 = L. Ortega (Maint.) · G-xx = guest cards · Rm 14 has no card reader (old keyed lock)'

export interface Email { id: string; from: string; subject: string; date: string; body: string[]; clueLine?: number; folder: 'inbox' | 'trash' }

export const EMAILS: Email[] = [
  { id: 'e1', folder: 'inbox', from: 'RoadRest Bookings', subject: 'Reservations for 10/20', date: 'Oct 14', body: ['Two reservations have been confirmed for Pinecrest Motor Inn on October 20.', 'Guest names will be faxed separately.', '— RoadRest Bookings, "Your Room On The Road"'] },
  { id: 'e2', folder: 'inbox', from: 'Harlow Ridge Linen Supply', subject: 'Invoice #4471 OVERDUE', date: 'Oct 12', body: ['Ray,', 'Invoice #4471 is now 60 days past due. We cannot deliver next week until it is paid.', 'Dot'] },
  { id: 'e3', folder: 'inbox', from: 'K. Doyle', subject: 're: the money', date: 'Oct 9', body: ['You said it would come through by October. The bank called again.', 'Don\'t tell me "soon". Tell me a date. K'] },
  { id: 'e4', folder: 'inbox', from: 'Halvorsen Mutual Claims', subject: 'Claim 14-0098: payment schedule', date: 'Sep 30', body: ['Dear Mr. Doyle,', 'Your claim for fire damage to Room 14 ($80,000) is under standard review.', 'Payment is expected within 30 days of the review closing.'] },
  { id: 'e5', folder: 'inbox', from: 'Vending Plus', subject: 'Cracker recall notice', date: 'Sep 22', body: ['Please remove all "Crunch Kings" crackers from machines. Lot #8812 may contain metal fragments.', 'Thank you for your cooperation.'] },
  { id: 'e6', folder: 'trash', from: 'Halvorsen Mutual Claims', subject: 'Claim 14-0098: field review', date: 'Oct 13', clueLine: 1, body: ['Dear Mr. Doyle,', 'As part of our standard process, an adjuster, O. Marsh, will visit unannounced to review the Room 14 claim on site.', 'Please make sure the room remains as it was after the incident. Do not begin repairs.', 'Halvorsen Mutual, Field Review Unit'] },
  { id: 'e7', folder: 'trash', from: 'MotelSaver Weekly', subject: 'Fall rates are falling!', date: 'Oct 2', body: ['Is your neon sign costing you money? Ten ways to save before winter.'] },
  { id: 'e8', folder: 'trash', from: 'Harlow Ridge Fire Dept.', subject: 'Report request', date: 'Jul 30', body: ['Mr. Doyle, we have no record of a call-out to your address on July 22.', 'If the fire was put out without us, please file form HR-7 within 30 days.'] },
]
export const EMAIL_PASSWORD = 'pinecrest14'

export interface Voicemail { id: number; from: string; when: string; lines: string[]; clueLine?: number; kind: 'voice' | 'breath' | 'static' | 'robot' }

export const VOICEMAILS: Voicemail[] = [
  { id: 1, from: 'RoadRest Bookings', when: 'Oct 14, 4:02pm', kind: 'robot', lines: ['"This is an automated message confirming two reservations for October twentieth..."'] },
  { id: 2, from: 'Edna (Room 12)', when: 'Oct 14, 9:14pm', kind: 'voice', lines: ['"Ray, it\'s Edna. The ice machine is making that noise again."', '"Also somebody parked in my spot. Again."'] },
  { id: 3, from: 'Unknown caller', when: 'Oct 15, 2:50am', kind: 'breath', lines: ['[breathing]', '[a door creaking]', '[a click. The line goes dead.]'] },
  { id: 4, from: 'Marisol', when: 'Oct 15, 8:30am', kind: 'voice', clueLine: 1, lines: ['"Luisito!"', '"Thanks for staying till four, you\'re the only one who helped clean up, little brother."', '"Mom says thank you. Love you."'] },
  { id: 5, from: 'Halvorsen Mutual', when: 'Oct 15, 10:15am', kind: 'voice', lines: ['"Calling for a Mr. Raymond Doyle about claim 14-0098. Please call us back."'] },
  { id: 6, from: 'Unknown caller', when: 'Tonight, 1:00am', kind: 'static', lines: ['[static only]'] },
]

export interface LogLine { date: string; text: string; clue?: number }

export const MAINTENANCE: LogLine[] = [
  { date: '07/18', text: 'Rm 6 shower drain. Hair. Fixed.' },
  { date: '07/23', text: 'Rm 14 — "fire" last night. Ray says he put it out himself. No smoke smell??' },
  { date: '07/24', text: 'Rm 14: no cleanup needed, Ray says keep it locked. Taped door per Ray.', clue: 8 },
  { date: '07/29', text: 'Ice machine. Banged it. Works.' },
  { date: '08/04', text: 'Neon sign "P" flickering. Ordered tube.' },
  { date: '08/11', text: 'Rm 2 TV dead. Swapped with Rm 14 TV? Ray said NO, use storage TV.' },
  { date: '08/19', text: 'Laundry door lock sticks. Leaving it unlocked for now.' },
  { date: '08/27', text: 'Gutters, building B.' },
  { date: '09/02', text: 'Rm 12 (Edna) radiator noise. Bled it.' },
  { date: '09/09', text: 'New tube for neon sign. Still buzzes.' },
  { date: '09/16', text: 'CCTV clock wrong again (fast). Told Ray. Not my department.' },
  { date: '09/24', text: 'Parking lines repainted. Edna wants hers to say EDNA. No.' },
  { date: '10/01', text: 'Ice machine. Banged it harder.' },
  { date: '10/08', text: 'Rm 9 lamp bulb.' },
  { date: '10/13', text: 'Vending: pulled the Crunch Kings. Recall.' },
  { date: '10/15', text: 'Rm 9 — see staff notes.' },
]

export const STAFF_NOTES: { author: string; when: string; lines: { text: string; clue?: number; handover?: boolean }[] }[] = [
  {
    author: 'RAY', when: 'Oct 15, 10:50pm',
    lines: [
      { text: 'New kid. Desk is yours till 7.', handover: true },
      { text: 'Night bell after 1, don\'t open the door for walk-ups.' },
      { text: 'Room 9 skipped last night, cops already came and went, nothing to worry about.' },
      { text: 'Room 14 is OFF LIMITS, floor\'s not safe.' },
      { text: 'I\'m in the back apartment if the building\'s on fire. Otherwise I\'m not.' },
      { text: '— Ray' },
    ],
  },
  {
    author: 'LUIS', when: 'Oct 15, 7:25am',
    lines: [
      { text: 'Room 9 bed made wrong, tag folded inside, not my work.', clue: 9 },
      { text: 'Guest bag gone. Car still out front?? Told Ray. He said leave it.' },
    ],
  },
  {
    author: 'LUIS', when: 'Oct 10, 6:05am',
    lines: [{ text: 'Do NOT eat the vending crackers. Recall. I mean it.' }],
  },
]
