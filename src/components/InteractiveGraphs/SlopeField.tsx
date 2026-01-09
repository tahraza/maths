'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

interface SlopeFieldProps {
  /** Expression de y' = f(x, y) */
  equation?: string
  /** Domaine x */
  xDomain?: [number, number]
  /** Domaine y */
  yDomain?: [number, number]
  /** Densité de la grille */
  gridDensity?: number
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

// Helpers
const fmt = (x: number, n = 2) => {
  if (Math.abs(x) < 1e-10) return '0'
  return x.toFixed(n).replace(/\.?0+$/, '')
}

function parseEquation(expr: string): (x: number, y: number) => number {
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
    return new Function('x', 'y', `return ${sanitized}`) as (x: number, y: number) => number
  } catch {
    return () => 0
  }
}

// Euler's method for solving ODE
function eulerSolve(
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  step: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [{ x: x0, y: y0 }]
  let x = x0
  let y = y0
  const direction = xEnd > x0 ? 1 : -1
  const h = step * direction

  while ((direction > 0 && x < xEnd) || (direction < 0 && x > xEnd)) {
    const slope = f(x, y)
    if (!isFinite(slope) || Math.abs(slope) > 1000) break
    y = y + h * slope
    x = x + h
    if (!isFinite(y) || Math.abs(y) > 100) break
    points.push({ x, y })
  }

  return points
}

const PRESET_EQUATIONS = [
  { name: "y' = y", expr: 'y', description: 'Exponentielle' },
  { name: "y' = -y", expr: '-y', description: 'Décroissance' },
  { name: "y' = x", expr: 'x', description: 'Paraboles' },
  { name: "y' = -x/y", expr: '-x/y', description: 'Cercles' },
  { name: "y' = x + y", expr: 'x + y', description: 'y\' = x + y' },
  { name: "y' = y(1-y)", expr: 'y*(1-y)', description: 'Logistique' },
  { name: "y' = sin(x)", expr: 'sin(x)', description: 'Sinusoïdale' },
  { name: "y' = x² - y", expr: 'x*x - y', description: 'Quadratique' },
]

export function SlopeField({
  equation = 'y',
  xDomain = [-4, 4],
  yDomain = [-4, 4],
  gridDensity = 15,
  title,
  height = 500,
}: SlopeFieldProps) {
  const [currentEquation, setCurrentEquation] = useState(equation)
  const [density, setDensity] = useState(gridDensity)
  const [solutionCurves, setSolutionCurves] = useState<{ x: number; y: number }[][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [showVectors, setShowVectors] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  const f = useMemo(() => parseEquation(currentEquation), [currentEquation])

  // SVG dimensions
  const W = 700
  const H = 500
  const margin = { top: 30, right: 30, bottom: 50, left: 50 }
  const plotW = W - margin.left - margin.right
  const plotH = H - margin.top - margin.bottom

  // Scale functions
  const scaleX = (x: number) => margin.left + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotW
  const scaleY = (y: number) => margin.top + ((yDomain[1] - y) / (yDomain[1] - yDomain[0])) * plotH
  const unscaleX = (px: number) => xDomain[0] + ((px - margin.left) / plotW) * (xDomain[1] - xDomain[0])
  const unscaleY = (py: number) => yDomain[1] - ((py - margin.top) / plotH) * (yDomain[1] - yDomain[0])

  // Generate slope field vectors
  const slopeVectors = useMemo(() => {
    const vectors: { x: number; y: number; angle: number; magnitude: number }[] = []
    const stepX = (xDomain[1] - xDomain[0]) / density
    const stepY = (yDomain[1] - yDomain[0]) / density

    for (let i = 0; i <= density; i++) {
      for (let j = 0; j <= density; j++) {
        const x = xDomain[0] + i * stepX
        const y = yDomain[0] + j * stepY
        const slope = f(x, y)

        if (isFinite(slope)) {
          const angle = Math.atan(slope)
          const magnitude = Math.min(1, 1 / (1 + Math.abs(slope) * 0.3))
          vectors.push({ x, y, angle, magnitude })
        }
      }
    }

    return vectors
  }, [f, xDomain, yDomain, density])

  // Vector length based on grid
  const vectorLength = Math.min(plotW, plotH) / density * 0.4

  // Handle click to add solution curve
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    // Scale to viewBox coordinates
    const viewBoxX = (px / rect.width) * W
    const viewBoxY = (py / rect.height) * H

    const x0 = unscaleX(viewBoxX)
    const y0 = unscaleY(viewBoxY)

    if (x0 >= xDomain[0] && x0 <= xDomain[1] && y0 >= yDomain[0] && y0 <= yDomain[1]) {
      // Solve forward and backward
      const step = 0.02
      const forward = eulerSolve(f, x0, y0, xDomain[1], step)
      const backward = eulerSolve(f, x0, y0, xDomain[0], step)

      // Combine (backward reversed + forward without first point)
      const combined = [...backward.reverse(), ...forward.slice(1)]

      setSolutionCurves((prev) => [...prev, combined])
    }
  }

  // Generate curve path
  const curvePath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ''
    return points
      .filter((p) => p.y >= yDomain[0] - 1 && p.y <= yDomain[1] + 1)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
      .join(' ')
  }

  // Axis ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = []
    const step = Math.ceil((xDomain[1] - xDomain[0]) / 8)
    for (let x = Math.ceil(xDomain[0]); x <= xDomain[1]; x += step) {
      ticks.push(x)
    }
    return ticks
  }, [xDomain])

  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const step = Math.ceil((yDomain[1] - yDomain[0]) / 8)
    for (let y = Math.ceil(yDomain[0]); y <= yDomain[1]; y += step) {
      ticks.push(y)
    }
    return ticks
  }, [yDomain])

  const handleClear = () => setSolutionCurves([])

  const handlePreset = (preset: typeof PRESET_EQUATIONS[0]) => {
    setCurrentEquation(preset.expr)
    setSolutionCurves([])
  }

  // Color palette for curves
  const curveColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

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
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full cursor-crosshair"
            style={{ maxHeight: height }}
            onClick={handleSvgClick}
          >
            {/* Grid */}
            {xTicks.map((x) => (
              <line
                key={`xgrid-${x}`}
                x1={scaleX(x)}
                y1={margin.top}
                x2={scaleX(x)}
                y2={H - margin.bottom}
                stroke="rgba(255,255,255,0.08)"
              />
            ))}
            {yTicks.map((y) => (
              <line
                key={`ygrid-${y}`}
                x1={margin.left}
                y1={scaleY(y)}
                x2={W - margin.right}
                y2={scaleY(y)}
                stroke="rgba(255,255,255,0.08)"
              />
            ))}

            {/* Axes */}
            <line
              x1={margin.left}
              y1={scaleY(0)}
              x2={W - margin.right}
              y2={scaleY(0)}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />
            <line
              x1={scaleX(0)}
              y1={margin.top}
              x2={scaleX(0)}
              y2={H - margin.bottom}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
            />

            {/* Axis labels */}
            {xTicks.map((x) => (
              <text
                key={`xlabel-${x}`}
                x={scaleX(x)}
                y={H - margin.bottom + 20}
                fill="rgba(255,255,255,0.6)"
                fontSize={11}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
            {yTicks.map((y) => (
              <text
                key={`ylabel-${y}`}
                x={margin.left - 10}
                y={scaleY(y) + 4}
                fill="rgba(255,255,255,0.6)"
                fontSize={11}
                textAnchor="end"
              >
                {y}
              </text>
            ))}

            {/* Slope field vectors */}
            {showVectors && slopeVectors.map((v, i) => {
              const len = vectorLength * v.magnitude
              const dx = len * Math.cos(v.angle)
              const dy = len * Math.sin(v.angle)
              const cx = scaleX(v.x)
              const cy = scaleY(v.y)

              return (
                <line
                  key={i}
                  x1={cx - dx}
                  y1={cy + dy}
                  x2={cx + dx}
                  y2={cy - dy}
                  stroke="rgba(82, 227, 182, 0.6)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )
            })}

            {/* Solution curves */}
            {solutionCurves.map((curve, i) => (
              <path
                key={i}
                d={curvePath(curve)}
                fill="none"
                stroke={curveColors[i % curveColors.length]}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ))}

            {/* Starting points */}
            {solutionCurves.map((curve, i) => {
              const mid = Math.floor(curve.length / 2)
              if (curve[mid]) {
                return (
                  <circle
                    key={`start-${i}`}
                    cx={scaleX(curve[mid].x)}
                    cy={scaleY(curve[mid].y)}
                    r={5}
                    fill={curveColors[i % curveColors.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                )
              }
              return null
            })}

            {/* Info box */}
            <g transform="translate(20, 10)">
              <rect x={0} y={0} width={150} height={45} rx={8} fill="rgba(0,0,0,0.7)" />
              <text x={12} y={20} fill="rgba(255,255,255,0.9)" fontSize={12}>
                y' = {currentEquation}
              </text>
              <text x={12} y={38} fill="rgba(255,255,255,0.5)" fontSize={10}>
                Cliquez pour tracer une solution
              </text>
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-[#52e3b6]" />
              <span>Champ de pentes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-[#3b82f6]" />
              <span>Courbes solutions</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-white" />
              <span>Point initial</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Équation y' =</label>
              <input
                type="text"
                value={currentEquation}
                onChange={(e) => {
                  setCurrentEquation(e.target.value)
                  setSolutionCurves([])
                }}
                className="w-full rounded bg-gray-700 px-2 py-1.5 text-sm text-white"
                placeholder="ex: y, -y, x+y"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Densité grille</label>
                <span className="font-mono">{density}</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={1}
                value={density}
                onChange={(e) => setDensity(parseInt(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded"
              />
              Afficher le champ de pentes
            </label>

            <hr className="border-gray-700" />

            <div>
              <label className="mb-2 block text-xs text-gray-400">Équations types</label>
              <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                {PRESET_EQUATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePreset(preset)}
                    className={`rounded px-2 py-1 text-xs text-left ${
                      currentEquation === preset.expr
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-700" />

            <button
              onClick={handleClear}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
            >
              Effacer les courbes
            </button>

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Mode d'emploi :</b>
              <br />
              Chaque segment indique la pente y' en ce point.
              <br />
              <b className="text-blue-400">Cliquez</b> pour tracer une courbe solution passant par ce point.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
