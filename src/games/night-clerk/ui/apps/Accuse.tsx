import { useState } from 'react'
import { DEDUCTIONS } from '../../data/clues.ts'
import type { DeductionId } from '../../data/clues.ts'
import CamCanvas from '../CamCanvas.tsx'
import { useGame } from '../ctx.ts'

type Suspect = 'ray' | 'edna' | 'luis'
type SlotName = 'Motive' | 'Opportunity' | 'Lie'
const SLOTS: SlotName[] = ['Motive', 'Opportunity', 'Lie']
const RIGHT: Record<SlotName, DeductionId> = { Motive: 'B', Opportunity: 'A', Lie: 'C' }
const NAMES: Record<Suspect, string> = { ray: 'Ray Doyle', edna: 'Edna Kowal', luis: 'Luis Ortega' }

export default function Accuse({ onClose }: { onClose: () => void }) {
  const { s, dispatch, sfx } = useGame()
  const [who, setWho] = useState<Suspect | null>(null)
  const [slots, setSlots] = useState<Record<SlotName, DeductionId | ''>>({ Motive: '', Opportunity: '', Lie: '' })
  const [reply, setReply] = useState<string | null>(null)
  const made = DEDUCTIONS.filter((d) => s.deductions.includes(d.id))

  const file = () => {
    if (!who) return
    const missing = SLOTS.find((k) => slots[k] !== RIGHT[k])
    if (who === 'ray' && !missing) {
      sfx('U7')
      dispatch({ type: 'ACCUSE', ok: true })
      return
    }
    sfx('U8')
    dispatch({ type: 'ACCUSE', ok: false })
    if (who === 'edna') setReply(`Edna Kowal can barely lift the ice bucket. The report doesn't hold up.${missing ? ` Look again at: ${missing}.` : ''}`)
    else if (who === 'luis') setReply(`Luis has a whole birthday party who saw him. Someone wanted you to think it was Luis.${missing ? ` Look again at: ${missing}.` : ''}`)
    else setReply(`You know it's Ray. You can't prove it yet. Missing: ${missing}.`)
  }

  return (
    <div className="nc-accuse" role="dialog" aria-label="Incident report">
      <div className="nc-report">
        <div className="nc-report-head">
          <b>HARLOW RIDGE COUNTY · INCIDENT REPORT</b>
          <button className="nc-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p>Missing person: guest registered as “D. Price”, Room 9. Person responsible:</p>
        <div className="nc-suspects">
          {(['ray', 'edna', 'luis'] as Suspect[]).map((p) => (
            <button key={p} className={`nc-suspect ${who === p ? 'is-on' : ''}`} onClick={() => { setWho(p); sfx('U1') }} aria-pressed={who === p}>
              <CamCanvas cut={p} label={NAMES[p]} fps={0} />
              <span>{NAMES[p]}</span>
            </button>
          ))}
        </div>
        <div className="nc-slots">
          {SLOTS.map((k) => (
            <label key={k}>
              <span>{k}</span>
              <select value={slots[k]} onChange={(e) => setSlots({ ...slots, [k]: e.target.value as DeductionId })}>
                <option value="">— attach a deduction —</option>
                {made.map((d) => <option key={d.id} value={d.id}>{d.id}. {d.result}</option>)}
              </select>
            </label>
          ))}
        </div>
        {reply && <p className="nc-reply">{reply}</p>}
        <div className="nc-report-foot">
          <button className="nc-btn" disabled={!who} onClick={file}>File report</button>
        </div>
      </div>
    </div>
  )
}
