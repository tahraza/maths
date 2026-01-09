'use client'

import { useState, useMemo } from 'react'

interface NormalDistributionProps {
  /** Moyenne initiale */
  initialMu?: number
  /** Écart-type initial */
  initialSigma?: number
  /** Afficher la règle 68-95-99.7 */
  showEmpiricalRule?: boolean
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

// Standard normal PDF
function phi(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

// Normal PDF with parameters
function normalPDF(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma
  return phi(z) / sigma
}

// Cumulative distribution function (approximation)
function normalCDF(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma
  // Approximation using error function
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}

// Probability between a and b
function normalProb(a: number, b: number, mu: number, sigma: number): number {
  return normalCDF(b, mu, sigma) - normalCDF(a, mu, sigma)
}

export function NormalDistribution({
  initialMu = 0,
  initialSigma = 1,
  showEmpiricalRule = true,
  title,
  height = 450,
}: NormalDistributionProps) {
  const [mu, setMu] = useState(initialMu)
  const [sigma, setSigma] = useState(initialSigma)
  const [rangeA, setRangeA] = useState(-1)
  const [rangeB, setRangeB] = useState(1)
  const [showStandardization, setShowStandardization] = useState(false)
  const [highlightRule, setHighlightRule] = useState<1 | 2 | 3 | null>(null)

  // SVG dimensions
  const W = 700
  const H = 400
  const margin = { top: 40, right: 40, bottom: 60, left: 60 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // X domain: mu ± 4*sigma
  const xMin = mu - 4 * sigma
  const xMax = mu + 4 * sigma
  const yMax = normalPDF(mu, mu, sigma) * 1.1

  // Scale functions
  const scaleX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW
  const scaleY = (y: number) => margin.top + plotH - (y / yMax) * plotH

  // Probability calculation
  const probability = useMemo(() => normalProb(rangeA, rangeB, mu, sigma), [rangeA, rangeB, mu, sigma])

  // Standardized values
  const zA = (rangeA - mu) / sigma
  const zB = (rangeB - mu) / sigma

  // Generate curve path
  const curvePath = useMemo(() => {
    const points: string[] = []
    const steps = 200
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      const y = normalPDF(x, mu, sigma)
      points.push(`${i === 0 ? 'M' : 'L'} ${scaleX(x)} ${scaleY(y)}`)
    }
    return points.join(' ')
  }, [mu, sigma, xMin, xMax, scaleX, scaleY])

  // Generate filled area path
  const areaPath = useMemo(() => {
    const points: string[] = []
    const steps = 100
    const a = Math.max(rangeA, xMin)
    const b = Math.min(rangeB, xMax)

    points.push(`M ${scaleX(a)} ${scaleY(0)}`)
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a)
      const y = normalPDF(x, mu, sigma)
      points.push(`L ${scaleX(x)} ${scaleY(y)}`)
    }
    points.push(`L ${scaleX(b)} ${scaleY(0)}`)
    points.push('Z')

    return points.join(' ')
  }, [mu, sigma, rangeA, rangeB, xMin, xMax, scaleX, scaleY])

  // Empirical rule areas
  const empiricalAreas = useMemo(() => {
    if (!showEmpiricalRule || highlightRule === null) return []

    const sigmas = highlightRule
    const a = mu - sigmas * sigma
    const b = mu + sigmas * sigma
    const points: string[] = []
    const steps = 100

    points.push(`M ${scaleX(a)} ${scaleY(0)}`)
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a)
      const y = normalPDF(x, mu, sigma)
      points.push(`L ${scaleX(x)} ${scaleY(y)}`)
    }
    points.push(`L ${scaleX(b)} ${scaleY(0)}`)
    points.push('Z')

    return points.join(' ')
  }, [mu, sigma, showEmpiricalRule, highlightRule, scaleX, scaleY])

  // X axis ticks
  const xTicks = useMemo(() => {
    const ticks: { value: number; label: string }[] = []
    for (let i = -3; i <= 3; i++) {
      const value = mu + i * sigma
      ticks.push({
        value,
        label: i === 0 ? `μ=${fmt(mu, 1)}` : `${i > 0 ? '+' : ''}${i}σ`,
      })
    }
    return ticks
  }, [mu, sigma])

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
            {/* Grid lines at sigma intervals */}
            {xTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={scaleX(tick.value)}
                y1={margin.top}
                x2={scaleX(tick.value)}
                y2={H - margin.bottom}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray={tick.value === mu ? 'none' : '4 4'}
              />
            ))}

            {/* Empirical rule highlight */}
            {empiricalAreas && (
              <path
                d={empiricalAreas}
                fill={
                  highlightRule === 1
                    ? 'rgba(82, 227, 182, 0.3)'
                    : highlightRule === 2
                      ? 'rgba(255, 209, 102, 0.3)'
                      : 'rgba(255, 107, 107, 0.3)'
                }
              />
            )}

            {/* Filled area for P(a < X < b) */}
            <path d={areaPath} fill="rgba(59, 130, 246, 0.4)" />

            {/* Normal curve */}
            <path d={curvePath} fill="none" stroke="#3b82f6" strokeWidth={3} />

            {/* Mean line */}
            <line
              x1={scaleX(mu)}
              y1={margin.top}
              x2={scaleX(mu)}
              y2={H - margin.bottom}
              stroke="#52e3b6"
              strokeWidth={2}
            />

            {/* Range bounds */}
            <line
              x1={scaleX(rangeA)}
              y1={margin.top}
              x2={scaleX(rangeA)}
              y2={H - margin.bottom}
              stroke="#ff6b6b"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <line
              x1={scaleX(rangeB)}
              y1={margin.top}
              x2={scaleX(rangeB)}
              y2={H - margin.bottom}
              stroke="#ff6b6b"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* X axis */}
            <line
              x1={margin.left}
              y1={H - margin.bottom}
              x2={W - margin.right}
              y2={H - margin.bottom}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1.5}
            />

            {/* X axis labels */}
            {xTicks.map((tick, i) => (
              <g key={`label-${i}`}>
                <line
                  x1={scaleX(tick.value)}
                  y1={H - margin.bottom}
                  x2={scaleX(tick.value)}
                  y2={H - margin.bottom + 5}
                  stroke="rgba(255,255,255,0.5)"
                />
                <text
                  x={scaleX(tick.value)}
                  y={H - margin.bottom + 20}
                  fill="rgba(255,255,255,0.7)"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {tick.label}
                </text>
                <text
                  x={scaleX(tick.value)}
                  y={H - margin.bottom + 35}
                  fill="rgba(255,255,255,0.5)"
                  fontSize={9}
                  textAnchor="middle"
                >
                  {fmt(tick.value, 1)}
                </text>
              </g>
            ))}

            {/* Y axis */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={H - margin.bottom}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1.5}
            />

            {/* Info box */}
            <g transform="translate(20, 10)">
              <rect x={0} y={0} width={200} height={100} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={12} y={22} fill="rgba(255,255,255,0.9)" fontSize={12}>
                X ~ N(μ={fmt(mu)}, σ={fmt(sigma)})
              </text>
              <text x={12} y={46} fill="#3b82f6" fontSize={13} fontWeight="bold">
                P({fmt(rangeA)} &lt; X &lt; {fmt(rangeB)})
              </text>
              <text x={12} y={68} fill="#3b82f6" fontSize={16} fontWeight="bold">
                = {fmt(probability * 100, 2)}%
              </text>
              {showStandardization && (
                <text x={12} y={90} fill="rgba(255,255,255,0.6)" fontSize={10}>
                  Z ∈ [{fmt(zA)}, {fmt(zB)}]
                </text>
              )}
            </g>

            {/* Range labels */}
            <text x={scaleX(rangeA)} y={margin.top - 8} fill="#ff6b6b" fontSize={11} textAnchor="middle">
              a = {fmt(rangeA)}
            </text>
            <text x={scaleX(rangeB)} y={margin.top - 8} fill="#ff6b6b" fontSize={11} textAnchor="middle">
              b = {fmt(rangeB)}
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#3b82f6]" />
              <span>Courbe de Gauss</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 bg-[#3b82f6]/40" />
              <span>P(a &lt; X &lt; b)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-0.5 bg-[#52e3b6]" />
              <span>Moyenne μ</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Moyenne (μ)</label>
                <span className="font-mono text-green-400">{fmt(mu)}</span>
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.1}
                value={mu}
                onChange={(e) => setMu(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Écart-type (σ)</label>
                <span className="font-mono text-yellow-400">{fmt(sigma)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.1}
                value={sigma}
                onChange={(e) => setSigma(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Borne a</label>
                <span className="font-mono text-red-400">{fmt(rangeA)}</span>
              </div>
              <input
                type="range"
                min={mu - 4 * sigma}
                max={rangeB - 0.1}
                step={0.1}
                value={rangeA}
                onChange={(e) => setRangeA(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Borne b</label>
                <span className="font-mono text-red-400">{fmt(rangeB)}</span>
              </div>
              <input
                type="range"
                min={rangeA + 0.1}
                max={mu + 4 * sigma}
                step={0.1}
                value={rangeB}
                onChange={(e) => setRangeB(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            {showEmpiricalRule && (
              <div>
                <label className="mb-2 block text-xs text-gray-400">Règle 68-95-99.7</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => {
                      setHighlightRule(highlightRule === 1 ? null : 1)
                      if (highlightRule !== 1) {
                        setRangeA(mu - sigma)
                        setRangeB(mu + sigma)
                      }
                    }}
                    className={`rounded px-2 py-1 text-xs ${
                      highlightRule === 1 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ±1σ
                  </button>
                  <button
                    onClick={() => {
                      setHighlightRule(highlightRule === 2 ? null : 2)
                      if (highlightRule !== 2) {
                        setRangeA(mu - 2 * sigma)
                        setRangeB(mu + 2 * sigma)
                      }
                    }}
                    className={`rounded px-2 py-1 text-xs ${
                      highlightRule === 2 ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ±2σ
                  </button>
                  <button
                    onClick={() => {
                      setHighlightRule(highlightRule === 3 ? null : 3)
                      if (highlightRule !== 3) {
                        setRangeA(mu - 3 * sigma)
                        setRangeB(mu + 3 * sigma)
                      }
                    }}
                    className={`rounded px-2 py-1 text-xs ${
                      highlightRule === 3 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ±3σ
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span className="text-green-400">±1σ:</span>
                    <span>≈ 68.27%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">±2σ:</span>
                    <span>≈ 95.45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">±3σ:</span>
                    <span>≈ 99.73%</span>
                  </div>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showStandardization}
                onChange={(e) => setShowStandardization(e.target.checked)}
                className="rounded"
              />
              Afficher Z (centré-réduit)
            </label>

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Formule :</b>
              <br />
              <span className="text-blue-400">Z = (X - μ) / σ</span>
              <br />
              Z suit une loi N(0, 1)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
