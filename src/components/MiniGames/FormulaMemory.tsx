'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brain, Clock, Trophy, CheckCircle, RotateCcw, Play } from 'lucide-react'
import { useMiniGamesStore } from '@/stores/miniGamesStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { cn } from '@/lib/utils'

type Category = 'derivees' | 'primitives' | 'limites' | 'probas'

interface FormulaPair {
  id: string
  formula: string
  name: string
}

const FORMULA_PAIRS: Record<Category, FormulaPair[]> = {
  derivees: [
    { id: 'd1', formula: "(uv)' = u'v + uv'", name: 'Produit' },
    { id: 'd2', formula: "(u/v)' = (u'v - uv')/v²", name: 'Quotient' },
    { id: 'd3', formula: "(eᵘ)' = u'eᵘ", name: 'Exponentielle' },
    { id: 'd4', formula: "(ln u)' = u'/u", name: 'Logarithme' },
    { id: 'd5', formula: "(uⁿ)' = nu'uⁿ⁻¹", name: 'Puissance' },
    { id: 'd6', formula: "(sin u)' = u'cos u", name: 'Sinus' },
  ],
  primitives: [
    { id: 'p1', formula: '∫ xⁿ dx = xⁿ⁺¹/(n+1)', name: 'Puissance' },
    { id: 'p2', formula: '∫ eˣ dx = eˣ', name: 'Exponentielle' },
    { id: 'p3', formula: '∫ 1/x dx = ln|x|', name: 'Inverse' },
    { id: 'p4', formula: '∫ cos x dx = sin x', name: 'Cosinus' },
    { id: 'p5', formula: '∫ sin x dx = -cos x', name: 'Sinus' },
    { id: 'p6', formula: "∫ u'eᵘ dx = eᵘ", name: 'Exp composée' },
  ],
  limites: [
    { id: 'l1', formula: 'lim (eˣ/xⁿ) = +∞', name: 'Croissance exp' },
    { id: 'l2', formula: 'lim (ln x/x) = 0', name: 'Croissance ln' },
    { id: 'l3', formula: 'lim (sin x/x) = 1', name: 'Sinus cardinal' },
    { id: 'l4', formula: 'lim ((1+1/n)ⁿ) = e', name: 'Définition e' },
    { id: 'l5', formula: 'lim (xⁿ/n!) = 0', name: 'Factorielle' },
    { id: 'l6', formula: 'lim ((eˣ-1)/x) = 1', name: 'Taux exp' },
  ],
  probas: [
    { id: 'pr1', formula: 'P(A∪B) = P(A)+P(B)-P(A∩B)', name: 'Union' },
    { id: 'pr2', formula: 'P(Ā) = 1 - P(A)', name: 'Complémentaire' },
    { id: 'pr3', formula: 'P_B(A) = P(A∩B)/P(B)', name: 'Conditionnelle' },
    { id: 'pr4', formula: 'E(X) = Σ xᵢP(X=xᵢ)', name: 'Espérance' },
    { id: 'pr5', formula: 'V(X) = E(X²) - E(X)²', name: 'Variance' },
    { id: 'pr6', formula: 'P(A∩B) = P(A)×P_A(B)', name: 'Intersection' },
  ],
}

interface Card {
  id: string
  content: string
  type: 'formula' | 'name'
  pairId: string
  isFlipped: boolean
  isMatched: boolean
}

interface FormulaMemoryProps {
  onBack: () => void
}

export function FormulaMemory({ onBack }: FormulaMemoryProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu')
  const [category, setCategory] = useState<Category>('derivees')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  const { recordMemoryScore, memoryHighScore } = useMiniGamesStore()
  const { addPoints } = useGamificationStore()

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, startTime])

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = cards.find(c => c.id === first)
      const secondCard = cards.find(c => c.id === second)

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, firstCard.pairId])
          setCards(prev => prev.map(c =>
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          ))
          setFlippedCards([])
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            flippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  // Check for game end
  useEffect(() => {
    const pairs = FORMULA_PAIRS[category]
    if (matchedPairs.length === pairs.length && gameState === 'playing') {
      setGameState('finished')

      // Calculate score based on moves and time
      const perfectMoves = pairs.length
      const moveBonus = Math.max(0, (perfectMoves * 3 - moves) * 5)
      const timeBonus = Math.max(0, (120 - elapsedTime) * 2)
      const score = matchedPairs.length * 10 + moveBonus + timeBonus

      recordMemoryScore(score, category)
      addPoints(score, `Mini-jeu mémory: ${matchedPairs.length} paires`)
    }
  }, [matchedPairs, category, gameState, moves, elapsedTime, recordMemoryScore, addPoints])

  const startGame = useCallback(() => {
    const pairs = FORMULA_PAIRS[category]

    // Créer les cartes (formule + nom pour chaque paire)
    const gameCards: Card[] = []
    pairs.forEach(pair => {
      gameCards.push({
        id: `${pair.id}-formula`,
        content: pair.formula,
        type: 'formula',
        pairId: pair.id,
        isFlipped: false,
        isMatched: false,
      })
      gameCards.push({
        id: `${pair.id}-name`,
        content: pair.name,
        type: 'name',
        pairId: pair.id,
        isFlipped: false,
        isMatched: false,
      })
    })

    // Mélanger
    const shuffled = gameCards.sort(() => Math.random() - 0.5)

    setCards(shuffled)
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setGameState('playing')
  }, [category])

  const handleCardClick = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return

    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))
    setFlippedCards(prev => [...prev, cardId])
    setMoves(prev => prev + 1)
  }

  const categories: { id: Category; name: string; icon: string }[] = [
    { id: 'derivees', name: 'Dérivées', icon: "f'" },
    { id: 'primitives', name: 'Primitives', icon: '∫' },
    { id: 'limites', name: 'Limites', icon: 'lim' },
    { id: 'probas', name: 'Probabilités', icon: 'P' },
  ]

  // Menu
  if (gameState === 'menu') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mémory Formules</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Associe les formules à leurs noms
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Choisis une catégorie
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border-2 p-4 transition-all',
                  category === cat.id
                    ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 font-mono text-lg font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {cat.icon}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {memoryHighScore > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Meilleur score : {memoryHighScore} points
            </span>
          </div>
        )}

        <button
          onClick={startGame}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Play className="h-5 w-5" />
          Commencer
        </button>
      </div>
    )
  }

  // Écran de fin
  if (gameState === 'finished') {
    const pairs = FORMULA_PAIRS[category]
    const perfectMoves = pairs.length
    const moveBonus = Math.max(0, (perfectMoves * 3 - moves) * 5)
    const timeBonus = Math.max(0, (120 - elapsedTime) * 2)
    const score = matchedPairs.length * 10 + moveBonus + timeBonus

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Trophy className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bravo !</h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Toutes les paires trouvées !
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{score}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Points</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{moves}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Coups</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{elapsedTime}s</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Temps</p>
          </div>
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
            Rejouer
          </button>
        </div>
      </div>
    )
  }

  // Jeu en cours
  const pairs = FORMULA_PAIRS[category]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>{elapsedTime}s</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {moves} coups
          </span>
          <div className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            {matchedPairs.length}/{pairs.length}
          </div>
        </div>
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
            className={cn(
              'aspect-square rounded-lg p-2 text-xs font-medium transition-all',
              card.isMatched
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : card.isFlipped
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100'
                  : 'bg-slate-100 text-transparent hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'
            )}
          >
            {(card.isFlipped || card.isMatched) ? (
              <span className={cn(
                'flex h-full w-full items-center justify-center text-center',
                card.type === 'formula' ? 'font-mono text-[10px]' : 'text-xs'
              )}>
                {card.content}
              </span>
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl">
                ?
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
