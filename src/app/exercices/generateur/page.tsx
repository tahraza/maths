'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Shuffle,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Infinity,
  BookOpen
} from 'lucide-react'
import { generators, generatorsByCategory, type GeneratedExercise, type ExerciseGenerator } from '@/lib/exercise-generators'
import MathText from '@/components/MathText'

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

export default function GenerateurPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedGenerator, setSelectedGenerator] = useState<ExerciseGenerator | null>(null)
  const [currentExercise, setCurrentExercise] = useState<GeneratedExercise | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [exerciseCount, setExerciseCount] = useState(0)

  const categories = Object.keys(generatorsByCategory)

  const generateNewExercise = useCallback(() => {
    if (selectedGenerator) {
      setCurrentExercise(selectedGenerator.generate())
      setShowHints(false)
      setShowSolution(false)
      setExerciseCount(prev => prev + 1)
    }
  }, [selectedGenerator])

  const selectGenerator = (gen: ExerciseGenerator) => {
    setSelectedGenerator(gen)
    setCurrentExercise(gen.generate())
    setShowHints(false)
    setShowSolution(false)
    setExerciseCount(1)
  }

  const goBack = () => {
    if (currentExercise) {
      setCurrentExercise(null)
      setSelectedGenerator(null)
      setExerciseCount(0)
    } else if (selectedCategory) {
      setSelectedCategory(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
            Les valeurs changent à chaque fois, mais la méthode reste la même.
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
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {gens.length} type{gens.length > 1 ? 's' : ''} d'exercice{gens.length > 1 ? 's' : ''}
                    </p>
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
                      <span className={`inline-block w-2 h-2 rounded-full ${difficultyColors[gen.difficulty]}`} />
                      <span className="text-xs text-slate-500">{difficultyLabels[gen.difficulty]}</span>
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
              </div>
              <button
                onClick={generateNewExercise}
                className="btn btn-primary flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Nouvel exercice
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

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setShowHints(!showHints)}
                className={`btn flex items-center gap-2 ${
                  showHints
                    ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700'
                    : 'btn-secondary'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                {showHints ? 'Masquer les indices' : 'Voir les indices'}
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
                Tu maîtrises ? Passe à l'exercice suivant avec de nouvelles valeurs.
              </p>
              <button
                onClick={generateNewExercise}
                className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
              >
                <Shuffle className="h-5 w-5" />
                Générer un nouvel exercice
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
