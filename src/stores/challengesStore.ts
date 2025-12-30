import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'lessons' | 'exercises' | 'quizzes' | 'streak' | 'points'
  target: number
  current: number
  reward: number
  completed: boolean
  emoji: string
}

const CHALLENGE_TEMPLATES = [
  { title: 'Érudit de la semaine', description: 'Complète 5 leçons cette semaine', type: 'lessons' as const, target: 5, reward: 150, emoji: '📚' },
  { title: 'Marathon d\'exercices', description: 'Termine 10 exercices cette semaine', type: 'exercises' as const, target: 10, reward: 200, emoji: '🏃' },
  { title: 'Maître des QCM', description: 'Réussis 3 QCM cette semaine', type: 'quizzes' as const, target: 3, reward: 100, emoji: '🎯' },
  { title: 'Flamme constante', description: 'Maintiens une série de 5 jours', type: 'streak' as const, target: 5, reward: 175, emoji: '🔥' },
  { title: 'Chasseur de points', description: 'Gagne 300 points cette semaine', type: 'points' as const, target: 300, reward: 125, emoji: '💎' },
]

interface ChallengesState {
  activeChallenges: Challenge[]
  completedChallenges: string[]
  lastRefresh: string | null

  // Actions
  refreshChallenges: () => void
  updateProgress: (type: Challenge['type'], amount?: number) => void
  claimReward: (challengeId: string) => number
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      activeChallenges: [],
      completedChallenges: [],
      lastRefresh: null,

      refreshChallenges: () => {
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() + 1)
        weekStart.setHours(0, 0, 0, 0)
        const weekStartStr = weekStart.toISOString().split('T')[0]

        const { lastRefresh } = get()

        if (lastRefresh === weekStartStr) return

        const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, 3)

        const newChallenges: Challenge[] = selected.map((template, index) => ({
          id: `challenge-${weekStartStr}-${index}`,
          ...template,
          current: 0,
          completed: false,
        }))

        set({
          activeChallenges: newChallenges,
          completedChallenges: [],
          lastRefresh: weekStartStr,
        })
      },

      updateProgress: (type, amount = 1) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((challenge) => {
            if (challenge.type !== type || challenge.completed) return challenge

            const newCurrent = type === 'points'
              ? challenge.current + amount
              : challenge.current + 1

            return {
              ...challenge,
              current: Math.min(newCurrent, challenge.target),
              completed: newCurrent >= challenge.target,
            }
          })
        }))
      },

      claimReward: (challengeId) => {
        const challenge = get().activeChallenges.find((c) => c.id === challengeId)
        if (!challenge || !challenge.completed || get().completedChallenges.includes(challengeId)) {
          return 0
        }

        set((state) => ({
          completedChallenges: [...state.completedChallenges, challengeId],
        }))

        return challenge.reward
      },
    }),
    {
      name: 'maths-challenges',
    }
  )
)
