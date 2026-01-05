'use client'

import { useEffect, useState } from 'react'
import { Trophy, Lock, X } from 'lucide-react'
import { useGamificationStore, BADGES, Badge } from '@/stores/gamificationStore'
import { cn } from '@/lib/utils'

interface BadgesDisplayProps {
  showAll?: boolean
  maxDisplay?: number
  className?: string
}

export function BadgesDisplay({ showAll = false, maxDisplay = 6, className }: BadgesDisplayProps) {
  const [mounted, setMounted] = useState(false)
  const { unlockedBadges, achievements } = useGamificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const unlockedBadgesList = BADGES.filter(b => unlockedBadges.includes(b.id))
  const lockedBadgesList = BADGES.filter(b => !unlockedBadges.includes(b.id))

  const displayBadges = showAll
    ? [...unlockedBadgesList, ...lockedBadgesList]
    : unlockedBadgesList.slice(0, maxDisplay)

  const getUnlockedAt = (badgeId: string) => {
    const achievement = achievements.find(a => a.badgeId === badgeId)
    return achievement?.unlockedAt
  }

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Trophy className="h-5 w-5 text-amber-500" />
          Badges ({unlockedBadges.length}/{BADGES.length})
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {displayBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            isUnlocked={unlockedBadges.includes(badge.id)}
            unlockedAt={getUnlockedAt(badge.id)}
          />
        ))}
        {!showAll && unlockedBadgesList.length > maxDisplay && (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-4 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              +{unlockedBadgesList.length - maxDisplay}
            </span>
          </div>
        )}
      </div>

      {displayBadges.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Aucun badge débloqué pour le moment. Continue tes révisions pour en obtenir !
        </p>
      )}
    </div>
  )
}

function BadgeCard({ badge, isUnlocked, unlockedAt }: { badge: Badge; isUnlocked: boolean; unlockedAt?: string }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const isSecret = badge.isSecret && !isUnlocked

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all',
          isUnlocked
            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-900/30 dark:to-orange-900/30'
            : isSecret
              ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-slate-50 dark:border-purple-800 dark:from-purple-900/20 dark:to-slate-800'
              : 'border-slate-200 bg-slate-50 opacity-50 grayscale dark:border-slate-700 dark:bg-slate-800'
        )}
      >
        <span className="text-2xl">{isSecret ? '🔐' : badge.icon}</span>
        <span className={cn(
          'mt-1 text-center text-xs font-medium',
          isUnlocked
            ? 'text-amber-700 dark:text-amber-300'
            : isSecret
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-slate-500 dark:text-slate-400'
        )}>
          {isSecret ? '???' : badge.name}
        </span>
        {!isUnlocked && !isSecret && (
          <Lock className="absolute right-1 top-1 h-3 w-3 text-slate-400" />
        )}
        {isSecret && (
          <span className="absolute -right-1 -top-1 text-xs">✨</span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-slate-700">
          <div className="font-semibold">{isSecret ? 'Succès secret' : badge.name}</div>
          <div className="text-slate-300">
            {isSecret ? 'Découvre les conditions pour débloquer ce badge mystérieux...' : badge.description}
          </div>
          {unlockedAt && (
            <div className="mt-1 text-emerald-400">
              Débloqué le {new Date(unlockedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </div>
      )}
    </div>
  )
}

interface BadgesModalProps {
  open: boolean
  onClose: () => void
}

export function BadgesModal({ open, onClose }: BadgesModalProps) {
  const [mounted, setMounted] = useState(false)
  const { unlockedBadges, achievements } = useGamificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) {
    return null
  }

  const getUnlockedAt = (badgeId: string) => {
    const achievement = achievements.find(a => a.badgeId === badgeId)
    return achievement?.unlockedAt
  }

  const categories = [
    { id: 'lessons', name: 'Leçons', icon: '📖' },
    { id: 'exercises', name: 'Exercices', icon: '✏️' },
    { id: 'quizzes', name: 'QCM', icon: '📝' },
    { id: 'streaks', name: 'Séries', icon: '🔥' },
    { id: 'special', name: 'Spéciaux', icon: '✨' },
    { id: 'secret', name: 'Secrets', icon: '🔐' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Badges ({unlockedBadges.length}/{BADGES.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {categories.map(category => {
          const categoryBadges = BADGES.filter(b => b.type === category.id)
          const unlockedCount = categoryBadges.filter(b => unlockedBadges.includes(b.id)).length

          return (
            <div key={category.id} className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>{category.icon}</span>
                {category.name}
                <span className="text-slate-400 dark:text-slate-500">
                  ({unlockedCount}/{categoryBadges.length})
                </span>
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {categoryBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isUnlocked={unlockedBadges.includes(badge.id)}
                    unlockedAt={getUnlockedAt(badge.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
