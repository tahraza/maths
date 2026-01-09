'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

interface MatrixTransformationProps {
  /** Matrice initiale [a, b, c, d] pour [[a, b], [c, d]] */
  initialMatrix?: [number, number, number, number]
  /** Afficher la grille */
  showGrid?: boolean
  /** Afficher le bouton d'animation */
  showAnimation?: boolean
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

// Preset transformations
const PRESETS = {
  identity: { name: 'Identité', matrix: [1, 0, 0, 1] as [number, number, number, number] },
  rotation45: { name: 'Rotation 45°', matrix: [0.707, -0.707, 0.707, 0.707] as [number, number, number, number] },
  rotation90: { name: 'Rotation 90°', matrix: [0, -1, 1, 0] as [number, number, number, number] },
  scale2: { name: 'Homothétie ×2', matrix: [2, 0, 0, 2] as [number, number, number, number] },
  scaleX: { name: 'Étirement X', matrix: [2, 0, 0, 1] as [number, number, number, number] },
  scaleY: { name: 'Étirement Y', matrix: [1, 0, 0, 2] as [number, number, number, number] },
  shearX: { name: 'Cisaillement X', matrix: [1, 1, 0, 1] as [number, number, number, number] },
  shearY: { name: 'Cisaillement Y', matrix: [1, 0, 1, 1] as [number, number, number, number] },
  reflectX: { name: 'Réflexion X', matrix: [1, 0, 0, -1] as [number, number, number, number] },
  reflectY: { name: 'Réflexion Y', matrix: [-1, 0, 0, 1] as [number, number, number, number] },
}

// Transform a point by matrix [[a, b], [c, d]]
function transform(x: number, y: number, m: [number, number, number, number]): [number, number] {
  return [m[0] * x + m[1] * y, m[2] * x + m[3] * y]
}

// Calculate determinant
function det(m: [number, number, number, number]): number {
  return m[0] * m[3] - m[1] * m[2]
}

export function MatrixTransformation({
  initialMatrix = [1, 0, 0, 1],
  showGrid = true,
  showAnimation = true,
  title,
  height = 520,
}: MatrixTransformationProps) {
  const [matrix, setMatrix] = useState<[number, number, number, number]>(initialMatrix)
  const [animating, setAnimating] = useState(false)
  const [animProgress, setAnimProgress] = useState(1)
  const animRef = useRef<number | null>(null)
  const targetMatrixRef = useRef<[number, number, number, number]>(matrix)

  // SVG dimensions
  const W = 800
  const H = 520
  const cx = 400
  const cy = 260
  const unit = 60

  const pX = (x: number) => cx + x * unit
  const pY = (y: number) => cy - y * unit

  // Interpolate matrix for animation
  const displayMatrix = useMemo((): [number, number, number, number] => {
    if (animProgress >= 1) return matrix
    const t = animProgress
    const target = targetMatrixRef.current
    return [
      (1 - t) * 1 + t * target[0],
      (1 - t) * 0 + t * target[1],
      (1 - t) * 0 + t * target[2],
      (1 - t) * 1 + t * target[3],
    ]
  }, [matrix, animProgress])

  const determinant = det(displayMatrix)

  // Base shape (unit square)
  const baseSquare = useMemo(() => [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ], [])

  // Transformed shape
  const transformedSquare = useMemo(() => {
    return baseSquare.map(([x, y]) => transform(x, y, displayMatrix))
  }, [baseSquare, displayMatrix])

  // Grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return { original: [], transformed: [] }

    const original: { x1: number; y1: number; x2: number; y2: number }[] = []
    const transformed: { x1: number; y1: number; x2: number; y2: number }[] = []

    for (let i = -3; i <= 3; i++) {
      // Vertical lines
      original.push({ x1: i, y1: -3, x2: i, y2: 3 })
      const [tx1, ty1] = transform(i, -3, displayMatrix)
      const [tx2, ty2] = transform(i, 3, displayMatrix)
      transformed.push({ x1: tx1, y1: ty1, x2: tx2, y2: ty2 })

      // Horizontal lines
      original.push({ x1: -3, y1: i, x2: 3, y2: i })
      const [hx1, hy1] = transform(-3, i, displayMatrix)
      const [hx2, hy2] = transform(3, i, displayMatrix)
      transformed.push({ x1: hx1, y1: hy1, x2: hx2, y2: hy2 })
    }

    return { original, transformed }
  }, [showGrid, displayMatrix])

  // Unit vectors
  const unitVectors = useMemo(() => {
    const e1 = transform(1, 0, displayMatrix)
    const e2 = transform(0, 1, displayMatrix)
    return { e1, e2 }
  }, [displayMatrix])

  // Animation effect
  useEffect(() => {
    if (animating && animProgress < 1) {
      const tick = () => {
        setAnimProgress((prev) => {
          const next = prev + 0.02
          if (next >= 1) {
            setAnimating(false)
            return 1
          }
          return next
        })
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    }
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
  }, [animating, animProgress])

  const applyPreset = (preset: keyof typeof PRESETS) => {
    targetMatrixRef.current = PRESETS[preset].matrix
    setMatrix(PRESETS[preset].matrix)
    if (showAnimation) {
      setAnimProgress(0)
      setAnimating(true)
    }
  }

  const handleMatrixChange = (index: number, value: number) => {
    const newMatrix: [number, number, number, number] = [...matrix]
    newMatrix[index] = value
    setMatrix(newMatrix)
    targetMatrixRef.current = newMatrix
    setAnimProgress(1)
  }

  const handleReset = () => {
    setMatrix([1, 0, 0, 1])
    targetMatrixRef.current = [1, 0, 0, 1]
    setAnimProgress(1)
    setAnimating(false)
  }

  // Create polygon path
  const polygonPath = (points: number[][]) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pX(p[0])} ${pY(p[1])}`).join(' ') + ' Z'
  }

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
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ maxHeight: height, background: 'transparent' }}
          >
            <defs>
              <marker
                id="arrowRed"
                markerWidth={10}
                markerHeight={10}
                refX={8}
                refY={5}
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="#ff6b6b" />
              </marker>
              <marker
                id="arrowGreen"
                markerWidth={10}
                markerHeight={10}
                refX={8}
                refY={5}
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="#52e3b6" />
              </marker>
              <marker
                id="arrowAxisM"
                markerWidth={10}
                markerHeight={10}
                refX={8}
                refY={5}
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="rgba(255,255,255,0.4)" />
              </marker>
            </defs>

            {/* Axes */}
            <line x1={40} y1={cy} x2={W - 40} y2={cy} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#arrowAxisM)" />
            <line x1={cx} y1={H - 40} x2={cx} y2={40} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#arrowAxisM)" />

            {/* Original grid (faded) */}
            {gridLines.original.map((line, i) => (
              <line
                key={`orig-${i}`}
                x1={pX(line.x1)}
                y1={pY(line.y1)}
                x2={pX(line.x2)}
                y2={pY(line.y2)}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            ))}

            {/* Transformed grid */}
            {gridLines.transformed.map((line, i) => (
              <line
                key={`trans-${i}`}
                x1={pX(line.x1)}
                y1={pY(line.y1)}
                x2={pX(line.x2)}
                y2={pY(line.y2)}
                stroke="rgba(100, 200, 255, 0.25)"
                strokeWidth={1}
              />
            ))}

            {/* Original square (faded) */}
            <path
              d={polygonPath(baseSquare)}
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* Transformed square */}
            <path
              d={polygonPath(transformedSquare)}
              fill={determinant >= 0 ? 'rgba(82, 227, 182, 0.2)' : 'rgba(255, 107, 107, 0.2)'}
              stroke={determinant >= 0 ? '#52e3b6' : '#ff6b6b'}
              strokeWidth={3}
            />

            {/* Original unit vectors (faded) */}
            <line x1={pX(0)} y1={pY(0)} x2={pX(1)} y2={pY(0)} stroke="rgba(255,107,107,0.3)" strokeWidth={2} strokeDasharray="4 4" />
            <line x1={pX(0)} y1={pY(0)} x2={pX(0)} y2={pY(1)} stroke="rgba(82,227,182,0.3)" strokeWidth={2} strokeDasharray="4 4" />

            {/* Transformed unit vectors */}
            <line
              x1={pX(0)}
              y1={pY(0)}
              x2={pX(unitVectors.e1[0])}
              y2={pY(unitVectors.e1[1])}
              stroke="#ff6b6b"
              strokeWidth={4}
              markerEnd="url(#arrowRed)"
            />
            <text
              x={pX(unitVectors.e1[0]) + 10}
              y={pY(unitVectors.e1[1]) - 5}
              fill="#ff6b6b"
              fontSize={14}
              fontWeight="bold"
            >
              e₁'
            </text>

            <line
              x1={pX(0)}
              y1={pY(0)}
              x2={pX(unitVectors.e2[0])}
              y2={pY(unitVectors.e2[1])}
              stroke="#52e3b6"
              strokeWidth={4}
              markerEnd="url(#arrowGreen)"
            />
            <text
              x={pX(unitVectors.e2[0]) + 10}
              y={pY(unitVectors.e2[1]) - 5}
              fill="#52e3b6"
              fontSize={14}
              fontWeight="bold"
            >
              e₂'
            </text>

            {/* Origin */}
            <circle cx={cx} cy={cy} r={5} fill="white" />

            {/* Matrix display */}
            <g transform="translate(20, 20)">
              <rect
                x={0}
                y={0}
                width={180}
                height={120}
                rx={12}
                fill="rgba(0,0,0,0.4)"
                stroke="rgba(255,255,255,0.1)"
              />
              <text x={14} y={25} fill="rgba(255,255,255,0.9)" fontSize={13} fontWeight="bold">
                Matrice A :
              </text>
              <text x={14} y={50} fill="rgba(255,255,255,0.8)" fontSize={16} fontFamily="monospace">
                ⎡ {fmt(displayMatrix[0], 2).padStart(5)}  {fmt(displayMatrix[1], 2).padStart(5)} ⎤
              </text>
              <text x={14} y={72} fill="rgba(255,255,255,0.8)" fontSize={16} fontFamily="monospace">
                ⎣ {fmt(displayMatrix[2], 2).padStart(5)}  {fmt(displayMatrix[3], 2).padStart(5)} ⎦
              </text>
              <text x={14} y={100} fill={determinant >= 0 ? '#52e3b6' : '#ff6b6b'} fontSize={13}>
                det(A) = {fmt(determinant, 3)}
              </text>
              <text x={14} y={115} fill="rgba(255,255,255,0.5)" fontSize={10}>
                {determinant > 0 ? '(orientation conservée)' : determinant < 0 ? '(orientation inversée)' : '(dégénérée)'}
              </text>
            </g>

            {/* Legend */}
            <g transform={`translate(${W - 200}, 20)`}>
              <rect
                x={0}
                y={0}
                width={180}
                height={90}
                rx={12}
                fill="rgba(0,0,0,0.4)"
                stroke="rgba(255,255,255,0.1)"
              />
              <text x={14} y={25} fill="rgba(255,255,255,0.7)" fontSize={11}>
                <tspan fill="#ff6b6b">e₁' = A × e₁</tspan> = ({fmt(unitVectors.e1[0])}, {fmt(unitVectors.e1[1])})
              </text>
              <text x={14} y={48} fill="rgba(255,255,255,0.7)" fontSize={11}>
                <tspan fill="#52e3b6">e₂' = A × e₂</tspan> = ({fmt(unitVectors.e2[0])}, {fmt(unitVectors.e2[1])})
              </text>
              <text x={14} y={75} fill="rgba(255,255,255,0.5)" fontSize={10}>
                Aire transformée = |det| × Aire
              </text>
            </g>
          </svg>

          {/* Legend bar */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 border border-dashed border-white/30 bg-white/10" />
              <span>Carré original</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#52e3b6]/50" />
              <span>Carré transformé</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span>Vecteur e₁'</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#52e3b6]" />
              <span>Vecteur e₂'</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-64 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Coefficients</h5>

          <div className="mb-4 grid grid-cols-2 gap-2">
            {['a', 'b', 'c', 'd'].map((label, i) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400">
                  <label>{label}</label>
                  <span className="font-mono text-blue-400">{fmt(matrix[i])}</span>
                </div>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={matrix[i]}
                  onChange={(e) => handleMatrixChange(i, parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
            ))}
          </div>

          <h5 className="mb-2 text-sm font-medium text-gray-300">Transformations</h5>
          <div className="mb-4 grid grid-cols-2 gap-1">
            {Object.entries(PRESETS).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => applyPreset(key as keyof typeof PRESETS)}
                className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
              >
                {name}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
          >
            ↺ Réinitialiser
          </button>

          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
            <b className="text-gray-300">Interprétation :</b>
            <br />
            La matrice transforme le carré unité. Le <b className="text-green-400">déterminant</b> mesure
            le facteur d'aire (négatif = retournement).
          </div>
        </div>
      </div>
    </div>
  )
}
