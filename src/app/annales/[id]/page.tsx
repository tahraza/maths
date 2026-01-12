'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Tags,
  ClipboardList,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import annalesData from '../../../../content/annales.json'

interface AnnaleExercise {
  id: string
  title?: string
  pages?: number[]
  topics?: string[]
  skills?: string[]
  lessonRefs?: string[]
}

interface Annale {
  id: string
  year: number
  session: string
  track: string
  paper: number
  subjectPath: string
  correctionPath?: string | null
  exercises?: AnnaleExercise[]
}

const SESSION_LABELS: Record<string, string> = {
  'amerique-nord': 'Amérique du Nord',
  'amerique-sud': 'Amérique du Sud',
  'centres-etranger': 'Centres étrangers',
  'nouv-caledonie': 'Nouvelle-Calédonie',
  'la-reunion': 'La Réunion',
  'mayotte-liban': 'Mayotte-Liban',
  'polynesie': 'Polynésie',
  'metropole': 'Métropole',
  'asie': 'Asie',
  'suede': 'Suède',
  'zero': 'Zéro',
}

const formatSession = (slug: string) => {
  if (SESSION_LABELS[slug]) return SESSION_LABELS[slug]
  return slug
    .split('-')
    .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

const formatPages = (pages?: number[]) => {
  if (!pages || pages.length === 0) return 'Pages à renseigner'
  if (pages.length === 1) return `Page ${pages[0]}`
  return `Pages ${pages.join(', ')}`
}

const formatLessonLabel = (slug: string) => {
  return slug
    .split('-')
    .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

export default function AnnalePage() {
  const params = useParams()
  const [mounted, setMounted] = useState(false)
  const [activeDoc, setActiveDoc] = useState<'subject' | 'correction'>('subject')
  const [activePage, setActivePage] = useState<number>(1)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const annaleId = params.id as string
  const annale = annalesData.annales.find((item) => item.id === annaleId) as Annale | undefined

  useEffect(() => {
    if (annale && activeDoc === 'correction' && !annale.correctionPath) {
      setActiveDoc('subject')
    }
  }, [annale, activeDoc])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!annale) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Annale non trouvée
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              L'annale demandée n'existe pas.
            </p>
            <Link
              href="/annales"
              className="mt-4 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux annales
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const exercises = annale.exercises ?? []
  const hasCorrection = Boolean(annale.correctionPath)
  const docPath = activeDoc === 'correction' && annale.correctionPath
    ? annale.correctionPath
    : annale.subjectPath
  const docLabel = activeDoc === 'correction' ? 'Correction' : 'Sujet'
  const docUrl = docPath ? `${docPath}#page=${activePage}` : ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/annales"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux annales
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Calendar className="h-4 w-4" />
              Bac {annale.year}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {formatSession(annale.session)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              Sujet {annale.paper}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
              hasCorrection
                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            )}>
              {hasCorrection ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {hasCorrection ? 'Corrigé disponible' : 'Corrigé manquant'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Annale – {formatSession(annale.session)} {annale.year}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Utilise l'embed pour naviguer dans le sujet et clique sur un exercice pour aller à la page indiquée.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveDoc('subject')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeDoc === 'subject'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              )}
            >
              Sujet
            </button>
            <button
              onClick={() => setActiveDoc('correction')}
              disabled={!hasCorrection}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeDoc === 'correction'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
                !hasCorrection && 'cursor-not-allowed opacity-60'
              )}
            >
              Corrigé
            </button>

            {docPath && (
              <Link
                href={docPath}
                target="_blank"
                className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                Ouvrir en grand
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {docLabel}
              </span>
              <span>Page {activePage}</span>
            </div>
            {docUrl ? (
              <iframe
                title={`${docLabel} ${annale.id}`}
                src={docUrl}
                className="h-[75vh] w-full rounded-lg border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Document indisponible.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <ClipboardList className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Exercices</h2>
              </div>

              {exercises.length === 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Aucun exercice n'est encore renseigné pour cette annale. Ajoute les pages, thèmes et compétences dans
                  <span className="font-semibold"> content/annales.json</span>.
                </p>
              )}

              <div className="space-y-3">
                {exercises.map((exercise) => {
                  const isSelected = selectedExerciseId === exercise.id
                  const topics = exercise.topics ?? []
                  const skills = exercise.skills ?? []
                  const lessonRefs = exercise.lessonRefs ?? []
                  const pages = exercise.pages ?? []
                  const handleSelect = () => {
                    setSelectedExerciseId(exercise.id)
                    if (pages.length > 0) {
                      setActivePage(pages[0])
                    }
                  }

                  return (
                    <div
                      key={exercise.id}
                      role="button"
                      tabIndex={0}
                      onClick={handleSelect}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleSelect()
                        }
                      }}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors',
                        isSelected
                          ? 'border-amber-400 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-900/20'
                          : 'border-slate-200 bg-white hover:border-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {exercise.title || `Exercice ${exercise.id.replace('ex', '')}`}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatPages(pages)}
                        </span>
                      </div>

                      {topics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {topics.map((topic) => (
                            <span
                              key={topic}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            >
                              <Tags className="h-3 w-3" />
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {lessonRefs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {lessonRefs.map((lesson) => (
                            <Link
                              key={lesson}
                              href={`/lecons/spe/${lesson}`}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                            >
                              <BookOpen className="h-3 w-3" />
                              {formatLessonLabel(lesson)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Astuce : renseigne les pages pour pouvoir sauter directement à un exercice depuis cette liste.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
