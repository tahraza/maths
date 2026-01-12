'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  FileText,
  Filter,
  Layers,
  Tags,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import annalesData from '../../../content/annales.json'

interface AnnaleExercise {
  id: string
  title?: string
  pages?: number[]
  topics?: string[]
  skills?: string[]
}

interface AnnaleSummary {
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

const uniqueSorted = (items: string[]) => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b))

export default function AnnalesPage() {
  const [mounted, setMounted] = useState(false)
  const [filterYear, setFilterYear] = useState<'all' | number>('all')
  const [filterSession, setFilterSession] = useState<'all' | string>('all')
  const [filterTopic, setFilterTopic] = useState<'all' | string>('all')
  const [filterSkill, setFilterSkill] = useState<'all' | string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const annales = annalesData.annales as AnnaleSummary[]

  const years = useMemo(
    () => Array.from(new Set(annales.map((annale) => annale.year))).sort((a, b) => b - a),
    [annales]
  )

  const sessions = useMemo(
    () => uniqueSorted(annales.map((annale) => annale.session)),
    [annales]
  )

  const topics = useMemo(() => {
    const allTopics = annales.flatMap((annale) =>
      (annale.exercises ?? []).flatMap((exercise) => exercise.topics ?? [])
    )
    return uniqueSorted(allTopics)
  }, [annales])

  const skills = useMemo(() => {
    const allSkills = annales.flatMap((annale) =>
      (annale.exercises ?? []).flatMap((exercise) => exercise.skills ?? [])
    )
    return uniqueSorted(allSkills)
  }, [annales])

  const filteredAnnales = annales.filter((annale) => {
    if (filterYear !== 'all' && annale.year !== filterYear) return false
    if (filterSession !== 'all' && annale.session !== filterSession) return false

    const exercises = annale.exercises ?? []
    if (filterTopic !== 'all' && !exercises.some((exercise) => exercise.topics?.includes(filterTopic))) {
      return false
    }
    if (filterSkill !== 'all' && !exercises.some((exercise) => exercise.skills?.includes(filterSkill))) {
      return false
    }

    return true
  })

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Annales – Spécialité Maths
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Sujets officiels + corrigés, avec repères par exercices, thèmes et compétences.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterYear('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filterYear === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              Toutes années
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setFilterYear(year)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  filterYear === year
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                )}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSession}
              onChange={(event) => setFilterSession(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Toutes sessions</option>
              {sessions.map((session) => (
                <option key={session} value={session}>
                  {formatSession(session)}
                </option>
              ))}
            </select>

            {topics.length > 0 && (
              <select
                value={filterTopic}
                onChange={(event) => setFilterTopic(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">Tous thèmes</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            )}

            {skills.length > 0 && (
              <select
                value={filterSkill}
                onChange={(event) => setFilterSkill(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">Toutes compétences</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {topics.length === 0 && skills.length === 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
            Les sujets sont prêts. Ajoute des exercices (pages + thèmes + compétences) dans
            <span className="font-semibold"> content/annales.json</span> pour activer les filtres pédagogiques.
          </div>
        )}

        <div className="space-y-4">
          {filteredAnnales.map((annale) => {
            const exercises = annale.exercises ?? []
            const topicsPreview = uniqueSorted(exercises.flatMap((exercise) => exercise.topics ?? [])).slice(0, 6)
            const hasCorrection = Boolean(annale.correctionPath)
            const labelSession = formatSession(annale.session)

            return (
              <Link
                key={annale.id}
                href={`/annales/${annale.id}`}
                className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <Calendar className="h-3 w-3" />
                        {annale.year}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {labelSession}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        Sujet {annale.paper}
                      </span>
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        hasCorrection
                          ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      )}>
                        {hasCorrection ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {hasCorrection ? 'Corrigé dispo' : 'Corrigé manquant'}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400">
                      Bac {annale.year} – {labelSession}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {exercises.length > 0
                        ? `${exercises.length} exercice${exercises.length > 1 ? 's' : ''} annoté${exercises.length > 1 ? 's' : ''}`
                        : 'Exercices à annoter (pages, thèmes, compétences)'}
                    </p>

                    {topicsPreview.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {topicsPreview.map((topic) => (
                          <span
                            key={topic}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-2">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        {annale.paper}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tags className="h-4 w-4" />
                        {topicsPreview.length || 0}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-amber-600 group-hover:text-amber-700 dark:text-amber-400">
                      Ouvrir le sujet
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredAnnales.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Aucune annale trouvée
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Essaie de modifier les filtres pour voir plus d'annales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
