'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shuffle,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Infinity,
  BookOpen,
  Trophy,
  Flame,
  Star,
  Zap,
  Target
} from 'lucide-react'
import { generators, generatorsByCategory, type GeneratedExercise, type ExerciseGenerator } from '@/lib/exercise-generators'
import MathText from '@/components/MathText'
import { useGamificationStore } from '@/stores/gamificationStore'

const categoryColors: Record<string, string> = {
  'Dérivation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Suites': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Limites': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Intégrales': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Probabilités': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Combinatoire': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'Équations différentielles': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Nombres complexes': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Exponentielle': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Logarithme': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Trigonométrie': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'Primitives': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'Continuité': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  'Convexité': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  'Loi normale': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Récurrence': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  'Arithmétique': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Matrices': 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
  'Géométrie': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

const difficultyLabels = ['', 'Facile', 'Accessible', 'Intermédiaire', 'Avancé', 'Expert']
const difficultyColors = ['', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500']

// Points de base par difficulté
const difficultyPoints = [0, 10, 20, 30, 50, 80]

// Clé localStorage pour stats locales du générateur (série, exercices par catégorie)
const STORAGE_KEY = 'maths-generator-local'

interface LocalStats {
  generatorStreak: number
  exercisesByCategory: Record<string, number>
  totalGeneratorExercises: number
}

const defaultLocalStats: LocalStats = {
  generatorStreak: 0,
  exercisesByCategory: {},
  totalGeneratorExercises: 0
}

export default function GenerateurPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [selectedGenerator, setSelectedGenerator] = useState<ExerciseGenerator | null>(null)
  const [currentExercise, setCurrentExercise] = useState<GeneratedExercise | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [exerciseCount, setExerciseCount] = useState(0)

  // Gamification globale (Zustand store)
  const {
    totalPoints,
    currentStreak: globalStreak,
    addPoints,
    incrementStat,
    recordExerciseWithoutHint,
    resetExerciseHintStreak,
    getLevel
  } = useGamificationStore()

  // Stats locales du générateur
  const [localStats, setLocalStats] = useState<LocalStats>(defaultLocalStats)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)
  const [hasValidated, setHasValidated] = useState(false)
  const [usedHints, setUsedHints] = useState(false)
  const [mounted, setMounted] = useState(false)

  const categories = Object.keys(generatorsByCategory)
  const level = getLevel()

  // Load local stats from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setLocalStats(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading local stats:', e)
    }
  }, [])

  // Save local stats to localStorage
  const saveLocalStats = useCallback((newStats: LocalStats) => {
    setLocalStats(newStats)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats))
    } catch (e) {
      console.error('Error saving local stats:', e)
    }
  }, [])

  // Calculate points for current exercise
  const calculatePoints = useCallback(() => {
    if (!selectedGenerator || hasValidated) return 0

    const basePoints = difficultyPoints[selectedGenerator.difficulty] || 10

    // Streak multiplier basé sur la série locale du générateur: +10% par exercice (max +100%)
    const streakMultiplier = 1 + Math.min(localStats.generatorStreak * 0.1, 1)

    // Pénalité si indices utilisés: -30%
    const hintPenalty = usedHints ? 0.7 : 1

    // Si solution affichée avant validation: 0 points
    if (showSolution && !hasValidated) return 0

    return Math.round(basePoints * streakMultiplier * hintPenalty)
  }, [selectedGenerator, localStats.generatorStreak, usedHints, showSolution, hasValidated])

  // Validate exercise (user claims they solved it)
  const validateExercise = useCallback(() => {
    if (hasValidated || !selectedGenerator) return

    const points = calculatePoints()
    setPointsEarned(points)
    setHasValidated(true)

    // Ajouter les points au store global (synchronisé auto avec pet store)
    if (points > 0) {
      addPoints(points, `Exercice généré: ${selectedGenerator.title}`)
      incrementStat('exercises')

      // Track exercices sans indices pour badge secret
      if (!usedHints) {
        recordExerciseWithoutHint()
      } else {
        resetExerciseHintStreak()
      }
    }

    // Mettre à jour les stats locales
    const newLocalStats: LocalStats = {
      generatorStreak: points > 0 ? localStats.generatorStreak + 1 : 0,
      exercisesByCategory: {
        ...localStats.exercisesByCategory,
        [selectedGenerator.category]: (localStats.exercisesByCategory[selectedGenerator.category] || 0) + 1
      },
      totalGeneratorExercises: localStats.totalGeneratorExercises + 1
    }

    saveLocalStats(newLocalStats)
  }, [hasValidated, selectedGenerator, calculatePoints, usedHints, addPoints, incrementStat, recordExerciseWithoutHint, resetExerciseHintStreak, localStats, saveLocalStats])

  // Skip exercise (breaks streak)
  const skipExercise = useCallback(() => {
    if (!hasValidated && localStats.generatorStreak > 0) {
      const newStats = { ...localStats, generatorStreak: 0 }
      saveLocalStats(newStats)
    }
    generateNewExercise()
  }, [hasValidated, localStats, saveLocalStats])

  const generateNewExercise = useCallback(() => {
    if (selectedGenerator) {
      setCurrentExercise(selectedGenerator.generate())
      setShowHints(false)
      setShowSolution(false)
      setExerciseCount(prev => prev + 1)
      setHasValidated(false)
      setPointsEarned(null)
      setUsedHints(false)
    }
  }, [selectedGenerator])

  const selectGenerator = (gen: ExerciseGenerator) => {
    setSelectedGenerator(gen)
    setCurrentExercise(gen.generate())
    setShowHints(false)
    setShowSolution(false)
    setExerciseCount(1)
    setHasValidated(false)
    setPointsEarned(null)
    setUsedHints(false)
  }

  const goBack = () => {
    if (currentExercise) {
      setCurrentExercise(null)
      setSelectedGenerator(null)
      setExerciseCount(0)
      setHasValidated(false)
      setPointsEarned(null)
    } else if (selectedCategory) {
      setSelectedCategory(null)
    }
  }

  const handleShowHints = () => {
    if (!showHints && !hasValidated) {
      setUsedHints(true)
    }
    setShowHints(!showHints)
  }

  const potentialPoints = calculatePoints()

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl mb-6"></div>
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-950 dark:to-amber-950 rounded-xl border border-primary-100 dark:border-primary-800">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{totalPoints} pts</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary-500" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Niveau</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{level.level}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className={`h-5 w-5 ${localStats.generatorStreak > 0 ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Série</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{localStats.generatorStreak}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Générés</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{localStats.totalGeneratorExercises}</div>
              </div>
            </div>
          </div>
          {localStats.generatorStreak >= 3 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Bonus x{(1 + Math.min(localStats.generatorStreak * 0.1, 1)).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {(selectedCategory || currentExercise) && (
              <button
                onClick={goBack}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 dark:text-slate-100">
              <Infinity className="h-8 w-8 text-primary-600" />
              Générateur d'exercices
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Entraîne-toi à l'infini avec des exercices générés aléatoirement.
            Gagne des points et maintiens ta série !
          </p>
        </div>

        {/* Sélection de catégorie */}
        {!selectedCategory && !currentExercise && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Choisis un chapitre
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => {
                const gens = generatorsByCategory[category]
                const completed = localStats.exercisesByCategory[category] || 0
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="card group hover:border-primary-200 hover:shadow-md transition-all text-left dark:hover:border-primary-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`badge ${categoryColors[category] || 'bg-slate-100 text-slate-800'}`}>
                        {category}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {gens.length} type{gens.length > 1 ? 's' : ''} d'exercice{gens.length > 1 ? 's' : ''}
                      </p>
                      {completed > 0 && (
                        <span className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {completed} fait{completed > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Sélection de générateur */}
        {selectedCategory && !currentExercise && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              <span className={`badge ${categoryColors[selectedCategory] || ''} mr-2`}>
                {selectedCategory}
              </span>
              — Choisis un type d'exercice
            </h2>
            <div className="grid gap-3">
              {generatorsByCategory[selectedCategory].map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => selectGenerator(gen)}
                  className="card group hover:border-primary-200 hover:shadow-md transition-all text-left dark:hover:border-primary-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors dark:text-slate-100">
                        {gen.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {gen.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${difficultyColors[gen.difficulty]}`} />
                          <span className="text-xs text-slate-500">{difficultyLabels[gen.difficulty]}</span>
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          +{difficultyPoints[gen.difficulty]} pts
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercice généré */}
        {currentExercise && selectedGenerator && (
          <div>
            {/* Info bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`badge ${categoryColors[selectedGenerator.category] || ''}`}>
                  {selectedGenerator.category}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Exercice #{exerciseCount}
                </span>
                {!hasValidated && !showSolution && (
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                    <Star className="h-4 w-4" />
                    {potentialPoints} pts
                    {usedHints && <span className="text-xs">(-30%)</span>}
                  </span>
                )}
                {pointsEarned !== null && (
                  <span className={`flex items-center gap-1 text-sm font-bold ${pointsEarned > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                    <Trophy className="h-4 w-4" />
                    +{pointsEarned} pts
                  </span>
                )}
              </div>
              <button
                onClick={skipExercise}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Passer
              </button>
            </div>

            {/* Énoncé */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {currentExercise.title}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MathText text={currentExercise.statement} />
              </div>
            </div>

            {/* Validation Button */}
            {!hasValidated && !showSolution && (
              <div className="mb-6">
                <button
                  onClick={validateExercise}
                  className="w-full btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 py-3 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  J'ai trouvé ! (+{potentialPoints} pts)
                </button>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Clique quand tu as résolu l'exercice pour gagner tes points
                </p>
              </div>
            )}

            {/* Points earned animation */}
            {pointsEarned !== null && pointsEarned > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <span className="text-2xl font-bold">+{pointsEarned} points !</span>
                </div>
                {localStats.generatorStreak >= 3 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    🔥 Série de {localStats.generatorStreak} ! Bonus actif !
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleShowHints}
                className={`btn flex items-center gap-2 ${
                  showHints
                    ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700'
                    : 'btn-secondary'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                {showHints ? 'Masquer les indices' : 'Voir les indices'}
                {!usedHints && !hasValidated && !showHints && (
                  <span className="text-xs opacity-70">(-30%)</span>
                )}
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className={`btn flex items-center gap-2 ${
                  showSolution
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
                    : 'btn-secondary'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {showSolution ? 'Masquer la solution' : 'Voir la solution'}
                {!hasValidated && !showSolution && (
                  <span className="text-xs opacity-70">(0 pts)</span>
                )}
              </button>
            </div>

            {/* Indices */}
            {showHints && (
              <div className="card mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Indices
                </h3>
                <ul className="space-y-2">
                  {currentExercise.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-900 dark:text-amber-100">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{i + 1}.</span>
                      <MathText text={hint} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Solution */}
            {showSolution && (
              <div className="card border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Solution
                </h3>
                <div className="prose prose-slate dark:prose-invert max-w-none text-green-900 dark:text-green-100">
                  <MathText text={currentExercise.solution} />
                </div>
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Réponse : <MathText text={currentExercise.answer} />
                  </p>
                </div>
              </div>
            )}

            {/* Quick regenerate */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {hasValidated ? 'Bravo ! Passe à l\'exercice suivant.' : 'Tu maîtrises ? Passe à l\'exercice suivant.'}
              </p>
              <button
                onClick={generateNewExercise}
                className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
              >
                <Shuffle className="h-5 w-5" />
                Nouvel exercice
              </button>
            </div>
          </div>
        )}

        {/* Footer link */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/exercices"
            className="flex items-center gap-2 text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
          >
            <BookOpen className="h-4 w-4" />
            Voir les exercices classiques avec solutions détaillées
          </Link>
        </div>
      </div>
    </div>
  )
}
