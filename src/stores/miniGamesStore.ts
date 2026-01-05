import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GameScore {
  score: number
  date: string
  difficulty?: string
}

interface MiniGamesState {
  // Calcul mental
  mentalMathHighScore: number
  mentalMathGamesPlayed: number
  mentalMathHistory: GameScore[]

  // Mémory formules
  memoryHighScore: number
  memoryGamesPlayed: number
  memoryHistory: GameScore[]

  // Actions
  recordMentalMathScore: (score: number, difficulty: string) => void
  recordMemoryScore: (score: number, category: string) => void
  getTotalGamesPlayed: () => number
  getBestScores: () => { mentalMath: number; memory: number }
}

export const useMiniGamesStore = create<MiniGamesState>()(
  persist(
    (set, get) => ({
      mentalMathHighScore: 0,
      mentalMathGamesPlayed: 0,
      mentalMathHistory: [],

      memoryHighScore: 0,
      memoryGamesPlayed: 0,
      memoryHistory: [],

      recordMentalMathScore: (score, difficulty) => {
        const today = new Date().toISOString().split('T')[0]

        set((state) => ({
          mentalMathHighScore: Math.max(state.mentalMathHighScore, score),
          mentalMathGamesPlayed: state.mentalMathGamesPlayed + 1,
          mentalMathHistory: [
            ...state.mentalMathHistory.slice(-49),
            { score, date: today, difficulty }
          ],
        }))
      },

      recordMemoryScore: (score, category) => {
        const today = new Date().toISOString().split('T')[0]

        set((state) => ({
          memoryHighScore: Math.max(state.memoryHighScore, score),
          memoryGamesPlayed: state.memoryGamesPlayed + 1,
          memoryHistory: [
            ...state.memoryHistory.slice(-49),
            { score, date: today, difficulty: category }
          ],
        }))
      },

      getTotalGamesPlayed: () => {
        const state = get()
        return state.mentalMathGamesPlayed + state.memoryGamesPlayed
      },

      getBestScores: () => {
        const state = get()
        return {
          mentalMath: state.mentalMathHighScore,
          memory: state.memoryHighScore,
        }
      },
    }),
    {
      name: 'maths-minigames',
    }
  )
)
