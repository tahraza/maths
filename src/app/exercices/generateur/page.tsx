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
  Target,
  Layers,
  X,
  Check,
  HelpCircle
} from 'lucide-react'
import { generators, generatorsByCategory, type GeneratedExercise, type ExerciseGenerator } from '@/lib/exercise-generators'
import { errorGenerators, errorGeneratorsByCategory, type ErrorExercise, type ErrorGenerator } from '@/lib/error-exercises'
import { conceptualGenerators, type ConceptualQuestion } from '@/lib/conceptual-questions'
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
  'Droites et plans': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  'Logique': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'Chaînes de Markov': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Graphes': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
}

const difficultyLabels = ['', 'Facile', 'Accessible', 'Intermédiaire', 'Avancé', 'Expert']
const difficultyColors = ['', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500']

// Mapping catégorie → leçon (pour lien retour)
const categoryToLesson: Record<string, { slug: string; track: string; title: string }> = {
  'Dérivation': { slug: 'derivation', track: 'spe', title: 'Dérivation' },
  'Suites': { slug: 'suites-definition', track: 'spe', title: 'Suites numériques' },
  'Limites': { slug: 'limites-fonctions', track: 'spe', title: 'Limites de fonctions' },
  'Intégrales': { slug: 'integrales', track: 'spe', title: 'Intégrales' },
  'Primitives': { slug: 'primitives', track: 'spe', title: 'Primitives' },
  'Continuité': { slug: 'continuite', track: 'spe', title: 'Continuité' },
  'Convexité': { slug: 'convexite', track: 'spe', title: 'Convexité' },
  'Exponentielle': { slug: 'exponentielle', track: 'spe', title: 'Fonction exponentielle' },
  'Logarithme': { slug: 'logarithme', track: 'spe', title: 'Fonction logarithme' },
  'Trigonométrie': { slug: 'trigonometrie-bases', track: 'spe', title: 'Trigonométrie' },
  'Probabilités': { slug: 'loi-binomiale', track: 'spe', title: 'Loi binomiale' },
  'Combinatoire': { slug: 'combinatoire', track: 'spe', title: 'Combinatoire' },
  'Loi normale': { slug: 'loi-normale', track: 'spe', title: 'Loi normale' },
  'Récurrence': { slug: 'recurrence', track: 'spe', title: 'Raisonnement par récurrence' },
  'Équations différentielles': { slug: 'equations-differentielles', track: 'spe', title: 'Équations différentielles' },
  'Géométrie': { slug: 'vecteurs-espace', track: 'spe', title: 'Géométrie dans l\'espace' },
  'Droites et plans': { slug: 'droites-plans-espace', track: 'spe', title: 'Droites et plans' },
  'Logique': { slug: 'implication-equivalence', track: 'spe', title: 'Implication et équivalence' },
  'Nombres complexes': { slug: 'complexes-introduction', track: 'expertes', title: 'Nombres complexes' },
  'Arithmétique': { slug: 'divisibilite', track: 'expertes', title: 'Arithmétique' },
  'Matrices': { slug: 'matrices-operations', track: 'expertes', title: 'Matrices' },
  'Chaînes de Markov': { slug: 'chaines-markov', track: 'expertes', title: 'Chaînes de Markov' },
  'Graphes': { slug: 'graphes-introduction', track: 'expertes', title: 'Théorie des graphes' },
}

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

  // Mode interleaving
  const [interleavingMode, setInterleavingMode] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [interleavingActive, setInterleavingActive] = useState(false)

  // Mode "Trouver l'erreur"
  type GeneratorMode = 'classic' | 'interleaving' | 'error' | 'conceptual'
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>('classic')
  const [currentErrorExercise, setCurrentErrorExercise] = useState<ErrorExercise | null>(null)
  const [showErrorAnswer, setShowErrorAnswer] = useState(false)
  const [userFoundError, setUserFoundError] = useState<boolean | null>(null)

  // Mode questions conceptuelles
  const [currentConceptualQuestion, setCurrentConceptualQuestion] = useState<ConceptualQuestion | null>(null)
  const [showConceptualAnswer, setShowConceptualAnswer] = useState(false)

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

  // Toggle category selection for interleaving mode
  const toggleCategorySelection = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Start interleaving session
  const startInterleavingSession = () => {
    if (selectedCategories.length < 2) return

    setInterleavingActive(true)
    generateInterleavingExercise()
  }

  // Generate random exercise from selected categories
  const generateInterleavingExercise = useCallback(() => {
    if (selectedCategories.length === 0) return

    // Pick random category
    const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)]
    const categoryGenerators = generatorsByCategory[randomCategory]

    if (!categoryGenerators || categoryGenerators.length === 0) return

    // Pick random generator from that category
    const randomGen = categoryGenerators[Math.floor(Math.random() * categoryGenerators.length)]

    setSelectedGenerator(randomGen)
    setCurrentExercise(randomGen.generate())
    setShowHints(false)
    setShowSolution(false)
    setExerciseCount(prev => prev + 1)
    setHasValidated(false)
    setPointsEarned(null)
    setUsedHints(false)
  }, [selectedCategories])

  // Skip exercise (breaks streak)
  const skipExercise = useCallback(() => {
    if (!hasValidated && localStats.generatorStreak > 0) {
      const newStats = { ...localStats, generatorStreak: 0 }
      saveLocalStats(newStats)
    }
    if (interleavingActive) {
      generateInterleavingExercise()
    } else {
      generateNewExercise()
    }
  }, [hasValidated, localStats, saveLocalStats, interleavingActive, generateInterleavingExercise, generateNewExercise])

  // Exit interleaving mode
  const exitInterleavingMode = () => {
    setInterleavingMode(false)
    setInterleavingActive(false)
    setSelectedCategories([])
    setCurrentExercise(null)
    setSelectedGenerator(null)
    setExerciseCount(0)
  }

  // Generate a random error exercise
  const generateErrorExercise = useCallback(() => {
    const randomGen = errorGenerators[Math.floor(Math.random() * errorGenerators.length)]
    setCurrentErrorExercise(randomGen.generate())
    setShowErrorAnswer(false)
    setShowHints(false)
    setUserFoundError(null)
    setExerciseCount(prev => prev + 1)
    setHasValidated(false)
    setPointsEarned(null)
  }, [])

  // Validate error found
  const validateErrorFound = useCallback((found: boolean) => {
    if (hasValidated || !currentErrorExercise) return

    setUserFoundError(found)
    setShowErrorAnswer(true)
    setHasValidated(true)

    const points = found ? difficultyPoints[currentErrorExercise.difficulty] : 0
    setPointsEarned(points)

    if (points > 0) {
      addPoints(points, `Erreur trouvée: ${currentErrorExercise.title}`)
      incrementStat('exercises')
    }
  }, [hasValidated, currentErrorExercise, addPoints, incrementStat])

  // Switch mode
  const switchMode = (mode: GeneratorMode) => {
    setGeneratorMode(mode)
    setInterleavingMode(mode === 'interleaving')
    setInterleavingActive(false)
    setSelectedCategories([])
    setCurrentExercise(null)
    setCurrentErrorExercise(null)
    setCurrentConceptualQuestion(null)
    setSelectedGenerator(null)
    setSelectedCategory(null)
    setExerciseCount(0)
    setHasValidated(false)
    setPointsEarned(null)
    setShowErrorAnswer(false)
    setUserFoundError(null)
    setShowConceptualAnswer(false)
  }

  // Generate a random conceptual question
  const generateConceptualQuestion = useCallback(() => {
    const randomGen = conceptualGenerators[Math.floor(Math.random() * conceptualGenerators.length)]
    setCurrentConceptualQuestion(randomGen.generate())
    setShowConceptualAnswer(false)
    setShowHints(false)
    setExerciseCount(prev => prev + 1)
    setHasValidated(false)
    setPointsEarned(null)
  }, [])

  // Validate conceptual question
  const validateConceptual = useCallback(() => {
    if (hasValidated || !currentConceptualQuestion) return

    setShowConceptualAnswer(true)
    setHasValidated(true)

    const points = difficultyPoints[currentConceptualQuestion.difficulty] || 20
    setPointsEarned(points)

    addPoints(points, `Question conceptuelle: ${currentConceptualQuestion.topic}`)
    incrementStat('exercises')
  }, [hasValidated, currentConceptualQuestion, addPoints, incrementStat])

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

        {/* Mode toggle */}
        {!selectedCategory && !currentExercise && !currentErrorExercise && !currentConceptualQuestion && !interleavingActive && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => switchMode('classic')}
              className={`py-3 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                generatorMode === 'classic'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <Target className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Classique</span>
            </button>
            <button
              onClick={() => switchMode('interleaving')}
              className={`py-3 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                generatorMode === 'interleaving'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Interleaving</span>
            </button>
            <button
              onClick={() => switchMode('error')}
              className={`py-3 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                generatorMode === 'error'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Erreurs</span>
            </button>
            <button
              onClick={() => switchMode('conceptual')}
              className={`py-3 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                generatorMode === 'conceptual'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Pourquoi ?</span>
            </button>
          </div>
        )}

        {/* Interleaving mode explanation */}
        {generatorMode === 'interleaving' && !interleavingActive && !currentExercise && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                  Mode Interleaving
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                  Mélange des exercices de plusieurs chapitres pour renforcer ta mémoire à long terme.
                  Cette technique scientifiquement prouvée améliore la rétention de 43% en moyenne !
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error mode explanation and start */}
        {generatorMode === 'error' && !currentErrorExercise && (
          <div>
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-200">
                    Mode "Trouver l'erreur"
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Analyse des solutions contenant des erreurs classiques. Développe ton esprit critique
                    et apprends à repérer les pièges fréquents !
                  </p>
                </div>
              </div>
            </div>

            <div className="card text-center py-8">
              <X className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Prêt à jouer au détective ?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Des solutions avec des erreurs subtiles te seront présentées.
                À toi de les débusquer !
              </p>
              <button
                onClick={generateErrorExercise}
                className="btn bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 py-3 px-8 text-lg font-semibold shadow-lg"
              >
                <Shuffle className="h-5 w-5 inline mr-2" />
                Commencer
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                {errorGenerators.length} types d'erreurs à identifier
              </p>
            </div>
          </div>
        )}

        {/* Conceptual mode explanation and start */}
        {generatorMode === 'conceptual' && !currentConceptualQuestion && (
          <div>
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 rounded-xl border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-cyan-900 dark:text-cyan-200">
                    Questions conceptuelles
                  </h3>
                  <p className="text-sm text-cyan-800 dark:text-cyan-300 mt-1">
                    Développe ta compréhension profonde avec des questions "Pourquoi ?" et "Que se passerait-il si...?".
                    Ces questions vont au-delà du calcul mécanique !
                  </p>
                </div>
              </div>
            </div>

            <div className="card text-center py-8">
              <HelpCircle className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Prêt à réfléchir en profondeur ?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Des questions qui testent ta vraie compréhension des mathématiques,
                pas juste ta capacité à appliquer des formules.
              </p>
              <button
                onClick={generateConceptualQuestion}
                className="btn bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 py-3 px-8 text-lg font-semibold shadow-lg"
              >
                <Shuffle className="h-5 w-5 inline mr-2" />
                Commencer
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                {conceptualGenerators.length} types de questions conceptuelles
              </p>
            </div>
          </div>
        )}

        {/* Sélection de catégorie - Mode classique */}
        {!selectedCategory && !currentExercise && generatorMode === 'classic' && (
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

        {/* Sélection de catégories - Mode interleaving */}
        {interleavingMode && !interleavingActive && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Sélectionne au moins 2 chapitres
              </h2>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Tout désélectionner
                </button>
              )}
            </div>

            {/* Selected categories summary */}
            {selectedCategories.length > 0 && (
              <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(cat => (
                    <span
                      key={cat}
                      className={`badge ${categoryColors[cat]} flex items-center gap-1`}
                    >
                      {cat}
                      <button
                        onClick={() => toggleCategorySelection(cat)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {selectedCategories.length} chapitre{selectedCategories.length > 1 ? 's' : ''} sélectionné{selectedCategories.length > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Category grid for selection */}
            <div className="grid gap-3 md:grid-cols-2 mb-6">
              {categories.map((category) => {
                const gens = generatorsByCategory[category]
                const isSelected = selectedCategories.includes(category)
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategorySelection(category)}
                    className={`card transition-all text-left ${
                      isSelected
                        ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950'
                        : 'hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`badge ${categoryColors[category] || 'bg-slate-100 text-slate-800'}`}>
                        {category}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {gens.length} type{gens.length > 1 ? 's' : ''} d'exercice{gens.length > 1 ? 's' : ''}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Start button */}
            <button
              onClick={startInterleavingSession}
              disabled={selectedCategories.length < 2}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                selectedCategories.length >= 2
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
              }`}
            >
              <Shuffle className="h-5 w-5" />
              {selectedCategories.length < 2
                ? `Sélectionne encore ${2 - selectedCategories.length} chapitre${2 - selectedCategories.length > 1 ? 's' : ''}`
                : `Commencer (${selectedCategories.length} chapitres)`
              }
            </button>
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
            {/* Interleaving mode header */}
            {interleavingActive && (
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-purple-900 dark:text-purple-200">Mode Interleaving</span>
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    ({selectedCategories.length} chapitres)
                  </span>
                </div>
                <button
                  onClick={exitInterleavingMode}
                  className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Quitter
                </button>
              </div>
            )}

            {/* Info bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`badge ${categoryColors[selectedGenerator.category] || ''}`}>
                  {selectedGenerator.category}
                </span>
                {categoryToLesson[selectedGenerator.category] && (
                  <Link
                    href={`/lecons/${categoryToLesson[selectedGenerator.category].track}/${categoryToLesson[selectedGenerator.category].slug}`}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <BookOpen className="h-4 w-4" />
                    Voir la leçon
                  </Link>
                )}
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
              {categoryToLesson[selectedGenerator.category] && (
                <Link
                  href={`/lecons/${categoryToLesson[selectedGenerator.category].track}/${categoryToLesson[selectedGenerator.category].slug}`}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Revoir le cours
                </Link>
              )}
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
                onClick={interleavingActive ? generateInterleavingExercise : generateNewExercise}
                className={`btn btn-lg flex items-center gap-2 mx-auto ${
                  interleavingActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0'
                    : 'btn-primary'
                }`}
              >
                <Shuffle className="h-5 w-5" />
                {interleavingActive ? 'Exercice suivant (aléatoire)' : 'Nouvel exercice'}
              </button>
            </div>
          </div>
        )}

        {/* Error exercise display */}
        {currentErrorExercise && (
          <div>
            {/* Back button */}
            <button
              onClick={() => {
                setCurrentErrorExercise(null)
                setExerciseCount(0)
                setHasValidated(false)
                setPointsEarned(null)
                setShowErrorAnswer(false)
                setUserFoundError(null)
              }}
              className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au menu
            </button>

            {/* Mode header */}
            <div className="mb-4 p-3 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950 dark:to-orange-950 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-900 dark:text-red-200">Mode Trouver l'erreur</span>
                <span className="text-sm text-red-600 dark:text-red-400">
                  Exercice #{exerciseCount}
                </span>
              </div>
              {pointsEarned !== null && (
                <span className={`flex items-center gap-1 text-sm font-bold ${pointsEarned > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                  <Trophy className="h-4 w-4" />
                  +{pointsEarned} pts
                </span>
              )}
            </div>

            {/* Statement */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className={`badge ${categoryColors[currentErrorExercise.category] || ''}`}>
                  {currentErrorExercise.category}
                </span>
                {currentErrorExercise.title}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MathText text={currentErrorExercise.statement} />
              </div>
            </div>

            {/* Wrong solution */}
            <div className="card mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <X className="h-5 w-5" />
                Solution proposée (contient une erreur !)
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-red-900 dark:text-red-100">
                <MathText text={currentErrorExercise.wrongSolution} />
              </div>
            </div>

            {/* Question */}
            {!showErrorAnswer && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
                  As-tu trouvé l'erreur ?
                </h3>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => validateErrorFound(true)}
                    className="btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 py-3 px-8 flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Oui, je l'ai trouvée !
                  </button>
                  <button
                    onClick={() => {
                      setShowHints(!showHints)
                    }}
                    className={`btn flex items-center gap-2 ${
                      showHints
                        ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700'
                        : 'btn-secondary'
                    }`}
                  >
                    <Lightbulb className="h-5 w-5" />
                    {showHints ? 'Masquer indices' : 'Voir indices'}
                  </button>
                  <button
                    onClick={() => validateErrorFound(false)}
                    className="btn btn-secondary py-3 px-8"
                  >
                    Je donne ma langue au chat
                  </button>
                </div>
              </div>
            )}

            {/* Hints */}
            {showHints && !showErrorAnswer && (
              <div className="card mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Indices
                </h3>
                <ul className="space-y-2">
                  {currentErrorExercise.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-900 dark:text-amber-100">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{i + 1}.</span>
                      <MathText text={hint} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Result */}
            {showErrorAnswer && (
              <>
                {/* Success/Failure message */}
                <div className={`mb-6 p-4 rounded-xl border text-center ${
                  userFoundError
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  {userFoundError ? (
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                      <Trophy className="h-6 w-6 text-amber-500" />
                      <span className="text-2xl font-bold">Bravo ! +{pointsEarned} points !</span>
                    </div>
                  ) : (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="text-lg">Pas de souci, on apprend de ses erreurs !</span>
                    </div>
                  )}
                </div>

                {/* Error explanation */}
                <div className="card mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Explication de l'erreur
                  </h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-green-900 dark:text-green-100">
                    <MathText text={currentErrorExercise.errorDescription} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Réponse correcte : <MathText text={currentErrorExercise.correctSolution} />
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Next exercise button */}
            <div className="mt-8 text-center">
              <button
                onClick={generateErrorExercise}
                className="btn bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 py-3 px-8 text-lg font-semibold shadow-lg flex items-center gap-2 mx-auto"
              >
                <Shuffle className="h-5 w-5" />
                Nouvelle erreur à trouver
              </button>
            </div>
          </div>
        )}

        {/* Conceptual question display */}
        {currentConceptualQuestion && (
          <div>
            {/* Back button */}
            <button
              onClick={() => {
                setCurrentConceptualQuestion(null)
                setExerciseCount(0)
                setHasValidated(false)
                setPointsEarned(null)
                setShowConceptualAnswer(false)
              }}
              className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au menu
            </button>

            {/* Mode header */}
            <div className="mb-4 p-3 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-950 dark:to-blue-950 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="font-medium text-cyan-900 dark:text-cyan-200">Question conceptuelle</span>
                <span className="text-sm text-cyan-600 dark:text-cyan-400">
                  #{exerciseCount}
                </span>
              </div>
              {pointsEarned !== null && (
                <span className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400">
                  <Trophy className="h-4 w-4" />
                  +{pointsEarned} pts
                </span>
              )}
            </div>

            {/* Question */}
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${categoryColors[currentConceptualQuestion.category] || ''}`}>
                  {currentConceptualQuestion.category}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {currentConceptualQuestion.topic}
                </span>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
                <MathText text={currentConceptualQuestion.question} />
              </div>
            </div>

            {/* Action buttons */}
            {!showConceptualAnswer && (
              <div className="mb-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`btn flex items-center gap-2 ${
                    showHints
                      ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700'
                      : 'btn-secondary'
                  }`}
                >
                  <Lightbulb className="h-5 w-5" />
                  {showHints ? 'Masquer indices' : 'Voir les indices'}
                </button>
                <button
                  onClick={validateConceptual}
                  className="btn bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 py-3 px-8 flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  J'ai réfléchi, voir la réponse
                </button>
              </div>
            )}

            {/* Hints */}
            {showHints && !showConceptualAnswer && (
              <div className="card mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Pistes de réflexion
                </h3>
                <ul className="space-y-2">
                  {currentConceptualQuestion.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-900 dark:text-amber-100">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{i + 1}.</span>
                      <MathText text={hint} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer */}
            {showConceptualAnswer && (
              <>
                {/* Points earned */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    <span className="text-2xl font-bold">+{pointsEarned} points !</span>
                  </div>
                </div>

                {/* Full answer */}
                <div className="card mb-6 border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
                  <h3 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Réponse et explication
                  </h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-cyan-900 dark:text-cyan-100">
                    <MathText text={currentConceptualQuestion.answer} />
                  </div>
                </div>

                {/* Key insight */}
                <div className="card mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    L'idée clé à retenir
                  </h3>
                  <p className="text-blue-900 dark:text-blue-100 font-medium">
                    <MathText text={currentConceptualQuestion.keyInsight} />
                  </p>
                </div>
              </>
            )}

            {/* Next question button */}
            <div className="mt-8 text-center">
              <button
                onClick={generateConceptualQuestion}
                className="btn bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 py-3 px-8 text-lg font-semibold shadow-lg flex items-center gap-2 mx-auto"
              >
                <Shuffle className="h-5 w-5" />
                Nouvelle question
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
