import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  Brain,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { getAllLessons, getAllExercises, getAllFlashcards } from '@/lib/content'

export default function HomePage() {
  const lessons = getAllLessons()
  const exercises = getAllExercises()
  const flashcards = getAllFlashcards()

  const speLessons = lessons.filter((l) => l.track === 'spe')
  const expertesLessons = lessons.filter((l) => l.track === 'expertes')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Réussis tes maths en{' '}
              <span className="text-primary-200">Terminale</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
              Cours complets, exercices corrigés, QCM de diagnostic, flashcards et suivi de progression.
              Tout ce qu'il te faut pour maîtriser le programme et réussir le bac.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/parcours"
                className="btn-primary flex items-center gap-2 bg-white px-6 py-3 text-primary-700 hover:bg-primary-50"
              >
                <GraduationCap className="h-5 w-5" />
                Commencer un parcours
              </Link>
              <Link
                href="/lecons"
                className="btn flex items-center gap-2 border border-primary-300 px-6 py-3 text-white hover:bg-primary-600"
              >
                <BookOpen className="h-5 w-5" />
                Explorer les leçons
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-slate-200 bg-white py-8 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{lessons.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Leçons complètes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{exercises.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Exercices corrigés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{flashcards.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Flashcards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">2</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Programmes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Une méthode qui fonctionne
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Basée sur les principes de l'apprentissage efficace : comprendre avant de mémoriser,
              pratiquer régulièrement, réviser au bon moment.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: QCM Diagnostic */}
            <div className="card group hover:border-primary-200 hover:shadow-md transition-all dark:hover:border-primary-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors dark:bg-primary-900/50">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                QCM de diagnostic
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Avant chaque leçon, un QCM évalue tes prérequis et ton niveau.
                Tu sais exactement où tu en es et ce qu'il faut revoir.
              </p>
            </div>

            {/* Feature 2: Cours structurés */}
            <div className="card group hover:border-primary-200 hover:shadow-md transition-all dark:hover:border-primary-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors dark:bg-amber-900/50">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Cours exhaustifs
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Définitions, propriétés, méthodes types, exemples résolus et erreurs fréquentes.
                Tout est expliqué clairement avec des exercices de compréhension.
              </p>
            </div>

            {/* Feature 3: Exercices gradués */}
            <div className="card group hover:border-primary-200 hover:shadow-md transition-all dark:hover:border-primary-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-900/50">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Progression graduelle
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Des exercices classés par difficulté avec indices progressifs et solutions détaillées
                étape par étape.
              </p>
            </div>

            {/* Feature 4: Flashcards */}
            <div className="card group hover:border-primary-200 hover:shadow-md transition-all dark:hover:border-primary-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors dark:bg-purple-900/50">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Répétition espacée
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Flashcards avec algorithme de mémorisation optimale. Révise au bon moment pour
                ancrer les notions dans ta mémoire à long terme.
              </p>
            </div>

            {/* Feature 5: QCM Validation */}
            <div className="card group hover:border-primary-200 hover:shadow-md transition-all dark:hover:border-primary-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors dark:bg-cyan-900/50">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Validation des acquis
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Après chaque leçon, un QCM teste ta compréhension et identifie les points à
                consolider.
              </p>
            </div>

            {/* Feature 6: Parcours */}
            <div className="card group hover:border-primary-200 hover:shadow-md transition-all dark:hover:border-primary-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors dark:bg-rose-900/50">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Parcours guidés
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Des parcours prêts à l'emploi : "Révision Bac 30 jours", "Remise à niveau",
                "Objectif Mention".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="bg-slate-50 py-16 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Deux programmes complets</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Spécialité Mathématiques et Maths Expertes, tout le programme de Terminale.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Spécialité */}
            <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200 dark:from-primary-900/20 dark:to-slate-800 dark:border-primary-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <span className="text-lg font-bold">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Spécialité Maths</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{speLessons.length} leçons disponibles</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  Suites et limites
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  Fonctions, dérivation, convexité
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  Exponentielles et logarithmes
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  Trigonométrie
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  Intégration
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  Probabilités
                </li>
              </ul>
              <Link
                href="/lecons?track=spe"
                className="mt-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Voir les leçons
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Expertes */}
            <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-200 dark:from-purple-900/20 dark:to-slate-800 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <span className="text-lg font-bold">E</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Maths Expertes</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{expertesLessons.length} leçons disponibles</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  Nombres complexes
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  Matrices et systèmes
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  Arithmétique
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  Graphes
                </li>
              </ul>
              <Link
                href="/lecons?track=expertes"
                className="mt-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Voir les leçons
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">La méthode des 5 passes</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Une approche structurée pour vraiment comprendre et retenir chaque notion.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              { step: 1, title: 'Survol', desc: 'Parcours rapide pour avoir une vue d\'ensemble' },
              { step: 2, title: 'Questions', desc: 'Pose-toi des questions sur ce que tu vas apprendre' },
              { step: 3, title: 'Lecture', desc: 'Lis attentivement, prends des notes' },
              { step: 4, title: 'Approfondis', desc: 'Creuse les points difficiles, fais les exercices' },
              { step: 5, title: 'Révise', desc: 'Répétition espacée pour ancrer dans la mémoire' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                  {item.step}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/methode"
              className="btn-outline inline-flex items-center gap-2"
            >
              Découvrir la méthode complète
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Prêt à progresser en maths ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">
            Commence dès maintenant avec le parcours de ton choix ou explore librement les leçons.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/parcours"
              className="btn flex items-center gap-2 bg-white px-6 py-3 text-primary-700 hover:bg-primary-50"
            >
              <GraduationCap className="h-5 w-5" />
              Choisir un parcours
            </Link>
            <Link
              href="/revision"
              className="btn flex items-center gap-2 border border-primary-300 px-6 py-3 text-white hover:bg-primary-500"
            >
              <Brain className="h-5 w-5" />
              Session de révision rapide
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
