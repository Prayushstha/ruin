import { useEffect, useRef } from 'react'
import rough from 'roughjs'

// Decorative hand-drawn marks scattered behind a page. Fixed to the viewport,
// low opacity, non-interactive. roughjs draws each once on mount.
//
// Pass a named `variant` for a curated set that fits the screen's mood, or a
// custom `marks` array to go bespoke.

type DoodleKind =
  | 'star'
  | 'squiggle'
  | 'arrow'
  | 'sparkle'
  | 'circle'
  | 'heart'
  | 'bolt'
  | 'smiley'
  | 'burst'
  | 'swoosh'
  | 'bang'

interface Doodle {
  kind: DoodleKind
  x: number // % across viewport
  y: number // % down viewport
  size: number
  rotate: number
  color: string
}

type Variant = 'welcome' | 'lobby' | 'loading'

interface DoodlesProps {
  variant?: Variant
  marks?: Doodle[]
}

// welcome — energetic first impression: stars, sparkles, a "come on in" vibe.
const WELCOME: Doodle[] = [
  { kind: 'star', x: 7, y: 14, size: 64, rotate: -12, color: 'var(--ink-accent)' },
  { kind: 'sparkle', x: 90, y: 10, size: 52, rotate: 8, color: 'var(--ink-purple)' },
  { kind: 'swoosh', x: 78, y: 88, size: 120, rotate: 0, color: 'var(--ink-blue)' },
  { kind: 'bolt', x: 10, y: 80, size: 56, rotate: -8, color: 'var(--ink-accent)' },
  { kind: 'circle', x: 93, y: 44, size: 54, rotate: 0, color: 'var(--ink-soft)' },
  { kind: 'star', x: 5, y: 48, size: 42, rotate: 20, color: 'var(--ink-blue)' },
  { kind: 'smiley', x: 86, y: 68, size: 48, rotate: 0, color: 'var(--ink-green)' },
  { kind: 'sparkle', x: 16, y: 30, size: 30, rotate: 0, color: 'var(--ink-soft)' },
]

// lobby — party gathering: hearts, bursts, a little chaos.
const LOBBY: Doodle[] = [
  { kind: 'heart', x: 8, y: 20, size: 50, rotate: -10, color: 'var(--ink-accent)' },
  { kind: 'burst', x: 88, y: 16, size: 60, rotate: 0, color: 'var(--ink-purple)' },
  { kind: 'squiggle', x: 14, y: 84, size: 100, rotate: 0, color: 'var(--ink-blue)' },
  { kind: 'arrow', x: 84, y: 80, size: 64, rotate: 35, color: 'var(--ink-green)' },
  { kind: 'circle', x: 92, y: 48, size: 46, rotate: 0, color: 'var(--ink-soft)' },
  { kind: 'star', x: 6, y: 56, size: 38, rotate: 18, color: 'var(--ink-blue)' },
  { kind: 'bang', x: 80, y: 30, size: 40, rotate: 12, color: 'var(--ink-accent)' },
  { kind: 'sparkle', x: 20, y: 70, size: 28, rotate: 0, color: 'var(--ink-soft)' },
]

// loading — sparse, gentle: a few marks while you wait.
const LOADING: Doodle[] = [
  { kind: 'circle', x: 12, y: 30, size: 44, rotate: 0, color: 'var(--ink-soft)' },
  { kind: 'sparkle', x: 86, y: 26, size: 36, rotate: 0, color: 'var(--ink-purple)' },
  { kind: 'swoosh', x: 70, y: 78, size: 90, rotate: 0, color: 'var(--ink-blue)' },
  { kind: 'star', x: 10, y: 72, size: 32, rotate: 15, color: 'var(--ink-accent)' },
]

const VARIANTS: Record<Variant, Doodle[]> = {
  welcome: WELCOME,
  lobby: LOBBY,
  loading: LOADING,
}

export function Doodles({ variant = 'welcome', marks }: DoodlesProps) {
  const ref = useRef<HTMLDivElement>(null)
  const set = marks ?? VARIANTS[variant]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'width:100%;height:100%;display:block;'
    el.appendChild(svg)
    const rc = rough.svg(svg)

    set.forEach((m, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const cx = (m.x / 100) * window.innerWidth
      const cy = (m.y / 100) * window.innerHeight
      g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${m.rotate})`)
      g.appendChild(drawMark(rc, m, i))
      svg.appendChild(g)
    })

    return () => void svg.remove()
  }, [set])

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
      return rc.polygon(
        [[0, -s], [s * 0.18, 0], [0, s], [-s * 0.18, 0]],
        { ...opts, fill: m.color, fillStyle: 'solid' },
      )
    case 'arrow':
      return rc.path(`M ${-s} 0 L ${s * 0.4} 0 M ${s * 0.4} 0 L 0 ${-s * 0.3} M ${s * 0.4} 0 L 0 ${s * 0.3}`, opts)
    case 'squiggle':
      return rc.path(`M ${-s} 0 Q ${-s / 2} ${-s * 0.4} 0 0 T ${s} 0`, opts)
    case 'heart':
      return rc.path(heartPath(s), opts)
    case 'bolt':
      return rc.polygon(
        [[s * 0.1, -s], [-s * 0.4, s * 0.1], [0, s * 0.1], [-s * 0.1, s], [s * 0.4, -s * 0.1], [0, -s * 0.1]],
        { ...opts, fill: m.color, fillStyle: 'solid' },
      )
    case 'smiley':
      return rc.path(smileyPath(s), opts)
    case 'burst':
      // asterisk-style burst: many lines from center.
      return rc.path(burstPath(s), opts)
    case 'swoosh':
      return rc.path(`M ${-s} ${s * 0.2} C ${-s * 0.4} ${-s * 0.5} ${s * 0.3} ${s * 0.5} ${s} ${-s * 0.2}`, opts)
    case 'bang':
      // exclamation: a droplet body + dot.
      return rc.path(`M 0 ${-s} Q ${s * 0.35} ${-s * 0.2} ${s * 0.1} ${s * 0.35} L ${-s * 0.1} ${s * 0.35} Q ${-s * 0.35} ${-s * 0.2} 0 ${-s} M 0 ${s * 0.65} q ${s * 0.13} 0 ${s * 0.13} ${s * 0.13} q 0 ${s * 0.13} ${-s * 0.13} ${s * 0.13} q ${-s * 0.13} 0 ${-s * 0.13} ${-s * 0.13} q 0 ${-s * 0.13} ${s * 0.13} ${-s * 0.13} Z`, opts)
  }
}

function starPoints(s: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s : s * 0.4
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push([+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)])
  }
  return pts
}

// Two-lobed heart: bezier up over the humps, point at the bottom.
function heartPath(s: number): string {
  return `M 0 ${s * 0.35} C ${-s * 0.9} ${-s * 0.5} ${-s * 0.2} ${-s} 0 ${-s * 0.25} C ${s * 0.2} ${-s} ${s * 0.9} ${-s * 0.5} 0 ${s * 0.35} Z`
}

function smileyPath(s: number): string {
  const r = s * 0.5
  return [
    `M ${-r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`,
    `M ${-s * 0.2} ${-s * 0.1} L ${-s * 0.2} ${-s * 0.05}`,
    `M ${s * 0.2} ${-s * 0.1} L ${s * 0.2} ${-s * 0.05}`,
    `M ${-s * 0.2} ${s * 0.08} Q 0 ${s * 0.28} ${s * 0.2} ${s * 0.08}`,
  ].join(' ')
}

function burstPath(s: number): string {
  const lines: string[] = []
  const spokes = 8
  for (let i = 0; i < spokes; i++) {
    const a = (Math.PI * 2 * i) / spokes
    const ix = 0, iy = 0
    const ox = +(Math.cos(a) * s).toFixed(1)
    const oy = +(Math.sin(a) * s).toFixed(1)
    lines.push(`M ${ix} ${iy} L ${ox} ${oy}`)
  }
  return lines.join(' ')
}

export type { Doodle, DoodleKind }
