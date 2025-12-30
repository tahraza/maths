import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Points values for different activities
export const POINTS = {
  LESSON_COMPLETED: 50,
  LESSON_REVIEWED: 20,
  EXERCISE_CORRECT: 20,
  EXERCISE_FIRST_TRY: 30,
  QUIZ_COMPLETED: 30,
  QUIZ_PERFECT: 100,
  FLASHCARD_CORRECT: 5,
  FLASHCARD_MASTERED: 25,
  STREAK_BONUS_7: 100,
  STREAK_BONUS_30: 500,
  DAILY_LOGIN: 10,
}

// Badge definitions
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  type: 'lessons' | 'exercises' | 'quizzes' | 'streaks' | 'special'
  unlocked?: boolean
}

export const BADGES: Badge[] = [
  // Lesson badges
  { id: 'first-lesson', name: 'Premier pas', description: 'Complète ta première leçon', icon: '📖', requirement: 1, type: 'lessons' },
  { id: 'lesson-5', name: 'Élève assidu', description: 'Complète 5 leçons', icon: '📚', requirement: 5, type: 'lessons' },
  { id: 'lesson-10', name: 'Mathématicien', description: 'Complète 10 leçons', icon: '🧮', requirement: 10, type: 'lessons' },
  { id: 'lesson-20', name: 'Expert des cours', description: 'Complète 20 leçons', icon: '🎓', requirement: 20, type: 'lessons' },

  // Exercise badges
  { id: 'first-exercise', name: 'Résolveur', description: 'Réussis ton premier exercice', icon: '✏️', requirement: 1, type: 'exercises' },
  { id: 'exercise-10', name: 'Praticien', description: 'Réussis 10 exercices', icon: '📝', requirement: 10, type: 'exercises' },
  { id: 'exercise-25', name: 'Maître des exercices', description: 'Réussis 25 exercices', icon: '🏆', requirement: 25, type: 'exercises' },
  { id: 'exercise-50', name: 'Champion', description: 'Réussis 50 exercices', icon: '👑', requirement: 50, type: 'exercises' },

  // Quiz badges
  { id: 'first-quiz', name: 'Testeur', description: 'Complète ton premier QCM', icon: '❓', requirement: 1, type: 'quizzes' },
  { id: 'quiz-5', name: 'Quiz master', description: 'Complète 5 QCM', icon: '🎯', requirement: 5, type: 'quizzes' },
  { id: 'perfect-quiz', name: 'Perfectionniste', description: 'Obtiens 100% à un QCM', icon: '💯', requirement: 1, type: 'quizzes' },
  { id: 'perfect-quiz-5', name: 'Sans faute', description: 'Obtiens 100% à 5 QCM', icon: '⭐', requirement: 5, type: 'quizzes' },

  // Streak badges
  { id: 'streak-3', name: 'Régulier', description: 'Série de 3 jours', icon: '🔥', requirement: 3, type: 'streaks' },
  { id: 'streak-7', name: 'Semaine parfaite', description: 'Série de 7 jours', icon: '💪', requirement: 7, type: 'streaks' },
  { id: 'streak-14', name: 'Déterminé', description: 'Série de 14 jours', icon: '🌟', requirement: 14, type: 'streaks' },
  { id: 'streak-30', name: 'Inarrêtable', description: 'Série de 30 jours', icon: '🏅', requirement: 30, type: 'streaks' },

  // Special badges
  { id: 'night-owl', name: 'Hibou de nuit', description: 'Étudie après 22h', icon: '🦉', requirement: 1, type: 'special' },
  { id: 'early-bird', name: 'Lève-tôt', description: 'Étudie avant 7h', icon: '🐦', requirement: 1, type: 'special' },
  { id: 'weekend-warrior', name: 'Guerrier du weekend', description: 'Étudie un samedi et dimanche', icon: '⚔️', requirement: 1, type: 'special' },
  { id: 'points-1000', name: 'Millionnaire', description: 'Accumule 1000 points', icon: '💰', requirement: 1000, type: 'special' },
]

interface GamificationState {
  // Points
  totalPoints: number
  pointsHistory: { date: string; points: number; reason: string }[]

  // Streaks
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null

  // Badges
  unlockedBadges: string[]
  achievements: { badgeId: string; unlockedAt: string }[]

  // Daily activities
  dailyActivities: {
    [date: string]: {
      lessonsCompleted: string[]
      exercisesCompleted: string[]
      quizzesCompleted: string[]
      flashcardsReviewed: string[]
      pointsEarned: number
    }
  }

  // Stats
  totalLessonsCompleted: number
  totalExercisesCompleted: number
  totalQuizzesCompleted: number
  totalCorrectAnswers: number

  // Actions
  addPoints: (points: number, reason: string) => void
  updateStreak: () => void
  checkBadges: () => string[] // Returns newly unlocked badges
  recordActivity: (type: 'lesson' | 'exercise' | 'quiz' | 'flashcard', id: string) => void
  incrementStat: (stat: 'lessons' | 'exercises' | 'quizzes' | 'correctAnswers') => void
  recordExerciseCompleted: (exerciseId: string, isCorrect: boolean) => void
  getLevel: () => { level: number; currentXP: number; requiredXP: number; progress: number }
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      pointsHistory: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      unlockedBadges: [],
      achievements: [],
      dailyActivities: {},
      totalLessonsCompleted: 0,
      totalExercisesCompleted: 0,
      totalQuizzesCompleted: 0,
      totalCorrectAnswers: 0,

      addPoints: (points, reason) => {
        const today = new Date().toISOString().split('T')[0]

        set((state) => ({
          totalPoints: state.totalPoints + points,
          pointsHistory: [
            ...state.pointsHistory.slice(-99),
            { date: today, points, reason }
          ],
          dailyActivities: {
            ...state.dailyActivities,
            [today]: {
              ...state.dailyActivities[today],
              pointsEarned: (state.dailyActivities[today]?.pointsEarned || 0) + points,
            }
          }
        }))

        // Update streak
        get().updateStreak()

        // Check for new badges
        get().checkBadges()
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0]
        const { lastActivityDate, currentStreak, longestStreak } = get()

        if (lastActivityDate === today) return

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreak = 1
        if (lastActivityDate === yesterdayStr) {
          newStreak = currentStreak + 1
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActivityDate: today,
        })

        // Bonus points for streaks
        if (newStreak === 7) {
          get().addPoints(POINTS.STREAK_BONUS_7, 'Bonus série 7 jours')
        } else if (newStreak === 30) {
          get().addPoints(POINTS.STREAK_BONUS_30, 'Bonus série 30 jours')
        }
      },

      checkBadges: () => {
        const state = get()
        const newlyUnlocked: string[] = []

        BADGES.forEach((badge) => {
          if (state.unlockedBadges.includes(badge.id)) return

          let shouldUnlock = false

          switch (badge.type) {
            case 'lessons':
              shouldUnlock = state.totalLessonsCompleted >= badge.requirement
              break
            case 'exercises':
              shouldUnlock = state.totalExercisesCompleted >= badge.requirement
              break
            case 'quizzes':
              shouldUnlock = state.totalQuizzesCompleted >= badge.requirement
              break
            case 'streaks':
              shouldUnlock = state.currentStreak >= badge.requirement
              break
            case 'special':
              if (badge.id === 'points-1000') {
                shouldUnlock = state.totalPoints >= 1000
              }
              break
          }

          if (shouldUnlock) {
            newlyUnlocked.push(badge.id)
          }
        })

        if (newlyUnlocked.length > 0) {
          const now = new Date().toISOString()
          set((state) => ({
            unlockedBadges: [...state.unlockedBadges, ...newlyUnlocked],
            achievements: [
              ...state.achievements,
              ...newlyUnlocked.map((id) => ({ badgeId: id, unlockedAt: now }))
            ]
          }))
        }

        return newlyUnlocked
      },

      recordActivity: (type, id) => {
        const today = new Date().toISOString().split('T')[0]

        set((state) => {
          const todayActivities = state.dailyActivities[today] || {
            lessonsCompleted: [],
            exercisesCompleted: [],
            quizzesCompleted: [],
            flashcardsReviewed: [],
            pointsEarned: 0,
          }

          const key = `${type}sCompleted` as keyof typeof todayActivities
          if (key === 'pointsEarned') return state

          const currentList = todayActivities[key] as string[]
          if (currentList.includes(id)) return state

          return {
            dailyActivities: {
              ...state.dailyActivities,
              [today]: {
                ...todayActivities,
                [key]: [...currentList, id],
              }
            }
          }
        })
      },

      incrementStat: (stat) => {
        set((state) => {
          switch (stat) {
            case 'lessons':
              return { totalLessonsCompleted: state.totalLessonsCompleted + 1 }
            case 'exercises':
              return { totalExercisesCompleted: state.totalExercisesCompleted + 1 }
            case 'quizzes':
              return { totalQuizzesCompleted: state.totalQuizzesCompleted + 1 }
            case 'correctAnswers':
              return { totalCorrectAnswers: state.totalCorrectAnswers + 1 }
            default:
              return state
          }
        })
      },

      recordExerciseCompleted: (exerciseId, isCorrect) => {
        const { recordActivity, incrementStat, addPoints } = get()

        recordActivity('exercise', exerciseId)
        incrementStat('exercises')

        if (isCorrect) {
          incrementStat('correctAnswers')
          addPoints(POINTS.EXERCISE_CORRECT, 'Exercice réussi')
        }
      },

      getLevel: () => {
        const { totalPoints } = get()

        // Level thresholds - each level requires more XP
        const getLevelThreshold = (level: number) => level * 100

        let level = 1
        let remainingXP = totalPoints

        // Calculate current level
        while (remainingXP >= getLevelThreshold(level)) {
          remainingXP -= getLevelThreshold(level)
          level++
        }

        const currentXP = remainingXP
        const requiredXP = getLevelThreshold(level)
        const progress = Math.min(100, (currentXP / requiredXP) * 100)

        return { level, currentXP, requiredXP, progress }
      },
    }),
    {
      name: 'maths-gamification',
    }
  )
)
