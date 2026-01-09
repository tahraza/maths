'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'

interface SieveOfEratosthenesProps {
  /** Nombre maximum (défaut: 100) */
  maxNumber?: number
  /** Titre */
  title?: string
}

type CellState = 'untouched' | 'prime' | 'crossed' | 'current' | 'being-crossed'

interface SieveState {
  cells: CellState[]
  currentPrime: number | null
  currentMultiple: number | null
  phase: 'waiting' | 'marking-prime' | 'crossing-multiples' | 'done'
  primes: number[]
  step: number
}

function initSieve(max: number): SieveState {
  const cells: CellState[] = new Array(max + 1).fill('untouched')
  cells[0] = 'crossed' // 0 n'est pas premier
  cells[1] = 'crossed' // 1 n'est pas premier
  return {
    cells,
    currentPrime: null,
    currentMultiple: null,
    phase: 'waiting',
    primes: [],
    step: 0,
  }
}

function findNextPrime(cells: CellState[], from: number): number | null {
  for (let i = from; i < cells.length; i++) {
    if (cells[i] === 'untouched') return i
  }
  return null
}

export function SieveOfEratosthenes({
  maxNumber = 100,
  title,
}: SieveOfEratosthenesProps) {
  const [max, setMax] = useState(maxNumber)
  const [state, setState] = useState<SieveState>(() => initSieve(max))
  const [autoPlay, setAutoPlay] = useState(false)
  const [speed, setSpeed] = useState(200)

  // Reset when max changes
  useEffect(() => {
    setState(initSieve(max))
    setAutoPlay(false)
  }, [max])

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || state.phase === 'done') return

    const timer = setTimeout(() => {
      nextStep()
    }, speed)

    return () => clearTimeout(timer)
  }, [autoPlay, state, speed])

  // Calculate grid dimensions
  const cols = max <= 50 ? 10 : max <= 100 ? 10 : 15
  const cellSize = max <= 50 ? 40 : max <= 100 ? 36 : 30

  // Next step function
  const nextStep = useCallback(() => {
    setState((prev) => {
      const newCells = [...prev.cells]
      let newPhase = prev.phase
      let newCurrentPrime = prev.currentPrime
      let newCurrentMultiple = prev.currentMultiple
      const newPrimes = [...prev.primes]

      if (prev.phase === 'waiting' || prev.phase === 'marking-prime') {
        // Find next untouched number
        const nextP = findNextPrime(newCells, prev.currentPrime ? prev.currentPrime + 1 : 2)
        if (nextP === null || nextP * nextP > max) {
          // Mark all remaining untouched as primes
          for (let i = 2; i <= max; i++) {
            if (newCells[i] === 'untouched') {
              newCells[i] = 'prime'
              newPrimes.push(i)
            }
          }
          newPhase = 'done'
          newCurrentPrime = null
          newCurrentMultiple = null
        } else {
          newCells[nextP] = 'prime'
          newPrimes.push(nextP)
          newCurrentPrime = nextP
          newCurrentMultiple = nextP * 2 // Start crossing at 2*p
          newPhase = 'crossing-multiples'
        }
      } else if (prev.phase === 'crossing-multiples') {
        if (prev.currentMultiple && prev.currentMultiple <= max) {
          // Cross out current multiple
          if (newCells[prev.currentMultiple] === 'untouched') {
            newCells[prev.currentMultiple] = 'crossed'
          }
          // Move to next multiple
          newCurrentMultiple = prev.currentMultiple + prev.currentPrime!
          if (newCurrentMultiple > max) {
            // Done with this prime, move to finding next
            newPhase = 'marking-prime'
            newCurrentMultiple = null
          }
        } else {
          newPhase = 'marking-prime'
          newCurrentMultiple = null
        }
      }

      return {
        cells: newCells,
        currentPrime: newCurrentPrime,
        currentMultiple: newCurrentMultiple,
        phase: newPhase,
        primes: newPrimes,
        step: prev.step + 1,
      }
    })
  }, [max])

  // Run complete sieve at once
  const runComplete = () => {
    setState((prev) => {
      const newCells = [...prev.cells]
      const newPrimes: number[] = []

      for (let i = 2; i <= max; i++) {
        if (newCells[i] === 'untouched') {
          newCells[i] = 'prime'
          newPrimes.push(i)
          // Cross out multiples
          for (let j = i * 2; j <= max; j += i) {
            if (newCells[j] === 'untouched') {
              newCells[j] = 'crossed'
            }
          }
        }
      }

      return {
        cells: newCells,
        currentPrime: null,
        currentMultiple: null,
        phase: 'done',
        primes: newPrimes,
        step: prev.step + 1,
      }
    })
    setAutoPlay(false)
  }

  // Reset
  const reset = () => {
    setState(initSieve(max))
    setAutoPlay(false)
  }

  // Get cell color
  const getCellColor = (n: number, cellState: CellState) => {
    if (n === state.currentPrime) return 'bg-yellow-500 text-black font-bold'
    if (n === state.currentMultiple) return 'bg-orange-500 text-white'
    if (cellState === 'prime') return 'bg-green-600 text-white'
    if (cellState === 'crossed') return 'bg-gray-700 text-gray-500 line-through'
    return 'bg-gray-800 text-gray-200'
  }

  // Build grid
  const rows: number[][] = []
  for (let i = 2; i <= max; i += cols) {
    const row: number[] = []
    for (let j = i; j < i + cols && j <= max; j++) {
      row.push(j)
    }
    rows.push(row)
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {title && (
        <h4 className="border-b border-gray-700 px-4 py-3 text-center text-sm font-medium text-gray-200">
          {title}
        </h4>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Grid */}
        <div className="flex-1 overflow-x-auto p-4">
          <div
            className="mx-auto grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              maxWidth: cols * (cellSize + 4),
            }}
          >
            {rows.flat().map((n) => (
              <div
                key={n}
                className={`flex items-center justify-center rounded text-sm transition-all ${getCellColor(n, state.cells[n])}`}
                style={{ width: cellSize, height: cellSize }}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-sm">
            {state.phase === 'waiting' && (
              <p className="text-gray-300">
                Cliquez sur <b>Suivant</b> pour commencer le crible.
              </p>
            )}
            {state.phase === 'marking-prime' && (
              <p className="text-gray-300">
                Recherche du prochain nombre premier...
              </p>
            )}
            {state.phase === 'crossing-multiples' && state.currentPrime && (
              <p className="text-gray-300">
                <span className="text-yellow-400">{state.currentPrime}</span> est premier.{' '}
                {state.currentMultiple && state.currentMultiple <= max ? (
                  <>
                    Barrage de{' '}
                    <span className="text-orange-400">{state.currentMultiple}</span> (multiple de{' '}
                    {state.currentPrime})
                  </>
                ) : (
                  <>Tous les multiples de {state.currentPrime} sont barrés.</>
                )}
              </p>
            )}
            {state.phase === 'done' && (
              <p className="text-green-400">
                Crible terminé ! <b>{state.primes.length}</b> nombres premiers trouvés entre 2 et{' '}
                {max}.
              </p>
            )}
          </div>

          {/* Primes list */}
          {state.primes.length > 0 && (
            <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <p className="mb-2 text-xs text-gray-400">
                Nombres premiers trouvés ({state.primes.length}) :
              </p>
              <p className="font-mono text-xs text-green-400">
                {state.primes.slice(0, 30).join(', ')}
                {state.primes.length > 30 && '...'}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-56 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Contrôles</h5>

          <div className="space-y-4">
            {/* Step buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={nextStep}
                disabled={state.phase === 'done'}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500"
              >
                Suivant
              </button>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                disabled={state.phase === 'done'}
                className={`rounded-lg px-3 py-2 text-sm ${
                  autoPlay
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-green-600 text-white hover:bg-green-500'
                } disabled:bg-gray-700 disabled:text-gray-500`}
              >
                {autoPlay ? 'Pause' : 'Auto'}
              </button>
            </div>

            <button
              onClick={runComplete}
              disabled={state.phase === 'done'}
              className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500"
            >
              Exécuter tout
            </button>

            <button
              onClick={reset}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-600"
            >
              Réinitialiser
            </button>

            <hr className="border-gray-700" />

            {/* Speed control */}
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Vitesse</label>
                <span>{speed}ms</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={50}
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            {/* Max number */}
            <div>
              <label className="mb-1 block text-xs text-gray-400">Limite supérieure</label>
              <div className="grid grid-cols-3 gap-1">
                {[50, 100, 150].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMax(n)}
                    className={`rounded px-2 py-1 text-xs ${
                      max === n ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-700" />

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <p className="text-gray-400">Légende :</p>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-800" />
                <span className="text-gray-400">Non traité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-yellow-500" />
                <span className="text-gray-400">Premier actuel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-orange-500" />
                <span className="text-gray-400">Multiple à barrer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-600" />
                <span className="text-gray-400">Nombre premier</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-700" />
                <span className="text-gray-400">Barré (non premier)</span>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Algorithme :</b>
              <br />
              1. Prendre le plus petit non barré
              <br />
              2. C'est un premier
              <br />
              3. Barrer tous ses multiples
              <br />
              4. Répéter jusqu'à √N
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
