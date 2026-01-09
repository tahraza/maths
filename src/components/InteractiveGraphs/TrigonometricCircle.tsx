'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

interface TrigonometricCircleProps {
  /** Angle initial en degrés */
  initialAngle?: number
  /** Afficher les valeurs remarquables */
  showRemarkableValues?: boolean
  /** Afficher le mode symétries */
  showSymmetries?: boolean
  /** Afficher le bouton d'animation */
  showAnimation?: boolean
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

// Helpers
const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const fmt = (x: number, n = 3) => {
  if (Math.abs(x) < 1e-10) return '0'
  return x.toFixed(n).replace(/\.?0+$/, '')
}

// Valeurs remarquables
const REMARKABLE_ANGLES = [
  { deg: 0, label: '0', cos: '1', sin: '0' },
  { deg: 30, label: 'π/6', cos: '√3/2', sin: '1/2' },
  { deg: 45, label: 'π/4', cos: '√2/2', sin: '√2/2' },
  { deg: 60, label: 'π/3', cos: '1/2', sin: '√3/2' },
  { deg: 90, label: 'π/2', cos: '0', sin: '1' },
  { deg: 120, label: '2π/3', cos: '-1/2', sin: '√3/2' },
  { deg: 135, label: '3π/4', cos: '-√2/2', sin: '√2/2' },
  { deg: 150, label: '5π/6', cos: '-√3/2', sin: '1/2' },
  { deg: 180, label: 'π', cos: '-1', sin: '0' },
  { deg: 210, label: '7π/6', cos: '-√3/2', sin: '-1/2' },
  { deg: 225, label: '5π/4', cos: '-√2/2', sin: '-√2/2' },
  { deg: 240, label: '4π/3', cos: '-1/2', sin: '-√3/2' },
  { deg: 270, label: '3π/2', cos: '0', sin: '-1' },
  { deg: 300, label: '5π/3', cos: '1/2', sin: '-√3/2' },
  { deg: 315, label: '7π/4', cos: '√2/2', sin: '-√2/2' },
  { deg: 330, label: '11π/6', cos: '√3/2', sin: '-1/2' },
]

export function TrigonometricCircle({
  initialAngle = 45,
  showRemarkableValues = true,
  showSymmetries = false,
  showAnimation = true,
  title,
  height = 520,
}: TrigonometricCircleProps) {
  const [angleDeg, setAngleDeg] = useState(initialAngle)
  const [animating, setAnimating] = useState(false)
  const [showSymMode, setShowSymMode] = useState(showSymmetries)
  const animRef = useRef<number | null>(null)

  // SVG dimensions
  const W = 800
  const H = 520
  const cx = 320
  const cy = 260
  const radius = 180

  const pX = (x: number) => cx + x * radius
  const pY = (y: number) => cy - y * radius

  // Computed values
  const angleRad = rad(angleDeg)
  const cosVal = Math.cos(angleRad)
  const sinVal = Math.sin(angleRad)
  const tanVal = Math.abs(cosVal) > 1e-10 ? sinVal / cosVal : null

  // Point M coordinates
  const mx = pX(cosVal)
  const my = pY(sinVal)

  // Projection points
  const projX = pX(cosVal)
  const projXY = pY(0)
  const projY = pX(0)
  const projYY = pY(sinVal)

  // Symmetry points
  const symPoints = useMemo(() => {
    if (!showSymMode) return []
    const a = angleRad
    return [
      { angle: -angleDeg, color: '#ff6b6b', label: '-θ', x: Math.cos(-a), y: Math.sin(-a) },
      { angle: 180 - angleDeg, color: '#4ecdc4', label: 'π-θ', x: Math.cos(Math.PI - a), y: Math.sin(Math.PI - a) },
      { angle: 180 + angleDeg, color: '#ffe66d', label: 'π+θ', x: Math.cos(Math.PI + a), y: Math.sin(Math.PI + a) },
    ]
  }, [angleDeg, angleRad, showSymMode])

  // Arc path for angle
  const arcPath = useMemo(() => {
    const arcR = 40
    const startAngle = 0
    const endAngle = -angleRad
    const x0 = cx + arcR
    const y0 = cy
    const x1 = cx + arcR * Math.cos(endAngle)
    const y1 = cy + arcR * Math.sin(endAngle)
    const largeArc = Math.abs(angleDeg) > 180 ? 1 : 0
    const sweep = angleDeg >= 0 ? 0 : 1
    return `M ${x0} ${y0} A ${arcR} ${arcR} 0 ${largeArc} ${sweep} ${x1} ${y1}`
  }, [angleDeg, angleRad])

  // Remarkable values markers
  const remarkableMarkers = useMemo(() => {
    if (!showRemarkableValues) return []
    return REMARKABLE_ANGLES.map((v) => {
      const a = rad(v.deg)
      return {
        ...v,
        x: pX(Math.cos(a)),
        y: pY(Math.sin(a)),
        labelX: pX(Math.cos(a) * 1.15),
        labelY: pY(Math.sin(a) * 1.15),
      }
    })
  }, [showRemarkableValues])

  // Animation
  useEffect(() => {
    if (animating) {
      const tick = () => {
        setAngleDeg((prev) => {
          let next = prev + 1
          if (next >= 360) next = 0
          return next
        })
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    } else {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
  }, [animating])

  const handleReset = () => {
    setAngleDeg(initialAngle)
    setAnimating(false)
  }

  const snapToRemarkable = (value: number) => {
    const closest = REMARKABLE_ANGLES.reduce((prev, curr) => {
      const prevDiff = Math.min(Math.abs(prev.deg - value), Math.abs(prev.deg - value + 360), Math.abs(prev.deg - value - 360))
      const currDiff = Math.min(Math.abs(curr.deg - value), Math.abs(curr.deg - value + 360), Math.abs(curr.deg - value - 360))
      return currDiff < prevDiff ? curr : prev
    })
    if (Math.abs(closest.deg - value) < 5 || Math.abs(closest.deg - value + 360) < 5 || Math.abs(closest.deg - value - 360) < 5) {
      return closest.deg
    }
    return value
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
                id="arrowAxis"
                markerWidth={10}
                markerHeight={10}
                refX={8}
                refY={5}
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="rgba(255,255,255,0.45)" />
              </marker>
              <marker
                id="arrowBlue"
                markerWidth={10}
                markerHeight={10}
                refX={8}
                refY={5}
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="#4aa3ff" />
              </marker>
            </defs>

            {/* Grid lines */}
            <line x1={cx - radius - 40} y1={cy} x2={cx + radius + 60} y2={cy} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#arrowAxis)" />
            <line x1={cx} y1={cy + radius + 40} x2={cx} y2={cy - radius - 40} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#arrowAxis)" />

            {/* Axis labels */}
            <text x={cx + radius + 65} y={cy + 5} fill="rgba(255,255,255,0.7)" fontSize={14}>x</text>
            <text x={cx + 8} y={cy - radius - 45} fill="rgba(255,255,255,0.7)" fontSize={14}>y</text>

            {/* Unit markers */}
            <line x1={pX(1)} y1={cy - 5} x2={pX(1)} y2={cy + 5} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            <text x={pX(1) - 3} y={cy + 20} fill="rgba(255,255,255,0.6)" fontSize={12}>1</text>
            <line x1={pX(-1)} y1={cy - 5} x2={pX(-1)} y2={cy + 5} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            <text x={pX(-1) - 6} y={cy + 20} fill="rgba(255,255,255,0.6)" fontSize={12}>-1</text>
            <line x1={cx - 5} y1={pY(1)} x2={cx + 5} y2={pY(1)} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            <text x={cx + 10} y={pY(1) + 4} fill="rgba(255,255,255,0.6)" fontSize={12}>1</text>
            <line x1={cx - 5} y1={pY(-1)} x2={cx + 5} y2={pY(-1)} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            <text x={cx + 10} y={pY(-1) + 4} fill="rgba(255,255,255,0.6)" fontSize={12}>-1</text>

            {/* Trigonometric circle */}
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2} />

            {/* Remarkable values dots */}
            {remarkableMarkers.map((v, i) => (
              <g key={i}>
                <circle cx={v.x} cy={v.y} r={4} fill="rgba(255,255,255,0.3)" />
                <text
                  x={v.labelX}
                  y={v.labelY}
                  fill="rgba(255,255,255,0.5)"
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {v.label}
                </text>
              </g>
            ))}

            {/* Projection lines (dashed) */}
            <line x1={mx} y1={my} x2={projX} y2={projXY} stroke="#4aa3ff" strokeWidth={2} strokeDasharray="5 5" opacity={0.7} />
            <line x1={mx} y1={my} x2={projY} y2={projYY} stroke="#ff6b6b" strokeWidth={2} strokeDasharray="5 5" opacity={0.7} />

            {/* Cos projection on X axis */}
            <line x1={cx} y1={cy} x2={projX} y2={cy} stroke="#4aa3ff" strokeWidth={4} />
            <text x={(cx + projX) / 2} y={cy + 25} fill="#4aa3ff" fontSize={14} textAnchor="middle">
              cos θ
            </text>

            {/* Sin projection on Y axis */}
            <line x1={cx} y1={cy} x2={cx} y2={projYY} stroke="#ff6b6b" strokeWidth={4} />
            <text x={cx - 30} y={(cy + projYY) / 2} fill="#ff6b6b" fontSize={14} textAnchor="middle">
              sin θ
            </text>

            {/* Angle arc */}
            <path d={arcPath} fill="none" stroke="#ffd166" strokeWidth={3} />

            {/* Angle label */}
            <text
              x={cx + 55 * Math.cos(-angleRad / 2)}
              y={cy + 55 * Math.sin(-angleRad / 2)}
              fill="#ffd166"
              fontSize={14}
              textAnchor="middle"
            >
              θ
            </text>

            {/* Radius to M */}
            <line x1={cx} y1={cy} x2={mx} y2={my} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />

            {/* Point M */}
            <circle cx={mx} cy={my} r={8} fill="#52e3b6" stroke="white" strokeWidth={2} />
            <text x={mx + 15} y={my - 10} fill="white" fontSize={14} fontWeight="bold">
              M
            </text>

            {/* Symmetry points */}
            {symPoints.map((p, i) => (
              <g key={i}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={pX(p.x)}
                  y2={pY(p.y)}
                  stroke={p.color}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  opacity={0.7}
                />
                <circle cx={pX(p.x)} cy={pY(p.y)} r={6} fill={p.color} />
                <text
                  x={pX(p.x * 1.12)}
                  y={pY(p.y * 1.12)}
                  fill={p.color}
                  fontSize={12}
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              </g>
            ))}

            {/* Origin */}
            <circle cx={cx} cy={cy} r={4} fill="white" />
            <text x={cx - 15} y={cy + 20} fill="rgba(255,255,255,0.7)" fontSize={12}>O</text>

            {/* Info box */}
            <g transform="translate(540, 20)">
              <rect
                x={0}
                y={0}
                width={240}
                height={showSymMode ? 200 : 140}
                rx={12}
                fill="rgba(0,0,0,0.4)"
                stroke="rgba(255,255,255,0.1)"
              />
              <text x={14} y={28} fill="#ffd166" fontSize={14} fontWeight="bold">
                θ = {angleDeg}° = {fmt(angleRad, 4)} rad
              </text>
              <text x={14} y={52} fill="#4aa3ff" fontSize={14}>
                cos θ = {fmt(cosVal, 4)}
              </text>
              <text x={14} y={76} fill="#ff6b6b" fontSize={14}>
                sin θ = {fmt(sinVal, 4)}
              </text>
              <text x={14} y={100} fill="#52e3b6" fontSize={14}>
                tan θ = {tanVal !== null ? fmt(tanVal, 4) : '∞'}
              </text>
              <text x={14} y={128} fill="rgba(255,255,255,0.6)" fontSize={12}>
                M({fmt(cosVal, 3)}, {fmt(sinVal, 3)})
              </text>

              {showSymMode && (
                <>
                  <line x1={14} y1={145} x2={226} y2={145} stroke="rgba(255,255,255,0.2)" />
                  <text x={14} y={165} fill="#ff6b6b" fontSize={11}>
                    -θ: cos={fmt(Math.cos(-angleRad), 3)}, sin={fmt(Math.sin(-angleRad), 3)}
                  </text>
                  <text x={14} y={183} fill="#4ecdc4" fontSize={11}>
                    π-θ: cos={fmt(Math.cos(Math.PI - angleRad), 3)}, sin={fmt(Math.sin(Math.PI - angleRad), 3)}
                  </text>
                </>
              )}
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#52e3b6]" />
              <span>Point M sur le cercle</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#4aa3ff]" />
              <span>cos θ (abscisse)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span>sin θ (ordonnée)</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-56 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Contrôles</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>Angle θ</label>
                <span className="font-mono text-yellow-400">{angleDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angleDeg}
                onChange={(e) => setAngleDeg(snapToRemarkable(parseInt(e.target.value)))}
                className="mt-1 w-full"
              />
            </div>

            {/* Quick angle buttons */}
            <div className="grid grid-cols-4 gap-1">
              {[0, 30, 45, 60, 90, 120, 180, 270].map((a) => (
                <button
                  key={a}
                  onClick={() => setAngleDeg(a)}
                  className={`rounded px-2 py-1 text-xs ${
                    angleDeg === a
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>

            <hr className="border-gray-700" />

            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showSymMode}
                onChange={(e) => setShowSymMode(e.target.checked)}
                className="rounded"
              />
              Afficher les symétries
            </label>

            {showAnimation && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAnimating(!animating)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
                >
                  {animating ? '⏸ Stop' : '▶ Animer'}
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
                >
                  ↺
                </button>
              </div>
            )}

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Rappel :</b>
              <br />
              Le point M de coordonnées <b className="text-green-400">(cos θ, sin θ)</b>
              se déplace sur le cercle de rayon 1.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
