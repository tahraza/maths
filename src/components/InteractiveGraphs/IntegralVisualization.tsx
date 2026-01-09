'use client'

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Text, Line, Polygon } from 'mafs'
import 'mafs/core.css'

interface IntegralVisualizationProps {
  /** Fonction à intégrer */
  fn: string
  /** Borne inférieure initiale */
  initialA?: number
  /** Borne supérieure initiale */
  initialB?: number
  /** Domaine x */
  xDomain?: [number, number]
  /** Domaine y */
  yDomain?: [number, number]
  /** Nombre de rectangles pour la somme de Riemann */
  rectangles?: number
  /** Afficher la somme de Riemann */
  showRiemann?: boolean
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

// Intégration numérique par méthode des trapèzes
function numericalIntegral(f: (x: number) => number, a: number, b: number, n: number = 1000): number {
  const h = (b - a) / n
  let sum = (f(a) + f(b)) / 2
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h)
  }
  return sum * h
}

export function IntegralVisualization({
  fn,
  initialA = 0,
  initialB = 2,
  xDomain = [-1, 5],
  yDomain = [-1, 5],
  rectangles = 10,
  showRiemann = true,
  title,
  height = 350,
}: IntegralVisualizationProps) {
  const f = useMemo(() => parseFunction(fn), [fn])

  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)
  const [numRects, setNumRects] = useState(rectangles)

  // Calculer l'intégrale
  const integralValue = useMemo(() => {
    if (a >= b) return 0
    return numericalIntegral(f, a, b)
  }, [f, a, b])

  // Calculer la somme de Riemann
  const riemannSum = useMemo(() => {
    if (a >= b || numRects < 1) return 0
    const dx = (b - a) / numRects
    let sum = 0
    for (let i = 0; i < numRects; i++) {
      const x = a + i * dx
      sum += f(x) * dx
    }
    return sum
  }, [f, a, b, numRects])

  // Générer les points pour l'aire sous la courbe
  const areaPoints = useMemo(() => {
    const points: [number, number][] = []
    const steps = 100
    const dx = (b - a) / steps

    // Point de départ sur l'axe x
    points.push([a, 0])

    // Points sur la courbe
    for (let i = 0; i <= steps; i++) {
      const x = a + i * dx
      points.push([x, Math.max(0, f(x))])
    }

    // Retour sur l'axe x
    points.push([b, 0])

    return points
  }, [f, a, b])

  // Générer les rectangles de Riemann
  const riemannRectangles = useMemo(() => {
    if (!showRiemann || numRects < 1) return []
    const rects: Array<[number, number][]> = []
    const dx = (b - a) / numRects

    for (let i = 0; i < numRects; i++) {
      const x = a + i * dx
      const height = f(x)
      if (height >= 0) {
        rects.push([
          [x, 0],
          [x, height],
          [x + dx, height],
          [x + dx, 0],
        ])
      }
    }
    return rects
  }, [f, a, b, numRects, showRiemann])

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      )}

      {/* Contrôles */}
      <div className="mb-4 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">a =</label>
          <input
            type="range"
            min={xDomain[0]}
            max={xDomain[1] - 0.5}
            step={0.1}
            value={a}
            onChange={(e) => setA(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="w-10 text-xs font-mono text-blue-600">{a.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">b =</label>
          <input
            type="range"
            min={xDomain[0] + 0.5}
            max={xDomain[1]}
            step={0.1}
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="w-10 text-xs font-mono text-red-600">{b.toFixed(1)}</span>
        </div>
        {showRiemann && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Rectangles:</label>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={numRects}
              onChange={(e) => setNumRects(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="w-8 text-xs font-mono">{numRects}</span>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded" style={{ height }}>
        <Mafs viewBox={{ x: xDomain, y: yDomain }} preserveAspectRatio={false} zoom={{ min: 0.5, max: 4 }}>
          <Coordinates.Cartesian />

          {/* Rectangles de Riemann */}
          {showRiemann &&
            riemannRectangles.map((rect, i) => (
              <Polygon
                key={i}
                points={rect}
                color="#fbbf24"
                fillOpacity={0.3}
                strokeOpacity={0.8}
              />
            ))}

          {/* Aire sous la courbe */}
          <Polygon points={areaPoints} color="#3b82f6" fillOpacity={0.2} strokeOpacity={0} />

          {/* Courbe */}
          <Plot.OfX y={f} color="#3b82f6" weight={2} />

          {/* Lignes verticales aux bornes */}
          <Line.Segment
            point1={[a, 0]}
            point2={[a, f(a)]}
            color="#3b82f6"
            style="dashed"
          />
          <Line.Segment
            point1={[b, 0]}
            point2={[b, f(b)]}
            color="#ef4444"
            style="dashed"
          />

          {/* Labels des bornes */}
          <Text x={a} y={-0.5} size={12} color="#3b82f6">
            a
          </Text>
          <Text x={b} y={-0.5} size={12} color="#ef4444">
            b
          </Text>
        </Mafs>
      </div>

      {/* Résultats */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded bg-blue-50 p-3 text-center dark:bg-blue-900/20">
          <div className="text-xs text-gray-500 dark:text-gray-400">Intégrale (exacte)</div>
          <div className="font-mono text-lg text-blue-600 dark:text-blue-400">
            ∫ f(x)dx = {integralValue.toFixed(4)}
          </div>
        </div>
        {showRiemann && (
          <div className="rounded bg-amber-50 p-3 text-center dark:bg-amber-900/20">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Somme de Riemann ({numRects} rect.)
            </div>
            <div className="font-mono text-lg text-amber-600 dark:text-amber-400">
              S = {riemannSum.toFixed(4)}
            </div>
            <div className="text-xs text-gray-400">
              Erreur: {Math.abs(integralValue - riemannSum).toFixed(4)}
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Déplacez les curseurs pour modifier les bornes d'intégration
      </p>
    </div>
  )
}
