'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  FileQuestion,
  Brain,
  Play,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  GraduationCap,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

interface DayPlan {
  day: number
  theme: string
  lessons: string[]
  exercises: number
  flashcards: number
  quiz?: boolean
}

// Mapping des slugs de leçons vers leur track
const lessonTrackMap: Record<string, string> = {
  // Spécialité
  'suites-definition': 'spe',
  'suites-limites': 'spe',
  'suites-convergence': 'spe',
  'recurrence': 'spe',
  'derivation': 'spe',
  'exponentielle': 'spe',
  'logarithme': 'spe',
  'primitives': 'spe',
  'integrales': 'spe',
  'limites-fonctions': 'spe',
  'continuite': 'spe',
  'convexite': 'spe',
  'trigonometrie-bases': 'spe',
  'fonctions-trigo': 'spe',
  'probabilites-va': 'spe',
  'loi-normale': 'spe',
  'implication-equivalence': 'spe',
  // Expertes
  'complexes-introduction': 'expertes',
  'complexes-formes': 'expertes',
  'complexes-geometrie': 'expertes',
  'matrices-operations': 'expertes',
  'matrices-systemes': 'expertes',
  'divisibilite': 'expertes',
  'congruences': 'expertes',
  'bezout': 'expertes',
  'graphes-introduction': 'expertes',
  'graphes-parcours': 'expertes',
}

// Noms affichés pour les leçons
const lessonNames: Record<string, string> = {
  // Spécialité
  'suites-definition': 'Suites numériques',
  'suites-limites': 'Limites de suites',
  'suites-convergence': 'Convergence des suites',
  'recurrence': 'Récurrence',
  'derivation': 'Dérivation',
  'exponentielle': 'Fonction exponentielle',
  'logarithme': 'Fonction logarithme',
  'primitives': 'Primitives',
  'integrales': 'Intégrales',
  'limites-fonctions': 'Limites de fonctions',
  'continuite': 'Continuité',
  'convexite': 'Convexité',
  'trigonometrie-bases': 'Trigonométrie',
  'fonctions-trigo': 'Fonctions trigonométriques',
  'probabilites-va': 'Variables aléatoires',
  'loi-normale': 'Loi normale',
  'implication-equivalence': 'Logique et raisonnement',
  // Expertes
  'complexes-introduction': 'Complexes - Introduction',
  'complexes-formes': 'Complexes - Formes',
  'complexes-geometrie': 'Complexes - Géométrie',
  'matrices-operations': 'Matrices - Opérations',
  'matrices-systemes': 'Matrices - Systèmes',
  'divisibilite': 'Divisibilité',
  'congruences': 'Congruences',
  'bezout': 'Théorème de Bézout',
  'graphes-introduction': 'Graphes - Introduction',
  'graphes-parcours': 'Graphes - Parcours',
}

const parcoursData: Record<string, {
  id: string
  name: string
  description: string
  duration: string
  color: string
  icon: typeof Target
  days: DayPlan[]
}> = {
  'bac-30-jours': {
    id: 'bac-30-jours',
    name: 'Révision Bac 30 jours',
    description: 'Parcours intensif pour préparer le bac',
    duration: '30 jours',
    color: 'primary',
    icon: Target,
    days: [
      // Semaine 1 : Suites et récurrence
      { day: 1, theme: 'Suites numériques', lessons: ['suites-definition'], exercises: 3, flashcards: 5, quiz: true },
      { day: 2, theme: 'Limites de suites', lessons: ['suites-limites'], exercises: 4, flashcards: 5, quiz: true },
      { day: 3, theme: 'Convergence', lessons: ['suites-convergence'], exercises: 4, flashcards: 5 },
      { day: 4, theme: 'Récurrence', lessons: ['recurrence'], exercises: 4, flashcards: 5, quiz: true },
      { day: 5, theme: 'Révision semaine 1', lessons: ['suites-definition', 'suites-limites', 'recurrence'], exercises: 5, flashcards: 10 },
      // Semaine 2 : Dérivation et fonctions
      { day: 6, theme: 'Dérivation', lessons: ['derivation'], exercises: 3, flashcards: 5, quiz: true },
      { day: 7, theme: 'Limites de fonctions', lessons: ['limites-fonctions'], exercises: 4, flashcards: 5, quiz: true },
      { day: 8, theme: 'Continuité', lessons: ['continuite'], exercises: 4, flashcards: 5, quiz: true },
      { day: 9, theme: 'Convexité', lessons: ['convexite'], exercises: 4, flashcards: 5, quiz: true },
      { day: 10, theme: 'Révision semaine 2', lessons: ['derivation', 'limites-fonctions', 'continuite'], exercises: 5, flashcards: 10 },
      // Semaine 3 : Fonctions usuelles
      { day: 11, theme: 'Exponentielle', lessons: ['exponentielle'], exercises: 4, flashcards: 5, quiz: true },
      { day: 12, theme: 'Logarithme', lessons: ['logarithme'], exercises: 4, flashcards: 5, quiz: true },
      { day: 13, theme: 'Trigonométrie', lessons: ['trigonometrie-bases'], exercises: 3, flashcards: 5, quiz: true },
      { day: 14, theme: 'Fonctions trigonométriques', lessons: ['fonctions-trigo'], exercises: 4, flashcards: 5, quiz: true },
      { day: 15, theme: 'Révision mi-parcours', lessons: ['exponentielle', 'logarithme', 'trigonometrie-bases'], exercises: 6, flashcards: 15 },
      // Semaine 4 : Intégrales et probabilités
      { day: 16, theme: 'Primitives', lessons: ['primitives'], exercises: 4, flashcards: 5, quiz: true },
      { day: 17, theme: 'Intégrales', lessons: ['integrales'], exercises: 4, flashcards: 5, quiz: true },
      { day: 18, theme: 'Variables aléatoires', lessons: ['probabilites-va'], exercises: 4, flashcards: 5, quiz: true },
      { day: 19, theme: 'Loi normale', lessons: ['loi-normale'], exercises: 4, flashcards: 5, quiz: true },
      { day: 20, theme: 'Révision Intégrales + Probas', lessons: ['primitives', 'integrales', 'probabilites-va', 'loi-normale'], exercises: 5, flashcards: 10 },
      // Semaine 5 : Révisions intensives
      { day: 21, theme: 'Révision Suites', lessons: ['suites-definition', 'suites-limites', 'suites-convergence'], exercises: 5, flashcards: 10 },
      { day: 22, theme: 'Révision Analyse', lessons: ['derivation', 'continuite', 'convexite'], exercises: 5, flashcards: 10 },
      { day: 23, theme: 'Révision Fonctions', lessons: ['exponentielle', 'logarithme', 'fonctions-trigo'], exercises: 5, flashcards: 10 },
      { day: 24, theme: 'Exercices type Bac 1', lessons: [], exercises: 6, flashcards: 5 },
      { day: 25, theme: 'Exercices type Bac 2', lessons: [], exercises: 6, flashcards: 5 },
      // Derniers jours
      { day: 26, theme: 'Points difficiles : Limites', lessons: ['limites-fonctions', 'suites-limites'], exercises: 5, flashcards: 10 },
      { day: 27, theme: 'Points difficiles : Intégrales', lessons: ['primitives', 'integrales'], exercises: 5, flashcards: 10 },
      { day: 28, theme: 'QCM de synthèse', lessons: [], exercises: 3, flashcards: 15, quiz: true },
      { day: 29, theme: 'Révision légère', lessons: [], exercises: 2, flashcards: 10 },
      { day: 30, theme: 'Jour J-1 : Confiance', lessons: [], exercises: 0, flashcards: 10 },
    ],
  },
  'remise-niveau': {
    id: 'remise-niveau',
    name: 'Remise à niveau',
    description: 'Reprends les bases avant les chapitres avancés',
    duration: '15 jours',
    color: 'emerald',
    icon: TrendingUp,
    days: [
      { day: 1, theme: 'Diagnostic initial', lessons: ['implication-equivalence'], exercises: 0, flashcards: 0, quiz: true },
      { day: 2, theme: 'Logique et raisonnement', lessons: ['implication-equivalence'], exercises: 2, flashcards: 5 },
      { day: 3, theme: 'Suites - Bases', lessons: ['suites-definition'], exercises: 3, flashcards: 5, quiz: true },
      { day: 4, theme: 'Suites - Limites', lessons: ['suites-limites'], exercises: 3, flashcards: 5 },
      { day: 5, theme: 'Révision suites', lessons: ['suites-definition', 'suites-limites'], exercises: 4, flashcards: 8 },
      { day: 6, theme: 'Dérivation - Bases', lessons: ['derivation'], exercises: 3, flashcards: 5, quiz: true },
      { day: 7, theme: 'Dérivation - Applications', lessons: ['derivation'], exercises: 4, flashcards: 5 },
      { day: 8, theme: 'Limites et continuité', lessons: ['limites-fonctions', 'continuite'], exercises: 3, flashcards: 5 },
      { day: 9, theme: 'Révision analyse', lessons: ['derivation', 'limites-fonctions'], exercises: 4, flashcards: 8 },
      { day: 10, theme: 'Exponentielle', lessons: ['exponentielle'], exercises: 3, flashcards: 5, quiz: true },
      { day: 11, theme: 'Logarithme', lessons: ['logarithme'], exercises: 3, flashcards: 5, quiz: true },
      { day: 12, theme: 'Trigonométrie - Bases', lessons: ['trigonometrie-bases'], exercises: 3, flashcards: 5 },
      { day: 13, theme: 'Révision fonctions', lessons: ['exponentielle', 'logarithme'], exercises: 4, flashcards: 8 },
      { day: 14, theme: 'Primitives - Introduction', lessons: ['primitives'], exercises: 3, flashcards: 5 },
      { day: 15, theme: 'Bilan final', lessons: [], exercises: 4, flashcards: 10, quiz: true },
    ],
  },
  'mention': {
    id: 'mention',
    name: 'Objectif Mention',
    description: 'Viser l\'excellence avec spé + expertes',
    duration: '45 jours',
    color: 'amber',
    icon: Zap,
    days: [
      // Semaine 1 : Bases solides
      { day: 1, theme: 'Logique et raisonnement', lessons: ['implication-equivalence'], exercises: 3, flashcards: 5, quiz: true },
      { day: 2, theme: 'Suites numériques', lessons: ['suites-definition'], exercises: 4, flashcards: 5, quiz: true },
      { day: 3, theme: 'Limites de suites', lessons: ['suites-limites'], exercises: 4, flashcards: 5, quiz: true },
      { day: 4, theme: 'Convergence', lessons: ['suites-convergence'], exercises: 4, flashcards: 5 },
      { day: 5, theme: 'Récurrence', lessons: ['recurrence'], exercises: 4, flashcards: 5, quiz: true },
      { day: 6, theme: 'Révision suites', lessons: ['suites-definition', 'suites-limites', 'recurrence'], exercises: 5, flashcards: 10 },
      { day: 7, theme: 'Complexes - Introduction', lessons: ['complexes-introduction'], exercises: 4, flashcards: 5, quiz: true },
      // Semaine 2 : Analyse
      { day: 8, theme: 'Dérivation', lessons: ['derivation'], exercises: 4, flashcards: 5, quiz: true },
      { day: 9, theme: 'Limites de fonctions', lessons: ['limites-fonctions'], exercises: 4, flashcards: 5, quiz: true },
      { day: 10, theme: 'Continuité', lessons: ['continuite'], exercises: 4, flashcards: 5, quiz: true },
      { day: 11, theme: 'Convexité', lessons: ['convexite'], exercises: 4, flashcards: 5, quiz: true },
      { day: 12, theme: 'Complexes - Formes', lessons: ['complexes-formes'], exercises: 4, flashcards: 5, quiz: true },
      { day: 13, theme: 'Complexes - Géométrie', lessons: ['complexes-geometrie'], exercises: 4, flashcards: 5, quiz: true },
      { day: 14, theme: 'Révision Analyse + Complexes', lessons: ['derivation', 'continuite', 'complexes-introduction'], exercises: 5, flashcards: 10 },
      // Semaine 3 : Fonctions usuelles
      { day: 15, theme: 'Exponentielle', lessons: ['exponentielle'], exercises: 4, flashcards: 5, quiz: true },
      { day: 16, theme: 'Logarithme', lessons: ['logarithme'], exercises: 4, flashcards: 5, quiz: true },
      { day: 17, theme: 'Trigonométrie', lessons: ['trigonometrie-bases'], exercises: 4, flashcards: 5, quiz: true },
      { day: 18, theme: 'Fonctions trigo', lessons: ['fonctions-trigo'], exercises: 4, flashcards: 5, quiz: true },
      { day: 19, theme: 'Matrices - Opérations', lessons: ['matrices-operations'], exercises: 4, flashcards: 5, quiz: true },
      { day: 20, theme: 'Matrices - Systèmes', lessons: ['matrices-systemes'], exercises: 4, flashcards: 5, quiz: true },
      { day: 21, theme: 'Révision Fonctions + Matrices', lessons: ['exponentielle', 'logarithme', 'matrices-operations'], exercises: 5, flashcards: 10 },
      // Semaine 4 : Intégrales et Arithmétique
      { day: 22, theme: 'Primitives', lessons: ['primitives'], exercises: 4, flashcards: 5, quiz: true },
      { day: 23, theme: 'Intégrales', lessons: ['integrales'], exercises: 4, flashcards: 5, quiz: true },
      { day: 24, theme: 'Divisibilité', lessons: ['divisibilite'], exercises: 4, flashcards: 5, quiz: true },
      { day: 25, theme: 'Congruences', lessons: ['congruences'], exercises: 4, flashcards: 5, quiz: true },
      { day: 26, theme: 'Bézout', lessons: ['bezout'], exercises: 4, flashcards: 5, quiz: true },
      { day: 27, theme: 'Révision Intégrales + Arith', lessons: ['primitives', 'integrales', 'divisibilite'], exercises: 5, flashcards: 10 },
      { day: 28, theme: 'QCM mi-parcours', lessons: [], exercises: 4, flashcards: 10, quiz: true },
      // Semaine 5 : Probabilités et Graphes
      { day: 29, theme: 'Variables aléatoires', lessons: ['probabilites-va'], exercises: 4, flashcards: 5, quiz: true },
      { day: 30, theme: 'Loi normale', lessons: ['loi-normale'], exercises: 4, flashcards: 5, quiz: true },
      { day: 31, theme: 'Graphes - Introduction', lessons: ['graphes-introduction'], exercises: 4, flashcards: 5, quiz: true },
      { day: 32, theme: 'Graphes - Parcours', lessons: ['graphes-parcours'], exercises: 4, flashcards: 5, quiz: true },
      { day: 33, theme: 'Révision Probas + Graphes', lessons: ['probabilites-va', 'loi-normale', 'graphes-introduction'], exercises: 5, flashcards: 10 },
      // Semaine 6-7 : Révisions intensives
      { day: 34, theme: 'Révision Suites avancé', lessons: ['suites-definition', 'suites-limites', 'suites-convergence'], exercises: 6, flashcards: 8 },
      { day: 35, theme: 'Révision Analyse avancé', lessons: ['derivation', 'limites-fonctions', 'continuite', 'convexite'], exercises: 6, flashcards: 8 },
      { day: 36, theme: 'Révision Complexes avancé', lessons: ['complexes-introduction', 'complexes-formes', 'complexes-geometrie'], exercises: 6, flashcards: 8 },
      { day: 37, theme: 'Révision Matrices avancé', lessons: ['matrices-operations', 'matrices-systemes'], exercises: 6, flashcards: 8 },
      { day: 38, theme: 'Révision Arithmétique avancé', lessons: ['divisibilite', 'congruences', 'bezout'], exercises: 6, flashcards: 8 },
      { day: 39, theme: 'Révision Graphes avancé', lessons: ['graphes-introduction', 'graphes-parcours'], exercises: 6, flashcards: 8 },
      { day: 40, theme: 'Exercices type Bac 1', lessons: [], exercises: 8, flashcards: 5 },
      { day: 41, theme: 'Exercices type Bac 2', lessons: [], exercises: 8, flashcards: 5 },
      { day: 42, theme: 'Exercices type concours', lessons: [], exercises: 8, flashcards: 5 },
      { day: 43, theme: 'Synthèse générale', lessons: [], exercises: 6, flashcards: 15 },
      { day: 44, theme: 'QCM final', lessons: [], exercises: 4, flashcards: 10, quiz: true },
      { day: 45, theme: 'Jour J-1 : Confiance', lessons: [], exercises: 2, flashcards: 10 },
    ],
  },
  'expertes-only': {
    id: 'expertes-only',
    name: 'Maths Expertes intensif',
    description: 'Programme complet maths expertes',
    duration: '25 jours',
    color: 'purple',
    icon: GraduationCap,
    days: [
      // Semaine 1 : Nombres complexes
      { day: 1, theme: 'Complexes - Introduction', lessons: ['complexes-introduction'], exercises: 3, flashcards: 5, quiz: true },
      { day: 2, theme: 'Complexes - Formes', lessons: ['complexes-formes'], exercises: 4, flashcards: 5, quiz: true },
      { day: 3, theme: 'Complexes - Géométrie', lessons: ['complexes-geometrie'], exercises: 4, flashcards: 5, quiz: true },
      { day: 4, theme: 'Complexes - Applications', lessons: ['complexes-introduction', 'complexes-formes'], exercises: 5, flashcards: 5 },
      { day: 5, theme: 'Révision complexes', lessons: ['complexes-introduction', 'complexes-formes', 'complexes-geometrie'], exercises: 5, flashcards: 10 },
      // Semaine 2 : Matrices
      { day: 6, theme: 'Matrices - Opérations', lessons: ['matrices-operations'], exercises: 4, flashcards: 5, quiz: true },
      { day: 7, theme: 'Matrices - Puissances', lessons: ['matrices-operations'], exercises: 4, flashcards: 5 },
      { day: 8, theme: 'Matrices - Systèmes', lessons: ['matrices-systemes'], exercises: 4, flashcards: 5, quiz: true },
      { day: 9, theme: 'Matrices - Gauss et inverse', lessons: ['matrices-systemes'], exercises: 5, flashcards: 5 },
      { day: 10, theme: 'Révision matrices', lessons: ['matrices-operations', 'matrices-systemes'], exercises: 5, flashcards: 10 },
      // Semaine 3 : Arithmétique
      { day: 11, theme: 'Divisibilité', lessons: ['divisibilite'], exercises: 4, flashcards: 5, quiz: true },
      { day: 12, theme: 'Divisibilité - Euclide', lessons: ['divisibilite'], exercises: 4, flashcards: 5 },
      { day: 13, theme: 'Congruences', lessons: ['congruences'], exercises: 4, flashcards: 5, quiz: true },
      { day: 14, theme: 'Congruences - Fermat', lessons: ['congruences'], exercises: 4, flashcards: 5 },
      { day: 15, theme: 'Bézout', lessons: ['bezout'], exercises: 4, flashcards: 5, quiz: true },
      { day: 16, theme: 'Bézout - Diophantienne', lessons: ['bezout'], exercises: 4, flashcards: 5 },
      { day: 17, theme: 'Révision arithmétique', lessons: ['divisibilite', 'congruences', 'bezout'], exercises: 5, flashcards: 10 },
      // Semaine 4 : Graphes
      { day: 18, theme: 'Graphes - Introduction', lessons: ['graphes-introduction'], exercises: 4, flashcards: 5, quiz: true },
      { day: 19, theme: 'Graphes - Représentations', lessons: ['graphes-introduction'], exercises: 4, flashcards: 5 },
      { day: 20, theme: 'Graphes - BFS et DFS', lessons: ['graphes-parcours'], exercises: 4, flashcards: 5, quiz: true },
      { day: 21, theme: 'Graphes - Euler et Hamilton', lessons: ['graphes-parcours'], exercises: 4, flashcards: 5 },
      { day: 22, theme: 'Révision graphes', lessons: ['graphes-introduction', 'graphes-parcours'], exercises: 5, flashcards: 10 },
      // Derniers jours : Synthèse
      { day: 23, theme: 'Révision Complexes + Matrices', lessons: ['complexes-formes', 'matrices-systemes'], exercises: 6, flashcards: 10 },
      { day: 24, theme: 'Révision Arith + Graphes', lessons: ['bezout', 'graphes-parcours'], exercises: 6, flashcards: 10 },
      { day: 25, theme: 'Bilan final', lessons: [], exercises: 5, flashcards: 15, quiz: true },
    ],
  },
}

export default function ParcoursDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const parcours = parcoursData[id]

  const { activePath, startPath, updatePathProgress, clearActivePath } = useStore()
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    if (activePath?.pathId === id) {
      setCurrentDay(activePath.currentDay)
    }
  }, [activePath, id])

  if (!parcours) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Parcours non trouvé</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Ce parcours n'existe pas.</p>
          <Link href="/parcours" className="btn-primary mt-4 inline-block">
            Retour aux parcours
          </Link>
        </div>
      </div>
    )
  }

  const Icon = parcours.icon
  const isActive = activePath?.pathId === id
  const completedDays = activePath?.completedDays || []

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
      primary: { bg: 'bg-primary-600', text: 'text-primary-600', border: 'border-primary-200 dark:border-primary-800', light: 'bg-primary-50 dark:bg-primary-900/20' },
      emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', light: 'bg-emerald-50 dark:bg-emerald-900/20' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800', light: 'bg-amber-50 dark:bg-amber-900/20' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800', light: 'bg-purple-50 dark:bg-purple-900/20' },
    }
    return colors[color] || colors.primary
  }

  const colors = getColorClasses(parcours.color)

  const handleStartParcours = () => {
    startPath(id)
    setCurrentDay(1)
  }

  const handleCompleteDay = (day: number) => {
    updatePathProgress(day)
    if (day < parcours.days.length) {
      setCurrentDay(day + 1)
    }
  }

  const handleResetParcours = () => {
    if (confirm('Voulez-vous vraiment réinitialiser ce parcours ? Toute la progression sera perdue.')) {
      clearActivePath()
      setCurrentDay(1)
    }
  }

  const handleRestartParcours = () => {
    if (confirm('Voulez-vous recommencer ce parcours depuis le début ?')) {
      clearActivePath()
      startPath(id)
      setCurrentDay(1)
    }
  }

  const handleGoBack = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1)
    }
  }

  const progress = isActive ? (completedDays.length / parcours.days.length) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/parcours"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux parcours
        </Link>

        {/* Header */}
        <div className={cn('rounded-xl p-6 mb-8 text-white', colors.bg)}>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{parcours.name}</h1>
              <p className="mt-1 text-white/80">{parcours.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {parcours.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {parcours.days.length} jours
                </span>
              </div>
            </div>
          </div>

          {isActive && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleRestartParcours}
                  className="text-sm text-white/80 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Recommencer depuis le début
                </button>
                <span className="text-white/40">|</span>
                <button
                  onClick={handleResetParcours}
                  className="text-sm text-white/80 hover:text-white"
                >
                  Abandonner le parcours
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start button if not active */}
        {!isActive && !activePath && (
          <div className="mb-8">
            <button
              onClick={handleStartParcours}
              className={cn('btn w-full justify-center text-white text-lg py-4', colors.bg)}
            >
              <Play className="h-5 w-5 mr-2" />
              Commencer ce parcours
            </button>
          </div>
        )}

        {/* Navigation between days */}
        {isActive && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleGoBack}
              disabled={currentDay <= 1}
              className={cn(
                "btn-secondary flex items-center gap-2",
                currentDay <= 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Jour précédent
            </button>
            <span className="text-slate-600 dark:text-slate-400">
              Jour actuel : <strong>{currentDay}</strong> / {parcours.days.length}
            </span>
            <button
              onClick={() => setCurrentDay(Math.min(currentDay + 1, parcours.days.length))}
              disabled={currentDay >= parcours.days.length}
              className={cn(
                "btn-secondary flex items-center gap-2",
                currentDay >= parcours.days.length && "opacity-50 cursor-not-allowed"
              )}
            >
              Jour suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Days list */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Programme jour par jour</h2>

          {parcours.days.map((day) => {
            const isCompleted = completedDays.includes(day.day)
            const isCurrent = isActive && currentDay === day.day
            const isLocked = isActive && day.day > currentDay && !isCompleted
            const isAccessible = !isActive || isCurrent || isCompleted || day.day <= currentDay

            return (
              <div
                key={day.day}
                className={cn(
                  'rounded-xl border bg-white dark:bg-slate-800 p-4 transition-all',
                  isCurrent && `${colors.border} ${colors.light}`,
                  isCompleted && 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
                  !isCurrent && !isCompleted && 'border-slate-200 dark:border-slate-700',
                  isLocked && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Day indicator */}
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      isCompleted
                        ? 'bg-success-500 text-white'
                        : isCurrent
                        ? `${colors.bg} text-white`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : day.day}
                  </div>

                  {/* Day content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{day.theme}</h3>
                      {/* Action */}
                      {isCurrent && (
                        <button
                          onClick={() => handleCompleteDay(day.day)}
                          className={cn('btn text-white flex-shrink-0', colors.bg)}
                        >
                          Terminer
                        </button>
                      )}
                      {isCompleted && (
                        <span className="text-success-600 font-medium flex items-center gap-1 flex-shrink-0">
                          <Trophy className="h-4 w-4" />
                          Fait
                        </span>
                      )}
                    </div>

                    {/* Summary badges */}
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {day.lessons.length > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {day.lessons.length} leçon{day.lessons.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {day.exercises > 0 && (
                        <span className="flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" />
                          {day.exercises} exercices
                        </span>
                      )}
                      {day.flashcards > 0 && (
                        <span className="flex items-center gap-1">
                          <Brain className="h-3.5 w-3.5" />
                          {day.flashcards} flashcards
                        </span>
                      )}
                      {day.quiz && (
                        <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">Quiz</span>
                      )}
                    </div>

                    {/* Detailed links - shown for current or accessible days */}
                    {isAccessible && (day.lessons.length > 0 || day.exercises > 0 || day.flashcards > 0 || day.quiz) && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        {/* Lesson links */}
                        {day.lessons.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">Leçons :</span>
                            {day.lessons.map((lessonSlug) => (
                              <Link
                                key={lessonSlug}
                                href={`/lecons/${lessonTrackMap[lessonSlug] || 'spe'}/${lessonSlug}`}
                                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 hover:underline"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                {lessonNames[lessonSlug] || lessonSlug}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Quiz link */}
                        {day.quiz && day.lessons.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">QCM :</span>
                            {day.lessons.map((lessonSlug) => (
                              <Link
                                key={`quiz-${lessonSlug}`}
                                href={`/qcm/pre-${lessonSlug}`}
                                className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 hover:underline"
                              >
                                <Target className="h-3.5 w-3.5" />
                                QCM {lessonNames[lessonSlug] || lessonSlug}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Exercises link */}
                        {day.exercises > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">Exercices :</span>
                            {day.lessons.length > 0 ? (
                              day.lessons.map((lessonSlug) => (
                                <Link
                                  key={`ex-${lessonSlug}`}
                                  href={`/exercices?lesson=${lessonSlug}`}
                                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                                >
                                  <FileQuestion className="h-3.5 w-3.5" />
                                  {lessonNames[lessonSlug] || lessonSlug}
                                </Link>
                              ))
                            ) : (
                              <Link
                                href="/exercices"
                                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                              >
                                <FileQuestion className="h-3.5 w-3.5" />
                                Tous les exercices ({day.exercises} à faire)
                              </Link>
                            )}
                          </div>
                        )}

                        {/* Flashcards link */}
                        {day.flashcards > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">Flashcards :</span>
                            {day.lessons.length > 0 ? (
                              day.lessons.map((lessonSlug) => (
                                <Link
                                  key={`fc-${lessonSlug}`}
                                  href={`/flashcards?lesson=${lessonSlug}`}
                                  className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                >
                                  <Brain className="h-3.5 w-3.5" />
                                  {lessonNames[lessonSlug] || lessonSlug}
                                </Link>
                              ))
                            ) : (
                              <Link
                                href="/flashcards"
                                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                              >
                                <Brain className="h-3.5 w-3.5" />
                                Toutes les flashcards ({day.flashcards})
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Completion message */}
        {isActive && completedDays.length === parcours.days.length && (
          <div className="mt-8 rounded-xl bg-success-100 dark:bg-success-900/30 border border-success-200 dark:border-success-800 p-6 text-center">
            <Trophy className="h-12 w-12 text-success-600 dark:text-success-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-success-900 dark:text-success-300">Parcours terminé !</h2>
            <p className="mt-2 text-success-700 dark:text-success-400">
              Félicitations ! Tu as complété tous les jours de ce parcours.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
