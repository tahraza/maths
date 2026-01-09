'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

interface EpsilonDeltaProps {
  /** Fonction (expression) */
  fn?: string
  /** Point où calculer la limite */
  limitPoint?: number
  /** Valeur de la limite */
  limitValue?: number
  /** Type de limite */
  limitType?: 'finite' | 'left' | 'right' | 'infinity'
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
    return (x) => x
  }
}

export function EpsilonDelta({
  fn = '(x^2 - 1)/(x - 1)',
  limitPoint = 1,
  limitValue = 2,
  limitType = 'finite',
  title,
  height = 450,
}: EpsilonDeltaProps) {
  const [epsilon, setEpsilon] = useState(0.5)
  const [delta, setDelta] = useState(0.3)
  const [autoFindDelta, setAutoFindDelta] = useState(true)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef<number | null>(null)

  const f = useMemo(() => parseFunction(fn), [fn])

  // SVG dimensions
  const W = 700
  const H = 450
  const margin = { top: 40, right: 40, bottom: 50, left: 60 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // Compute domain based on limit point
  const xMin = limitPoint - 3
  const xMax = limitPoint + 3
  const yMin = limitValue - 3
  const yMax = limitValue + 3

  // Scale functions
  const scaleX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW
  const scaleY = (y: number) => margin.top + ((yMax - y) / (yMax - yMin)) * plotH

  // Auto-find delta for given epsilon
  const computedDelta = useMemo(() => {
    if (!autoFindDelta) return delta

    // Binary search for delta
    let low = 0.001
    let high = 2
    const targetEps = epsilon

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2
      let maxDeviation = 0

      // Check points in the delta neighborhood
      for (let dx = -mid; dx <= mid; dx += mid / 50) {
        if (Math.abs(dx) < 0.0001) continue
        const x = limitPoint + dx
        if (limitType === 'left' && dx > 0) continue
        if (limitType === 'right' && dx < 0) continue

        const y = f(x)
        if (isFinite(y)) {
          maxDeviation = Math.max(maxDeviation, Math.abs(y - limitValue))
        }
      }

      if (maxDeviation <= targetEps) {
        low = mid
      } else {
        high = mid
      }
    }

    return Math.min(low, 2)
  }, [f, limitPoint, limitValue, limitType, epsilon, autoFindDelta, delta])

  const displayDelta = autoFindDelta ? computedDelta : delta

  // Check if condition is satisfied
  const conditionSatisfied = useMemo(() => {
    const testDelta = displayDelta
    for (let dx = -testDelta; dx <= testDelta; dx += testDelta / 100) {
      if (Math.abs(dx) < 0.0001) continue
      const x = limitPoint + dx
      if (limitType === 'left' && dx > 0) continue
      if (limitType === 'right' && dx < 0) continue

      const y = f(x)
      if (isFinite(y) && Math.abs(y - limitValue) > epsilon) {
        return false
      }
    }
    return true
  }, [f, limitPoint, limitValue, limitType, epsilon, displayDelta])

  // Generate curve path (avoiding the limit point if it's undefined)
  const curvePath = useMemo(() => {
    const points: string[] = []
    const steps = 400
    let started = false

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      // Skip very close to limit point if function undefined there
      if (Math.abs(x - limitPoint) < 0.02) continue

      const y = f(x)
      if (isFinite(y) && y >= yMin - 1 && y <= yMax + 1) {
        if (!started) {
          points.push(`M ${scaleX(x)} ${scaleY(y)}`)
          started = true
        } else {
          points.push(`L ${scaleX(x)} ${scaleY(y)}`)
        }
      } else {
        started = false
      }
    }
    return points.join(' ')
  }, [f, xMin, xMax, yMin, yMax, limitPoint, scaleX, scaleY])

  // Animation
  useEffect(() => {
    if (animating) {
      const tick = () => {
        setEpsilon((prev) => {
          const next = prev - 0.01
          if (next <= 0.05) {
            setAnimating(false)
            return 0.05
          }
          return next
        })
        animRef.current = requestAnimationFrame(tick)
      }
      const timeout = setTimeout(() => {
        animRef.current = requestAnimationFrame(tick)
      }, 30)
      return () => {
        clearTimeout(timeout)
        if (animRef.current) cancelAnimationFrame(animRef.current)
      }
    }
  }, [animating])

  const startAnimation = () => {
    setEpsilon(1.5)
    setAutoFindDelta(true)
    setAnimating(true)
  }

  const handleReset = () => {
    setEpsilon(0.5)
    setDelta(0.3)
    setAnimating(false)
  }

  // Axis ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = []
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      ticks.push(x)
    }
    return ticks
  }, [xMin, xMax])

  const yTicks = useMemo(() => {
    const ticks: number[] = []
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      ticks.push(y)
    }
    return ticks
  }, [yMin, yMax])

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
            {yTicks.map((y) => (
              <line
                key={`ygrid-${y}`}
                x1={margin.left}
                y1={scaleY(y)}
                x2={W - margin.right}
                y2={scaleY(y)}
                stroke="rgba(255,255,255,0.08)"
              />
            ))}

            {/* Epsilon band (horizontal) */}
            <rect
              x={margin.left}
              y={scaleY(limitValue + epsilon)}
              width={plotW}
              height={scaleY(limitValue - epsilon) - scaleY(limitValue + epsilon)}
              fill="rgba(255, 107, 107, 0.15)"
              stroke="rgba(255, 107, 107, 0.5)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* Delta band (vertical) */}
            <rect
              x={scaleX(limitPoint - (limitType === 'right' ? 0 : displayDelta))}
              y={margin.top}
              width={
                limitType === 'left' || limitType === 'right'
                  ? scaleX(limitPoint) - scaleX(limitPoint - displayDelta)
                  : scaleX(limitPoint + displayDelta) - scaleX(limitPoint - displayDelta)
              }
              height={plotH}
              fill="rgba(82, 227, 182, 0.15)"
              stroke="rgba(82, 227, 182, 0.5)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

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
              <text
                key={`xlabel-${x}`}
                x={scaleX(x)}
                y={H - margin.bottom + 20}
                fill="rgba(255,255,255,0.6)"
                fontSize={11}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
            {yTicks.map((y) => (
              <text
                key={`ylabel-${y}`}
                x={margin.left - 10}
                y={scaleY(y) + 4}
                fill="rgba(255,255,255,0.6)"
                fontSize={11}
                textAnchor="end"
              >
                {y}
              </text>
            ))}

            {/* Function curve */}
            <path d={curvePath} fill="none" stroke="#3b82f6" strokeWidth={3} />

            {/* Limit point vertical line */}
            <line
              x1={scaleX(limitPoint)}
              y1={margin.top}
              x2={scaleX(limitPoint)}
              y2={H - margin.bottom}
              stroke="#ffd166"
              strokeWidth={2}
              strokeDasharray="4 4"
            />

            {/* Limit value horizontal line */}
            <line
              x1={margin.left}
              y1={scaleY(limitValue)}
              x2={W - margin.right}
              y2={scaleY(limitValue)}
              stroke="#ffd166"
              strokeWidth={2}
              strokeDasharray="4 4"
            />

            {/* Limit point (hollow if undefined) */}
            <circle
              cx={scaleX(limitPoint)}
              cy={scaleY(limitValue)}
              r={8}
              fill="none"
              stroke="#ffd166"
              strokeWidth={3}
            />

            {/* Epsilon labels */}
            <g transform={`translate(${W - margin.right + 5}, ${scaleY(limitValue)})`}>
              <line x1={0} y1={0} x2={10} y2={0} stroke="#ff6b6b" strokeWidth={2} />
              <line
                x1={5}
                y1={scaleY(limitValue + epsilon) - scaleY(limitValue)}
                x2={5}
                y2={scaleY(limitValue - epsilon) - scaleY(limitValue)}
                stroke="#ff6b6b"
                strokeWidth={2}
              />
              <text x={15} y={-5} fill="#ff6b6b" fontSize={12}>
                L+ε
              </text>
              <text
                x={15}
                y={scaleY(limitValue - epsilon) - scaleY(limitValue) + 5}
                fill="#ff6b6b"
                fontSize={12}
              >
                L-ε
              </text>
            </g>

            {/* Delta labels */}
            <text
              x={scaleX(limitPoint - displayDelta)}
              y={H - 5}
              fill="#52e3b6"
              fontSize={11}
              textAnchor="middle"
            >
              a-δ
            </text>
            <text
              x={scaleX(limitPoint + displayDelta)}
              y={H - 5}
              fill="#52e3b6"
              fontSize={11}
              textAnchor="middle"
            >
              a+δ
            </text>

            {/* Info box */}
            <g transform="translate(20, 10)">
              <rect
                x={0}
                y={0}
                width={280}
                height={85}
                rx={8}
                fill="rgba(0,0,0,0.6)"
                stroke={conditionSatisfied ? 'rgba(82, 227, 182, 0.5)' : 'rgba(255, 107, 107, 0.5)'}
                strokeWidth={2}
              />
              <text x={12} y={22} fill="rgba(255,255,255,0.9)" fontSize={12}>
                lim f(x) = {limitValue} quand x → {limitPoint}
              </text>
              <text x={12} y={44} fill="#ff6b6b" fontSize={12}>
                ε = {fmt(epsilon)} (bande horizontale)
              </text>
              <text x={12} y={64} fill="#52e3b6" fontSize={12}>
                δ = {fmt(displayDelta)} (bande verticale)
              </text>
              <text
                x={250}
                y={75}
                fill={conditionSatisfied ? '#52e3b6' : '#ff6b6b'}
                fontSize={16}
                textAnchor="end"
              >
                {conditionSatisfied ? '✓' : '✗'}
              </text>
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#3b82f6]" />
              <span>Courbe f(x)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 bg-[#ff6b6b]/30 border border-[#ff6b6b]" />
              <span>Bande ε (L-ε, L+ε)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 bg-[#52e3b6]/30 border border-[#52e3b6]" />
              <span>Bande δ (a-δ, a+δ)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#ffd166]" />
              <span>Limite L</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-56 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Epsilon (ε)</label>
                <span className="font-mono text-red-400">{fmt(epsilon)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={2}
                step={0.01}
                value={epsilon}
                onChange={(e) => {
                  setAnimating(false)
                  setEpsilon(parseFloat(e.target.value))
                }}
                className="mt-1 w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={autoFindDelta}
                onChange={(e) => setAutoFindDelta(e.target.checked)}
                className="rounded"
              />
              Trouver δ automatiquement
            </label>

            {!autoFindDelta && (
              <div>
                <div className="flex justify-between text-xs text-gray-400">
                  <label>Delta (δ)</label>
                  <span className="font-mono text-green-400">{fmt(delta)}</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={2}
                  step={0.01}
                  value={delta}
                  onChange={(e) => setDelta(parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
            )}

            <hr className="border-gray-700" />

            <div className="flex gap-2">
              <button
                onClick={startAnimation}
                disabled={animating}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600 disabled:opacity-50"
              >
                ▶ ε → 0
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
              >
                ↺
              </button>
            </div>

            <div
              className={`rounded-lg border p-3 text-xs ${
                conditionSatisfied
                  ? 'border-green-700 bg-green-900/30 text-green-300'
                  : 'border-red-700 bg-red-900/30 text-red-300'
              }`}
            >
              <b>Condition {conditionSatisfied ? 'satisfaite' : 'non satisfaite'}</b>
              <br />
              {conditionSatisfied
                ? `Pour tout x tel que 0 < |x-a| < δ, on a |f(x)-L| < ε`
                : `Il existe x tel que 0 < |x-a| < δ mais |f(x)-L| ≥ ε`}
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Définition :</b>
              <br />
              lim f(x) = L signifie :
              <br />
              ∀ε&gt;0, ∃δ&gt;0 tel que
              <br />
              0 &lt; |x-a| &lt; δ ⇒ |f(x)-L| &lt; ε
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
