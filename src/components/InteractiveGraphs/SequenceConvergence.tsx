'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

interface SequenceConvergenceProps {
  /** Expression de la suite u_n en fonction de n */
  formula?: string
  /** Limite de la suite */
  limit?: number
  /** Nombre initial de termes affichés */
  initialTerms?: number
  /** Type de suite */
  sequenceType?: 'explicit' | 'arithmetic' | 'geometric' | 'recursive'
  /** Premier terme (pour suites récursives) */
  u0?: number
  /** Raison (pour suites arithmétiques/géométriques) */
  ratio?: number
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

// Helpers
const fmt = (x: number, n = 4) => {
  if (!isFinite(x)) return '∞'
  if (Math.abs(x) < 1e-10) return '0'
  return x.toFixed(n).replace(/\.?0+$/, '')
}

function parseSequence(expr: string): (n: number) => number {
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/exp/g, 'Math.exp')
    .replace(/log/g, 'Math.log')
    .replace(/ln/g, 'Math.log')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs')
    .replace(/pi/gi, 'Math.PI')
    .replace(/e(?![xp])/g, 'Math.E')

  try {
    return new Function('n', `return ${sanitized}`) as (n: number) => number
  } catch {
    return (n) => 1 / n
  }
}

const PRESET_SEQUENCES = [
  { name: '1/n', formula: '1/n', limit: 0, description: 'Suite classique' },
  { name: '1/n²', formula: '1/(n*n)', limit: 0, description: 'Converge plus vite' },
  { name: '(n+1)/n', formula: '(n+1)/n', limit: 1, description: 'Tend vers 1' },
  { name: 'n/(n+1)', formula: 'n/(n+1)', limit: 1, description: 'Croissante' },
  { name: '(-1)^n/n', formula: '((-1)**n)/n', limit: 0, description: 'Alternée' },
  { name: '(1+1/n)^n', formula: '(1+1/n)**n', limit: Math.E, description: 'Tend vers e' },
  { name: 'sin(n)/n', formula: 'sin(n)/n', limit: 0, description: 'Théorème gendarmes' },
  { name: '√n - √(n-1)', formula: 'sqrt(n) - sqrt(n-1)', limit: 0, description: 'Différence' },
]

export function SequenceConvergence({
  formula = '1/n',
  limit = 0,
  initialTerms = 10,
  title,
  height = 450,
}: SequenceConvergenceProps) {
  const [currentFormula, setCurrentFormula] = useState(formula)
  const [currentLimit, setCurrentLimit] = useState(limit)
  const [numTerms, setNumTerms] = useState(initialTerms)
  const [epsilon, setEpsilon] = useState(0.2)
  const [animating, setAnimating] = useState(false)
  const [highlightN, setHighlightN] = useState<number | null>(null)
  const animRef = useRef<number | null>(null)

  const u = useMemo(() => parseSequence(currentFormula), [currentFormula])

  // Generate sequence terms
  const terms = useMemo(() => {
    const result: { n: number; value: number }[] = []
    for (let n = 1; n <= numTerms; n++) {
      const value = u(n)
      if (isFinite(value)) {
        result.push({ n, value })
      }
    }
    return result
  }, [u, numTerms])

  // Find N0 such that for all n >= N0, |u_n - L| < epsilon
  const N0 = useMemo(() => {
    for (let n = 1; n <= numTerms; n++) {
      let allInside = true
      for (let k = n; k <= Math.min(numTerms, n + 20); k++) {
        if (Math.abs(u(k) - currentLimit) >= epsilon) {
          allInside = false
          break
        }
      }
      if (allInside) return n
    }
    return null
  }, [u, currentLimit, epsilon, numTerms])

  // SVG dimensions
  const W = 700
  const H = 400
  const margin = { top: 40, right: 40, bottom: 50, left: 60 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // Compute domain
  const xMin = 0
  const xMax = numTerms + 1

  // Compute y range
  const yRange = useMemo(() => {
    if (terms.length === 0) return { min: -1, max: 1 }
    const values = terms.map((t) => t.value)
    const min = Math.min(...values, currentLimit - epsilon * 2)
    const max = Math.max(...values, currentLimit + epsilon * 2)
    const padding = (max - min) * 0.1 || 0.5
    return { min: min - padding, max: max + padding }
  }, [terms, currentLimit, epsilon])

  // Scale functions
  const scaleX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW
  const scaleY = (y: number) => margin.top + ((yRange.max - y) / (yRange.max - yRange.min)) * plotH

  // Animation
  useEffect(() => {
    if (animating) {
      let currentN = 1
      const tick = () => {
        currentN++
        if (currentN > numTerms) {
          setAnimating(false)
          setHighlightN(null)
          return
        }
        setHighlightN(currentN)
        animRef.current = setTimeout(() => requestAnimationFrame(tick), 100) as unknown as number
      }
      setHighlightN(1)
      animRef.current = setTimeout(() => requestAnimationFrame(tick), 100) as unknown as number
    }
    return () => {
      if (animRef.current) clearTimeout(animRef.current as unknown as NodeJS.Timeout)
    }
  }, [animating, numTerms])

  const startAnimation = () => {
    setHighlightN(null)
    setAnimating(true)
  }

  const handlePreset = (preset: (typeof PRESET_SEQUENCES)[0]) => {
    setCurrentFormula(preset.formula)
    setCurrentLimit(preset.limit)
    setAnimating(false)
    setHighlightN(null)
  }

  const handleReset = () => {
    setNumTerms(initialTerms)
    setEpsilon(0.2)
    setAnimating(false)
    setHighlightN(null)
  }

  // X axis ticks
  const xTicks = useMemo(() => {
    const step = Math.max(1, Math.floor(numTerms / 10))
    const ticks: number[] = []
    for (let x = step; x <= numTerms; x += step) {
      ticks.push(x)
    }
    return ticks
  }, [numTerms])

  // Y axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const range = yRange.max - yRange.min
    const step = Math.pow(10, Math.floor(Math.log10(range))) / 2
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
            {/* Grid */}
            {xTicks.map((x) => (
              <line
                key={`xgrid-${x}`}
                x1={scaleX(x)}
                y1={margin.top}
                x2={scaleX(x)}
                y2={H - margin.bottom}
                stroke="rgba(255,255,255,0.06)"
              />
            ))}
            {yTicks.map((y, i) => (
              <line
                key={`ygrid-${i}`}
                x1={margin.left}
                y1={scaleY(y)}
                x2={W - margin.right}
                y2={scaleY(y)}
                stroke="rgba(255,255,255,0.06)"
              />
            ))}

            {/* Epsilon band around limit */}
            <rect
              x={margin.left}
              y={scaleY(currentLimit + epsilon)}
              width={plotW}
              height={Math.abs(scaleY(currentLimit - epsilon) - scaleY(currentLimit + epsilon))}
              fill="rgba(82, 227, 182, 0.15)"
              stroke="rgba(82, 227, 182, 0.4)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* Limit line */}
            <line
              x1={margin.left}
              y1={scaleY(currentLimit)}
              x2={W - margin.right}
              y2={scaleY(currentLimit)}
              stroke="#52e3b6"
              strokeWidth={2}
            />
            <text x={W - margin.right + 5} y={scaleY(currentLimit) + 4} fill="#52e3b6" fontSize={12}>
              L = {fmt(currentLimit)}
            </text>

            {/* N0 vertical line */}
            {N0 && (
              <>
                <line
                  x1={scaleX(N0)}
                  y1={margin.top}
                  x2={scaleX(N0)}
                  y2={H - margin.bottom}
                  stroke="#ffd166"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <text x={scaleX(N0)} y={margin.top - 8} fill="#ffd166" fontSize={11} textAnchor="middle">
                  N₀ = {N0}
                </text>
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
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
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
            <text x={W - margin.right} y={H - margin.bottom + 20} fill="rgba(255,255,255,0.6)" fontSize={11}>
              n
            </text>
            {yTicks.map((y, i) => (
              <text key={`ylabel-${i}`} x={margin.left - 10} y={scaleY(y) + 4} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="end">
                {fmt(y, 2)}
              </text>
            ))}

            {/* Sequence points */}
            {terms.map(({ n, value }) => {
              const isInEpsilon = Math.abs(value - currentLimit) < epsilon
              const isHighlighted = highlightN !== null && n <= highlightN
              const isCurrentPoint = n === highlightN

              return (
                <g key={n}>
                  {/* Vertical line from axis to point */}
                  {isCurrentPoint && (
                    <line
                      x1={scaleX(n)}
                      y1={scaleY(0)}
                      x2={scaleX(n)}
                      y2={scaleY(value)}
                      stroke="rgba(255,255,255,0.2)"
                      strokeDasharray="2 2"
                    />
                  )}
                  <circle
                    cx={scaleX(n)}
                    cy={scaleY(value)}
                    r={isCurrentPoint ? 8 : isHighlighted || highlightN === null ? 5 : 3}
                    fill={isInEpsilon ? '#52e3b6' : '#ff6b6b'}
                    opacity={highlightN === null || isHighlighted ? 1 : 0.3}
                    stroke={isCurrentPoint ? 'white' : 'none'}
                    strokeWidth={2}
                  />
                  {isCurrentPoint && (
                    <text x={scaleX(n) + 10} y={scaleY(value) - 10} fill="white" fontSize={11}>
                      u_{n} = {fmt(value)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Info box */}
            <g transform="translate(20, 10)">
              <rect x={0} y={0} width={180} height={75} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={12} y={22} fill="rgba(255,255,255,0.9)" fontSize={12}>
                u_n = {currentFormula}
              </text>
              <text x={12} y={44} fill="#52e3b6" fontSize={12}>
                Limite L = {fmt(currentLimit)}
              </text>
              <text x={12} y={64} fill="#ffd166" fontSize={11}>
                ε = {fmt(epsilon)} {N0 ? `→ N₀ = ${N0}` : ''}
              </text>
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#52e3b6]" />
              <span>|u_n - L| &lt; ε</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span>|u_n - L| ≥ ε</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 border-2 border-[#52e3b6] bg-[#52e3b6]/20" />
              <span>Tube ε</span>
            </div>
            {N0 && (
              <div className="flex items-center gap-1">
                <span className="inline-block h-3 w-0.5 bg-[#ffd166]" />
                <span>Rang N₀</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Nombre de termes</label>
                <span className="font-mono text-blue-400">{numTerms}</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={numTerms}
                onChange={(e) => setNumTerms(parseInt(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Epsilon (ε)</label>
                <span className="font-mono text-green-400">{fmt(epsilon)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={1}
                step={0.01}
                value={epsilon}
                onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            <div>
              <label className="mb-2 block text-xs text-gray-400">Suites prédéfinies</label>
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                {PRESET_SEQUENCES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePreset(preset)}
                    className={`rounded px-2 py-1 text-xs ${
                      currentFormula === preset.formula
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-700" />

            <div className="flex gap-2">
              <button
                onClick={startAnimation}
                disabled={animating}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600 disabled:opacity-50"
              >
                ▶ Animer
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
              >
                ↺
              </button>
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Définition :</b>
              <br />
              (u_n) converge vers L si :
              <br />
              ∀ε&gt;0, ∃N₀ tel que n≥N₀ ⇒ |u_n - L| &lt; ε
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
