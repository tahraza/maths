'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

interface ComplexMultiplicationProps {
  /** Partie réelle initiale de z */
  initialA?: number
  /** Partie imaginaire initiale de z */
  initialB?: number
  /** Module initial de w (facteur de zoom) */
  initialRho?: number
  /** Argument initial de w en degrés (rotation) */
  initialTheta?: number
  /** Afficher le bouton d'animation */
  showAnimation?: boolean
  /** Titre */
  title?: string
  /** Hauteur */
  height?: number
}

// Helpers
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
const rad = (deg: number) => (deg * Math.PI) / 180
const degFromRad = (r: number) => (r * 180) / Math.PI
const fmt = (x: number, n = 2) => (Math.abs(x) < 1e-10 ? 0 : x).toFixed(n)

// Complex multiplication: w * z where w = ρe^{iθ}
function mulComplex(a: number, b: number, rho: number, thetaDeg: number) {
  const t = rad(thetaDeg)
  const c = Math.cos(t)
  const s = Math.sin(t)
  return {
    re: rho * (a * c - b * s),
    im: rho * (a * s + b * c),
  }
}

export function ComplexMultiplication({
  initialA = 1.5,
  initialB = 1.2,
  initialRho = 1,
  initialTheta = 30,
  showAnimation = true,
  title,
  height = 500,
}: ComplexMultiplicationProps) {
  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)
  const [rho, setRho] = useState(initialRho)
  const [theta, setTheta] = useState(initialTheta)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef<number | null>(null)

  // SVG dimensions and coordinate system
  const W = 900
  const H = 560
  const cx = 460
  const cy = 280
  const unit = 70

  const pX = (x: number) => cx + x * unit
  const pY = (y: number) => cy - y * unit

  // Computed values
  const zMod = Math.hypot(a, b)
  const zArg = Math.atan2(b, a)
  const zp = mulComplex(a, b, rho, theta)
  const zpMod = Math.hypot(zp.re, zp.im)
  const zpArg = Math.atan2(zp.im, zp.re)

  // Positions
  const zx = pX(a)
  const zy = pY(b)
  const zpx = pX(zp.re)
  const zpy = pY(zp.im)
  const modRadius = zMod * unit

  // Arc path for angle visualization
  const arcPath = useMemo(() => {
    const arcR = clamp(0.9 * unit, 40, 90)
    const a1svg = -zArg
    const x0 = cx + arcR * Math.cos(0)
    const y0 = cy + arcR * Math.sin(0)
    const x1 = cx + arcR * Math.cos(a1svg)
    const y1 = cy + arcR * Math.sin(a1svg)
    const large = Math.abs(zArg) > Math.PI ? 1 : 0
    const sweep = zArg >= 0 ? 0 : 1
    return `M ${x0} ${y0} A ${arcR} ${arcR} 0 ${large} ${sweep} ${x1} ${y1}`
  }, [zArg])

  // Theta label position
  const thetaLabelPos = useMemo(() => {
    const arcR = clamp(0.9 * unit, 40, 90)
    const mid = -zArg / 2
    return {
      x: cx + (arcR + 18) * Math.cos(mid),
      y: cy + (arcR + 18) * Math.sin(mid),
    }
  }, [zArg])

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = []
    const min = -5
    const max = 5

    for (let i = min * 2; i <= max * 2; i++) {
      const v = i / 2
      const x = pX(v)
      const y = pY(v)
      const isInt = Number.isInteger(v)
      const stroke = isInt ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'
      const strokeWidth = isInt ? 1.5 : 1

      lines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={40}
          x2={x}
          y2={520}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )
      lines.push(
        <line
          key={`h-${i}`}
          x1={80}
          y1={y}
          x2={840}
          y2={y}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )

      if (isInt && v !== 0) {
        lines.push(
          <text
            key={`lx-${i}`}
            x={x + 4}
            y={cy + 16}
            fill="rgba(255,255,255,0.45)"
            fontSize={12}
          >
            {v}
          </text>
        )
        lines.push(
          <text
            key={`ly-${i}`}
            x={cx + 6}
            y={y - 6}
            fill="rgba(255,255,255,0.45)"
            fontSize={12}
          >
            {v}i
          </text>
        )
      }
    }
    return lines
  }, [])

  // Animation
  useEffect(() => {
    if (animating) {
      const tick = () => {
        setTheta((prev) => {
          let next = prev + 0.8
          if (next > 180) next = -180
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
    setA(initialA)
    setB(initialB)
    setRho(initialRho)
    setTheta(initialTheta)
    setAnimating(false)
  }

  const handleRandom = () => {
    setA(Math.round((Math.random() * 7 - 3.5) * 100) / 100)
    setB(Math.round((Math.random() * 7 - 3.5) * 100) / 100)
    setRho(Math.round(Math.random() * 2.2 * 100) / 100)
    setTheta(Math.round(Math.random() * 360 - 180))
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
                id="arrowBlue"
                markerWidth={12}
                markerHeight={12}
                refX={10}
                refY={6}
                orient="auto"
              >
                <path d="M0,0 L12,6 L0,12 Z" fill="#4aa3ff" />
              </marker>
              <marker
                id="arrowYellow"
                markerWidth={12}
                markerHeight={12}
                refX={10}
                refY={6}
                orient="auto"
              >
                <path d="M0,0 L12,6 L0,12 Z" fill="#ffd166" />
              </marker>
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
            </defs>

            {/* Grid */}
            <g>{gridLines}</g>

            {/* Axes */}
            <line
              x1={80}
              y1={cy}
              x2={840}
              y2={cy}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={2}
              markerEnd="url(#arrowAxis)"
            />
            <line
              x1={cx}
              y1={520}
              x2={cx}
              y2={40}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={2}
              markerEnd="url(#arrowAxis)"
            />
            <text x={845} y={cy - 10} fill="rgba(255,255,255,0.7)" fontSize={14}>
              Re
            </text>
            <text x={cx + 10} y={45} fill="rgba(255,255,255,0.7)" fontSize={14}>
              Im
            </text>

            {/* Origin */}
            <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.7)" />

            {/* Modulus circle */}
            <circle
              cx={cx}
              cy={cy}
              r={modRadius}
              fill="none"
              stroke="rgba(82,227,182,0.6)"
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <text
              x={cx + modRadius + 10}
              y={cy - 6}
              fill="rgba(82,227,182,0.95)"
              fontSize={14}
            >
              |z| = {fmt(zMod)}
            </text>

            {/* Angle arc */}
            <path
              d={arcPath}
              fill="none"
              stroke="#ffd166"
              strokeWidth={3}
              opacity={0.95}
            />
            <text
              x={thetaLabelPos.x}
              y={thetaLabelPos.y}
              fill="#ffd166"
              fontSize={14}
            >
              arg(z) = {fmt(degFromRad(zArg), 1)}°
            </text>

            {/* Vector z */}
            <line
              x1={cx}
              y1={cy}
              x2={zx}
              y2={zy}
              stroke="#4aa3ff"
              strokeWidth={4}
              markerEnd="url(#arrowBlue)"
            />
            <circle cx={zx} cy={zy} r={7} fill="#4aa3ff" />
            <text x={zx + 10} y={zy - 10} fill="rgba(255,255,255,0.92)" fontSize={14}>
              z
            </text>

            {/* Vector z' = w*z */}
            <line
              x1={cx}
              y1={cy}
              x2={zpx}
              y2={zpy}
              stroke="#ffd166"
              strokeWidth={4}
              markerEnd="url(#arrowYellow)"
              opacity={0.95}
            />
            <circle cx={zpx} cy={zpy} r={7} fill="#ffd166" opacity={0.95} />
            <text x={zpx + 10} y={zpy - 10} fill="rgba(255,255,255,0.92)" fontSize={14}>
              z'
            </text>

            {/* Info box */}
            <g transform="translate(20,20)">
              <rect
                x={0}
                y={0}
                width={310}
                height={108}
                rx={12}
                fill="rgba(0,0,0,0.25)"
                stroke="rgba(255,255,255,0.1)"
              />
              <text x={14} y={28} fill="rgba(255,255,255,0.92)" fontSize={14}>
                z = {fmt(a)} + {fmt(b)}i
              </text>
              <text x={14} y={52} fill="rgba(255,255,255,0.8)" fontSize={13}>
                |z| = {fmt(zMod)} arg(z) = {fmt(degFromRad(zArg), 1)}°
              </text>
              <text x={14} y={76} fill="rgba(255,255,255,0.8)" fontSize={13}>
                w = ρe^(iθ) : ρ={fmt(rho)} θ={theta}°
              </text>
              <text x={14} y={100} fill="rgba(255,255,255,0.8)" fontSize={13}>
                z' = w·z = {fmt(zp.re)} + {fmt(zp.im)}i
              </text>
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#4aa3ff]" />
              <span>Vecteur <b>z</b></span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ffd166]" />
              <span>Vecteur <b>z' = w·z</b></span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[#52e3b6]" />
              <span>Cercle de module <b>|z|</b></span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-64 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Contrôles</h5>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>a (partie réelle de z)</label>
                <span className="font-mono text-blue-400">{fmt(a)}</span>
              </div>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.01}
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>b (partie imaginaire de z)</label>
                <span className="font-mono text-blue-400">{fmt(b)}</span>
              </div>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.01}
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <hr className="border-gray-700" />

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>ρ (zoom de w)</label>
                <span className="font-mono text-yellow-400">{fmt(rho)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2.5}
                step={0.01}
                value={rho}
                onChange={(e) => setRho(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <label>θ (rotation en degrés)</label>
                <span className="font-mono text-yellow-400">{theta}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={theta}
                onChange={(e) => setTheta(parseInt(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            {showAnimation && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAnimating(!animating)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
                >
                  {animating ? '⏸ Stop' : '▶ Animer θ'}
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
                >
                  ↺
                </button>
                <button
                  onClick={handleRandom}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
                >
                  🎲
                </button>
              </div>
            )}

            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Interprétation :</b>
              <br />
              Multiplier par w = ρe^(iθ) revient à <b className="text-yellow-400">tourner</b> de θ
              et <b className="text-green-400">agrandir/rétrécir</b> par ρ.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
