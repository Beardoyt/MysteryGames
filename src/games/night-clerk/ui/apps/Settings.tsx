import { useGame } from '../ctx.ts'
import type { Settings as S } from '../../state.ts'

export default function Settings({ onQuit }: { onQuit?: () => void }) {
  const { s, dispatch } = useGame()
  const set = (patch: Partial<S>) => dispatch({ type: 'SETTINGS', patch })
  const st = s.settings
  const vol = (k: 'music' | 'sfx' | 'amb', label: string) => (
    <label className="nc-row">{label}<input type="range" min={0} max={1} step={0.05} value={st[k]} onChange={(e) => set({ [k]: +e.target.value })} /></label>
  )
  const tog = (k: 'crt' | 'largeText' | 'hints' | 'softScares' | 'guided', label: string) => (
    <label className="nc-row"><span>{label}</span><input type="checkbox" checked={st[k]} onChange={(e) => set({ [k]: e.target.checked })} /></label>
  )
  return (
    <div className="nc-app nc-settings">
      {vol('music', 'Music')}
      {vol('sfx', 'Effects')}
      {vol('amb', 'Ambience')}
      {tog('guided', 'Tutorial for the first clue')}
      {tog('crt', 'Screen effects (scanlines, flicker)')}
      {tog('largeText', 'Large text')}
      {tog('softScares', 'Soften scares (no breathing call, no camera sting)')}
      {onQuit && <button className="nc-btn" onClick={onQuit}>Save &amp; quit to title</button>}
      <div className="nc-foot">Progress saves automatically in this browser.</div>
    </div>
  )
}
