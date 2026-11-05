import type { ReactNode } from 'react'
import { useGame } from './ctx.ts'

/** Every line of text in an app is clickable. Lines that carry a clue get pinned. */
export default function Line({ clue, children, className, as = 'div' }: { clue?: number; children: ReactNode; className?: string; as?: 'div' | 'tr' | 'li' }) {
  const { pin, status, s, sfx, guide } = useGame()
  const pinned = clue !== undefined && s.clues.includes(clue)
  const glow = !pinned && clue !== undefined && guide?.clue === clue
  const onClick = () => {
    sfx('U1')
    if (clue !== undefined) pin(clue)
    else status('Nothing unusual.')
  }
  const props = {
    className: `nc-line ${pinned ? 'is-pinned' : ''} ${glow ? 'is-guide' : ''} ${className ?? ''}`,
    onClick,
    tabIndex: 0,
    role: 'button',
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } },
    title: pinned ? 'Pinned to your Notebook' : 'Click to examine',
  }
  if (as === 'tr') return <tr {...props}>{children}</tr>
  if (as === 'li') return <li {...props}>{children}</li>
  return <div {...props}>{children}{pinned && <span className="nc-pin-mark" aria-label="pinned"> 📌</span>}</div>
}
