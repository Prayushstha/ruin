import { useEffect, useRef, type CSSProperties } from 'react'
import rough from 'roughjs'

// Hand-drawn loader: a wobbly circle that re-draws itself on a loop, like a
// doodle being sketched over and over. Matches the roughjs aesthetic.

interface LoaderProps {
  /** Pixel size of the sketch circle. */
  size?: number
  /** Stroke color. Defaults to ink. */
  stroke?: string
  label?: string
  style?: CSSProperties
}

export function Loader({ size = 48, stroke = 'var(--ink)', label, style }: LoaderProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'width:100%;height:100%;overflow:visible;'
    el.appendChild(svg)
    const rc = rough.svg(svg)

    let frame = 0
    let raf = 0

    const draw = () => {
      // New seed each frame → the wobble re-sketches, giving a "drawing"
      // animation rather than a static stroke.
      svg.innerHTML = ''
      svg.appendChild(
        rc.circle(size / 2, size / 2, size - 6, {
          stroke,
          strokeWidth: 2.5,
          seed: frame,
          roughness: 1.8,
          bowing: 2,
        }),
      )
      frame++
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      svg.remove()
    }
  }, [size, stroke])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...style }}>
      <div ref={ref} style={{ width: size, height: size }} />
      {label && <span style={{ color: 'var(--ink-soft)', fontSize: '0.95em' }}>{label}</span>}
    </div>
  )
}
