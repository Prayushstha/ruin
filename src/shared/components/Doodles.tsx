import { useEffect, useRef } from 'react'
import rough from 'roughjs'

// Decorative hand-drawn marks scattered behind a page. Fixed to the viewport,
// low opacity, non-interactive. roughjs draws each mark once on mount.

type DoodleKind = 'star' | 'squiggle' | 'arrow' | 'sparkle' | 'circle'

interface Doodle {
  kind: DoodleKind
  x: number // % across viewport
  y: number // % down viewport
  size: number
  rotate: number
  color: string
}

interface DoodlesProps {
  /** Override the default scattered set. */
  marks?: Doodle[]
}

const DEFAULT_MARKS: Doodle[] = [
  { kind: 'star', x: 8, y: 16, size: 56, rotate: -12, color: 'var(--ink-accent)' },
  { kind: 'sparkle', x: 88, y: 12, size: 44, rotate: 8, color: 'var(--ink-purple)' },
  { kind: 'squiggle', x: 12, y: 82, size: 90, rotate: 0, color: 'var(--ink-blue)' },
  { kind: 'arrow', x: 84, y: 78, size: 70, rotate: 35, color: 'var(--ink-green)' },
  { kind: 'circle', x: 92, y: 46, size: 50, rotate: 0, color: 'var(--ink-soft)' },
  { kind: 'star', x: 6, y: 50, size: 38, rotate: 20, color: 'var(--ink-blue)' },
]

export function Doodles({ marks = DEFAULT_MARKS }: DoodlesProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'width:100%;height:100%;display:block;'
    el.appendChild(svg)
    const rc = rough.svg(svg)

    marks.forEach((m, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const w = window.innerWidth
      const h = window.innerHeight
      const cx = (m.x / 100) * w
      const cy = (m.y / 100) * h
      g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${m.rotate})`)
      g.appendChild(drawMark(rc, m, i))
      svg.appendChild(g)
    })

    return () => void svg.remove()
  }, [marks])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  )
}

function drawMark(rc: ReturnType<typeof rough.svg>, m: Doodle, seed: number) {
  const opts = {
    stroke: m.color,
    strokeWidth: 2.5,
    roughness: 1.5,
    bowing: 1.5,
    seed: seed + 1,
  }
  const s = m.size

  switch (m.kind) {
    case 'star':
      return rc.polygon(starPoints(s), opts)
    case 'circle':
      return rc.circle(0, 0, s, opts)
    case 'sparkle':
      // Four-point sparkle: two crossing thin diamonds.
      return rc.polygon(
        [[0, -s], [s * 0.18, 0], [0, s], [-s * 0.18, 0]],
        { ...opts, fill: m.color, fillStyle: 'solid' },
      )
    case 'arrow':
      return rc.path(`M ${-s} 0 L ${s * 0.4} 0 M ${s * 0.4} 0 L ${0} ${-s * 0.3} M ${s * 0.4} 0 L ${0} ${s * 0.3}`, opts)
    case 'squiggle':
      return rc.path(`M ${-s} 0 Q ${-s / 2} ${-s * 0.4} 0 0 T ${s} 0`, opts)
  }
}

// 5-point star as Point tuples.
function starPoints(s: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s : s * 0.4
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push([+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)])
  }
  return pts
}

export type { Doodle, DoodleKind }
