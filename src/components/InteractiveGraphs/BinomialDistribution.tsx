'use client'

import { useState, useMemo } from 'react'

interface BinomialDistributionProps {
  /** Nombre d'épreuves initial */
  initialN?: number
  /** Probabilité de succès initiale */
  initialP?: number
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

// Helpers
const fmt = (x: number, n = 4) => {
  if (Math.abs(x) < 1e-10) return '0'
  return x.toFixed(n).replace(/\.?0+$/, '')
}

// Factorial with memoization
const factorialCache: Record<number, number> = { 0: 1, 1: 1 }
function factorial(n: number): number {
  if (n in factorialCache) return factorialCache[n]
  factorialCache[n] = n * factorial(n - 1)
  return factorialCache[n]
}

// Binomial coefficient C(n, k)
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  // Use smaller k for efficiency
  if (k > n - k) k = n - k
  let result = 1
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return Math.round(result)
}

// P(X = k) for X ~ B(n, p)
function binomialPMF(n: number, p: number, k: number): number {
  return binomial(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

// Cumulative P(X <= k)
function binomialCDF(n: number, p: number, k: number): number {
  let sum = 0
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(n, p, i)
  }
  return sum
}

export function BinomialDistribution({
  initialN = 10,
  initialP = 0.5,
  title,
  height = 450,
}: BinomialDistributionProps) {
  const [n, setN] = useState(initialN)
  const [p, setP] = useState(initialP)
  const [selectedK, setSelectedK] = useState<number | null>(null)
  const [showCumulative, setShowCumulative] = useState(false)
  const [rangeStart, setRangeStart] = useState(0)
  const [rangeEnd, setRangeEnd] = useState(initialN)

  // SVG dimensions
  const W = 700
  const H = 400
  const margin = { top: 40, right: 40, bottom: 60, left: 60 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // Calculate probabilities
  const probabilities = useMemo(() => {
    const probs: { k: number; prob: number; cumProb: number }[] = []
    let cumSum = 0
    for (let k = 0; k <= n; k++) {
      const prob = binomialPMF(n, p, k)
      cumSum += prob
      probs.push({ k, prob, cumProb: cumSum })
    }
    return probs
  }, [n, p])

  // Find max probability for scaling
  const maxProb = useMemo(() => {
    return Math.max(...probabilities.map((d) => d.prob), 0.01)
  }, [probabilities])

  // Statistics
  const mean = n * p
  const variance = n * p * (1 - p)
  const stdDev = Math.sqrt(variance)

  // Range probability
  const rangeProb = useMemo(() => {
    let sum = 0
    for (let k = rangeStart; k <= Math.min(rangeEnd, n); k++) {
      sum += binomialPMF(n, p, k)
    }
    return sum
  }, [n, p, rangeStart, rangeEnd])

  // Scale functions
  const barWidth = Math.max(8, Math.min(30, plotW / (n + 2)))
  const gap = Math.max(2, barWidth * 0.2)
  const totalBarSpace = (barWidth + gap) * (n + 1)
  const startX = margin.left + (plotW - totalBarSpace) / 2

  const scaleX = (k: number) => startX + k * (barWidth + gap) + barWidth / 2
  const scaleY = (prob: number) => margin.top + plotH - (prob / maxProb) * plotH

  // Y axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const step = maxProb > 0.3 ? 0.1 : maxProb > 0.1 ? 0.05 : 0.01
    for (let y = 0; y <= maxProb + step; y += step) {
      if (y <= maxProb * 1.1) ticks.push(y)
    }
    return ticks
  }, [maxProb])

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
            {yTicks.map((y, i) => (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={scaleY(y)}
                  x2={W - margin.right}
                  y2={scaleY(y)}
                  stroke="rgba(255,255,255,0.1)"
                />
                <text
                  x={margin.left - 10}
                  y={scaleY(y) + 4}
                  fill="rgba(255,255,255,0.6)"
                  fontSize={10}
                  textAnchor="end"
                >
                  {fmt(y, 2)}
                </text>
              </g>
            ))}

            {/* X axis */}
            <line
              x1={margin.left}
              y1={margin.top + plotH}
              x2={W - margin.right}
              y2={margin.top + plotH}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />

            {/* Y axis */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + plotH}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />

            {/* Mean line */}
            <line
              x1={scaleX(mean)}
              y1={margin.top}
              x2={scaleX(mean)}
              y2={margin.top + plotH}
              stroke="#52e3b6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <text
              x={scaleX(mean)}
              y={margin.top - 8}
              fill="#52e3b6"
              fontSize={11}
              textAnchor="middle"
            >
              μ = {fmt(mean, 2)}
            </text>

            {/* Bars */}
            {probabilities.map(({ k, prob }) => {
              const isInRange = k >= rangeStart && k <= rangeEnd
              const isSelected = k === selectedK
              const barHeight = (prob / maxProb) * plotH

              return (
                <g key={k}>
                  <rect
                    x={scaleX(k) - barWidth / 2}
                    y={margin.top + plotH - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={isSelected ? '#ffd166' : isInRange ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'}
                    stroke={isSelected ? '#ffd166' : '#3b82f6'}
                    strokeWidth={isSelected ? 2 : 1}
                    rx={2}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setSelectedK(k)}
                    onMouseLeave={() => setSelectedK(null)}
                  />
                  {/* X label */}
                  {(n <= 20 || k % Math.ceil(n / 20) === 0) && (
                    <text
                      x={scaleX(k)}
                      y={margin.top + plotH + 18}
                      fill="rgba(255,255,255,0.7)"
                      fontSize={n > 15 ? 9 : 11}
                      textAnchor="middle"
                    >
                      {k}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Selected bar tooltip */}
            {selectedK !== null && (
              <g transform={`translate(${scaleX(selectedK)}, ${scaleY(probabilities[selectedK].prob) - 10})`}>
                <rect
                  x={-50}
                  y={-35}
                  width={100}
                  height={32}
                  rx={6}
                  fill="rgba(0,0,0,0.85)"
                  stroke="#ffd166"
                />
                <text x={0} y={-18} fill="#ffd166" fontSize={11} textAnchor="middle">
                  P(X = {selectedK}) = {fmt(probabilities[selectedK].prob)}
                </text>
                {showCumulative && (
                  <text x={0} y={-5} fill="rgba(255,255,255,0.7)" fontSize={10} textAnchor="middle">
                    P(X ≤ {selectedK}) = {fmt(probabilities[selectedK].cumProb)}
                  </text>
                )}
              </g>
            )}

            {/* Info box */}
            <g transform="translate(20, 10)">
              <rect x={0} y={0} width={170} height={90} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={12} y={22} fill="rgba(255,255,255,0.9)" fontSize={12}>
                X ~ B({n}, {fmt(p, 2)})
              </text>
              <text x={12} y={42} fill="#52e3b6" fontSize={11}>
                E(X) = μ = {fmt(mean, 2)}
              </text>
              <text x={12} y={58} fill="#ffd166" fontSize={11}>
                V(X) = {fmt(variance, 2)}
              </text>
              <text x={12} y={74} fill="rgba(255,255,255,0.7)" fontSize={11}>
                σ = {fmt(stdDev, 2)}
              </text>
            </g>

            {/* Range probability */}
            <g transform={`translate(${W - 180}, 10)`}>
              <rect x={0} y={0} width={160} height={50} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={12} y={22} fill="#3b82f6" fontSize={11}>
                P({rangeStart} ≤ X ≤ {rangeEnd})
              </text>
              <text x={12} y={42} fill="#3b82f6" fontSize={14} fontWeight="bold">
                = {fmt(rangeProb * 100, 2)}%
              </text>
            </g>

            {/* Axis labels */}
            <text
              x={W / 2}
              y={H - 10}
              fill="rgba(255,255,255,0.7)"
              fontSize={12}
              textAnchor="middle"
            >
              k (nombre de succès)
            </text>
            <text
              x={15}
              y={margin.top + plotH / 2}
              fill="rgba(255,255,255,0.7)"
              fontSize={12}
              textAnchor="middle"
              transform={`rotate(-90, 15, ${margin.top + plotH / 2})`}
            >
              P(X = k)
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-[#3b82f6]" />
              <span>P(X = k) dans l'intervalle</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-0.5 bg-[#52e3b6]" />
              <span>Espérance μ = np</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-[#ffd166]" />
              <span>Valeur sélectionnée</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>n (épreuves)</label>
                <span className="font-mono text-blue-400">{n}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={n}
                onChange={(e) => {
                  const newN = parseInt(e.target.value)
                  setN(newN)
                  setRangeEnd(Math.min(rangeEnd, newN))
                }}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>p (probabilité)</label>
                <span className="font-mono text-green-400">{fmt(p, 2)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.99}
                step={0.01}
                value={p}
                onChange={(e) => setP(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            <div>
              <label className="mb-2 block text-xs text-gray-400">Intervalle P(a ≤ X ≤ b)</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={rangeEnd}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded bg-gray-700 px-2 py-1 text-xs text-white"
                  />
                </div>
                <span className="text-gray-400">à</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min={rangeStart}
                    max={n}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(Math.min(n, parseInt(e.target.value) || n))}
                    className="w-full rounded bg-gray-700 px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showCumulative}
                onChange={(e) => setShowCumulative(e.target.checked)}
                className="rounded"
              />
              Afficher P(X ≤ k)
            </label>

            <hr className="border-gray-700" />

            {/* Quick presets */}
            <div>
              <label className="mb-2 block text-xs text-gray-400">Exemples</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => { setN(10); setP(0.5); setRangeStart(0); setRangeEnd(10); }}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                >
                  Pièce ×10
                </button>
                <button
                  onClick={() => { setN(6); setP(1/6); setRangeStart(0); setRangeEnd(6); }}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                >
                  Dé ×6
                </button>
                <button
                  onClick={() => { setN(20); setP(0.3); setRangeStart(0); setRangeEnd(20); }}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                >
                  QCM 20q
                </button>
                <button
                  onClick={() => { setN(100); setP(0.5); setRangeStart(40); setRangeEnd(60); }}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                >
                  n=100
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Formule :</b>
              <br />
              P(X = k) = C(n,k) × p^k × (1-p)^(n-k)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
