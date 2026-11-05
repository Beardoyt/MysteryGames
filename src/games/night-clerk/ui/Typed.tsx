import { useEffect, useState } from 'react'

/** Typewriter text. Calls onTick every few characters (for the keyboard sound). */
export default function Typed({ text, speed = 38, onTick, onDone }: { text: string; speed?: number; onTick?: () => void; onDone?: () => void }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); onDone?.(); return }
    let i = 0
    const t = setInterval(() => {
      i++
      setN(i)
      if (i % 3 === 0) onTick?.()
      if (i >= text.length) { clearInterval(t); onDone?.() }
    }, speed)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  return <span>{text.slice(0, n)}<span className="nc-caret" aria-hidden>▌</span><span className="sr-only">{text}</span></span>
}
