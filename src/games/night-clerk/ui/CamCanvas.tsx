import { useEffect, useRef } from 'react'
import { H, W, drawCam, drawCut } from '../render/scenes.ts'
import type { CamOpts, CutId } from '../render/scenes.ts'

type Props =
  | { cam: Omit<CamOpts, 'frame'>; cut?: never; className?: string; onClick?: (x: number, y: number) => void; label: string; fps?: number }
  | { cut: CutId; cam?: never; className?: string; onClick?: (x: number, y: number) => void; label: string; fps?: number }

/** A small low-res canvas that redraws a few times a second so the grain crawls. */
export default function CamCanvas({ cam, cut, className, onClick, label, fps = 8 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const key = JSON.stringify(cam ?? cut)
  useEffect(() => {
    const c = ref.current?.getContext('2d', { willReadFrequently: true })
    if (!c) return
    let frame = 0
    const draw = () => {
      if (cam) drawCam(c, { ...cam, frame })
      else drawCut(c, cut!, frame)
      frame++
    }
    draw()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || fps <= 0) return
    const t = window.setInterval(draw, 1000 / fps)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fps])
  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className={`nc-cam ${className ?? ''}`}
      role="img"
      aria-label={label}
      onClick={(e) => {
        if (!onClick) return
        const r = e.currentTarget.getBoundingClientRect()
        onClick(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H)
      }}
    />
  )
}
