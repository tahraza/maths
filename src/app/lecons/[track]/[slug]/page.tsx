import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileQuestion,
  Brain,
  ClipboardList,
  ChevronRight,
  Infinity,
  GraduationCap,
} from 'lucide-react'
import { getLessonBySlug, getAllLessons, getExercisesByLesson, getFlashcardsByLesson, getPreQuiz, getPostQuiz } from '@/lib/content'
import { getTrackLabel, getTrackColor, getDifficultyLabel, getDifficultyColor, formatDuration } from '@/lib/utils'
import { LessonContent } from '@/components/LessonContent'
import { LessonProgress } from '@/components/LessonProgress'
import { RevisionSchedule } from '@/components/RevisionSchedule'
import { MnemonicList, MnemonicSidebarWidget } from '@/components/MnemonicCard'
import { getMnemonicsByLesson } from '@/data/mnemonics'
import type { Track } from '@/types'

interface PageProps {
  params: { track: string; slug: string }
}

// Mapping des IDs de leçons vers les catégories du générateur d'exercices
const lessonToGeneratorCategory: Record<string, string> = {
  // Spécialité
  'derivation': 'Dérivation',
  'suites-definition': 'Suites',
  'suites-limites': 'Suites',
  'suites-convergence': 'Suites',
  'limites-fonctions': 'Limites',
  'integrales': 'Intégrales',
  'primitives': 'Primitives',
  'continuite': 'Continuité',
  'convexite': 'Convexité',
  'exponentielle': 'Exponentielle',
  'logarithme': 'Logarithme',
  'trigonometrie-bases': 'Trigonométrie',
  'fonctions-trigo': 'Trigonométrie',
  'combinatoire': 'Combinatoire',
  'probabilites-va': 'Probabilités',
  'variables-aleatoires': 'Probabilités',
  'loi-binomiale': 'Probabilités',
  'loi-normale': 'Loi normale',
  'recurrence': 'Récurrence',
  'vecteurs-espace': 'Géométrie',
  'produit-scalaire-espace': 'Géométrie',
  'orthogonalite-espace': 'Géométrie',
  'equations-differentielles': 'Équations différentielles',
  // Expertes
  'complexes-introduction': 'Nombres complexes',
  'complexes-formes': 'Nombres complexes',
  'complexes-geometrie': 'Nombres complexes',
  'equations-polynomiales-complexes': 'Nombres complexes',
  'divisibilite': 'Arithmétique',
  'congruences': 'Arithmétique',
  'bezout': 'Arithmétique',
  'nombres-premiers': 'Arithmétique',
  'matrices-operations': 'Matrices',
  'matrices-systemes': 'Matrices',
  // Nouveaux chapitres
  'droites-plans-espace': 'Droites et plans',
  'implication-equivalence': 'Logique',
  'chaines-markov': 'Chaînes de Markov',
  'graphes-introduction': 'Graphes',
  'graphes-parcours': 'Graphes',
}

export async function generateStaticParams() {
  const lessons = getAllLessons()
  return lessons.map((lesson) => ({
    track: lesson.track,
    slug: lesson.slug,
  }))
}

export default function LessonPage({ params }: PageProps) {
  const { track, slug } = params
  const lesson = getLessonBySlug(track as Track, slug)

  if (!lesson) {
    notFound()
  }

  const exercises = getExercisesByLesson(lesson.id)
  const typeBacExercises = exercises.filter((exercise) => exercise.exerciseType === 'type-bac')
  const standardExercises = exercises.filter((exercise) => exercise.exerciseType !== 'type-bac')
  const flashcards = getFlashcardsByLesson(lesson.id)
  const preQuiz = getPreQuiz(lesson.id)
  const postQuiz = getPostQuiz(lesson.id)
  const mnemonics = getMnemonicsByLesson(lesson.id)

  // Get prev/next lessons
  const allLessons = getAllLessons().filter((l) => l.track === lesson.track)
  const currentIndex = allLessons.findIndex((l) => l.slug === slug)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/lecons" className="hover:text-primary-600 dark:hover:text-primary-400">
              Leçons
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/lecons?track=${track}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {getTrackLabel(track)}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 dark:text-slate-100">{lesson.title}</span>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${getTrackColor(lesson.track)}`}>
                  {getTrackLabel(lesson.track)}
                </span>
                <span className={`badge ${getDifficultyColor(lesson.level)}`}>
                  {getDifficultyLabel(lesson.level)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(lesson.estimatedTime)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {lesson.chapter}
                </div>
              </div>
            </div>

            <LessonProgress lessonId={lesson.id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <div>
            {/* Prerequisites warning */}
            {lesson.prerequisites.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-900 dark:text-amber-200">Prérequis</h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                      Cette leçon suppose que tu maîtrises : {lesson.prerequisites.join(', ')}
                    </p>
                    {preQuiz && (
                      <Link
                        href={`/qcm/${preQuiz.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
                      >
                        <FileQuestion className="h-4 w-4" />
                        Faire le QCM de diagnostic
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pre-quiz CTA */}
            {preQuiz && (
              <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
                <div className="flex items-start gap-3">
                  <FileQuestion className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-primary-900 dark:text-primary-200">QCM de diagnostic</h3>
                    <p className="mt-1 text-sm text-primary-800 dark:text-primary-300">
                      Évalue ton niveau avant de commencer pour un apprentissage personnalisé.
                    </p>
                  </div>
                  <Link
                    href={`/qcm/${preQuiz.id}`}
                    className="btn-primary text-sm"
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            )}

            {/* Lesson content */}
            <div className="card">
              <LessonContent content={lesson.content} />
            </div>

            {/* Mnemonics section */}
            {mnemonics.length > 0 && (
              <div className="mt-6 card border-fuchsia-200 dark:border-fuchsia-800">
                <MnemonicList mnemonics={mnemonics} title="Astuces pour retenir" />
              </div>
            )}

            {/* Post-quiz CTA */}
            {postQuiz && (
              <div className="mt-6 rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-success-900 dark:text-success-200">Valide tes acquis</h3>
                    <p className="mt-1 text-sm text-success-800 dark:text-success-300">
                      Tu as terminé la leçon ? Teste ta compréhension avec le QCM de validation.
                    </p>
                  </div>
                  <Link
                    href={`/qcm/${postQuiz.id}`}
                    className="btn-success text-sm"
                  >
                    Faire le QCM
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation prev/next */}
            <div className="mt-8 flex items-center justify-between">
              {prevLesson ? (
                <Link
                  href={`/lecons/${prevLesson.track}/${prevLesson.slug}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/lecons/${nextLesson.track}/${nextLesson.slug}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  <span className="text-sm">{nextLesson.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revision schedule */}
            <RevisionSchedule lessonId={lesson.id} />

            {/* Mnemonics sidebar widget */}
            <MnemonicSidebarWidget mnemonics={mnemonics} />

            {/* Related exercises */}
            {standardExercises.length > 0 && (
              <div className="card">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                  Exercices ({standardExercises.length})
                </h3>
                <ul className="mt-4 space-y-2">
                  {standardExercises.slice(0, 5).map((exercise) => (
                    <li key={exercise.id}>
                      <Link
                        href={`/exercices/${exercise.id}`}
                        className="flex items-center justify-between text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                      >
                        <span className="truncate">{exercise.title}</span>
                        <span className={`badge text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                          {getDifficultyLabel(exercise.difficulty)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {standardExercises.length > 5 && (
                  <Link
                    href={`/exercices?lesson=${lesson.id}`}
                    className="mt-4 block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Voir tous les exercices
                  </Link>
                )}
              </div>
            )}

            {typeBacExercises.length > 0 && (
              <div className="card border border-indigo-100 dark:border-indigo-900/60">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Exercices type bac ({typeBacExercises.length})
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Entraîne-toi sur un exercice issu d'une annale pour appliquer la leçon.
                </p>
                <ul className="mt-4 space-y-2">
                  {typeBacExercises.slice(0, 3).map((exercise) => (
                    <li key={exercise.id}>
                      <Link
                        href={`/exercices/${exercise.id}`}
                        className="flex items-center justify-between text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                      >
                        <span className="truncate">{exercise.title}</span>
                        <span className={`badge text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                          {getDifficultyLabel(exercise.difficulty)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {typeBacExercises.length > 3 && (
                  <Link
                    href={`/exercices?lesson=${lesson.id}&type=type-bac`}
                    className="mt-4 block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Voir tous les exercices type bac
                  </Link>
                )}
              </div>
            )}

            {/* Random exercise generator */}
            {lessonToGeneratorCategory[lesson.id] && (
              <div className="card border-2 border-dashed border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Infinity className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                  Exercices illimités
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Entraîne-toi avec des exercices générés aléatoirement sur ce chapitre.
                </p>
                <Link
                  href={`/exercices/generateur?category=${encodeURIComponent(lessonToGeneratorCategory[lesson.id])}`}
                  className="btn-primary mt-4 w-full text-center flex items-center justify-center gap-2"
                >
                  <Infinity className="h-4 w-4" />
                  Générateur {lessonToGeneratorCategory[lesson.id]}
                </Link>
              </div>
            )}

            {/* Related flashcards */}
            {flashcards.length > 0 && (
              <div className="card">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Flashcards ({flashcards.length})
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Révise les notions clés avec les flashcards de cette leçon.
                </p>
                <Link
                  href={`/flashcards?lesson=${lesson.id}`}
                  className="btn-secondary mt-4 w-full text-center"
                >
                  Réviser les flashcards
                </Link>
              </div>
            )}

            {/* Tags */}
            {lesson.tags.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tags</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lesson.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/lecons?tag=${tag}`}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
