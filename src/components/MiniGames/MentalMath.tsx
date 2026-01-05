'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calculator, Clock, Trophy, Zap, CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react'
import { useMiniGamesStore } from '@/stores/miniGamesStore'
import { useGamificationStore, POINTS } from '@/stores/gamificationStore'
import { cn } from '@/lib/utils'

type Difficulty = 'easy' | 'medium' | 'hard'

interface Question {
  expression: string
  answer: number
}

const GAME_DURATION = 60 // secondes

const generateQuestion = (difficulty: Difficulty): Question => {
  let a: number, b: number, op: string, answer: number

  switch (difficulty) {
    case 'easy':
      a = Math.floor(Math.random() * 50) + 1
      b = Math.floor(Math.random() * 50) + 1
      if (Math.random() > 0.5) {
        op = '+'
        answer = a + b
      } else {
        // Assurer résultat positif
        if (a < b) [a, b] = [b, a]
        op = '-'
        answer = a - b
      }
      break

    case 'medium':
      if (Math.random() > 0.5) {
        // Multiplication
        a = Math.floor(Math.random() * 12) + 2
        b = Math.floor(Math.random() * 12) + 2
        op = '×'
        answer = a * b
      } else {
        // Division exacte
        b = Math.floor(Math.random() * 10) + 2
        answer = Math.floor(Math.random() * 12) + 1
        a = b * answer
        op = '÷'
      }
      break

    case 'hard':
      const type = Math.floor(Math.random() * 3)
      if (type === 0) {
        // Carré
        a = Math.floor(Math.random() * 15) + 2
        op = '²'
        answer = a * a
        return { expression: `${a}²`, answer }
      } else if (type === 1) {
        // Racine carrée parfaite
        answer = Math.floor(Math.random() * 12) + 2
        a = answer * answer
        op = '√'
        return { expression: `√${a}`, answer }
      } else {
        // Multiplication difficile
        a = Math.floor(Math.random() * 20) + 10
        b = Math.floor(Math.random() * 10) + 2
        op = '×'
        answer = a * b
      }
      break

    default:
      a = 1
      b = 1
      op = '+'
      answer = 2
  }

  return { expression: `${a} ${op} ${b}`, answer }
}

interface MentalMathProps {
  onBack: () => void
}

export function MentalMath({ onBack }: MentalMathProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [question, setQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const { recordMentalMathScore, mentalMathHighScore } = useMiniGamesStore()
  const { addPoints } = useGamificationStore()

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Focus input quand le jeu commence
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState, question])

  const startGame = useCallback(() => {
    setGameState('playing')
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setStreak(0)
    setQuestionsAnswered(0)
    setUserAnswer('')
    setFeedback(null)
    setQuestion(generateQuestion(difficulty))
  }, [difficulty])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!question || userAnswer === '') return

    const isCorrect = parseInt(userAnswer) === question.answer

    if (isCorrect) {
      const streakBonus = streak >= 5 ? 2 : streak >= 3 ? 1 : 0
      setScore((prev) => prev + 1 + streakBonus)
      setStreak((prev) => prev + 1)
      setFeedback('correct')
    } else {
      setStreak(0)
      setFeedback('wrong')
    }

    setQuestionsAnswered((prev) => prev + 1)

    // Feedback visuel rapide puis nouvelle question
    setTimeout(() => {
      setFeedback(null)
      setUserAnswer('')
      setQuestion(generateQuestion(difficulty))
    }, 300)
  }, [question, userAnswer, streak, difficulty])

  // Enregistrer le score à la fin
  useEffect(() => {
    if (gameState === 'finished' && score > 0) {
      recordMentalMathScore(score, difficulty)

      // XP: 5 par point, bonus si > 20
      let xpEarned = score * 5
      if (score > 20) xpEarned += 50

      addPoints(xpEarned, `Mini-jeu calcul mental: ${score} pts`)
    }
  }, [gameState, score, difficulty, recordMentalMathScore, addPoints])

  const difficulties: { id: Difficulty; name: string; description: string }[] = [
    { id: 'easy', name: 'Facile', description: 'Addition et soustraction' },
    { id: 'medium', name: 'Moyen', description: 'Multiplication et division' },
    { id: 'hard', name: 'Difficile', description: 'Carrés et racines' },
  ]

  // Menu de sélection de difficulté
  if (gameState === 'menu') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Calcul Mental</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Résous un maximum d'opérations en {GAME_DURATION} secondes
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Choisis ta difficulté
          </h4>
          <div className="grid gap-3">
            {difficulties.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={cn(
                  'flex items-center justify-between rounded-lg border-2 p-4 transition-all',
                  difficulty === d.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                )}
              >
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{d.name}</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{d.description}</p>
                </div>
                {difficulty === d.id && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {mentalMathHighScore > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Meilleur score : {mentalMathHighScore} points
            </span>
          </div>
        )}

        <button
          onClick={startGame}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Play className="h-5 w-5" />
          Commencer
        </button>
      </div>
    )
  }

  // Écran de fin
  if (gameState === 'finished') {
    const isNewHighScore = score > mentalMathHighScore - score // Approximatif avant enregistrement
    const xpEarned = score * 5 + (score > 20 ? 50 : 0)

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Trophy className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Terminé !</h3>
          {isNewHighScore && score > 0 && (
            <p className="mt-1 text-amber-600 dark:text-amber-400">Nouveau record !</p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-700/50">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Points</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-700/50">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">+{xpEarned}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">XP gagnés</p>
          </div>
        </div>

        <div className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {questionsAnswered} questions répondues
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-lg border border-slate-200 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Retour
          </button>
          <button
            onClick={startGame}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
            Rejouer
          </button>
        </div>
      </div>
    )
  }

  // Jeu en cours
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      {/* Header avec timer et score */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'h-5 w-5',
            timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'
          )} />
          <span className={cn(
            'text-2xl font-bold',
            timeLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'
          )}>
            {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-4">
          {streak >= 3 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Zap className="h-3 w-3" />
              x{streak}
            </div>
          )}
          <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-lg font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {score}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className={cn(
        'mb-6 rounded-xl p-8 text-center transition-colors',
        feedback === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
        feedback === 'wrong' ? 'bg-red-50 dark:bg-red-900/20' :
        'bg-slate-50 dark:bg-slate-700/50'
      )}>
        <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          {question?.expression} = ?
        </p>
      </div>

      {/* Input réponse */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            placeholder="?"
            autoComplete="off"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            OK
          </button>
        </div>
      </form>

      {/* Feedback icons */}
      {feedback && (
        <div className="mt-4 flex justify-center">
          {feedback === 'correct' ? (
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
        </div>
      )}
    </div>
  )
}
