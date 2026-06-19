import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useSketchBox } from './useSketchBox'

// Tappable button with a hand-drawn border.

interface SketchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  stroke?: string
  seed?: number
}

export function SketchButton({
  children,
  stroke,
  seed,
  className,
  style,
  type = 'button',
  ...rest
}: SketchButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  useSketchBox(ref, { stroke, seed })

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      style={{
        position: 'relative',
        padding: '12px 24px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
