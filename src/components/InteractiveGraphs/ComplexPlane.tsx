'use client'

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Point, Line, Circle, Text, Vector, Polygon, useMovablePoint } from 'mafs'
import 'mafs/core.css'

interface ComplexNumber {
  re: number
  im: number
  label?: string
  color?: string
}

interface ComplexPlaneProps {
  /** Points complexes à afficher */
  points?: ComplexNumber[]
  /** Afficher le cercle unité */
  showUnitCircle?: boolean
  /** Afficher les racines n-ièmes de l'unité */
  rootsOfUnity?: number
  /** Permettre de déplacer un point interactif */
  interactive?: boolean
  /** Point interactif initial */
  initialPoint?: { re: number; im: number }
  /** Afficher le module et l'argument */
  showModulusArgument?: boolean
  /** Domaine */
  domain?: [number, number]
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

function polarToCartesian(r: number, theta: number): [number, number] {
  return [r * Math.cos(theta), r * Math.sin(theta)]
}

export function ComplexPlane({
  points = [],
  showUnitCircle = false,
  rootsOfUnity,
  interactive = false,
  initialPoint = { re: 1, im: 1 },
  showModulusArgument = true,
  domain = [-3, 3],
  title,
  height = 350,
}: ComplexPlaneProps) {
  // Point interactif
  const movablePoint = useMovablePoint([initialPoint.re, initialPoint.im])

  // Calculer les racines n-ièmes de l'unité
  const unityRoots = useMemo(() => {
    if (!rootsOfUnity || rootsOfUnity < 2) return []
    const roots: ComplexNumber[] = []
    for (let k = 0; k < rootsOfUnity; k++) {
      const angle = (2 * Math.PI * k) / rootsOfUnity
      roots.push({
        re: Math.cos(angle),
        im: Math.sin(angle),
        label: `ω${k}`,
        color: `hsl(${(k * 360) / rootsOfUnity}, 70%, 50%)`,
      })
    }
    return roots
  }, [rootsOfUnity])

  // Calculer module et argument du point interactif
  const interactiveModulus = Math.sqrt(
    movablePoint.point[0] ** 2 + movablePoint.point[1] ** 2
  )
  const interactiveArgument = Math.atan2(movablePoint.point[1], movablePoint.point[0])

  // Tous les points à afficher
  const allPoints = [...points, ...unityRoots]

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      )}

      <div className="overflow-hidden rounded" style={{ height }}>
        <Mafs viewBox={{ x: domain, y: domain }} preserveAspectRatio="contain" zoom={{ min: 0.5, max: 4 }}>
          <Coordinates.Cartesian
            xAxis={{ labels: (x) => (x === 0 ? '' : x.toString()) }}
            yAxis={{ labels: (y) => (y === 0 ? '' : `${y}i`) }}
          />

          {/* Cercle unité */}
          {(showUnitCircle || rootsOfUnity) && (
            <Circle center={[0, 0]} radius={1} color="#9ca3af" fillOpacity={0} />
          )}

          {/* Polygone des racines de l'unité */}
          {rootsOfUnity && rootsOfUnity >= 3 && (
            <Polygon
              points={unityRoots.map((z) => [z.re, z.im])}
              color="#3b82f6"
              fillOpacity={0.1}
            />
          )}

          {/* Points fixes */}
          {allPoints.map((z, i) => (
            <g key={i}>
              {/* Vecteur depuis l'origine */}
              <Vector tail={[0, 0]} tip={[z.re, z.im]} color={z.color || '#3b82f6'} />
              {/* Point */}
              <Point x={z.re} y={z.im} color={z.color || '#3b82f6'} />
              {/* Label */}
              {z.label && (
                <Text x={z.re + 0.15} y={z.im + 0.15} size={11}>
                  {z.label}
                </Text>
              )}
            </g>
          ))}

          {/* Point interactif */}
          {interactive && (
            <>
              {/* Arc pour l'argument */}
              {showModulusArgument && interactiveModulus > 0.1 && (
                <Circle
                  center={[0, 0]}
                  radius={0.4}
                  color="#22c55e"
                  fillOpacity={0}
                  // Note: Mafs n'a pas d'arc natif, on utilise un cercle complet
                />
              )}
              {/* Vecteur */}
              <Vector
                tail={[0, 0]}
                tip={movablePoint.point}
                color="#ef4444"
              />
              {/* Projections */}
              <Line.Segment
                point1={[movablePoint.point[0], 0]}
                point2={movablePoint.point}
                color="#ef4444"
                style="dashed"
                opacity={0.5}
              />
              <Line.Segment
                point1={[0, movablePoint.point[1]]}
                point2={movablePoint.point}
                color="#ef4444"
                style="dashed"
                opacity={0.5}
              />
              {/* Point mobile */}
              {movablePoint.element}
              {/* Label */}
              <Text
                x={movablePoint.point[0] + 0.2}
                y={movablePoint.point[1] + 0.2}
                size={11}
              >
                z
              </Text>
            </>
          )}

          {/* Labels des axes */}
          <Text x={domain[1] - 0.3} y={0.2} size={12}>
            Re
          </Text>
          <Text x={0.2} y={domain[1] - 0.3} size={12}>
            Im
          </Text>
        </Mafs>
      </div>

      {/* Informations sur le point interactif */}
      {interactive && showModulusArgument && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Forme algébrique</div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
              {movablePoint.point[0].toFixed(2)} {movablePoint.point[1] >= 0 ? '+' : ''}{' '}
              {movablePoint.point[1].toFixed(2)}i
            </div>
          </div>
          <div className="rounded bg-blue-50 p-2 dark:bg-blue-900/20">
            <div className="text-xs text-gray-500 dark:text-gray-400">Module |z|</div>
            <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
              {interactiveModulus.toFixed(3)}
            </div>
          </div>
          <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
            <div className="text-xs text-gray-500 dark:text-gray-400">Argument (rad)</div>
            <div className="font-mono text-sm text-green-600 dark:text-green-400">
              {interactiveArgument.toFixed(3)}
            </div>
          </div>
          <div className="rounded bg-purple-50 p-2 dark:bg-purple-900/20">
            <div className="text-xs text-gray-500 dark:text-gray-400">Argument (°)</div>
            <div className="font-mono text-sm text-purple-600 dark:text-purple-400">
              {((interactiveArgument * 180) / Math.PI).toFixed(1)}°
            </div>
          </div>
        </div>
      )}

      {/* Légende des racines de l'unité */}
      {rootsOfUnity && (
        <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          Racines {rootsOfUnity}-ièmes de l'unité : les sommets d'un{' '}
          {rootsOfUnity === 3
            ? 'triangle équilatéral'
            : rootsOfUnity === 4
            ? 'carré'
            : rootsOfUnity === 5
            ? 'pentagone régulier'
            : rootsOfUnity === 6
            ? 'hexagone régulier'
            : `polygone régulier à ${rootsOfUnity} côtés`}
        </div>
      )}

      {interactive && (
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Glissez le point z pour explorer le plan complexe
        </p>
      )}
    </div>
  )
}
