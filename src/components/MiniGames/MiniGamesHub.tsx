'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, Brain, Calculator, Trophy, Play, ArrowLeft } from 'lucide-react'
import { useMiniGamesStore } from '@/stores/miniGamesStore'
import { MentalMath } from './MentalMath'
import { FormulaMemory } from './FormulaMemory'
import { cn } from '@/lib/utils'

type GameId = 'mental-math' | 'formula-memory' | null

const GAMES = [
  {
    id: 'mental-math' as const,
    name: 'Calcul Mental',
    description: 'Résous un maximum d\'opérations en 60 secondes',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'formula-memory' as const,
    name: 'Mémory Formules',
    description: 'Associe les formules à leurs noms',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
]

export function MiniGamesHub() {
  const [mounted, setMounted] = useState(false)
  const [activeGame, setActiveGame] = useState<GameId>(null)
  const { mentalMathHighScore, memoryHighScore, mentalMathGamesPlayed, memoryGamesPlayed } = useMiniGamesStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Mini-jeux</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">Chargement...</p>
      </div>
    )
  }

  // Si un jeu est actif, afficher le jeu
  if (activeGame === 'mental-math') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux mini-jeux
        </button>
        <MentalMath onBack={() => setActiveGame(null)} />
      </div>
    )
  }

  if (activeGame === 'formula-memory') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux mini-jeux
        </button>
        <FormulaMemory onBack={() => setActiveGame(null)} />
      </div>
    )
  }

  const highScores = {
    'mental-math': mentalMathHighScore,
    'formula-memory': memoryHighScore,
  }

  const gamesPlayed = {
    'mental-math': mentalMathGamesPlayed,
    'formula-memory': memoryGamesPlayed,
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Mini-jeux</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          <Trophy className="h-3 w-3" />
          {mentalMathGamesPlayed + memoryGamesPlayed} parties jouées
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((game) => {
          const Icon = game.icon
          return (
            <div
              key={game.id}
              className={cn(
                'group relative overflow-hidden rounded-xl border-2 p-5 transition-all hover:shadow-lg',
                game.borderColor,
                `bg-gradient-to-br ${game.bgColor}`
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                  game.color
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                {highScores[game.id] > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <Trophy className="h-3 w-3" />
                    {highScores[game.id]}
                  </div>
                )}
              </div>

              <h4 className="mt-4 font-bold text-slate-900 dark:text-slate-100">
                {game.name}
              </h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {game.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {gamesPlayed[game.id]} parties
                </span>
                <button
                  onClick={() => setActiveGame(game.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg',
                    game.color
                  )}
                >
                  <Play className="h-4 w-4" />
                  Jouer
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
