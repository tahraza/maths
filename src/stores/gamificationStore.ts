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
  type: 'lessons' | 'exercises' | 'quizzes' | 'streaks' | 'special' | 'secret'
  unlocked?: boolean
  isSecret?: boolean // Si true, les conditions sont cachées jusqu'au déblocage
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

  // Secret badges - conditions cachées jusqu'au déblocage
  { id: 'midnight-scholar', name: 'Érudit de minuit', description: 'Étudie à minuit pile', icon: '🌙', requirement: 1, type: 'secret', isSecret: true },
  { id: 'speed-demon', name: 'Éclair', description: 'Termine 3 exercices en moins de 10 minutes', icon: '⚡', requirement: 3, type: 'secret', isSecret: true },
  { id: 'marathon', name: 'Marathonien', description: 'Gagne 50+ XP en une seule session', icon: '🏃', requirement: 50, type: 'secret', isSecret: true },
  { id: 'perfectionist-streak', name: 'Perfectionniste', description: 'Obtiens 100% à 3 QCM consécutifs', icon: '💎', requirement: 3, type: 'secret', isSecret: true },
  { id: 'first-day', name: 'Bienvenue !', description: 'Premier jour sur l\'application', icon: '🎉', requirement: 1, type: 'secret', isSecret: true },
  { id: 'comeback', name: 'Le retour', description: 'Reviens après 7 jours d\'absence', icon: '🔄', requirement: 7, type: 'secret', isSecret: true },
  { id: 'flash-master', name: 'Maître des cartes', description: '20 flashcards correctes d\'affilée', icon: '🃏', requirement: 20, type: 'secret', isSecret: true },
  { id: 'no-hints', name: 'Sans filet', description: 'Termine 5 exercices sans utiliser d\'indices', icon: '🎯', requirement: 5, type: 'secret', isSecret: true },
  { id: 'dedication', name: 'Dévoué', description: '100 jours d\'activité au total', icon: '📅', requirement: 100, type: 'secret', isSecret: true },
  { id: 'points-5000', name: 'Magnat', description: 'Accumule 5000 points', icon: '💎', requirement: 5000, type: 'secret', isSecret: true },
  { id: 'all-lessons-spe', name: 'Spécialiste', description: 'Termine toutes les leçons Spécialité', icon: '🎓', requirement: 17, type: 'secret', isSecret: true },
  { id: 'all-lessons-expertes', name: 'Expert', description: 'Termine toutes les leçons Expertes', icon: '🏆', requirement: 10, type: 'secret', isSecret: true },
  { id: 'centurion', name: 'Centurion', description: 'Complète 100 exercices', icon: '🛡️', requirement: 100, type: 'secret', isSecret: true },
  { id: 'quick-learner', name: 'Vif d\'esprit', description: 'Termine une leçon en moins de 15 minutes', icon: '🧠', requirement: 1, type: 'secret', isSecret: true },
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

  // Secret badges tracking
  perfectQuizzesInARow: number
  exercisesWithoutHints: number
  flashcardsCorrectStreak: number
  totalDaysActive: number
  sessionPointsEarned: number
  weekendDaysStudied: string[] // Pour tracker samedi/dimanche
  lessonsCompletedSpe: number
  lessonsCompletedExpertes: number

  // Anti-farming: track completed items (XP once only)
  completedGuidedExercises: string[]

  // Actions
  addPoints: (points: number, reason: string) => void
  updateStreak: () => void
  checkBadges: () => string[] // Returns newly unlocked badges
  recordActivity: (type: 'lesson' | 'exercise' | 'quiz' | 'flashcard', id: string) => void
  incrementStat: (stat: 'lessons' | 'exercises' | 'quizzes' | 'correctAnswers') => void
  recordExerciseCompleted: (exerciseId: string, isCorrect: boolean) => void
  getLevel: () => { level: number; currentXP: number; requiredXP: number; progress: number }
  // Secret badges helpers
  recordPerfectQuiz: () => void
  resetPerfectQuizStreak: () => void
  recordExerciseWithoutHint: () => void
  resetExerciseHintStreak: () => void
  recordFlashcardCorrect: () => void
  resetFlashcardStreak: () => void
  recordLessonCompleted: (track: 'spe' | 'expertes') => void
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
      // Secret badges tracking
      perfectQuizzesInARow: 0,
      exercisesWithoutHints: 0,
      flashcardsCorrectStreak: 0,
      totalDaysActive: 0,
      sessionPointsEarned: 0,
      weekendDaysStudied: [],
      lessonsCompletedSpe: 0,
      lessonsCompletedExpertes: 0,

      // Anti-farming: track completed items
      completedGuidedExercises: [],

      addPoints: (points, reason) => {
        const today = new Date().toISOString().split('T')[0]
        const now = new Date()
        const dayOfWeek = now.getDay() // 0 = dimanche, 6 = samedi

        set((state) => {
          // Track weekend activity
          let updatedWeekendDays = [...state.weekendDaysStudied]
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            const weekendKey = `${today}-${dayOfWeek}`
            if (!updatedWeekendDays.includes(weekendKey)) {
              updatedWeekendDays.push(weekendKey)
            }
          }

          // Track total days active
          const isNewDay = !state.dailyActivities[today]
          const newTotalDaysActive = isNewDay ? state.totalDaysActive + 1 : state.totalDaysActive

          return {
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
            },
            sessionPointsEarned: state.sessionPointsEarned + points,
            weekendDaysStudied: updatedWeekendDays,
            totalDaysActive: newTotalDaysActive,
          }
        })

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
        const now = new Date()
        const hour = now.getHours()
        const dayOfWeek = now.getDay()

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
              // Badges spéciaux avec logique temporelle
              switch (badge.id) {
                case 'points-1000':
                  shouldUnlock = state.totalPoints >= 1000
                  break
                case 'night-owl':
                  shouldUnlock = hour >= 22 || hour < 5
                  break
                case 'early-bird':
                  shouldUnlock = hour >= 5 && hour < 7
                  break
                case 'weekend-warrior':
                  // Vérifie si on a étudié un samedi ET un dimanche (même week-end)
                  const hasSaturday = state.weekendDaysStudied.some(d => d.endsWith('-6'))
                  const hasSunday = state.weekendDaysStudied.some(d => d.endsWith('-0'))
                  shouldUnlock = hasSaturday && hasSunday
                  break
              }
              break
            case 'secret':
              // Badges secrets avec conditions spéciales
              switch (badge.id) {
                case 'midnight-scholar':
                  shouldUnlock = hour === 0 // Minuit pile (0h00 - 0h59)
                  break
                case 'speed-demon':
                  // Géré par le composant exercice
                  break
                case 'marathon':
                  shouldUnlock = state.sessionPointsEarned >= 50
                  break
                case 'perfectionist-streak':
                  shouldUnlock = state.perfectQuizzesInARow >= 3
                  break
                case 'first-day':
                  shouldUnlock = state.totalDaysActive === 1
                  break
                case 'comeback':
                  // Vérifie si la dernière activité était il y a 7+ jours
                  if (state.lastActivityDate) {
                    const lastDate = new Date(state.lastActivityDate)
                    const today = new Date()
                    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
                    shouldUnlock = diffDays >= 7
                  }
                  break
                case 'flash-master':
                  shouldUnlock = state.flashcardsCorrectStreak >= 20
                  break
                case 'no-hints':
                  shouldUnlock = state.exercisesWithoutHints >= 5
                  break
                case 'dedication':
                  shouldUnlock = state.totalDaysActive >= 100
                  break
                case 'points-5000':
                  shouldUnlock = state.totalPoints >= 5000
                  break
                case 'all-lessons-spe':
                  shouldUnlock = state.lessonsCompletedSpe >= 17
                  break
                case 'all-lessons-expertes':
                  shouldUnlock = state.lessonsCompletedExpertes >= 10
                  break
                case 'centurion':
                  shouldUnlock = state.totalExercisesCompleted >= 100
                  break
                case 'quick-learner':
                  // Géré par le composant leçon
                  break
              }
              break
          }

          if (shouldUnlock) {
            newlyUnlocked.push(badge.id)
          }
        })

        if (newlyUnlocked.length > 0) {
          const nowStr = new Date().toISOString()
          set((state) => ({
            unlockedBadges: [...state.unlockedBadges, ...newlyUnlocked],
            achievements: [
              ...state.achievements,
              ...newlyUnlocked.map((id) => ({ badgeId: id, unlockedAt: nowStr }))
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
        const { recordActivity, incrementStat, addPoints, completedGuidedExercises } = get()
        const alreadyCompleted = completedGuidedExercises.includes(exerciseId)

        recordActivity('exercise', exerciseId)

        // XP seulement la première fois (anti-farming)
        if (isCorrect && !alreadyCompleted) {
          incrementStat('exercises')
          incrementStat('correctAnswers')
          addPoints(POINTS.EXERCISE_CORRECT, 'Exercice guidé réussi')

          // Marquer comme complété
          set((state) => ({
            completedGuidedExercises: [...state.completedGuidedExercises, exerciseId]
          }))
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

      // Secret badges helpers
      recordPerfectQuiz: () => {
        set((state) => ({
          perfectQuizzesInARow: state.perfectQuizzesInARow + 1
        }))
        get().checkBadges()
      },

      resetPerfectQuizStreak: () => {
        set({ perfectQuizzesInARow: 0 })
      },

      recordExerciseWithoutHint: () => {
        set((state) => ({
          exercisesWithoutHints: state.exercisesWithoutHints + 1
        }))
        get().checkBadges()
      },

      resetExerciseHintStreak: () => {
        set({ exercisesWithoutHints: 0 })
      },

      recordFlashcardCorrect: () => {
        set((state) => ({
          flashcardsCorrectStreak: state.flashcardsCorrectStreak + 1
        }))
        get().checkBadges()
      },

      resetFlashcardStreak: () => {
        set({ flashcardsCorrectStreak: 0 })
      },

      recordLessonCompleted: (track: 'spe' | 'expertes') => {
        set((state) => ({
          lessonsCompletedSpe: track === 'spe' ? state.lessonsCompletedSpe + 1 : state.lessonsCompletedSpe,
          lessonsCompletedExpertes: track === 'expertes' ? state.lessonsCompletedExpertes + 1 : state.lessonsCompletedExpertes,
        }))
        get().checkBadges()
      },
    }),
    {
      name: 'maths-gamification',
    }
  )
)
