'use client'

import { useState, useMemo } from 'react'

interface MarkovChainProps {
  /** Matrice de transition initiale (2x2) */
  initialMatrix?: number[][]
  /** Vecteur d'état initial */
  initialState?: number[]
  /** Titre */
  title?: string
  /** Noms des états */
  stateNames?: string[]
}

// Helpers
const fmt = (x: number, n = 3) => {
  if (Math.abs(x) < 1e-10) return '0'
  return x.toFixed(n).replace(/\.?0+$/, '')
}

const frac = (x: number): string => {
  // Essaie de trouver une fraction simple
  const fractions: [number, string][] = [
    [1 / 2, '1/2'],
    [1 / 3, '1/3'],
    [2 / 3, '2/3'],
    [1 / 4, '1/4'],
    [3 / 4, '3/4'],
    [1 / 5, '1/5'],
    [2 / 5, '2/5'],
    [3 / 5, '3/5'],
    [4 / 5, '4/5'],
    [1 / 6, '1/6'],
    [5 / 6, '5/6'],
    [1 / 7, '1/7'],
    [2 / 7, '2/7'],
    [3 / 7, '3/7'],
    [4 / 7, '4/7'],
    [5 / 7, '5/7'],
    [6 / 7, '6/7'],
    [1 / 8, '1/8'],
    [3 / 8, '3/8'],
    [5 / 8, '5/8'],
    [7 / 8, '7/8'],
    [1 / 10, '1/10'],
    [3 / 10, '3/10'],
    [7 / 10, '7/10'],
    [9 / 10, '9/10'],
    [1 / 11, '1/11'],
    [4 / 11, '4/11'],
    [7 / 11, '7/11'],
  ]

  for (const [val, str] of fractions) {
    if (Math.abs(x - val) < 0.0001) return str
  }

  if (Math.abs(x) < 0.0001) return '0'
  if (Math.abs(x - 1) < 0.0001) return '1'

  return fmt(x, 2)
}

// Multiply row vector by matrix
function multiplyRowMatrix(row: number[], matrix: number[][]): number[] {
  const n = matrix.length
  const result: number[] = []
  for (let j = 0; j < n; j++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      sum += row[i] * matrix[i][j]
    }
    result.push(sum)
  }
  return result
}

// Multiply two matrices
function multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const n = a.length
  const result: number[][] = []
  for (let i = 0; i < n; i++) {
    result[i] = []
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += a[i][k] * b[k][j]
      }
      result[i][j] = sum
    }
  }
  return result
}

// Find stable state for 2x2 matrix
function findStableState(matrix: number[][]): number[] | null {
  // For 2x2: π P = π with π1 + π2 = 1
  // p11 * x + p21 * (1-x) = x
  // p11 * x + p21 - p21 * x = x
  // x(p11 - p21 - 1) = -p21
  // x = p21 / (1 - p11 + p21)
  const p11 = matrix[0][0]
  const p21 = matrix[1][0]

  const denom = 1 - p11 + p21
  if (Math.abs(denom) < 0.0001) return null

  const x = p21 / denom
  return [x, 1 - x]
}

const PRESETS = [
  {
    name: 'Bus/Vélo',
    matrix: [
      [0.3, 0.7],
      [0.4, 0.6],
    ],
    states: ['Bus', 'Vélo'],
  },
  {
    name: 'Fumeur',
    matrix: [
      [0.9, 0.1],
      [0.6, 0.4],
    ],
    states: ['Non-fumeur', 'Fumeur'],
  },
  {
    name: 'Météo',
    matrix: [
      [0.8, 0.2],
      [0.4, 0.6],
    ],
    states: ['Soleil', 'Pluie'],
  },
  {
    name: 'Identité',
    matrix: [
      [1, 0],
      [0, 1],
    ],
    states: ['État A', 'État B'],
  },
  {
    name: 'Symétrique',
    matrix: [
      [0.5, 0.5],
      [0.5, 0.5],
    ],
    states: ['État A', 'État B'],
  },
]

export function MarkovChain({
  initialMatrix = [
    [0.3, 0.7],
    [0.4, 0.6],
  ],
  initialState = [1, 0],
  title,
  stateNames = ['État 1', 'État 2'],
}: MarkovChainProps) {
  const [matrix, setMatrix] = useState(initialMatrix)
  const [pi0, setPi0] = useState(initialState)
  const [names, setNames] = useState(stateNames)
  const [selectedStep, setSelectedStep] = useState(0)
  const [showStable, setShowStable] = useState(false)

  // Calculate evolution over time
  const evolution = useMemo(() => {
    const steps: number[][] = [pi0]
    let current = [...pi0]
    for (let i = 0; i < 20; i++) {
      current = multiplyRowMatrix(current, matrix)
      steps.push([...current])
    }
    return steps
  }, [matrix, pi0])

  // Calculate stable state
  const stableState = useMemo(() => findStableState(matrix), [matrix])

  // SVG dimensions
  const W = 400
  const H = 300
  const cx1 = 120
  const cx2 = 280
  const cy = 150
  const r = 40

  // Update matrix coefficient
  const updateMatrix = (i: number, j: number, value: number) => {
    const newMatrix = matrix.map((row) => [...row])
    newMatrix[i][j] = value
    // Ensure row sums to 1
    const otherJ = 1 - j
    newMatrix[i][otherJ] = Math.max(0, Math.min(1, 1 - value))
    setMatrix(newMatrix)
  }

  // Handle preset
  const handlePreset = (preset: (typeof PRESETS)[0]) => {
    setMatrix(preset.matrix.map((row) => [...row]))
    setNames([...preset.states])
    setSelectedStep(0)
  }

  // Current state (based on selected step or stable)
  const currentPi = showStable && stableState ? stableState : evolution[selectedStep]

  // Curve for self-loop
  const selfLoopPath = (cx: number, cy: number, r: number, isLeft: boolean) => {
    const offset = isLeft ? -1 : 1
    const startAngle = isLeft ? Math.PI * 0.7 : Math.PI * 0.3
    const endAngle = isLeft ? Math.PI * 1.3 : -Math.PI * 0.3

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)

    const controlOffset = 60 * offset
    const cpx = cx + controlOffset
    const cpy = cy - 80

    return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`
  }

  // Arrow for curved transition
  const transitionArrow = (
    fromX: number,
    toX: number,
    cy: number,
    r: number,
    isTop: boolean
  ) => {
    const startX = fromX + (toX > fromX ? r : -r)
    const endX = toX + (toX > fromX ? -r : r)
    const curveOffset = isTop ? -50 : 50
    const cpY = cy + curveOffset

    return `M ${startX} ${cy} Q ${(startX + endX) / 2} ${cpY} ${endX} ${cy}`
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {title && (
        <h4 className="border-b border-gray-700 px-4 py-3 text-center text-sm font-medium text-gray-200">
          {title}
        </h4>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Graph */}
        <div className="flex-1 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 300 }}>
            {/* Self-loops */}
            {matrix[0][0] > 0.01 && (
              <g>
                <path
                  d={selfLoopPath(cx1, cy, r, true)}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.7)"
                  strokeWidth={2}
                  markerEnd="url(#arrowBlue)"
                />
                <text
                  x={cx1 - 70}
                  y={cy - 50}
                  fill="rgba(147, 197, 253, 0.9)"
                  fontSize={14}
                  textAnchor="middle"
                >
                  {fmt(matrix[0][0], 2)}
                </text>
              </g>
            )}
            {matrix[1][1] > 0.01 && (
              <g>
                <path
                  d={selfLoopPath(cx2, cy, r, false)}
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.7)"
                  strokeWidth={2}
                  markerEnd="url(#arrowRed)"
                />
                <text
                  x={cx2 + 70}
                  y={cy - 50}
                  fill="rgba(252, 165, 165, 0.9)"
                  fontSize={14}
                  textAnchor="middle"
                >
                  {fmt(matrix[1][1], 2)}
                </text>
              </g>
            )}

            {/* Transition 1 → 2 (top) */}
            {matrix[0][1] > 0.01 && (
              <g>
                <path
                  d={transitionArrow(cx1, cx2, cy, r, true)}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.7)"
                  strokeWidth={2}
                  markerEnd="url(#arrowGreen)"
                />
                <text
                  x={(cx1 + cx2) / 2}
                  y={cy - 60}
                  fill="rgba(110, 231, 183, 0.9)"
                  fontSize={14}
                  textAnchor="middle"
                >
                  {fmt(matrix[0][1], 2)}
                </text>
              </g>
            )}

            {/* Transition 2 → 1 (bottom) */}
            {matrix[1][0] > 0.01 && (
              <g>
                <path
                  d={transitionArrow(cx2, cx1, cy, r, false)}
                  fill="none"
                  stroke="rgba(245, 158, 11, 0.7)"
                  strokeWidth={2}
                  markerEnd="url(#arrowYellow)"
                />
                <text
                  x={(cx1 + cx2) / 2}
                  y={cy + 75}
                  fill="rgba(252, 211, 77, 0.9)"
                  fontSize={14}
                  textAnchor="middle"
                >
                  {fmt(matrix[1][0], 2)}
                </text>
              </g>
            )}

            {/* State nodes */}
            <circle
              cx={cx1}
              cy={cy}
              r={r}
              fill={`rgba(59, 130, 246, ${0.3 + currentPi[0] * 0.6})`}
              stroke="rgb(59, 130, 246)"
              strokeWidth={3}
            />
            <text x={cx1} y={cy + 5} fill="white" fontSize={14} textAnchor="middle">
              {names[0]}
            </text>
            <text x={cx1} y={cy + 22} fill="rgba(255,255,255,0.7)" fontSize={11} textAnchor="middle">
              {frac(currentPi[0])}
            </text>

            <circle
              cx={cx2}
              cy={cy}
              r={r}
              fill={`rgba(239, 68, 68, ${0.3 + currentPi[1] * 0.6})`}
              stroke="rgb(239, 68, 68)"
              strokeWidth={3}
            />
            <text x={cx2} y={cy + 5} fill="white" fontSize={14} textAnchor="middle">
              {names[1]}
            </text>
            <text x={cx2} y={cy + 22} fill="rgba(255,255,255,0.7)" fontSize={11} textAnchor="middle">
              {frac(currentPi[1])}
            </text>

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowBlue"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(59, 130, 246, 0.7)" />
              </marker>
              <marker
                id="arrowRed"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(239, 68, 68, 0.7)" />
              </marker>
              <marker
                id="arrowGreen"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(16, 185, 129, 0.7)" />
              </marker>
              <marker
                id="arrowYellow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(245, 158, 11, 0.7)" />
              </marker>
            </defs>
          </svg>

          {/* Evolution display */}
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {showStable ? 'État stable π' : `Étape n = ${selectedStep}`}
              </span>
              <span className="font-mono text-sm text-gray-200">
                π = ({frac(currentPi[0])}, {frac(currentPi[1])})
              </span>
            </div>

            <div className="flex gap-2">
              <div
                className="h-6 rounded bg-blue-600 transition-all"
                style={{ width: `${currentPi[0] * 100}%` }}
              />
              <div
                className="h-6 rounded bg-red-600 transition-all"
                style={{ width: `${currentPi[1] * 100}%` }}
              />
            </div>
          </div>

          {/* Matrix display */}
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">Matrice P = </span>
            <span className="ml-2 font-mono text-sm text-gray-200">
              ⎛ {fmt(matrix[0][0], 2)}  {fmt(matrix[0][1], 2)} ⎞
              <br />
              <span className="ml-[70px]">⎝ {fmt(matrix[1][0], 2)}  {fmt(matrix[1][1], 2)} ⎠</span>
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-64 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Contrôles</h5>

          <div className="space-y-4">
            {/* Time slider */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Étape n</label>
                <button
                  onClick={() => setShowStable(!showStable)}
                  className={`ml-auto rounded px-2 py-1 text-xs ${
                    showStable ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {showStable ? 'État stable' : 'Voir stable'}
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={selectedStep}
                onChange={(e) => {
                  setSelectedStep(parseInt(e.target.value))
                  setShowStable(false)
                }}
                className="mt-1 w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>20</span>
              </div>
            </div>

            {/* Initial state */}
            <div>
              <label className="mb-1 block text-xs text-gray-400">État initial π₀</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPi0([1, 0])}
                  className={`flex-1 rounded px-2 py-1 text-xs ${
                    pi0[0] === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  (1, 0)
                </button>
                <button
                  onClick={() => setPi0([0, 1])}
                  className={`flex-1 rounded px-2 py-1 text-xs ${
                    pi0[1] === 1 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  (0, 1)
                </button>
                <button
                  onClick={() => setPi0([0.5, 0.5])}
                  className={`flex-1 rounded px-2 py-1 text-xs ${
                    pi0[0] === 0.5 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  (½, ½)
                </button>
              </div>
            </div>

            <hr className="border-gray-700" />

            {/* Matrix controls */}
            <div>
              <label className="mb-2 block text-xs text-gray-400">Matrice de transition</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-blue-400">p₁₁</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={matrix[0][0]}
                    onChange={(e) => updateMatrix(0, 0, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{fmt(matrix[0][0], 2)}</span>
                </div>
                <div>
                  <span className="text-xs text-red-400">p₂₂</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={matrix[1][1]}
                    onChange={(e) => updateMatrix(1, 1, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{fmt(matrix[1][1], 2)}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-700" />

            {/* Presets */}
            <div>
              <label className="mb-2 block text-xs text-gray-400">Exemples</label>
              <div className="grid grid-cols-2 gap-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePreset(preset)}
                    className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stable state info */}
            {stableState && (
              <div className="rounded-lg border border-green-800 bg-green-900/30 p-3 text-xs text-gray-300">
                <b className="text-green-400">État stable :</b>
                <br />π = ({frac(stableState[0])}, {frac(stableState[1])})
                <br />
                <span className="text-gray-500">
                  ≈ ({fmt(stableState[0] * 100, 1)}%, {fmt(stableState[1] * 100, 1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          <span>{names[0]}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
          <span>{names[1]}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-green-500" />
          <span>Transition 1→2</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-yellow-500" />
          <span>Transition 2→1</span>
        </div>
      </div>
    </div>
  )
}
