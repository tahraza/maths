'use client'

import { useEffect, useMemo, useState } from 'react'

interface EuclideanDivisionProps {
  initialDividend?: number
  initialDivisor?: number
  autoPlay?: boolean
  stepDelay?: number
  title?: string
}

function normalizeInt(value: number, min: number) {
  const next = Math.floor(Number.isFinite(value) ? value : min)
  return Math.max(min, next)
}

export function EuclideanDivision({
  initialDividend = 47,
  initialDivisor = 6,
  autoPlay = false,
  stepDelay = 900,
  title,
}: EuclideanDivisionProps) {
  const [dividend, setDividend] = useState(() => normalizeInt(initialDividend, 0))
  const [divisor, setDivisor] = useState(() => normalizeInt(initialDivisor, 1))
  const [remainder, setRemainder] = useState(dividend)
  const [quotient, setQuotient] = useState(0)
  const [steps, setSteps] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [delay, setDelay] = useState(stepDelay)

  useEffect(() => {
    setDelay(stepDelay)
  }, [stepDelay])

  const canStep = divisor > 0 && remainder >= divisor

  const reset = (nextDividend = dividend, nextDivisor = divisor) => {
    setRemainder(nextDividend)
    setQuotient(0)
    setSteps([])
    if (!autoPlay || nextDivisor <= 0) {
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    reset(dividend, divisor)
  }, [dividend, divisor])

  useEffect(() => {
    if (!isPlaying) return
    if (!canStep) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setRemainder((prev) => {
        if (prev < divisor) return prev
        const next = prev - divisor
        setSteps((prevSteps) => [...prevSteps, next])
        return next
      })
      setQuotient((prev) => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, canStep, delay, divisor])

  const finalQuotient = useMemo(() => Math.floor(dividend / divisor), [dividend, divisor])
  const finalRemainder = useMemo(() => dividend % divisor, [dividend, divisor])

  const handleStep = () => {
    if (!canStep) return
    setRemainder((prev) => {
      const next = prev - divisor
      setSteps((prevSteps) => [...prevSteps, next])
      return next
    })
    setQuotient((prev) => prev + 1)
  }

  return (
    <div className="my-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}
        </h4>
      )}

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {dividend} = {divisor} x {quotient} + {remainder}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quotient courant : {quotient} | Reste courant : {remainder}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-slate-500">
              Dividend
              <input
                type="number"
                min={0}
                value={dividend}
                onChange={(e) => setDividend(normalizeInt(Number(e.target.value), 0))}
                className="mt-1 block w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <label className="text-xs text-slate-500">
              Diviseur
              <input
                type="number"
                min={1}
                value={divisor}
                onChange={(e) => setDivisor(normalizeInt(Number(e.target.value), 1))}
                className="mt-1 block w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <label className="text-xs text-slate-500">
              Vitesse
              <input
                type="range"
                min={200}
                max={1400}
                step={100}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="mt-2 block w-36"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              disabled={!canStep && !isPlaying}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isPlaying ? 'Pause' : 'Lancer'}
            </button>
            <button
              type="button"
              onClick={handleStep}
              disabled={!canStep}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Etape suivante
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reinitialiser
            </button>
          </div>

          <div className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {steps.length === 0 ? (
              <span>Aucune soustraction effectuee pour le moment.</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {steps.map((value, index) => (
                  <span
                    key={`${value}-${index}`}
                    className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {dividend} - {divisor} x {index + 1} = {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
          <div className="font-semibold text-slate-700 dark:text-slate-100">Resultat attendu</div>
          <div className="mt-2">
            {dividend} = {divisor} x {finalQuotient} + {finalRemainder}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            On s'arrete quand le reste est strictement inferieur au diviseur.
          </div>
        </div>
      </div>
    </div>
  )
}
