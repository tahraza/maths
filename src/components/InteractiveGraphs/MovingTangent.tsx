'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

interface MovingTangentProps {
  /** Fonction (expression) */
  fn?: string
  /** Dérivée (expression, optionnel - calculée numériquement si non fournie) */
  derivative?: string
  /** Position initiale du point */
  initialX?: number
  /** Mode convexité */
  showConvexity?: boolean
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

// Helpers
const fmt = (x: number, n = 3) => {
  if (Math.abs(x) < 1e-10) return '0'
  return x.toFixed(n).replace(/\.?0+$/, '')
}

function parseFunction(expr: string): (x: number) => number {
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/exp/g, 'Math.exp')
    .replace(/log/g, 'Math.log')
    .replace(/ln/g, 'Math.log')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs')
    .replace(/pi/gi, 'Math.PI')
    .replace(/e(?![xp])/g, 'Math.E')

  try {
    return new Function('x', `return ${sanitized}`) as (x: number) => number
  } catch {
    return (x) => x * x
  }
}

// Numerical derivative
function numericalDerivative(f: (x: number) => number, x: number, h = 0.0001): number {
  return (f(x + h) - f(x - h)) / (2 * h)
}

// Second derivative for convexity
function secondDerivative(f: (x: number) => number, x: number, h = 0.001): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h)
}

export function MovingTangent({
  fn = 'x^3 - 3*x',
  derivative,
  initialX = 1,
  showConvexity = true,
  title,
  height = 450,
}: MovingTangentProps) {
  const [pointX, setPointX] = useState(initialX)
  const [animating, setAnimating] = useState(false)
  const [showSecant, setShowSecant] = useState(false)
  const [secantH, setSecantH] = useState(1)
  const animRef = useRef<number | null>(null)
  const animDirection = useRef(1)

  const f = useMemo(() => parseFunction(fn), [fn])
  const fPrime = useMemo(
    () => (derivative ? parseFunction(derivative) : (x: number) => numericalDerivative(f, x)),
    [f, derivative]
  )

  // SVG dimensions
  const W = 700
  const H = 450
  const margin = { top: 40, right: 40, bottom: 50, left: 60 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // Compute domain
  const xMin = -4
  const xMax = 4

  // Sample function to find y range
  const yRange = useMemo(() => {
    let yMinVal = Infinity
    let yMaxVal = -Infinity
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = f(x)
      if (isFinite(y)) {
        yMinVal = Math.min(yMinVal, y)
        yMaxVal = Math.max(yMaxVal, y)
      }
    }
    const padding = (yMaxVal - yMinVal) * 0.15 || 1
    return { min: yMinVal - padding, max: yMaxVal + padding }
  }, [f, xMin, xMax])

  // Scale functions
  const scaleX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW
  const scaleY = (y: number) => margin.top + ((yRange.max - y) / (yRange.max - yRange.min)) * plotH

  // Current point values
  const pointY = f(pointX)
  const slope = fPrime(pointX)
  const secondDeriv = secondDerivative(f, pointX)
  const isConvex = secondDeriv > 0
  const isInflection = Math.abs(secondDeriv) < 0.1

  // Tangent line: y = f(a) + f'(a)(x - a)
  const tangentY = (x: number) => pointY + slope * (x - pointX)

  // Tangent endpoints
  const tangentX1 = xMin
  const tangentX2 = xMax
  const tangentY1 = tangentY(tangentX1)
  const tangentY2 = tangentY(tangentX2)

  // Secant line (if shown)
  const secantPoint2X = pointX + secantH
  const secantPoint2Y = f(secantPoint2X)
  const secantSlope = (secantPoint2Y - pointY) / secantH

  // Generate curve path
  const curvePath = useMemo(() => {
    const points: string[] = []
    const steps = 300
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      const y = f(x)
      if (isFinite(y) && y >= yRange.min - 2 && y <= yRange.max + 2) {
        points.push(`${i === 0 ? 'M' : 'L'} ${scaleX(x)} ${scaleY(y)}`)
      }
    }
    return points.join(' ')
  }, [f, xMin, xMax, yRange, scaleX, scaleY])

  // Convexity regions
  const convexityRegions = useMemo(() => {
    if (!showConvexity) return { convex: [], concave: [] }

    const convex: string[] = []
    const concave: string[] = []
    const steps = 200
    let currentRegion: 'convex' | 'concave' | null = null
    let regionPath: string[] = []

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      const y = f(x)
      const d2 = secondDerivative(f, x)

      if (!isFinite(y) || y < yRange.min - 1 || y > yRange.max + 1) continue

      const region = d2 > 0.05 ? 'convex' : d2 < -0.05 ? 'concave' : null

      if (region !== currentRegion) {
        if (regionPath.length > 0 && currentRegion) {
          if (currentRegion === 'convex') convex.push(regionPath.join(' '))
          else concave.push(regionPath.join(' '))
        }
        regionPath = [`M ${scaleX(x)} ${scaleY(y)}`]
        currentRegion = region
      } else if (region) {
        regionPath.push(`L ${scaleX(x)} ${scaleY(y)}`)
      }
    }

    if (regionPath.length > 0 && currentRegion) {
      if (currentRegion === 'convex') convex.push(regionPath.join(' '))
      else concave.push(regionPath.join(' '))
    }

    return { convex, concave }
  }, [f, xMin, xMax, yRange, showConvexity, scaleX, scaleY])

  // Animation
  useEffect(() => {
    if (animating) {
      const tick = () => {
        setPointX((prev) => {
          let next = prev + 0.03 * animDirection.current
          if (next >= xMax - 0.5) {
            animDirection.current = -1
            next = xMax - 0.5
          } else if (next <= xMin + 0.5) {
            animDirection.current = 1
            next = xMin + 0.5
          }
          return next
        })
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [animating])

  const handleReset = () => {
    setPointX(initialX)
    setAnimating(false)
    animDirection.current = 1
  }

  // Axis ticks
  const xTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4].filter((x) => x >= xMin && x <= xMax)
  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const range = yRange.max - yRange.min
    const step = Math.pow(10, Math.floor(Math.log10(range)))
    for (let y = Math.ceil(yRange.min / step) * step; y <= yRange.max; y += step) {
      ticks.push(y)
    }
    return ticks.slice(0, 8)
  }, [yRange])

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {title && (
        <h4 className="border-b border-gray-700 px-4 py-3 text-center text-sm font-medium text-gray-200">
          {title}
        </h4>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* SVG */}
        <div className="flex-1 p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: height }}>
            <defs>
              <marker id="arrowTangent" markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#ff6b6b" />
              </marker>
            </defs>

            {/* Grid */}
            {xTicks.map((x) => (
              <line
                key={`xgrid-${x}`}
                x1={scaleX(x)}
                y1={margin.top}
                x2={scaleX(x)}
                y2={H - margin.bottom}
                stroke="rgba(255,255,255,0.08)"
              />
            ))}
            {yTicks.map((y, i) => (
              <line
                key={`ygrid-${i}`}
                x1={margin.left}
                y1={scaleY(y)}
                x2={W - margin.right}
                y2={scaleY(y)}
                stroke="rgba(255,255,255,0.08)"
              />
            ))}

            {/* Convexity highlighting */}
            {showConvexity && (
              <>
                {convexityRegions.convex.map((path, i) => (
                  <path key={`convex-${i}`} d={path} fill="none" stroke="rgba(82, 227, 182, 0.5)" strokeWidth={6} />
                ))}
                {convexityRegions.concave.map((path, i) => (
                  <path key={`concave-${i}`} d={path} fill="none" stroke="rgba(255, 209, 102, 0.5)" strokeWidth={6} />
                ))}
              </>
            )}

            {/* Axes */}
            <line
              x1={margin.left}
              y1={scaleY(0)}
              x2={W - margin.right}
              y2={scaleY(0)}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />
            <line
              x1={scaleX(0)}
              y1={margin.top}
              x2={scaleX(0)}
              y2={H - margin.bottom}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />

            {/* Axis labels */}
            {xTicks.map((x) => (
              <text key={`xlabel-${x}`} x={scaleX(x)} y={H - margin.bottom + 20} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">
                {x}
              </text>
            ))}
            {yTicks.map((y, i) => (
              <text key={`ylabel-${i}`} x={margin.left - 10} y={scaleY(y) + 4} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="end">
                {fmt(y, 1)}
              </text>
            ))}

            {/* Function curve */}
            <path d={curvePath} fill="none" stroke="#3b82f6" strokeWidth={3} />

            {/* Secant line (if shown) */}
            {showSecant && (
              <>
                <line
                  x1={scaleX(xMin)}
                  y1={scaleY(pointY + secantSlope * (xMin - pointX))}
                  x2={scaleX(xMax)}
                  y2={scaleY(pointY + secantSlope * (xMax - pointX))}
                  stroke="#ffd166"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={0.8}
                />
                <circle cx={scaleX(secantPoint2X)} cy={scaleY(secantPoint2Y)} r={6} fill="#ffd166" />
              </>
            )}

            {/* Tangent line */}
            <line
              x1={scaleX(tangentX1)}
              y1={scaleY(tangentY1)}
              x2={scaleX(tangentX2)}
              y2={scaleY(tangentY2)}
              stroke="#ff6b6b"
              strokeWidth={2.5}
            />

            {/* Current point */}
            <circle cx={scaleX(pointX)} cy={scaleY(pointY)} r={10} fill="#ff6b6b" stroke="white" strokeWidth={2} />

            {/* Vertical line to x-axis */}
            <line
              x1={scaleX(pointX)}
              y1={scaleY(pointY)}
              x2={scaleX(pointX)}
              y2={scaleY(0)}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="4 4"
            />

            {/* Info box */}
            <g transform="translate(20, 10)">
              <rect x={0} y={0} width={220} height={100} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={12} y={22} fill="rgba(255,255,255,0.8)" fontSize={12}>
                f(x) = {fn}
              </text>
              <text x={12} y={44} fill="#ff6b6b" fontSize={12}>
                Point: ({fmt(pointX)}, {fmt(pointY)})
              </text>
              <text x={12} y={64} fill="#52e3b6" fontSize={12}>
                f'({fmt(pointX)}) = {fmt(slope)}
              </text>
              {showConvexity && (
                <text x={12} y={86} fill={isInflection ? '#ffd166' : isConvex ? '#52e3b6' : '#ffd166'} fontSize={11}>
                  f''({fmt(pointX)}) = {fmt(secondDeriv)} ({isInflection ? 'inflexion' : isConvex ? 'convexe' : 'concave'})
                </text>
              )}
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#3b82f6]" />
              <span>Courbe f(x)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span>Tangente</span>
            </div>
            {showConvexity && (
              <>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-1 w-4 bg-[#52e3b6]" />
                  <span>Convexe (f'' &gt; 0)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-1 w-4 bg-[#ffd166]" />
                  <span>Concave (f'' &lt; 0)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-56 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Contrôles</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Position x</label>
                <span className="font-mono text-red-400">{fmt(pointX)}</span>
              </div>
              <input
                type="range"
                min={xMin + 0.2}
                max={xMax - 0.2}
                step={0.01}
                value={pointX}
                onChange={(e) => {
                  setAnimating(false)
                  setPointX(parseFloat(e.target.value))
                }}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showConvexity}
                onChange={() => {}}
                disabled
                className="rounded"
                defaultChecked={showConvexity}
              />
              Afficher convexité
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showSecant}
                onChange={(e) => setShowSecant(e.target.checked)}
                className="rounded"
              />
              Afficher sécante
            </label>

            {showSecant && (
              <div>
                <div className="flex justify-between text-xs text-gray-400">
                  <label>h (distance sécante)</label>
                  <span className="font-mono text-yellow-400">{fmt(secantH)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={secantH}
                  onChange={(e) => setSecantH(parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Pente sécante: {fmt(secantSlope)}
                </div>
              </div>
            )}

            <hr className="border-gray-700" />

            <div className="flex gap-2">
              <button
                onClick={() => setAnimating(!animating)}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
              >
                {animating ? '⏸ Stop' : '▶ Animer'}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
              >
                ↺
              </button>
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Rappel :</b>
              <br />
              La tangente au point (a, f(a)) a pour équation:
              <br />
              <span className="text-green-400">y = f(a) + f'(a)(x - a)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
