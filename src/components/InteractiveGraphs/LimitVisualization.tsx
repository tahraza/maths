'use client'

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Text, Line, Point, useMovablePoint, Vector } from 'mafs'
import 'mafs/core.css'

interface LimitVisualizationProps {
  /** Fonction à tracer */
  fn: string
  /** Point où calculer la limite */
  limitPoint: number
  /** Valeur de la limite (pour l'affichage) */
  limitValue?: number
  /** Type de limite */
  limitType?: 'left' | 'right' | 'both'
  /** Domaine x */
  xDomain?: [number, number]
  /** Domaine y */
  yDomain?: [number, number]
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
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
    return () => 0
  }
}

export function LimitVisualization({
  fn,
  limitPoint,
  limitValue,
  limitType = 'both',
  xDomain = [-5, 5],
  yDomain = [-5, 5],
  title,
  height = 300,
}: LimitVisualizationProps) {
  const f = useMemo(() => parseFunction(fn), [fn])

  // Points d'approche interactifs
  const [leftApproach, setLeftApproach] = useState(limitPoint - 1)
  const [rightApproach, setRightApproach] = useState(limitPoint + 1)

  const leftValue = f(leftApproach)
  const rightValue = f(rightApproach)

  // Calculer la limite numérique si non fournie
  const computedLimit = limitValue ?? (() => {
    const epsilon = 0.0001
    const leftLim = f(limitPoint - epsilon)
    const rightLim = f(limitPoint + epsilon)
    if (Math.abs(leftLim - rightLim) < 0.01) {
      return (leftLim + rightLim) / 2
    }
    return NaN
  })()

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      )}

      {/* Contrôles */}
      <div className="mb-4 flex flex-wrap justify-center gap-4">
        {(limitType === 'left' || limitType === 'both') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Approche gauche:
            </label>
            <input
              type="range"
              min={xDomain[0]}
              max={limitPoint - 0.01}
              step={0.1}
              value={leftApproach}
              onChange={(e) => setLeftApproach(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-xs font-mono text-blue-600">{leftApproach.toFixed(2)}</span>
          </div>
        )}
        {(limitType === 'right' || limitType === 'both') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Approche droite:
            </label>
            <input
              type="range"
              min={limitPoint + 0.01}
              max={xDomain[1]}
              step={0.1}
              value={rightApproach}
              onChange={(e) => setRightApproach(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-xs font-mono text-red-600">{rightApproach.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded" style={{ height }}>
        <Mafs viewBox={{ x: xDomain, y: yDomain }} preserveAspectRatio={false}>
          <Coordinates.Cartesian />

          {/* Courbe */}
          <Plot.OfX y={f} color="#3b82f6" />

          {/* Ligne verticale au point limite */}
          <Line.Segment
            point1={[limitPoint, yDomain[0]]}
            point2={[limitPoint, yDomain[1]]}
            color="#9ca3af"
            style="dashed"
          />

          {/* Point d'approche gauche */}
          {(limitType === 'left' || limitType === 'both') && (
            <>
              <Point x={leftApproach} y={leftValue} color="#3b82f6" />
              <Vector
                tail={[leftApproach, leftValue]}
                tip={[limitPoint - 0.2, leftValue]}
                color="#3b82f6"
              />
            </>
          )}

          {/* Point d'approche droite */}
          {(limitType === 'right' || limitType === 'both') && (
            <>
              <Point x={rightApproach} y={rightValue} color="#ef4444" />
              <Vector
                tail={[rightApproach, rightValue]}
                tip={[limitPoint + 0.2, rightValue]}
                color="#ef4444"
              />
            </>
          )}

          {/* Ligne horizontale de la limite */}
          {!isNaN(computedLimit) && (
            <Line.Segment
              point1={[xDomain[0], computedLimit]}
              point2={[xDomain[1], computedLimit]}
              color="#22c55e"
              style="dashed"
              opacity={0.5}
            />
          )}

          {/* Label du point limite */}
          <Text x={limitPoint} y={yDomain[0] + 0.5} size={12}>
            x = {limitPoint}
          </Text>
        </Mafs>
      </div>

      {/* Valeurs actuelles */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
        {(limitType === 'left' || limitType === 'both') && (
          <div className="rounded bg-blue-50 p-2 dark:bg-blue-900/20">
            <div className="text-xs text-gray-500 dark:text-gray-400">Limite à gauche</div>
            <div className="font-mono text-blue-600 dark:text-blue-400">
              f({leftApproach.toFixed(2)}) = {leftValue.toFixed(4)}
            </div>
          </div>
        )}
        {(limitType === 'right' || limitType === 'both') && (
          <div className="rounded bg-red-50 p-2 dark:bg-red-900/20">
            <div className="text-xs text-gray-500 dark:text-gray-400">Limite à droite</div>
            <div className="font-mono text-red-600 dark:text-red-400">
              f({rightApproach.toFixed(2)}) = {rightValue.toFixed(4)}
            </div>
          </div>
        )}
      </div>

      {!isNaN(computedLimit) && (
        <div className="mt-2 text-center">
          <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            lim f(x) = {computedLimit.toFixed(2)} quand x → {limitPoint}
          </span>
        </div>
      )}
    </div>
  )
}
