'use client'

import { useState } from 'react'
import { Brain, Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import MathText from './MathText'
import type { Mnemonic } from '@/data/mnemonics'

interface MnemonicCardProps {
  mnemonic: Mnemonic
  compact?: boolean
}

const categoryIcons: Record<Mnemonic['category'], string> = {
  formula: '📐',
  definition: '📖',
  method: '🔧',
  property: '✨',
  tip: '💡',
  theorem: '📜'
}

const categoryLabels: Record<Mnemonic['category'], string> = {
  formula: 'Formule',
  definition: 'Définition',
  method: 'Méthode',
  property: 'Propriété',
  tip: 'Astuce',
  theorem: 'Théorème'
}

const categoryColors: Record<Mnemonic['category'], string> = {
  formula: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  definition: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  method: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  property: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  tip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  theorem: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
}

export function MnemonicCard({ mnemonic, compact = false }: MnemonicCardProps) {
  const [expanded, setExpanded] = useState(!compact)

  if (compact) {
    return (
      <div className="rounded-lg border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-purple-50 dark:border-fuchsia-800 dark:from-fuchsia-950/50 dark:to-purple-950/50 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-fuchsia-100/50 dark:hover:bg-fuchsia-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
            <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
              {mnemonic.title}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-fuchsia-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-fuchsia-500" />
          )}
        </button>

        {expanded && (
          <div className="px-3 pb-3 border-t border-fuchsia-200 dark:border-fuchsia-800">
            <div className="mt-2 text-sm">
              <div className="mb-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded">
                <MathText text={mnemonic.content} />
              </div>
              <div className="text-fuchsia-800 dark:text-fuchsia-200">
                <MathText text={mnemonic.mnemonic} />
              </div>
              {mnemonic.explanation && (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">
                  {mnemonic.explanation}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-pink-50 dark:border-fuchsia-800 dark:from-fuchsia-950/30 dark:via-purple-950/30 dark:to-pink-950/30 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-fuchsia-100/80 to-purple-100/80 dark:from-fuchsia-900/40 dark:to-purple-900/40 border-b border-fuchsia-200 dark:border-fuchsia-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-fuchsia-200 dark:bg-fuchsia-800">
              <Brain className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-300" />
            </div>
            <h3 className="font-semibold text-fuchsia-900 dark:text-fuchsia-100">
              {mnemonic.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[mnemonic.category]}`}>
              {categoryIcons[mnemonic.category]} {categoryLabels[mnemonic.category]}
            </span>
            {mnemonic.visualAid && (
              <span className="text-lg">{mnemonic.visualAid}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Formula/Definition to remember */}
        <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-fuchsia-100 dark:border-fuchsia-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            À retenir
          </p>
          <div className="text-slate-800 dark:text-slate-200">
            <MathText text={mnemonic.content} />
          </div>
        </div>

        {/* Mnemonic trick */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-fuchsia-100/50 to-purple-100/50 dark:from-fuchsia-900/30 dark:to-purple-900/30 border-l-4 border-fuchsia-500">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                Astuce pour retenir
              </p>
              <div className="text-fuchsia-900 dark:text-fuchsia-100 font-medium">
                <MathText text={mnemonic.mnemonic} />
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {mnemonic.explanation && (
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-500" />
            <p className="italic">{mnemonic.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Component to display a list of mnemonics
interface MnemonicListProps {
  mnemonics: Mnemonic[]
  title?: string
  compact?: boolean
}

export function MnemonicList({ mnemonics, title = "Moyens mnémotechniques", compact = false }: MnemonicListProps) {
  const [showAll, setShowAll] = useState(false)

  if (mnemonics.length === 0) return null

  const displayedMnemonics = showAll ? mnemonics : mnemonics.slice(0, 3)
  const hasMore = mnemonics.length > 3

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300">
          {mnemonics.length}
        </span>
      </div>

      <div className={compact ? "space-y-2" : "grid gap-4"}>
        {displayedMnemonics.map((mnemonic) => (
          <MnemonicCard key={mnemonic.id} mnemonic={mnemonic} compact={compact} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 flex items-center justify-center gap-1"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Voir les {mnemonics.length - 3} autres
            </>
          )}
        </button>
      )}
    </div>
  )
}

// Sidebar widget for mnemonics
interface MnemonicSidebarWidgetProps {
  mnemonics: Mnemonic[]
}

export function MnemonicSidebarWidget({ mnemonics }: MnemonicSidebarWidgetProps) {
  if (mnemonics.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/50">
          <Brain className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          Astuces mémoire
        </h3>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300">
          {mnemonics.length}
        </span>
      </div>

      <div className="space-y-2">
        {mnemonics.slice(0, 4).map((mnemonic) => (
          <MnemonicCard key={mnemonic.id} mnemonic={mnemonic} compact />
        ))}
      </div>

      {mnemonics.length > 4 && (
        <p className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
          +{mnemonics.length - 4} autres astuces disponibles
        </p>
      )}
    </div>
  )
}
