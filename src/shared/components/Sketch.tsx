import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import { useSketchBox } from './useSketchBox'

// Container with a hand-drawn rectangle border — the base card/panel.

interface SketchProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  stroke?: string
  seed?: number
}

export function Sketch({
  children,
  stroke,
  seed,
  className,
  style,
  ...rest
}: SketchProps) {
  const ref = useRef<HTMLDivElement>(null)
  useSketchBox(ref, { stroke, seed })

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', padding: '28px', zIndex: 0, ...style }}
      {...rest}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
