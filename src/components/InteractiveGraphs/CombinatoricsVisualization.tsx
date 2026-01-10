'use client'

import { useState, useCallback, useEffect } from 'react'

interface CombinatoricsVisualizationProps {
  initialN?: number
  initialK?: number
  initialMode?: 'comb' | 'arr' | 'perm'
}

// BigInt helpers for large factorials
function factorial(n: number): bigint {
  let r = BigInt(1)
  for (let i = BigInt(2); i <= BigInt(n); i++) r *= i
  return r
}

function arrangements(n: number, k: number): bigint {
  if (k < 0 || k > n) return BigInt(0)
  let r = BigInt(1)
  for (let i = 0; i < k; i++) r *= BigInt(n - i)
  return r
}

function combinations(n: number, k: number): bigint {
  if (k < 0 || k > n) return BigInt(0)
  if (k > n - k) k = n - k
  let num = BigInt(1)
  let den = BigInt(1)
  for (let i = 1; i <= k; i++) {
    num *= BigInt(n - (k - i))
    den *= BigInt(i)
  }
  return num / den
}

function formatBigInt(x: bigint): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function sampleWithoutReplacement(n: number, k: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  return shuffleArray(arr).slice(0, k)
}

export function CombinatoricsVisualization({
  initialN = 8,
  initialK = 3,
  initialMode = 'comb'
}: CombinatoricsVisualizationProps) {
  const [n, setN] = useState(initialN)
  const [k, setK] = useState(initialK)
  const [mode, setMode] = useState<'comb' | 'arr' | 'perm'>(initialMode)
  const [selected, setSelected] = useState<number[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  // Initialize selection
  useEffect(() => {
    const newSelected = sampleWithoutReplacement(n, Math.min(k, n))
    setSelected(newSelected)
    setOrder(shuffleArray([...newSelected]))
  }, [])

  // Update selection when n or k changes
  const updateSelection = useCallback(() => {
    const effectiveK = mode === 'perm' ? n : Math.min(k, n)
    if (selected.length !== effectiveK || selected.some(v => v >= n)) {
      const newSelected = sampleWithoutReplacement(n, effectiveK)
      setSelected(newSelected)
      setOrder(shuffleArray([...newSelected]))
    }
  }, [n, k, mode, selected])

  useEffect(() => {
    updateSelection()
  }, [n, k, mode])

  // Animation effect
  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      const effectiveK = mode === 'perm' ? n : k
      if (mode === 'comb') {
        const newSelected = sampleWithoutReplacement(n, effectiveK)
        setSelected(newSelected)
        setOrder(shuffleArray([...newSelected]))
      } else {
        setOrder(prev => shuffleArray([...prev]))
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isAnimating, mode, n, k])

  const handleShuffle = () => {
    const effectiveK = mode === 'perm' ? n : k
    const newSelected = sampleWithoutReplacement(n, effectiveK)
    setSelected(newSelected)
    setOrder(shuffleArray([...newSelected]))
  }

  const handleNChange = (newN: number) => {
    setN(newN)
    if (k > newN) setK(newN)
  }

  const handleModeChange = (newMode: 'comb' | 'arr' | 'perm') => {
    setMode(newMode)
    if (newMode === 'perm') {
      setK(n)
    }
  }

  // Calculate results
  const effectiveK = mode === 'perm' ? n : k
  const Cnk = combinations(n, effectiveK)
  const Ank = arrangements(n, effectiveK)
  const Pn = factorial(n)

  let count: bigint
  let formula: string
  let interpretation: string
  let modeLabel: string

  if (mode === 'comb') {
    count = Cnk
    formula = 'C(n,k) = n! / (k!(n−k)!)'
    interpretation = 'On compte les sous-ensembles de taille k.'
    modeLabel = 'Combinaisons'
  } else if (mode === 'arr') {
    count = Ank
    formula = 'A(n,k) = n(n−1)…(n−k+1) = n!/(n−k)!'
    interpretation = 'On remplit k places avec k objets distincts.'
    modeLabel = 'Arrangements'
  } else {
    count = Pn
    formula = 'P(n) = n!'
    interpretation = 'On ordonne tous les n objets.'
    modeLabel = 'Permutations'
  }

  // SVG positions
  const poolStartX = 60
  const poolStartY = 80
  const poolDx = 65
  const poolDy = 65

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 bg-black/20">
        <h3 className="font-semibold text-white text-sm">
          Combinatoire — choisir k objets parmi n
        </h3>
      </div>

      {/* SVG Visualization */}
      <svg viewBox="0 0 800 480" className="w-full h-auto">
        <defs>
          <marker id="arrow-comb" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 Z" fill="rgba(255,255,255,0.55)" />
          </marker>
          <filter id="glow-comb" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title for pool */}
        <text x="30" y="44" fill="rgba(255,255,255,0.82)" fontSize="13">
          Ensemble de départ (n = {n} objets)
        </text>

        {/* Pool of items */}
        {Array.from({ length: n }, (_, i) => {
          const row = Math.floor(i / 6)
          const col = i % 6
          const x = poolStartX + col * poolDx
          const y = poolStartY + row * poolDy
          const isSelected = selected.includes(i)

          return (
            <g key={`pool-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={18}
                fill={isSelected ? '#ffd166' : '#4aa3ff'}
                stroke={isSelected ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={1.8}
                filter={isSelected ? 'url(#glow-comb)' : undefined}
              />
              <text
                x={x}
                y={y}
                fill="rgba(0,0,0,0.75)"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {i + 1}
              </text>
            </g>
          )
        })}

        {/* Arrow */}
        <line
          x1="400"
          y1="190"
          x2="400"
          y2="235"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          markerEnd="url(#arrow-comb)"
        />

        {/* Chosen subset title */}
        <text x="30" y="275" fill="rgba(255,255,255,0.82)" fontSize="13">
          Choix (k = {effectiveK} objets)
        </text>

        {/* Chosen subset */}
        {effectiveK === 0 ? (
          <text x="120" y="320" fill="rgba(255,255,255,0.65)" fontSize="18" textAnchor="middle">
            ∅
          </text>
        ) : (
          selected.map((itemIdx, j) => {
            const x = 60 + j * 60
            const y = 320
            return (
              <g key={`chosen-${j}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={20}
                  fill="#ffd166"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1.8}
                />
                <text
                  x={x}
                  y={y}
                  fill="rgba(0,0,0,0.75)"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {itemIdx + 1}
                </text>
              </g>
            )
          })
        )}

        {/* Ordered slots title */}
        <text x="460" y="275" fill="rgba(255,255,255,0.82)" fontSize="13">
          {mode === 'comb' ? 'Ordre ignoré' : `Si l'ordre compte : ${effectiveK} places`}
        </text>

        {/* Ordered slots */}
        {mode !== 'comb' ? (
          order.map((itemIdx, j) => {
            const col = j % 4
            const row = Math.floor(j / 4)
            const x = 480 + col * 70
            const y = 300 + row * 70
            return (
              <g key={`slot-${j}`}>
                <rect
                  x={x}
                  y={y}
                  width={52}
                  height={52}
                  rx={10}
                  fill="rgba(255,92,122,0.12)"
                  stroke="rgba(255,92,122,0.35)"
                />
                <text
                  x={x + 26}
                  y={y + 10}
                  fill="rgba(255,255,255,0.60)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {j + 1}
                </text>
                <circle
                  cx={x + 26}
                  cy={y + 32}
                  r={16}
                  fill="#ffd166"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1.6}
                />
                <text
                  x={x + 26}
                  y={y + 32}
                  fill="rgba(0,0,0,0.75)"
                  fontSize="11"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {itemIdx + 1}
                </text>
              </g>
            )
          })
        ) : (
          <text x="560" y="340" fill="rgba(255,255,255,0.55)" fontSize="13" textAnchor="middle">
            (ordre non considéré)
          </text>
        )}

        {/* Info box */}
        <rect x="20" y="390" width="760" height="80" rx="12" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.10)" />
        <text x="34" y="415" fill="rgba(255,255,255,0.92)" fontSize="13">
          Mode : {modeLabel} | n = {n}, k = {effectiveK}
        </text>
        <text x="34" y="438" fill="rgba(255,255,255,0.82)" fontSize="12">
          Formule : {formula}
        </text>
        <text x="34" y="458" fill="rgba(255,255,255,0.82)" fontSize="12">
          Nombre de cas : {formatBigInt(count)} — {interpretation}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-4 py-2 border-t border-slate-700 bg-black/10 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#4aa3ff]" />
          Objets disponibles
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ffd166]" />
          Objets sélectionnés
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5c7a]" />
          Places (si ordre compte)
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/20 border-t border-slate-700 space-y-4">
        {/* n slider */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 w-24">n (ensemble)</label>
          <input
            type="range"
            min={1}
            max={12}
            value={n}
            onChange={(e) => handleNChange(parseInt(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="text-sm text-white w-8 text-right">{n}</span>
        </div>

        {/* k slider */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 w-24">k (choix)</label>
          <input
            type="range"
            min={0}
            max={n}
            value={mode === 'perm' ? n : k}
            onChange={(e) => setK(parseInt(e.target.value))}
            disabled={mode === 'perm'}
            className="flex-1 accent-yellow-500 disabled:opacity-50"
          />
          <span className="text-sm text-white w-8 text-right">{mode === 'perm' ? n : k}</span>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 w-24">Mode</label>
          <select
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as 'comb' | 'arr' | 'perm')}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm border border-slate-600"
          >
            <option value="comb">Combinaisons (ordre ne compte pas)</option>
            <option value="arr">Arrangements (ordre compte)</option>
            <option value="perm">Permutations (k = n)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm border border-slate-600"
          >
            🎲 Tirage aléatoire
          </button>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-3 py-1.5 rounded-lg text-white text-sm border ${
              isAnimating
                ? 'bg-red-600 hover:bg-red-500 border-red-500'
                : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
            }`}
          >
            {isAnimating ? '⏸ Stop' : '▶ Animer'}
          </button>
        </div>

        {/* Key insight */}
        <div className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <strong className="text-slate-300">Idée clé :</strong>
          <br />
          • Si l'ordre ne compte pas → <strong className="text-yellow-400">C(n,k)</strong>
          <br />
          • Si l'ordre compte → <strong className="text-red-400">A(n,k)</strong> (ou P(n) si k=n)
        </div>
      </div>
    </div>
  )
}
