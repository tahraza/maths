'use client'

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Point, Line, Text, Plot } from 'mafs'
import 'mafs/core.css'

interface SequencePlotProps {
  /** Type de suite */
  type: 'arithmetic' | 'geometric' | 'recursive' | 'custom'
  /** Premier terme u0 */
  u0: number
  /** Raison (pour arithmétique ou géométrique) */
  ratio?: number
  /** Fonction de récurrence (pour recursive, ex: "0.5*u + 1") */
  recursiveFn?: string
  /** Fonction explicite (pour custom, ex: "1/n") */
  customFn?: string
  /** Nombre de termes à afficher */
  terms?: number
  /** Afficher la limite si elle existe */
  showLimit?: boolean
  /** Domaine y */
  yDomain?: [number, number]
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

function computeSequence(
  type: string,
  u0: number,
  ratio: number,
  recursiveFn: string,
  customFn: string,
  n: number
): number[] {
  const sequence: number[] = []

  if (type === 'arithmetic') {
    for (let i = 0; i <= n; i++) {
      sequence.push(u0 + i * ratio)
    }
  } else if (type === 'geometric') {
    for (let i = 0; i <= n; i++) {
      sequence.push(u0 * Math.pow(ratio, i))
    }
  } else if (type === 'recursive') {
    try {
      const f = new Function('u', `return ${recursiveFn}`) as (u: number) => number
      let u = u0
      for (let i = 0; i <= n; i++) {
        sequence.push(u)
        u = f(u)
      }
    } catch {
      for (let i = 0; i <= n; i++) {
        sequence.push(u0)
      }
    }
  } else if (type === 'custom') {
    try {
      const f = new Function('n', `return ${customFn}`) as (n: number) => number
      for (let i = 0; i <= n; i++) {
        sequence.push(f(i))
      }
    } catch {
      for (let i = 0; i <= n; i++) {
        sequence.push(0)
      }
    }
  }

  return sequence
}

export function SequencePlot({
  type,
  u0,
  ratio = 1,
  recursiveFn = 'u',
  customFn = 'n',
  terms = 15,
  showLimit = true,
  yDomain,
  title,
  height = 300,
}: SequencePlotProps) {
  const [numTerms, setNumTerms] = useState(terms)

  const sequence = useMemo(
    () => computeSequence(type, u0, ratio, recursiveFn, customFn, numTerms),
    [type, u0, ratio, recursiveFn, customFn, numTerms]
  )

  // Calculer la limite théorique
  const limit = useMemo(() => {
    if (type === 'arithmetic') {
      return ratio === 0 ? u0 : (ratio > 0 ? Infinity : -Infinity)
    } else if (type === 'geometric') {
      if (Math.abs(ratio) < 1) return 0
      if (ratio === 1) return u0
      return Math.abs(ratio) > 1 ? (ratio > 0 ? Infinity : NaN) : NaN
    } else if (type === 'recursive') {
      // Essayer de trouver le point fixe
      try {
        const f = new Function('u', `return ${recursiveFn}`) as (u: number) => number
        // Point fixe : u = f(u)
        // Chercher numériquement
        let u = sequence[sequence.length - 1]
        for (let i = 0; i < 100; i++) {
          u = f(u)
        }
        return u
      } catch {
        return NaN
      }
    }
    return NaN
  }, [type, u0, ratio, recursiveFn, sequence])

  // Calculer les bornes y automatiquement
  const computedYDomain = useMemo(() => {
    if (yDomain) return yDomain
    const min = Math.min(...sequence)
    const max = Math.max(...sequence)
    const margin = (max - min) * 0.2 || 1
    return [min - margin, max + margin] as [number, number]
  }, [sequence, yDomain])

  const xDomain: [number, number] = [-1, numTerms + 1]

  // Déterminer si la suite est convergente, divergente, ou autre
  const behavior = useMemo(() => {
    if (!isFinite(limit)) {
      return sequence[sequence.length - 1] > sequence[0] ? 'diverge vers +∞' : 'diverge vers -∞'
    }
    if (isNaN(limit)) return 'comportement indéterminé'
    return `converge vers ${limit.toFixed(3)}`
  }, [limit, sequence])

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      )}

      {/* Contrôle du nombre de termes */}
      <div className="mb-4 flex justify-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">Nombre de termes:</label>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={numTerms}
            onChange={(e) => setNumTerms(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="w-8 text-xs font-mono">{numTerms}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded" style={{ height }}>
        <Mafs viewBox={{ x: xDomain, y: computedYDomain }} preserveAspectRatio={false} zoom={{ min: 0.5, max: 4 }}>
          <Coordinates.Cartesian />

          {/* Points de la suite */}
          {sequence.map((value, n) => (
            <Point key={n} x={n} y={value} color="#3b82f6" />
          ))}

          {/* Lignes reliant les points */}
          {sequence.map((value, n) =>
            n > 0 ? (
              <Line.Segment
                key={`line-${n}`}
                point1={[n - 1, sequence[n - 1]]}
                point2={[n, value]}
                color="#3b82f6"
                opacity={0.3}
              />
            ) : null
          )}

          {/* Ligne de la limite */}
          {showLimit && isFinite(limit) && !isNaN(limit) && (
            <>
              <Line.Segment
                point1={[xDomain[0], limit]}
                point2={[xDomain[1], limit]}
                color="#22c55e"
                style="dashed"
              />
              <Text x={xDomain[1] - 1} y={limit + 0.3} size={11} color="#22c55e">
                ℓ = {limit.toFixed(2)}
              </Text>
            </>
          )}
        </Mafs>
      </div>

      {/* Informations sur la suite */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm sm:grid-cols-4">
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">u₀</div>
          <div className="font-mono text-gray-800 dark:text-gray-200">{u0}</div>
        </div>
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">u₁</div>
          <div className="font-mono text-gray-800 dark:text-gray-200">
            {sequence[1]?.toFixed(3) || '-'}
          </div>
        </div>
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">u_{numTerms}</div>
          <div className="font-mono text-gray-800 dark:text-gray-200">
            {sequence[numTerms]?.toFixed(3) || '-'}
          </div>
        </div>
        <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
          <div className="text-xs text-gray-500 dark:text-gray-400">Comportement</div>
          <div className="text-xs font-medium text-green-700 dark:text-green-400">{behavior}</div>
        </div>
      </div>

      {/* Formule de la suite */}
      <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
        {type === 'arithmetic' && (
          <span>
            Suite arithmétique : u<sub>n</sub> = {u0} + {ratio}n
          </span>
        )}
        {type === 'geometric' && (
          <span>
            Suite géométrique : u<sub>n</sub> = {u0} × {ratio}
            <sup>n</sup>
          </span>
        )}
        {type === 'recursive' && (
          <span>
            Suite récurrente : u<sub>n+1</sub> = {recursiveFn.replace(/u/g, 'uₙ')}
          </span>
        )}
        {type === 'custom' && (
          <span>
            Suite explicite : u<sub>n</sub> = {customFn}
          </span>
        )}
      </div>
    </div>
  )
}
