'use client'

import { useState, useMemo } from 'react'

interface PascalTriangleProps {
  /** Nombre de lignes initiales */
  initialRows?: number
  /** Titre */
  title?: string
}

// Calculate binomial coefficient
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return Math.round(result)
}

// Calculate factorial
function factorial(n: number): number {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

type HighlightMode = 'none' | 'symmetry' | 'pascal' | 'diagonals' | 'powers2' | 'fibonacci'

export function PascalTriangle({
  initialRows = 8,
  title,
}: PascalTriangleProps) {
  const [numRows, setNumRows] = useState(initialRows)
  const [selectedCell, setSelectedCell] = useState<{ n: number; k: number } | null>(null)
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('none')
  const [showAnimation, setShowAnimation] = useState(false)
  const [animatedRows, setAnimatedRows] = useState(numRows)

  // Generate triangle data
  const triangle = useMemo(() => {
    const rows: number[][] = []
    for (let n = 0; n < numRows; n++) {
      const row: number[] = []
      for (let k = 0; k <= n; k++) {
        row.push(binomial(n, k))
      }
      rows.push(row)
    }
    return rows
  }, [numRows])

  // Animation handler
  const startAnimation = () => {
    setShowAnimation(true)
    setAnimatedRows(0)
    let row = 0
    const interval = setInterval(() => {
      row++
      setAnimatedRows(row)
      if (row >= numRows) {
        clearInterval(interval)
        setShowAnimation(false)
      }
    }, 400)
  }

  // Get cell color based on highlight mode
  const getCellStyle = (n: number, k: number, value: number) => {
    const isSelected = selectedCell?.n === n && selectedCell?.k === k

    if (isSelected) {
      return 'bg-yellow-500 text-black font-bold scale-110'
    }

    switch (highlightMode) {
      case 'symmetry': {
        // Highlight symmetric pairs
        const isLeft = k < n / 2
        const isRight = k > n / 2
        const isCenter = k === n / 2
        if (isCenter) return 'bg-purple-600 text-white'
        if (isLeft) return 'bg-blue-600 text-white'
        if (isRight) return 'bg-blue-400 text-white'
        return 'bg-gray-700 text-gray-200'
      }
      case 'pascal': {
        // Highlight cells that contribute to selected cell
        if (selectedCell) {
          const { n: sn, k: sk } = selectedCell
          if (n === sn - 1 && (k === sk - 1 || k === sk)) {
            return 'bg-green-500 text-white font-bold'
          }
        }
        return 'bg-gray-700 text-gray-200'
      }
      case 'diagonals': {
        // Color by diagonal (k value)
        const colors = [
          'bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
          'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
          'bg-pink-500', 'bg-rose-500'
        ]
        return `${colors[k % colors.length]} text-white`
      }
      case 'powers2': {
        // Highlight if power of 2
        const isPow2 = value > 0 && (value & (value - 1)) === 0
        return isPow2 ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'
      }
      case 'fibonacci': {
        // Highlight Fibonacci diagonal sums
        // Cells where n - k = constant form diagonals that sum to Fibonacci
        const diagIndex = n - k
        const colors = [
          'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500',
          'bg-green-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500',
          'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500'
        ]
        return `${colors[diagIndex % colors.length]} text-white`
      }
      default:
        return 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    }
  }

  // Cell size based on number of rows
  const cellSize = numRows <= 8 ? 44 : numRows <= 10 ? 38 : numRows <= 12 ? 32 : 26
  const fontSize = numRows <= 8 ? 'text-sm' : numRows <= 10 ? 'text-xs' : 'text-[10px]'

  // Calculate row sums
  const rowSums = triangle.map(row => row.reduce((a, b) => a + b, 0))

  // Fibonacci numbers (diagonal sums)
  const fibonacciSums = useMemo(() => {
    const fibs: number[] = []
    for (let d = 0; d < numRows; d++) {
      let sum = 0
      for (let n = d; n < numRows; n++) {
        const k = n - d
        if (k <= n) {
          sum += binomial(n, k)
        }
      }
      fibs.push(sum)
    }
    return fibs
  }, [numRows])

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {title && (
        <h4 className="border-b border-gray-700 px-4 py-3 text-center text-sm font-medium text-gray-200">
          {title}
        </h4>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Triangle */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex flex-col items-center gap-1">
            {triangle.map((row, n) => (
              <div
                key={n}
                className={`flex gap-1 transition-all duration-300 ${
                  showAnimation && n >= animatedRows ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                }`}
              >
                {row.map((value, k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedCell(selectedCell?.n === n && selectedCell?.k === k ? null : { n, k })}
                    className={`flex items-center justify-center rounded transition-all duration-200 ${fontSize} ${getCellStyle(n, k, value)}`}
                    style={{ width: cellSize, height: cellSize, minWidth: cellSize }}
                    title={`C(${n}, ${k}) = ${value}`}
                  >
                    {value}
                  </button>
                ))}
                {/* Row sum */}
                <span className="ml-2 flex items-center text-xs text-gray-500">
                  = {rowSums[n]}
                </span>
              </div>
            ))}
          </div>

          {/* Selected cell info */}
          {selectedCell && (
            <div className="mt-4 rounded-lg border border-yellow-800 bg-yellow-900/30 p-4">
              <div className="mb-2 text-center text-lg font-bold text-yellow-400">
                C({selectedCell.n}, {selectedCell.k}) = {binomial(selectedCell.n, selectedCell.k)}
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="text-gray-400">Formule :</span>{' '}
                  <span className="font-mono">
                    {selectedCell.n}! / ({selectedCell.k}! × {selectedCell.n - selectedCell.k}!)
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Calcul :</span>{' '}
                  <span className="font-mono">
                    {factorial(selectedCell.n)} / ({factorial(selectedCell.k)} × {factorial(selectedCell.n - selectedCell.k)})
                    {' = '}
                    {factorial(selectedCell.n)} / {factorial(selectedCell.k) * factorial(selectedCell.n - selectedCell.k)}
                    {' = '}
                    {binomial(selectedCell.n, selectedCell.k)}
                  </span>
                </p>
                {selectedCell.n > 0 && selectedCell.k > 0 && selectedCell.k < selectedCell.n && (
                  <p className="text-green-400">
                    <span className="text-gray-400">Pascal :</span>{' '}
                    C({selectedCell.n - 1}, {selectedCell.k - 1}) + C({selectedCell.n - 1}, {selectedCell.k})
                    {' = '}
                    {binomial(selectedCell.n - 1, selectedCell.k - 1)} + {binomial(selectedCell.n - 1, selectedCell.k)}
                    {' = '}
                    {binomial(selectedCell.n, selectedCell.k)}
                  </p>
                )}
                <p>
                  <span className="text-gray-400">Symétrie :</span>{' '}
                  C({selectedCell.n}, {selectedCell.k}) = C({selectedCell.n}, {selectedCell.n - selectedCell.k})
                </p>
              </div>
            </div>
          )}

          {/* Properties summary */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-gray-800 p-2">
              <span className="text-gray-400">Somme ligne n :</span>
              <span className="ml-1 text-white">2ⁿ</span>
            </div>
            <div className="rounded bg-gray-800 p-2">
              <span className="text-gray-400">Nombre de lignes :</span>
              <span className="ml-1 text-white">{numRows}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-56 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Contrôles</h5>

          <div className="space-y-4">
            {/* Rows control */}
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Nombre de lignes</label>
                <span className="font-mono">{numRows}</span>
              </div>
              <input
                type="range"
                min={3}
                max={14}
                step={1}
                value={numRows}
                onChange={(e) => setNumRows(parseInt(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            {/* Animation button */}
            <button
              onClick={startAnimation}
              disabled={showAnimation}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500"
            >
              {showAnimation ? 'Animation...' : 'Construire ligne par ligne'}
            </button>

            <hr className="border-gray-700" />

            {/* Highlight modes */}
            <div>
              <label className="mb-2 block text-xs text-gray-400">Mettre en évidence</label>
              <div className="space-y-1">
                {[
                  { mode: 'none' as const, label: 'Aucun' },
                  { mode: 'symmetry' as const, label: 'Symétrie' },
                  { mode: 'pascal' as const, label: 'Relation de Pascal' },
                  { mode: 'diagonals' as const, label: 'Diagonales' },
                  { mode: 'powers2' as const, label: 'Puissances de 2' },
                  { mode: 'fibonacci' as const, label: 'Diag. Fibonacci' },
                ].map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => setHighlightMode(mode)}
                    className={`w-full rounded px-2 py-1 text-left text-xs ${
                      highlightMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
              >
                Désélectionner
              </button>
            )}

            <hr className="border-gray-700" />

            {/* Info */}
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Propriétés :</b>
              <br />• C(n,k) = C(n, n-k)
              <br />• C(n,k) = C(n-1,k-1) + C(n-1,k)
              <br />• Somme ligne n = 2ⁿ
              <br />• Cliquez sur une case
            </div>

            {/* Fibonacci diagonal sums */}
            {highlightMode === 'fibonacci' && (
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
                <b className="text-gray-300">Sommes diagonales :</b>
                <br />
                <span className="font-mono text-green-400">
                  {fibonacciSums.slice(0, 10).join(', ')}...
                </span>
                <br />
                <span className="text-gray-500">= Suite de Fibonacci !</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
        <span>Cliquez sur une case pour voir les détails du coefficient binomial</span>
        {highlightMode === 'pascal' && selectedCell && (
          <span className="text-green-400">Les cases vertes s'additionnent pour donner la case sélectionnée</span>
        )}
      </div>
    </div>
  )
}
