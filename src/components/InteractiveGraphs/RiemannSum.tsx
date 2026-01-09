'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

interface RiemannSumProps {
  /** Fonction à intégrer (expression) */
  fn?: string
  /** Borne inférieure */
  initialA?: number
  /** Borne supérieure */
  initialB?: number
  /** Nombre initial de rectangles */
  initialRectangles?: number
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

type SumType = 'left' | 'right' | 'midpoint' | 'trapezoid'

// Helpers
const fmt = (x: number, n = 4) => {
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

// Numerical integral (exact value approximation)
function numericalIntegral(f: (x: number) => number, a: number, b: number, n: number = 10000): number {
  const h = (b - a) / n
  let sum = (f(a) + f(b)) / 2
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h)
  }
  return sum * h
}

// Riemann sum calculation
function riemannSum(f: (x: number) => number, a: number, b: number, n: number, type: SumType): number {
  const dx = (b - a) / n
  let sum = 0

  for (let i = 0; i < n; i++) {
    let x: number
    switch (type) {
      case 'left':
        x = a + i * dx
        sum += f(x) * dx
        break
      case 'right':
        x = a + (i + 1) * dx
        sum += f(x) * dx
        break
      case 'midpoint':
        x = a + (i + 0.5) * dx
        sum += f(x) * dx
        break
      case 'trapezoid':
        const x1 = a + i * dx
        const x2 = a + (i + 1) * dx
        sum += ((f(x1) + f(x2)) / 2) * dx
        break
    }
  }
  return sum
}

const SUM_TYPES: { value: SumType; label: string; description: string }[] = [
  { value: 'left', label: 'Gauche', description: 'Rectangles à gauche' },
  { value: 'right', label: 'Droite', description: 'Rectangles à droite' },
  { value: 'midpoint', label: 'Milieu', description: 'Point milieu' },
  { value: 'trapezoid', label: 'Trapèzes', description: 'Méthode des trapèzes' },
]

export function RiemannSum({
  fn = 'x^2',
  initialA = 0,
  initialB = 2,
  initialRectangles = 5,
  title,
  height = 400,
}: RiemannSumProps) {
  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)
  const [numRects, setNumRects] = useState(initialRectangles)
  const [sumType, setSumType] = useState<SumType>('left')
  const [animating, setAnimating] = useState(false)
  const [showConvergence, setShowConvergence] = useState(false)
  const animRef = useRef<number | null>(null)

  const f = useMemo(() => parseFunction(fn), [fn])

  // SVG dimensions
  const W = 700
  const H = 400
  const margin = { top: 30, right: 30, bottom: 50, left: 50 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // Compute domain
  const xMin = Math.min(a, b) - 0.5
  const xMax = Math.max(a, b) + 0.5

  // Sample function to find y range
  const yRange = useMemo(() => {
    let yMin = 0
    let yMax = 0
    for (let x = xMin; x <= xMax; x += 0.01) {
      const y = f(x)
      if (isFinite(y)) {
        yMin = Math.min(yMin, y)
        yMax = Math.max(yMax, y)
      }
    }
    const padding = (yMax - yMin) * 0.1 || 1
    return { min: yMin - padding, max: yMax + padding }
  }, [f, xMin, xMax])

  // Scale functions
  const scaleX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW
  const scaleY = (y: number) => margin.top + ((yRange.max - y) / (yRange.max - yRange.min)) * plotH

  // Calculate values
  const exactValue = useMemo(() => numericalIntegral(f, a, b), [f, a, b])
  const approxValue = useMemo(() => riemannSum(f, a, b, numRects, sumType), [f, a, b, numRects, sumType])
  const error = Math.abs(exactValue - approxValue)
  const errorPercent = exactValue !== 0 ? (error / Math.abs(exactValue)) * 100 : 0

  // Generate curve path
  const curvePath = useMemo(() => {
    const points: string[] = []
    const steps = 200
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      const y = f(x)
      if (isFinite(y)) {
        points.push(`${i === 0 ? 'M' : 'L'} ${scaleX(x)} ${scaleY(y)}`)
      }
    }
    return points.join(' ')
  }, [f, xMin, xMax, scaleX, scaleY])

  // Generate rectangles/trapezoids
  const shapes = useMemo(() => {
    const result: { path: string; sampleX: number; sampleY: number }[] = []
    const dx = (b - a) / numRects

    for (let i = 0; i < numRects; i++) {
      const x1 = a + i * dx
      const x2 = a + (i + 1) * dx
      let path: string
      let sampleX: number
      let sampleY: number

      switch (sumType) {
        case 'left':
          sampleX = x1
          sampleY = f(x1)
          path = `M ${scaleX(x1)} ${scaleY(0)} L ${scaleX(x1)} ${scaleY(sampleY)} L ${scaleX(x2)} ${scaleY(sampleY)} L ${scaleX(x2)} ${scaleY(0)} Z`
          break
        case 'right':
          sampleX = x2
          sampleY = f(x2)
          path = `M ${scaleX(x1)} ${scaleY(0)} L ${scaleX(x1)} ${scaleY(sampleY)} L ${scaleX(x2)} ${scaleY(sampleY)} L ${scaleX(x2)} ${scaleY(0)} Z`
          break
        case 'midpoint':
          sampleX = (x1 + x2) / 2
          sampleY = f(sampleX)
          path = `M ${scaleX(x1)} ${scaleY(0)} L ${scaleX(x1)} ${scaleY(sampleY)} L ${scaleX(x2)} ${scaleY(sampleY)} L ${scaleX(x2)} ${scaleY(0)} Z`
          break
        case 'trapezoid':
          sampleX = (x1 + x2) / 2
          sampleY = (f(x1) + f(x2)) / 2
          path = `M ${scaleX(x1)} ${scaleY(0)} L ${scaleX(x1)} ${scaleY(f(x1))} L ${scaleX(x2)} ${scaleY(f(x2))} L ${scaleX(x2)} ${scaleY(0)} Z`
          break
      }

      result.push({ path, sampleX, sampleY })
    }
    return result
  }, [f, a, b, numRects, sumType, scaleX, scaleY])

  // Convergence data
  const convergenceData = useMemo(() => {
    if (!showConvergence) return []
    const data: { n: number; value: number; error: number }[] = []
    for (let n = 1; n <= 100; n += (n < 20 ? 1 : 5)) {
      const value = riemannSum(f, a, b, n, sumType)
      data.push({ n, value, error: Math.abs(exactValue - value) })
    }
    return data
  }, [f, a, b, sumType, exactValue, showConvergence])

  // Animation
  useEffect(() => {
    if (animating) {
      const tick = () => {
        setNumRects((prev) => {
          if (prev >= 100) {
            setAnimating(false)
            return 100
          }
          return prev + 1
        })
        animRef.current = requestAnimationFrame(tick)
      }
      const timeout = setTimeout(() => {
        animRef.current = requestAnimationFrame(tick)
      }, 50)
      return () => {
        clearTimeout(timeout)
        if (animRef.current) cancelAnimationFrame(animRef.current)
      }
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [animating])

  const startAnimation = () => {
    setNumRects(1)
    setAnimating(true)
  }

  const handleReset = () => {
    setNumRects(initialRectangles)
    setAnimating(false)
  }

  // Axis ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = []
    const step = Math.ceil((xMax - xMin) / 5)
    for (let x = Math.ceil(xMin); x <= xMax; x += step) {
      ticks.push(x)
    }
    return ticks
  }, [xMin, xMax])

  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const range = yRange.max - yRange.min
    const step = Math.pow(10, Math.floor(Math.log10(range))) / 2
    for (let y = Math.ceil(yRange.min / step) * step; y <= yRange.max; y += step) {
      ticks.push(y)
    }
    return ticks.slice(0, 6)
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
                stroke="rgba(255,255,255,0.1)"
              />
            ))}
            {yTicks.map((y) => (
              <line
                key={`ygrid-${y}`}
                x1={margin.left}
                y1={scaleY(y)}
                x2={W - margin.right}
                y2={scaleY(y)}
                stroke="rgba(255,255,255,0.1)"
              />
            ))}

            {/* X axis */}
            <line
              x1={margin.left}
              y1={scaleY(0)}
              x2={W - margin.right}
              y2={scaleY(0)}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1.5}
            />
            {/* Y axis */}
            <line
              x1={scaleX(0)}
              y1={margin.top}
              x2={scaleX(0)}
              y2={H - margin.bottom}
              stroke="rgba(255,255,255,0.5)"
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
                {fmt(y, 1)}
              </text>
            ))}

            {/* Rectangles/Trapezoids */}
            {shapes.map((shape, i) => (
              <g key={i}>
                <path
                  d={shape.path}
                  fill="rgba(251, 191, 36, 0.4)"
                  stroke="rgba(251, 191, 36, 0.8)"
                  strokeWidth={1}
                />
                {numRects <= 15 && sumType !== 'trapezoid' && (
                  <circle
                    cx={scaleX(shape.sampleX)}
                    cy={scaleY(shape.sampleY)}
                    r={4}
                    fill="#fbbf24"
                  />
                )}
              </g>
            ))}

            {/* Function curve */}
            <path d={curvePath} fill="none" stroke="#3b82f6" strokeWidth={3} />

            {/* Bound lines */}
            <line
              x1={scaleX(a)}
              y1={margin.top}
              x2={scaleX(a)}
              y2={H - margin.bottom}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <line
              x1={scaleX(b)}
              y1={margin.top}
              x2={scaleX(b)}
              y2={H - margin.bottom}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* Labels */}
            <text x={scaleX(a)} y={H - 10} fill="#3b82f6" fontSize={14} textAnchor="middle" fontWeight="bold">
              a = {a}
            </text>
            <text x={scaleX(b)} y={H - 10} fill="#ef4444" fontSize={14} textAnchor="middle" fontWeight="bold">
              b = {b}
            </text>

            {/* Results box */}
            <g transform="translate(20, 10)">
              <rect x={0} y={0} width={200} height={95} rx={8} fill="rgba(0,0,0,0.5)" />
              <text x={10} y={22} fill="#3b82f6" fontSize={12}>
                f(x) = {fn}
              </text>
              <text x={10} y={42} fill="rgba(255,255,255,0.9)" fontSize={12}>
                Intégrale exacte ≈ {fmt(exactValue)}
              </text>
              <text x={10} y={62} fill="#fbbf24" fontSize={12}>
                Somme ({numRects} rect.) = {fmt(approxValue)}
              </text>
              <text x={10} y={82} fill={errorPercent < 5 ? '#52e3b6' : '#ff6b6b'} fontSize={11}>
                Erreur: {fmt(error)} ({fmt(errorPercent, 2)}%)
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
              <span className="inline-block h-3 w-3 bg-[#fbbf24]/50 border border-[#fbbf24]" />
              <span>Rectangles de Riemann</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-0.5 bg-[#3b82f6]" />
              <span>Borne a</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-0.5 bg-[#ef4444]" />
              <span>Borne b</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Borne a</label>
                <span className="font-mono text-blue-400">{a}</span>
              </div>
              <input
                type="range"
                min={-2}
                max={b - 0.5}
                step={0.1}
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Borne b</label>
                <span className="font-mono text-red-400">{b}</span>
              </div>
              <input
                type="range"
                min={a + 0.5}
                max={5}
                step={0.1}
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Nombre de rectangles</label>
                <span className="font-mono text-yellow-400">{numRects}</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={numRects}
                onChange={(e) => {
                  setAnimating(false)
                  setNumRects(parseInt(e.target.value))
                }}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            <div>
              <label className="mb-2 block text-xs text-gray-400">Type de somme</label>
              <div className="grid grid-cols-2 gap-1">
                {SUM_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSumType(type.value)}
                    className={`rounded px-2 py-1.5 text-xs ${
                      sumType === type.value
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={type.description}
                  >
                    {type.label}
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

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showConvergence}
                onChange={(e) => setShowConvergence(e.target.checked)}
                className="rounded"
              />
              Afficher convergence
            </label>

            {showConvergence && convergenceData.length > 0 && (
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-2 text-xs">
                <div className="text-gray-400 mb-1">Convergence vers {fmt(exactValue)}</div>
                <div className="max-h-24 overflow-y-auto space-y-0.5">
                  {convergenceData.slice(0, 10).map((d) => (
                    <div key={d.n} className="flex justify-between text-gray-500">
                      <span>n={d.n}</span>
                      <span className="text-yellow-400">{fmt(d.value, 3)}</span>
                      <span className="text-red-400">±{fmt(d.error, 3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Observation :</b>
              <br />
              Plus le nombre de rectangles augmente, plus la somme converge vers l'intégrale exacte.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
