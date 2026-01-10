'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Info, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

// Définition des chapitres avec leurs connexions
interface ChapterNode {
  id: string
  title: string
  shortTitle: string
  track: 'spe' | 'expertes'
  chapter: string
  prerequisites: string[]
  x: number
  y: number
  color: string
}

// Les chapitres organisés spatialement pour montrer les flux de prérequis
const chapters: ChapterNode[] = [
  // === SPÉCIALITÉ - Ligne du haut (bases) ===
  {
    id: 'limites-fonctions',
    title: 'Limites de fonctions',
    shortTitle: 'Limites',
    track: 'spe',
    chapter: 'fonctions',
    prerequisites: [],
    x: 100,
    y: 80,
    color: '#3b82f6', // blue
  },
  {
    id: 'implication-equivalence',
    title: 'Implication et équivalence',
    shortTitle: 'Logique',
    track: 'spe',
    chapter: 'raisonnement',
    prerequisites: [],
    x: 300,
    y: 80,
    color: '#8b5cf6', // violet
  },
  {
    id: 'suites-definition',
    title: 'Suites : définitions',
    shortTitle: 'Suites déf.',
    track: 'spe',
    chapter: 'suites',
    prerequisites: [],
    x: 500,
    y: 80,
    color: '#10b981', // emerald
  },
  {
    id: 'trigonometrie-bases',
    title: 'Trigonométrie : bases',
    shortTitle: 'Trigo bases',
    track: 'spe',
    chapter: 'trigo',
    prerequisites: [],
    x: 700,
    y: 80,
    color: '#f59e0b', // amber
  },
  {
    id: 'combinatoire',
    title: 'Combinatoire',
    shortTitle: 'Combinatoire',
    track: 'spe',
    chapter: 'probas',
    prerequisites: [],
    x: 900,
    y: 80,
    color: '#ec4899', // pink
  },

  // === Deuxième ligne (construits sur les bases) ===
  {
    id: 'continuite',
    title: 'Continuité',
    shortTitle: 'Continuité',
    track: 'spe',
    chapter: 'fonctions',
    prerequisites: ['limites-fonctions'],
    x: 100,
    y: 180,
    color: '#3b82f6',
  },
  {
    id: 'recurrence',
    title: 'Raisonnement par récurrence',
    shortTitle: 'Récurrence',
    track: 'spe',
    chapter: 'raisonnement',
    prerequisites: ['implication-equivalence'],
    x: 300,
    y: 180,
    color: '#8b5cf6',
  },
  {
    id: 'suites-limites',
    title: 'Limites de suites',
    shortTitle: 'Suites lim.',
    track: 'spe',
    chapter: 'suites',
    prerequisites: ['suites-definition', 'limites-fonctions'],
    x: 500,
    y: 180,
    color: '#10b981',
  },
  {
    id: 'fonctions-trigo',
    title: 'Fonctions trigonométriques',
    shortTitle: 'Fonctions trigo',
    track: 'spe',
    chapter: 'trigo',
    prerequisites: ['trigonometrie-bases', 'derivation'],
    x: 700,
    y: 180,
    color: '#f59e0b',
  },
  {
    id: 'variables-aleatoires',
    title: 'Variables aléatoires',
    shortTitle: 'V.A.',
    track: 'spe',
    chapter: 'probas',
    prerequisites: ['combinatoire'],
    x: 900,
    y: 180,
    color: '#ec4899',
  },

  // === Troisième ligne (analyse) ===
  {
    id: 'derivation',
    title: 'Dérivation',
    shortTitle: 'Dérivation',
    track: 'spe',
    chapter: 'fonctions',
    prerequisites: ['limites-fonctions'],
    x: 200,
    y: 280,
    color: '#3b82f6',
  },
  {
    id: 'suites-convergence',
    title: 'Convergence des suites',
    shortTitle: 'Convergence',
    track: 'spe',
    chapter: 'suites',
    prerequisites: ['suites-limites', 'recurrence'],
    x: 400,
    y: 280,
    color: '#10b981',
  },
  {
    id: 'loi-binomiale',
    title: 'Loi binomiale',
    shortTitle: 'Binomiale',
    track: 'spe',
    chapter: 'probas',
    prerequisites: ['variables-aleatoires', 'combinatoire'],
    x: 900,
    y: 280,
    color: '#ec4899',
  },

  // === Quatrième ligne (exp/ln et convexité) ===
  {
    id: 'convexite',
    title: 'Convexité',
    shortTitle: 'Convexité',
    track: 'spe',
    chapter: 'fonctions',
    prerequisites: ['derivation'],
    x: 100,
    y: 380,
    color: '#3b82f6',
  },
  {
    id: 'exponentielle',
    title: 'Fonction exponentielle',
    shortTitle: 'Exponentielle',
    track: 'spe',
    chapter: 'exp-ln',
    prerequisites: ['derivation', 'limites-fonctions'],
    x: 300,
    y: 380,
    color: '#06b6d4', // cyan
  },
  {
    id: 'vecteurs-espace',
    title: 'Vecteurs dans l\'espace',
    shortTitle: 'Vecteurs 3D',
    track: 'spe',
    chapter: 'geometrie',
    prerequisites: [],
    x: 600,
    y: 380,
    color: '#84cc16', // lime
  },
  {
    id: 'loi-normale',
    title: 'Loi normale',
    shortTitle: 'Loi normale',
    track: 'spe',
    chapter: 'probas',
    prerequisites: ['loi-binomiale', 'exponentielle'],
    x: 900,
    y: 380,
    color: '#ec4899',
  },

  // === Cinquième ligne (logarithme et géométrie) ===
  {
    id: 'logarithme',
    title: 'Fonction logarithme',
    shortTitle: 'Logarithme',
    track: 'spe',
    chapter: 'exp-ln',
    prerequisites: ['exponentielle', 'derivation'],
    x: 300,
    y: 480,
    color: '#06b6d4',
  },
  {
    id: 'produit-scalaire-espace',
    title: 'Produit scalaire dans l\'espace',
    shortTitle: 'Prod. scal. 3D',
    track: 'spe',
    chapter: 'geometrie',
    prerequisites: ['vecteurs-espace'],
    x: 600,
    y: 480,
    color: '#84cc16',
  },

  // === Sixième ligne (intégration et géométrie avancée) ===
  {
    id: 'primitives',
    title: 'Primitives',
    shortTitle: 'Primitives',
    track: 'spe',
    chapter: 'integration',
    prerequisites: ['derivation', 'exponentielle', 'logarithme'],
    x: 200,
    y: 580,
    color: '#ef4444', // red
  },
  {
    id: 'orthogonalite-espace',
    title: 'Orthogonalité dans l\'espace',
    shortTitle: 'Ortho. 3D',
    track: 'spe',
    chapter: 'geometrie',
    prerequisites: ['produit-scalaire-espace'],
    x: 600,
    y: 580,
    color: '#84cc16',
  },
  {
    id: 'droites-plans-espace',
    title: 'Droites et plans',
    shortTitle: 'Droites/Plans',
    track: 'spe',
    chapter: 'geometrie',
    prerequisites: ['vecteurs-espace', 'orthogonalite-espace'],
    x: 750,
    y: 580,
    color: '#84cc16',
  },

  // === Septième ligne (intégrales et éq. diff) ===
  {
    id: 'integrales',
    title: 'Intégration',
    shortTitle: 'Intégrales',
    track: 'spe',
    chapter: 'integration',
    prerequisites: ['primitives', 'continuite'],
    x: 200,
    y: 680,
    color: '#ef4444',
  },
  {
    id: 'equations-differentielles',
    title: 'Équations différentielles',
    shortTitle: 'Éq. diff.',
    track: 'spe',
    chapter: 'integration',
    prerequisites: ['exponentielle', 'primitives'],
    x: 400,
    y: 680,
    color: '#ef4444',
  },

  // =============================================
  // === MATHS EXPERTES ===
  // =============================================
  {
    id: 'complexes-introduction',
    title: 'Nombres complexes : introduction',
    shortTitle: 'Complexes intro',
    track: 'expertes',
    chapter: 'complexes',
    prerequisites: [],
    x: 100,
    y: 850,
    color: '#7c3aed', // violet-600
  },
  {
    id: 'divisibilite',
    title: 'Divisibilité',
    shortTitle: 'Divisibilité',
    track: 'expertes',
    chapter: 'arithmetique',
    prerequisites: ['recurrence'],
    x: 400,
    y: 850,
    color: '#0891b2', // cyan-600
  },
  {
    id: 'matrices-operations',
    title: 'Matrices : opérations',
    shortTitle: 'Matrices op.',
    track: 'expertes',
    chapter: 'matrices',
    prerequisites: [],
    x: 650,
    y: 850,
    color: '#059669', // emerald-600
  },
  {
    id: 'graphes-introduction',
    title: 'Graphes : introduction',
    shortTitle: 'Graphes intro',
    track: 'expertes',
    chapter: 'graphes',
    prerequisites: [],
    x: 900,
    y: 850,
    color: '#dc2626', // red-600
  },

  // === Expertes - Deuxième ligne ===
  {
    id: 'complexes-formes',
    title: 'Formes des complexes',
    shortTitle: 'Formes',
    track: 'expertes',
    chapter: 'complexes',
    prerequisites: ['complexes-introduction', 'trigonometrie-bases'],
    x: 100,
    y: 950,
    color: '#7c3aed',
  },
  {
    id: 'congruences',
    title: 'Congruences',
    shortTitle: 'Congruences',
    track: 'expertes',
    chapter: 'arithmetique',
    prerequisites: ['divisibilite'],
    x: 400,
    y: 950,
    color: '#0891b2',
  },
  {
    id: 'matrices-systemes',
    title: 'Matrices et systèmes',
    shortTitle: 'Syst. lin.',
    track: 'expertes',
    chapter: 'matrices',
    prerequisites: ['matrices-operations'],
    x: 650,
    y: 950,
    color: '#059669',
  },
  {
    id: 'graphes-parcours',
    title: 'Parcours de graphes',
    shortTitle: 'Parcours',
    track: 'expertes',
    chapter: 'graphes',
    prerequisites: ['graphes-introduction'],
    x: 900,
    y: 950,
    color: '#dc2626',
  },

  // === Expertes - Troisième ligne ===
  {
    id: 'complexes-geometrie',
    title: 'Géométrie complexe',
    shortTitle: 'Géom. complexe',
    track: 'expertes',
    chapter: 'complexes',
    prerequisites: ['complexes-formes'],
    x: 100,
    y: 1050,
    color: '#7c3aed',
  },
  {
    id: 'bezout',
    title: 'Théorème de Bézout',
    shortTitle: 'Bézout',
    track: 'expertes',
    chapter: 'arithmetique',
    prerequisites: ['congruences', 'divisibilite'],
    x: 400,
    y: 1050,
    color: '#0891b2',
  },
  {
    id: 'chaines-markov',
    title: 'Chaînes de Markov',
    shortTitle: 'Markov',
    track: 'expertes',
    chapter: 'matrices',
    prerequisites: ['matrices-operations', 'variables-aleatoires'],
    x: 650,
    y: 1050,
    color: '#059669',
  },

  // === Expertes - Quatrième ligne ===
  {
    id: 'equations-polynomiales-complexes',
    title: 'Équations polynomiales',
    shortTitle: 'Polynômes',
    track: 'expertes',
    chapter: 'complexes',
    prerequisites: ['complexes-geometrie'],
    x: 100,
    y: 1150,
    color: '#7c3aed',
  },
  {
    id: 'nombres-premiers',
    title: 'Nombres premiers',
    shortTitle: 'Premiers',
    track: 'expertes',
    chapter: 'arithmetique',
    prerequisites: ['bezout'],
    x: 400,
    y: 1150,
    color: '#0891b2',
  },
]

// Légende des couleurs par thème
const themes = [
  { name: 'Fonctions', color: '#3b82f6', chapter: 'fonctions' },
  { name: 'Exp/Ln', color: '#06b6d4', chapter: 'exp-ln' },
  { name: 'Intégration', color: '#ef4444', chapter: 'integration' },
  { name: 'Suites', color: '#10b981', chapter: 'suites' },
  { name: 'Raisonnement', color: '#8b5cf6', chapter: 'raisonnement' },
  { name: 'Trigonométrie', color: '#f59e0b', chapter: 'trigo' },
  { name: 'Probabilités', color: '#ec4899', chapter: 'probas' },
  { name: 'Géométrie 3D', color: '#84cc16', chapter: 'geometrie' },
  { name: 'Complexes', color: '#7c3aed', chapter: 'complexes' },
  { name: 'Arithmétique', color: '#0891b2', chapter: 'arithmetique' },
  { name: 'Matrices', color: '#059669', chapter: 'matrices' },
  { name: 'Graphes', color: '#dc2626', chapter: 'graphes' },
]

export default function ConceptMapPage() {
  const [zoom, setZoom] = useState(1)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null)

  // Calculer les connexions (arêtes)
  const edges = useMemo(() => {
    const result: { from: ChapterNode; to: ChapterNode }[] = []
    for (const chapter of chapters) {
      for (const prereqId of chapter.prerequisites) {
        const prereq = chapters.find((c) => c.id === prereqId)
        if (prereq) {
          result.push({ from: prereq, to: chapter })
        }
      }
    }
    return result
  }, [])

  // Filtrer les chapitres reliés au chapitre sélectionné
  const relatedChapters = useMemo(() => {
    if (!selectedChapter) return new Set<string>()
    const related = new Set<string>([selectedChapter])

    // Prérequis directs
    const selected = chapters.find((c) => c.id === selectedChapter)
    if (selected) {
      selected.prerequisites.forEach((p) => related.add(p))
    }

    // Chapitres qui dépendent de celui-ci
    chapters.forEach((c) => {
      if (c.prerequisites.includes(selectedChapter)) {
        related.add(c.id)
      }
    })

    return related
  }, [selectedChapter])

  const viewBox = `0 0 ${1050 / zoom} ${1250 / zoom}`

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/lecons"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux leçons
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Carte conceptuelle
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Visualisez les connexions entre les chapitres et comprenez la progression du programme.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Carte interactive */}
          <div className="card overflow-hidden">
            {/* Contrôles de zoom */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Dézoomer"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Zoomer"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Réinitialiser"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
              {selectedChapter && (
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Afficher tout
                </button>
              )}
            </div>

            {/* SVG de la carte */}
            <div className="overflow-auto bg-slate-100 dark:bg-slate-800/50" style={{ height: '700px' }}>
              <svg
                viewBox={viewBox}
                className="min-w-full min-h-full"
                style={{
                  width: `${1050 * zoom}px`,
                  height: `${1250 * zoom}px`,
                }}
              >
                <defs>
                  {/* Marqueur de flèche */}
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#94a3b8"
                    />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#3b82f6"
                    />
                  </marker>
                </defs>

                {/* Séparateur Spé / Expertes */}
                <line
                  x1="50"
                  y1="780"
                  x2="1000"
                  y2="780"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                />
                <text x="525" y="805" textAnchor="middle" className="fill-slate-500 text-sm font-medium">
                  Maths Expertes
                </text>
                <text x="525" y="765" textAnchor="middle" className="fill-slate-500 text-sm font-medium">
                  Spécialité
                </text>

                {/* Arêtes (connexions) */}
                {edges.map(({ from, to }, index) => {
                  const isActive = selectedChapter
                    ? relatedChapters.has(from.id) && relatedChapters.has(to.id)
                    : true
                  const isHovered = hoveredChapter === from.id || hoveredChapter === to.id

                  // Calculer le chemin avec une courbe
                  const dx = to.x - from.x
                  const dy = to.y - from.y
                  const midX = (from.x + to.x) / 2
                  const midY = (from.y + to.y) / 2

                  // Point de contrôle pour la courbe
                  const controlX = midX
                  const controlY = midY - Math.abs(dx) * 0.1

                  return (
                    <path
                      key={`${from.id}-${to.id}-${index}`}
                      d={`M ${from.x + 50} ${from.y + 20} Q ${controlX} ${controlY} ${to.x + 50} ${to.y}`}
                      fill="none"
                      stroke={isHovered ? '#3b82f6' : '#94a3b8'}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      strokeOpacity={isActive ? (isHovered ? 1 : 0.6) : 0.15}
                      markerEnd={isHovered ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                      className="transition-all duration-200"
                    />
                  )
                })}

                {/* Nœuds (chapitres) */}
                {chapters.map((chapter) => {
                  const isActive = selectedChapter ? relatedChapters.has(chapter.id) : true
                  const isSelected = selectedChapter === chapter.id
                  const isHovered = hoveredChapter === chapter.id

                  return (
                    <g
                      key={chapter.id}
                      transform={`translate(${chapter.x}, ${chapter.y})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedChapter(isSelected ? null : chapter.id)}
                      onMouseEnter={() => setHoveredChapter(chapter.id)}
                      onMouseLeave={() => setHoveredChapter(null)}
                      opacity={isActive ? 1 : 0.3}
                    >
                      {/* Rectangle du nœud */}
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="40"
                        rx="8"
                        fill={chapter.color}
                        stroke={isSelected ? '#1e293b' : 'transparent'}
                        strokeWidth={isSelected ? 3 : 0}
                        className={`transition-all duration-200 ${isHovered ? 'filter brightness-110' : ''}`}
                      />
                      {/* Texte */}
                      <text
                        x="50"
                        y="24"
                        textAnchor="middle"
                        className="fill-white text-xs font-medium pointer-events-none"
                        style={{ fontSize: '10px' }}
                      >
                        {chapter.shortTitle}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Info sur le chapitre sélectionné */}
            {selectedChapter && (
              <div className="card">
                {(() => {
                  const chapter = chapters.find((c) => c.id === selectedChapter)
                  if (!chapter) return null

                  const prereqs = chapters.filter((c) => chapter.prerequisites.includes(c.id))
                  const dependents = chapters.filter((c) => c.prerequisites.includes(chapter.id))

                  return (
                    <>
                      <div className="flex items-start gap-3">
                        <div
                          className="w-4 h-4 rounded mt-1 flex-shrink-0"
                          style={{ backgroundColor: chapter.color }}
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {chapter.track === 'spe' ? 'Spécialité' : 'Maths Expertes'}
                          </p>
                        </div>
                      </div>

                      {prereqs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Prérequis ({prereqs.length})
                          </h4>
                          <ul className="space-y-1">
                            {prereqs.map((p) => (
                              <li key={p.id}>
                                <button
                                  onClick={() => setSelectedChapter(p.id)}
                                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-2"
                                >
                                  <div
                                    className="w-2 h-2 rounded"
                                    style={{ backgroundColor: p.color }}
                                  />
                                  {p.shortTitle}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dependents.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Ouvre vers ({dependents.length})
                          </h4>
                          <ul className="space-y-1">
                            {dependents.map((d) => (
                              <li key={d.id}>
                                <button
                                  onClick={() => setSelectedChapter(d.id)}
                                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-2"
                                >
                                  <div
                                    className="w-2 h-2 rounded"
                                    style={{ backgroundColor: d.color }}
                                  />
                                  {d.shortTitle}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Link
                        href={`/lecons/${chapter.track}/${chapter.id}`}
                        className="btn-primary mt-4 w-full text-center block"
                      >
                        Voir la leçon
                      </Link>
                    </>
                  )
                })()}
              </div>
            )}

            {/* Légende */}
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Légende
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <div key={theme.chapter} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {theme.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aide */}
            <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Comment utiliser la carte</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Cliquez sur un chapitre pour voir ses connexions</li>
                    <li>Les flèches montrent les prérequis</li>
                    <li>Utilisez le zoom pour explorer</li>
                    <li>Survolez pour mettre en évidence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
