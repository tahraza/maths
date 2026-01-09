'use client'

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Theme, useMovablePoint, Text, Line, Point } from 'mafs'
import 'mafs/core.css'

interface FunctionPlotProps {
  /** Fonction à tracer (ex: "x^2", "sin(x)", "exp(x)") */
  fn: string
  /** Domaine x [min, max] */
  xDomain?: [number, number]
  /** Domaine y [min, max] */
  yDomain?: [number, number]
  /** Couleur de la courbe */
  color?: string
  /** Afficher un point mobile sur la courbe */
  showMovablePoint?: boolean
  /** Afficher la tangente au point mobile */
  showTangent?: boolean
  /** Afficher la dérivée */
  showDerivative?: boolean
  /** Couleur de la dérivée */
  derivativeColor?: string
  /** Titre du graphe */
  title?: string
  /** Hauteur en pixels */
  height?: number
}

// Parser simple pour convertir les expressions en fonctions
function parseFunction(expr: string): (x: number) => number {
  // Remplacements pour rendre l'expression compatible avec Math
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
    // Créer une fonction à partir de l'expression
    return new Function('x', `return ${sanitized}`) as (x: number) => number
  } catch {
    return () => 0
  }
}

// Dérivée numérique
function numericalDerivative(f: (x: number) => number, h: number = 0.0001): (x: number) => number {
  return (x: number) => (f(x + h) - f(x - h)) / (2 * h)
}

export function FunctionPlot({
  fn,
  xDomain = [-5, 5],
  yDomain = [-5, 5],
  color = '#3b82f6',
  showMovablePoint = false,
  showTangent = false,
  showDerivative = false,
  derivativeColor = '#ef4444',
  title,
  height = 300,
}: FunctionPlotProps) {
  const f = useMemo(() => parseFunction(fn), [fn])
  const fPrime = useMemo(() => numericalDerivative(f), [f])

  // Point mobile sur la courbe
  const point = useMovablePoint([1, f(1)], {
    constrain: ([x]) => [x, f(x)],
  })

  // Calcul de la tangente
  const tangentSlope = fPrime(point.point[0])
  const tangentIntercept = point.point[1] - tangentSlope * point.point[0]

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      )}
      <div className="overflow-hidden rounded" style={{ height }}>
        <Mafs
          viewBox={{ x: xDomain, y: yDomain }}
          preserveAspectRatio={false}
          zoom={{ min: 0.5, max: 4 }}
        >
          <Coordinates.Cartesian />

          {/* Courbe principale */}
          <Plot.OfX y={f} color={color} />

          {/* Dérivée optionnelle */}
          {showDerivative && (
            <Plot.OfX y={fPrime} color={derivativeColor} opacity={0.7} />
          )}

          {/* Point mobile */}
          {showMovablePoint && (
            <>
              {point.element}
              <Text
                x={point.point[0] + 0.3}
                y={point.point[1] + 0.5}
                size={12}
              >
                ({point.point[0].toFixed(2)}, {point.point[1].toFixed(2)})
              </Text>
            </>
          )}

          {/* Tangente */}
          {showMovablePoint && showTangent && (
            <>
              <Plot.OfX
                y={(x) => tangentSlope * x + tangentIntercept}
                color="#22c55e"
                opacity={0.8}
                style="dashed"
              />
              <Text
                x={point.point[0] - 1}
                y={point.point[1] - 1}
                size={11}
                color="#22c55e"
              >
                pente = {tangentSlope.toFixed(2)}
              </Text>
            </>
          )}
        </Mafs>
      </div>

      {/* Légende */}
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: color }} />
          <span className="text-gray-600 dark:text-gray-400">f(x) = {fn}</span>
        </div>
        {showDerivative && (
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: derivativeColor }} />
            <span className="text-gray-600 dark:text-gray-400">f'(x)</span>
          </div>
        )}
        {showTangent && (
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Tangente</span>
          </div>
        )}
      </div>

      {showMovablePoint && (
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Glissez le point pour explorer la courbe
        </p>
      )}
    </div>
  )
}
