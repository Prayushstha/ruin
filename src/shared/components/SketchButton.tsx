import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useSketchBox } from './useSketchBox'

// Tappable button with a hand-drawn border. Bold + filled by default.

interface SketchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  stroke?: string
  /** Background fill. Defaults to a soft tint matching the stroke. */
  fill?: string
  /** Stretch to fill the parent's width. */
  block?: boolean
  seed?: number
}

export function SketchButton({
  children,
  stroke = 'var(--ink)',
  fill,
  block,
  seed,
  className,
  style,
  type = 'button',
  ...rest
}: SketchButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  useSketchBox(ref, { stroke, seed, strokeWidth: 3 })

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      style={{
        position: 'relative',
        width: block ? '100%' : undefined,
        padding: '18px 32px',
        fontSize: '1.25em',
        border: 'none',
        background: fill ?? fillFor(stroke),
        cursor: 'pointer',
        borderRadius: 10,
        transition: 'transform 0.1s ease',
        ...style,
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
      onPointerUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      onPointerLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      {...rest}
    >
      {children}
    </button>
  )
}

// Map an ink color to its soft fill token. Lets callers pass `stroke` only
// and get a matching fill for free.
function fillFor(stroke: string): string {
  if (stroke.includes('accent')) return 'var(--fill-accent)'
  if (stroke.includes('blue')) return 'var(--fill-blue)'
  if (stroke.includes('green')) return 'var(--fill-green)'
  if (stroke.includes('soft')) return 'var(--fill-soft)'
  return 'var(--fill-soft)'
}
