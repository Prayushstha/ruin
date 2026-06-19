import { useEffect, type RefObject } from 'react'
import rough from 'roughjs'

// Draws a hand-drawn rectangle around an element via an SVG overlay that
// redraws on resize. The wrapper must be position:relative (see <Sketch>).

interface Options {
  stroke?: string
  strokeWidth?: number
  seed?: number
}

export function useSketchBox(
  target: RefObject<HTMLElement | null>,
  options: Options = {},
) {
  const { stroke = 'var(--ink)', strokeWidth = 2.5, seed = 1 } = options

  useEffect(() => {
    const el = target.current
    if (!el) return

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0;'
    el.insertBefore(svg, el.firstChild)

    const rc = rough.svg(svg)

    const draw = () => {
      const { width, height } = el.getBoundingClientRect()
      svg.innerHTML = ''
      svg.appendChild(
        rc.rectangle(2, 2, width - 4, height - 4, {
          stroke,
          strokeWidth,
          seed,
          roughness: 1.6,
          bowing: 1.5,
        }),
      )
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(el)

    return () => {
      observer.disconnect()
      svg.remove()
    }
  }, [target, stroke, strokeWidth, seed])
}
