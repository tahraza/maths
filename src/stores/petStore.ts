import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PetType {
  id: string
  name: string
  emoji: string
  stages: PetStage[]
}

export interface PetStage {
  level: number
  name: string
  emoji: string
  requiredPoints: number
  description: string
}

// Accessory types
export interface Accessory {
  id: string
  name: string
  emoji: string
  price: number
  category: 'hat' | 'glasses' | 'necklace' | 'special'
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Background types
export interface Background {
  id: string
  name: string
  price: number
  gradient: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Pet traits
export interface PetTraits {
  happiness: number
  energy: number
  intelligence: number
}

// Side quest types
export interface SideQuest {
  id: string
  title: string
  description: string
  type: 'lesson' | 'exercise' | 'quiz' | 'flashcard' | 'streak'
  requirement: number
  rewardPoints: number
  rewardTrait: keyof PetTraits
  rewardTraitAmount: number
  emoji: string
}

// Available side quests
export const SIDE_QUESTS: SideQuest[] = [
  { id: 'sq-1', title: 'Lecteur avide', description: 'Lis 2 leçons complètes', type: 'lesson', requirement: 2, rewardPoints: 30, rewardTrait: 'intelligence', rewardTraitAmount: 5, emoji: '📖' },
  { id: 'sq-2', title: 'Résolveur d\'équations', description: 'Termine 3 exercices', type: 'exercise', requirement: 3, rewardPoints: 40, rewardTrait: 'intelligence', rewardTraitAmount: 8, emoji: '🧩' },
  { id: 'sq-3', title: 'Champion du QCM', description: 'Obtiens 80%+ à un QCM', type: 'quiz', requirement: 80, rewardPoints: 50, rewardTrait: 'happiness', rewardTraitAmount: 10, emoji: '🏆' },
  { id: 'sq-4', title: 'Maître des formules', description: 'Révise 10 flashcards', type: 'flashcard', requirement: 10, rewardPoints: 25, rewardTrait: 'intelligence', rewardTraitAmount: 3, emoji: '🃏' },
  { id: 'sq-5', title: 'Persévérant', description: 'Maintiens une série de 3 jours', type: 'streak', requirement: 3, rewardPoints: 60, rewardTrait: 'happiness', rewardTraitAmount: 15, emoji: '🔥' },
  { id: 'sq-6', title: 'Explorateur', description: 'Lis 1 leçon d\'un nouveau chapitre', type: 'lesson', requirement: 1, rewardPoints: 20, rewardTrait: 'happiness', rewardTraitAmount: 5, emoji: '🧭' },
  { id: 'sq-7', title: 'Perfectionniste', description: 'Obtiens 100% à un QCM', type: 'quiz', requirement: 100, rewardPoints: 80, rewardTrait: 'intelligence', rewardTraitAmount: 15, emoji: '💯' },
  { id: 'sq-8', title: 'Marathonien', description: 'Révise 20 flashcards', type: 'flashcard', requirement: 20, rewardPoints: 45, rewardTrait: 'energy', rewardTraitAmount: -10, emoji: '🏃' },
]

// Available accessories
export const ACCESSORIES: Accessory[] = [
  // Hats
  { id: 'hat-wizard', name: 'Chapeau de sorcier', emoji: '🧙', price: 150, category: 'hat', description: 'Magie des nombres !', rarity: 'common' },
  { id: 'hat-graduate', name: 'Toque de diplômé', emoji: '🎓', price: 200, category: 'hat', description: 'Prêt pour le bac !', rarity: 'rare' },
  { id: 'hat-crown', name: 'Couronne d\'or', emoji: '👑', price: 500, category: 'hat', description: 'Roi des maths', rarity: 'epic' },
  { id: 'hat-tophat', name: 'Haut-de-forme', emoji: '🎩', price: 180, category: 'hat', description: 'Classe et élégant', rarity: 'rare' },
  { id: 'hat-beret', name: 'Béret d\'artiste', emoji: '🎨', price: 120, category: 'hat', description: 'L\'art des équations', rarity: 'common' },

  // Glasses
  { id: 'glasses-nerd', name: 'Lunettes de génie', emoji: '🤓', price: 100, category: 'glasses', description: 'Look Einstein', rarity: 'common' },
  { id: 'glasses-sun', name: 'Lunettes de soleil', emoji: '🕶️', price: 120, category: 'glasses', description: 'Trop cool', rarity: 'common' },
  { id: 'glasses-monocle', name: 'Monocle', emoji: '🧐', price: 200, category: 'glasses', description: 'Distingué', rarity: 'rare' },

  // Necklaces
  { id: 'necklace-pi', name: 'Pendentif Pi', emoji: '🥧', price: 250, category: 'necklace', description: '3.14159...', rarity: 'rare' },
  { id: 'necklace-infinity', name: 'Collier Infini', emoji: '♾️', price: 400, category: 'necklace', description: 'Les limites n\'existent pas', rarity: 'epic' },
  { id: 'necklace-star', name: 'Étoile brillante', emoji: '⭐', price: 150, category: 'necklace', description: 'Brille de mille feux', rarity: 'common' },

  // Special
  { id: 'special-wings', name: 'Ailes mathématiques', emoji: '🪽', price: 600, category: 'special', description: 'Envole-toi !', rarity: 'epic' },
  { id: 'special-sparkle', name: 'Aura d\'étincelles', emoji: '✨', price: 500, category: 'special', description: 'Tu brilles !', rarity: 'epic' },
  { id: 'special-calculator', name: 'Calculatrice magique', emoji: '🔢', price: 300, category: 'special', description: 'Puissance de calcul', rarity: 'rare' },
  { id: 'special-formula', name: 'Formule flottante', emoji: '📐', price: 700, category: 'special', description: 'E=mc²', rarity: 'legendary' },
  { id: 'special-rainbow', name: 'Arc-en-ciel', emoji: '🌈', price: 800, category: 'special', description: 'Spectre complet', rarity: 'legendary' },

  // Premium accessories - Plus chers pour objectifs long terme
  { id: 'hat-divine', name: 'Auréole divine', emoji: '😇', price: 1000, category: 'hat', description: 'Sagesse suprême', rarity: 'legendary' },
  { id: 'hat-supreme', name: 'Chapeau cosmique', emoji: '🌌', price: 1200, category: 'hat', description: 'Maître de l\'univers', rarity: 'legendary' },
  { id: 'special-orb', name: 'Orbe mystique', emoji: '🔮', price: 1500, category: 'special', description: 'Voit l\'avenir des équations', rarity: 'legendary' },
  { id: 'special-portal', name: 'Portail dimensionnel', emoji: '🌀', price: 2000, category: 'special', description: 'Voyage entre les dimensions', rarity: 'legendary' },
  { id: 'special-potion', name: 'Potion de sagesse', emoji: '⚗️', price: 850, category: 'special', description: 'Boost ton intelligence', rarity: 'epic' },
  { id: 'special-scroll', name: 'Parchemin ancien', emoji: '📜', price: 900, category: 'special', description: 'Secrets des anciens', rarity: 'epic' },
  { id: 'necklace-integral', name: 'Symbole intégrale', emoji: '∫', price: 1100, category: 'necklace', description: 'L\'intégrale de tout', rarity: 'legendary' },
  { id: 'necklace-sigma', name: 'Sigma doré', emoji: '∑', price: 950, category: 'necklace', description: 'La somme de tes efforts', rarity: 'epic' },
  { id: 'necklace-pi-gold', name: 'Pi géant doré', emoji: 'π', price: 880, category: 'necklace', description: '3.14159265359...', rarity: 'epic' },
  { id: 'special-infinity', name: 'Infini cosmique', emoji: '∞', price: 1300, category: 'special', description: 'Au-delà des limites', rarity: 'legendary' },
]

// Available backgrounds
export const BACKGROUNDS: Background[] = [
  { id: 'bg-default', name: 'Par défaut', price: 0, gradient: 'from-primary-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-900/20', description: 'Fond classique', rarity: 'common' },
  { id: 'bg-galaxy', name: 'Galaxie', price: 200, gradient: 'from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/40 dark:via-indigo-900/30 dark:to-blue-900/40', description: 'Parmi les étoiles', rarity: 'rare' },
  { id: 'bg-library', name: 'Bibliothèque', price: 150, gradient: 'from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40', description: 'Entouré de livres', rarity: 'common' },
  { id: 'bg-chalkboard', name: 'Tableau noir', price: 180, gradient: 'from-slate-200 via-gray-100 to-slate-200 dark:from-slate-700 dark:via-gray-800 dark:to-slate-700', description: 'Comme en classe', rarity: 'rare' },
  { id: 'bg-fractal', name: 'Fractale', price: 400, gradient: 'from-cyan-100 via-teal-100 to-emerald-100 dark:from-cyan-900/40 dark:via-teal-900/30 dark:to-emerald-900/40', description: 'Beauté mathématique', rarity: 'epic' },
  { id: 'bg-matrix', name: 'Matrice', price: 350, gradient: 'from-green-100 via-emerald-50 to-lime-100 dark:from-green-900/50 dark:via-emerald-900/40 dark:to-lime-900/50', description: 'Code binaire', rarity: 'epic' },
  { id: 'bg-golden', name: 'Nombre d\'or', price: 500, gradient: 'from-yellow-200 via-amber-100 to-yellow-200 dark:from-yellow-900/50 dark:via-amber-900/40 dark:to-yellow-900/50', description: 'φ = 1.618...', rarity: 'legendary' },
  { id: 'bg-nebula', name: 'Nébuleuse', price: 450, gradient: 'from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-900/40 dark:via-purple-900/40 dark:to-indigo-900/40', description: 'Cosmos infini', rarity: 'epic' },
]

// Available pets - DIFFERENT FROM PHYSIQUE-CHIMIE
export const AVAILABLE_PETS: PetType[] = [
  {
    id: 'unicorn',
    name: 'Licorne',
    emoji: '🦄',
    stages: [
      { level: 1, name: 'Poulain magique', emoji: '🦄', requiredPoints: 0, description: 'Une petite licorne scintillante' },
      { level: 2, name: 'Licorne joyeuse', emoji: '✨🦄', requiredPoints: 200, description: 'Sa corne commence à briller' },
      { level: 3, name: 'Licorne arc-en-ciel', emoji: '🌈🦄', requiredPoints: 500, description: 'Elle laisse des arcs-en-ciel' },
      { level: 4, name: 'Licorne céleste', emoji: '⭐🦄', requiredPoints: 1000, description: 'Elle vole dans les nuages' },
      { level: 5, name: 'Licorne cosmique', emoji: '🌙🦄', requiredPoints: 2000, description: 'Gardienne des étoiles' },
      { level: 6, name: 'Licorne légendaire', emoji: '👑🦄✨', requiredPoints: 5000, description: 'Reine des créatures magiques' },
    ]
  },
  {
    id: 'phoenix',
    name: 'Phénix',
    emoji: '🔥',
    stages: [
      { level: 1, name: 'Œuf de feu', emoji: '🥚🔥', requiredPoints: 0, description: 'Un œuf qui rougeoit' },
      { level: 2, name: 'Oisillon de braise', emoji: '🐦🔥', requiredPoints: 200, description: 'Premières flammes' },
      { level: 3, name: 'Phénix flamboyant', emoji: '🦅🔥', requiredPoints: 500, description: 'Ailes de feu' },
      { level: 4, name: 'Phénix solaire', emoji: '☀️🦅', requiredPoints: 1000, description: 'Aussi brillant que le soleil' },
      { level: 5, name: 'Phénix immortel', emoji: '✨🦅🔥', requiredPoints: 2000, description: 'Renaît de ses cendres' },
      { level: 6, name: 'Phénix divin', emoji: '👑🦅✨', requiredPoints: 5000, description: 'Maître du feu éternel' },
    ]
  },
  {
    id: 'penguin',
    name: 'Pingouin',
    emoji: '🐧',
    stages: [
      { level: 1, name: 'Bébé pingouin', emoji: '🐧', requiredPoints: 0, description: 'Petit et mignon' },
      { level: 2, name: 'Pingouin joueur', emoji: '🐧❄️', requiredPoints: 200, description: 'Glisse sur la glace' },
      { level: 3, name: 'Pingouin nageur', emoji: '🐧🌊', requiredPoints: 500, description: 'Expert en plongée' },
      { level: 4, name: 'Pingouin polaire', emoji: '🐧⭐', requiredPoints: 1000, description: 'Roi de la banquise' },
      { level: 5, name: 'Pingouin savant', emoji: '🎓🐧', requiredPoints: 2000, description: 'Génie des maths' },
      { level: 6, name: 'Empereur pingouin', emoji: '👑🐧✨', requiredPoints: 5000, description: 'Souverain de l\'Antarctique' },
    ]
  },
  {
    id: 'koala',
    name: 'Koala',
    emoji: '🐨',
    stages: [
      { level: 1, name: 'Bébé koala', emoji: '🐨', requiredPoints: 0, description: 'Accroché à sa branche' },
      { level: 2, name: 'Koala curieux', emoji: '🐨🌿', requiredPoints: 200, description: 'Explore les arbres' },
      { level: 3, name: 'Koala zen', emoji: '🐨🧘', requiredPoints: 500, description: 'Maître de la relaxation' },
      { level: 4, name: 'Koala sage', emoji: '📚🐨', requiredPoints: 1000, description: 'Amateur de livres' },
      { level: 5, name: 'Koala étoilé', emoji: '⭐🐨', requiredPoints: 2000, description: 'Guide nocturne' },
      { level: 6, name: 'Koala légendaire', emoji: '👑🐨✨', requiredPoints: 5000, description: 'Gardien de la forêt' },
    ]
  },
  {
    id: 'wolf',
    name: 'Loup',
    emoji: '🐺',
    stages: [
      { level: 1, name: 'Louveteau', emoji: '🐺', requiredPoints: 0, description: 'Un petit loup curieux' },
      { level: 2, name: 'Loup joueur', emoji: '🐺🌲', requiredPoints: 200, description: 'Court dans la forêt' },
      { level: 3, name: 'Loup chasseur', emoji: '🐺🎯', requiredPoints: 500, description: 'Sens aiguisés' },
      { level: 4, name: 'Loup alpha', emoji: '🐺💪', requiredPoints: 1000, description: 'Chef de meute' },
      { level: 5, name: 'Loup lunaire', emoji: '🌙🐺', requiredPoints: 2000, description: 'Hurle à la lune' },
      { level: 6, name: 'Loup mythique', emoji: '👑🐺✨', requiredPoints: 5000, description: 'Esprit de la forêt' },
    ]
  },
  {
    id: 'tiger',
    name: 'Tigre',
    emoji: '🐯',
    stages: [
      { level: 1, name: 'Tigreau', emoji: '🐯', requiredPoints: 0, description: 'Un adorable bébé tigre' },
      { level: 2, name: 'Tigre bondissant', emoji: '🐯💨', requiredPoints: 200, description: 'Rapide et agile' },
      { level: 3, name: 'Tigre royal', emoji: '🐯👑', requiredPoints: 500, description: 'Majestueux' },
      { level: 4, name: 'Tigre guerrier', emoji: '🐯⚔️', requiredPoints: 1000, description: 'Fort et courageux' },
      { level: 5, name: 'Tigre blanc', emoji: '🐅✨', requiredPoints: 2000, description: 'Rare et mystique' },
      { level: 6, name: 'Tigre céleste', emoji: '👑🐯🔥', requiredPoints: 5000, description: 'Gardien légendaire' },
    ]
  },
  {
    id: 'dolphin',
    name: 'Dauphin',
    emoji: '🐬',
    stages: [
      { level: 1, name: 'Bébé dauphin', emoji: '🐬', requiredPoints: 0, description: 'Petit et joueur' },
      { level: 2, name: 'Dauphin sauteur', emoji: '🐬💦', requiredPoints: 200, description: 'Fait des acrobaties' },
      { level: 3, name: 'Dauphin marin', emoji: '🐬🌊', requiredPoints: 500, description: 'Roi des vagues' },
      { level: 4, name: 'Dauphin intelligent', emoji: '🐬🧠', requiredPoints: 1000, description: 'Génie des océans' },
      { level: 5, name: 'Dauphin arc-en-ciel', emoji: '🌈🐬', requiredPoints: 2000, description: 'Brille de mille couleurs' },
      { level: 6, name: 'Dauphin cosmique', emoji: '👑🐬✨', requiredPoints: 5000, description: 'Gardien des mers' },
    ]
  },
]

interface PetState {
  selectedPetId: string | null
  petName: string
  currentPoints: number
  ownedAccessories: string[]
  ownedBackgrounds: string[]
  equippedAccessory: string | null
  equippedBackground: string
  traits: PetTraits
  activeSideQuests: string[]
  completedSideQuests: string[]
  lastSideQuestRefresh: string | null

  // Actions
  selectPet: (petId: string, name: string) => void
  addPetPoints: (points: number) => void
  getCurrentStage: () => PetStage | null
  getNextStage: () => PetStage | null
  getProgress: () => { current: number; next: number; percentage: number }
  getPetType: () => PetType | null
  renamePet: (name: string) => void
  buyAccessory: (accessoryId: string) => boolean
  buyBackground: (backgroundId: string) => boolean
  equipAccessory: (accessoryId: string | null) => void
  equipBackground: (backgroundId: string) => void
  getEquippedAccessory: () => Accessory | null
  getEquippedBackground: () => Background
  updateTrait: (trait: keyof PetTraits, amount: number) => void
  feedPet: () => void
  playWithPet: () => void
  refreshSideQuests: () => void
  completeSideQuest: (questId: string) => void
  getActiveSideQuests: () => SideQuest[]
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      selectedPetId: null,
      petName: '',
      currentPoints: 0,
      ownedAccessories: [],
      ownedBackgrounds: ['bg-default'],
      equippedAccessory: null,
      equippedBackground: 'bg-default',
      traits: {
        happiness: 70,
        energy: 100,
        intelligence: 10,
      },
      activeSideQuests: [],
      completedSideQuests: [],
      lastSideQuestRefresh: null,

      selectPet: (petId, name) => {
        set({
          selectedPetId: petId,
          petName: name,
          currentPoints: 0,
        })
        get().refreshSideQuests()
      },

      addPetPoints: (points) => {
        set((state) => ({
          currentPoints: state.currentPoints + points
        }))
      },

      getCurrentStage: () => {
        const { selectedPetId, currentPoints } = get()
        if (!selectedPetId) return null

        const pet = AVAILABLE_PETS.find(p => p.id === selectedPetId)
        if (!pet) return null

        const qualifiedStages = pet.stages.filter(s => currentPoints >= s.requiredPoints)
        return qualifiedStages.length > 0 ? qualifiedStages[qualifiedStages.length - 1] : pet.stages[0]
      },

      getNextStage: () => {
        const { selectedPetId, currentPoints } = get()
        if (!selectedPetId) return null

        const pet = AVAILABLE_PETS.find(p => p.id === selectedPetId)
        if (!pet) return null

        const nextStage = pet.stages.find(s => currentPoints < s.requiredPoints)
        return nextStage || null
      },

      getProgress: () => {
        const currentStage = get().getCurrentStage()
        const nextStage = get().getNextStage()
        const { currentPoints } = get()

        if (!currentStage) return { current: 0, next: 100, percentage: 0 }

        if (!nextStage) {
          return { current: currentPoints, next: currentPoints, percentage: 100 }
        }

        const progressInStage = currentPoints - currentStage.requiredPoints
        const stageTotal = nextStage.requiredPoints - currentStage.requiredPoints
        const percentage = (progressInStage / stageTotal) * 100

        return {
          current: progressInStage,
          next: stageTotal,
          percentage: Math.min(percentage, 100)
        }
      },

      getPetType: () => {
        const { selectedPetId } = get()
        if (!selectedPetId) return null
        return AVAILABLE_PETS.find(p => p.id === selectedPetId) || null
      },

      renamePet: (name) => {
        set({ petName: name })
      },

      buyAccessory: (accessoryId) => {
        const { currentPoints, ownedAccessories } = get()
        const accessory = ACCESSORIES.find(a => a.id === accessoryId)

        if (!accessory) return false
        if (ownedAccessories.includes(accessoryId)) return false
        if (currentPoints < accessory.price) return false

        set((state) => ({
          currentPoints: state.currentPoints - accessory.price,
          ownedAccessories: [...state.ownedAccessories, accessoryId],
        }))
        return true
      },

      buyBackground: (backgroundId) => {
        const { currentPoints, ownedBackgrounds } = get()
        const background = BACKGROUNDS.find(b => b.id === backgroundId)

        if (!background) return false
        if (ownedBackgrounds.includes(backgroundId)) return false
        if (currentPoints < background.price) return false

        set((state) => ({
          currentPoints: state.currentPoints - background.price,
          ownedBackgrounds: [...state.ownedBackgrounds, backgroundId],
        }))
        return true
      },

      equipAccessory: (accessoryId) => {
        const { ownedAccessories } = get()
        if (accessoryId === null || ownedAccessories.includes(accessoryId)) {
          set({ equippedAccessory: accessoryId })
        }
      },

      equipBackground: (backgroundId) => {
        const { ownedBackgrounds } = get()
        if (ownedBackgrounds.includes(backgroundId)) {
          set({ equippedBackground: backgroundId })
        }
      },

      getEquippedAccessory: () => {
        const { equippedAccessory } = get()
        if (!equippedAccessory) return null
        return ACCESSORIES.find(a => a.id === equippedAccessory) || null
      },

      getEquippedBackground: () => {
        const { equippedBackground } = get()
        return BACKGROUNDS.find(b => b.id === equippedBackground) || BACKGROUNDS[0]
      },

      updateTrait: (trait, amount) => {
        set((state) => ({
          traits: {
            ...state.traits,
            [trait]: Math.max(0, Math.min(100, state.traits[trait] + amount)),
          },
        }))
      },

      feedPet: () => {
        const { currentPoints, traits } = get()
        const cost = 20
        if (currentPoints >= cost && traits.energy < 100) {
          set((state) => ({
            currentPoints: state.currentPoints - cost,
            traits: {
              ...state.traits,
              energy: Math.min(100, state.traits.energy + 30),
            },
          }))
        }
      },

      playWithPet: () => {
        const { currentPoints, traits } = get()
        const cost = 15
        if (currentPoints >= cost && traits.happiness < 100) {
          set((state) => ({
            currentPoints: state.currentPoints - cost,
            traits: {
              ...state.traits,
              happiness: Math.min(100, state.traits.happiness + 20),
              energy: Math.max(0, state.traits.energy - 10),
            },
          }))
        }
      },

      refreshSideQuests: () => {
        const today = new Date().toISOString().split('T')[0]
        const { lastSideQuestRefresh } = get()

        if (lastSideQuestRefresh === today) return

        const shuffled = [...SIDE_QUESTS].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, 3).map(q => q.id)

        set({
          activeSideQuests: selected,
          completedSideQuests: [],
          lastSideQuestRefresh: today,
        })
      },

      completeSideQuest: (questId) => {
        const { activeSideQuests, completedSideQuests } = get()
        const quest = SIDE_QUESTS.find(q => q.id === questId)

        if (!quest || completedSideQuests.includes(questId)) return
        if (!activeSideQuests.includes(questId)) return

        set((state) => ({
          currentPoints: state.currentPoints + quest.rewardPoints,
          completedSideQuests: [...state.completedSideQuests, questId],
          traits: {
            ...state.traits,
            [quest.rewardTrait]: Math.max(0, Math.min(100, state.traits[quest.rewardTrait] + quest.rewardTraitAmount)),
          },
        }))
      },

      getActiveSideQuests: () => {
        const { activeSideQuests } = get()
        return SIDE_QUESTS.filter(q => activeSideQuests.includes(q.id))
      },
    }),
    {
      name: 'maths-pet',
    }
  )
)
