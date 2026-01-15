import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Lesson, LessonFrontmatter, Exercise, Flashcard, Quiz, Chapter, Module, Track } from '@/types'

const contentDirectory = path.join(process.cwd(), 'content')

// ==========================================
// Leçons
// ==========================================

export function getAllLessons(): Lesson[] {
  const lessonsDir = path.join(contentDirectory, 'lessons')

  if (!fs.existsSync(lessonsDir)) {
    return []
  }

  const tracks: Track[] = ['rappels', 'spe', 'expertes']
  const lessons: Lesson[] = []

  for (const track of tracks) {
    const trackDir = path.join(lessonsDir, track)
    if (!fs.existsSync(trackDir)) continue

    const files = fs.readdirSync(trackDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

    for (const file of files) {
      const filePath = path.join(trackDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      const slug = file.replace(/\.mdx?$/, '')

      lessons.push({
        ...(data as LessonFrontmatter),
        content,
        slug,
      })
    }
  }

  const trackOrder: Record<Track, number> = { rappels: 0, spe: 1, expertes: 2 }
  return lessons.sort((a, b) => {
    if (a.track !== b.track) return (trackOrder[a.track] ?? 99) - (trackOrder[b.track] ?? 99)
    return a.order - b.order
  })
}

export function getLessonBySlug(track: Track, slug: string): Lesson | null {
  const lessonsDir = path.join(contentDirectory, 'lessons', track)

  const extensions = ['.mdx', '.md']
  for (const ext of extensions) {
    const filePath = path.join(lessonsDir, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      return {
        ...(data as LessonFrontmatter),
        content,
        slug,
      }
    }
  }

  return null
}

export function getLessonsByTrack(track: Track): Lesson[] {
  return getAllLessons().filter((l) => l.track === track)
}

export function getLessonsByChapter(chapter: string): Lesson[] {
  return getAllLessons().filter((l) => l.chapter === chapter)
}

export function getLessonById(id: string): Lesson | null {
  return getAllLessons().find((l) => l.id === id) || null
}

// ==========================================
// Exercices
// ==========================================

export function getAllExercises(): Exercise[] {
  const exercisesPath = path.join(contentDirectory, 'exercises.json')

  if (!fs.existsSync(exercisesPath)) {
    return []
  }

  const content = fs.readFileSync(exercisesPath, 'utf-8')
  return JSON.parse(content) as Exercise[]
}

export function getExercisesByLesson(lessonId: string): Exercise[] {
  return getAllExercises().filter((e) => e.lessonId === lessonId)
}

export function getExerciseById(id: string): Exercise | null {
  return getAllExercises().find((e) => e.id === id) || null
}

export function getComprehensionExercises(lessonId: string): Exercise[] {
  return getAllExercises().filter((e) => e.lessonId === lessonId && e.isComprehension)
}

// ==========================================
// Flashcards
// ==========================================

export function getAllFlashcards(): Flashcard[] {
  const flashcardsPath = path.join(contentDirectory, 'flashcards.json')

  if (!fs.existsSync(flashcardsPath)) {
    return []
  }

  const content = fs.readFileSync(flashcardsPath, 'utf-8')
  return JSON.parse(content) as Flashcard[]
}

export function getFlashcardsByLesson(lessonId: string): Flashcard[] {
  return getAllFlashcards().filter((f) => f.lessonId === lessonId)
}

export function getFlashcardById(id: string): Flashcard | null {
  return getAllFlashcards().find((f) => f.id === id) || null
}

export function getFlashcardsByTag(tag: string): Flashcard[] {
  return getAllFlashcards().filter((f) => f.tags.includes(tag))
}

// ==========================================
// QCM
// ==========================================

export function getAllQuizzes(): Quiz[] {
  const quizzesPath = path.join(contentDirectory, 'quizzes.json')

  if (!fs.existsSync(quizzesPath)) {
    return []
  }

  const content = fs.readFileSync(quizzesPath, 'utf-8')
  return JSON.parse(content) as Quiz[]
}

export function getQuizzesByLesson(lessonId: string): Quiz[] {
  return getAllQuizzes().filter((q) => q.lessonId === lessonId)
}

export function getPreQuiz(lessonId: string): Quiz | null {
  return getAllQuizzes().find((q) => q.lessonId === lessonId && q.type === 'pre') || null
}

export function getPostQuiz(lessonId: string): Quiz | null {
  return getAllQuizzes().find((q) => q.lessonId === lessonId && q.type === 'post') || null
}

export function getQuizById(id: string): Quiz | null {
  return getAllQuizzes().find((q) => q.id === id) || null
}

// ==========================================
// Structure des cours (Modules et Chapitres)
// ==========================================

export function getCourseStructure(): Module[] {
  const structurePath = path.join(contentDirectory, 'structure.json')

  if (!fs.existsSync(structurePath)) {
    // Structure par défaut si le fichier n'existe pas
    return getDefaultStructure()
  }

  const content = fs.readFileSync(structurePath, 'utf-8')
  return JSON.parse(content) as Module[]
}

function getDefaultStructure(): Module[] {
  return [
    {
      id: 'rappels-module',
      title: 'Rappels',
      track: 'rappels',
      description: 'Rappels express pour consolider les bases',
      chapters: [
        {
          id: 'rappels-notations',
          title: 'Notations essentielles',
          track: 'rappels',
          order: 1,
          description: 'Sommes, produits et notations clés',
          lessons: ['sommes-produits'],
        },
      ],
    },
    {
      id: 'spe-module',
      title: 'Spécialité Mathématiques',
      track: 'spe',
      description: 'Programme complet de spécialité mathématiques en Terminale',
      chapters: [
        {
          id: 'raisonnement',
          title: 'Raisonnement et démonstration',
          track: 'spe',
          order: 1,
          description: 'Logique, implications, récurrence',
          lessons: ['implication-equivalence', 'recurrence'],
        },
        {
          id: 'suites',
          title: 'Suites numériques',
          track: 'spe',
          order: 2,
          description: 'Définitions, limites, convergence',
          lessons: ['suites-definition', 'suites-limites', 'suites-convergence'],
        },
        {
          id: 'fonctions',
          title: 'Fonctions',
          track: 'spe',
          order: 3,
          description: 'Limites, continuité, dérivation, convexité',
          lessons: ['limites-fonctions', 'continuite', 'derivation', 'convexite'],
        },
        {
          id: 'exp-ln',
          title: 'Fonctions exponentielles et logarithmes',
          track: 'spe',
          order: 4,
          description: 'Propriétés, équations, applications',
          lessons: ['exponentielle', 'logarithme'],
        },
        {
          id: 'trigo',
          title: 'Trigonométrie',
          track: 'spe',
          order: 5,
          description: 'Fonctions trigonométriques, équations',
          lessons: ['trigonometrie-bases', 'fonctions-trigo'],
        },
        {
          id: 'geometrie-espace',
          title: 'Géométrie dans l\'espace',
          track: 'spe',
          order: 6,
          description: 'Vecteurs, droites, plans, orthogonalité',
          lessons: ['vecteurs-espace', 'produit-scalaire-espace', 'droites-plans-espace', 'orthogonalite-espace'],
        },
        {
          id: 'integration',
          title: 'Intégration',
          track: 'spe',
          order: 7,
          description: 'Primitives, intégrales, calcul d\'aires',
          lessons: ['primitives', 'integrales', 'equations-differentielles'],
        },
        {
          id: 'probabilites',
          title: 'Probabilités',
          track: 'spe',
          order: 8,
          description: 'Combinatoire, variables aléatoires et lois usuelles',
          lessons: ['combinatoire', 'variables-aleatoires', 'loi-binomiale', 'probabilites-va', 'loi-normale'],
        },
      ],
    },
    {
      id: 'expertes-module',
      title: 'Maths Expertes',
      track: 'expertes',
      description: 'Programme de mathématiques expertes en Terminale',
      chapters: [
        {
          id: 'complexes',
          title: 'Nombres complexes',
          track: 'expertes',
          order: 1,
          description: 'Formes, opérations, géométrie',
          lessons: ['complexes-introduction', 'complexes-formes', 'complexes-geometrie', 'equations-polynomiales-complexes'],
        },
        {
          id: 'matrices',
          title: 'Matrices et systèmes',
          track: 'expertes',
          order: 2,
          description: 'Opérations, systèmes linéaires',
          lessons: ['matrices-operations', 'matrices-systemes', 'chaines-markov'],
        },
        {
          id: 'arithmetique',
          title: 'Arithmétique',
          track: 'expertes',
          order: 3,
          description: 'Divisibilité, congruences, applications',
          lessons: ['divisibilite', 'congruences', 'nombres-premiers', 'bezout'],
        },
        {
          id: 'graphes',
          title: 'Graphes',
          track: 'expertes',
          order: 4,
          description: 'Théorie des graphes',
          lessons: ['graphes-introduction', 'graphes-parcours'],
        },
      ],
    },
  ]
}

export function getChapterById(chapterId: string): Chapter | null {
  const structure = getCourseStructure()

  for (const module of structure) {
    const chapter = module.chapters.find((c) => c.id === chapterId)
    if (chapter) return chapter
  }

  return null
}

// ==========================================
// Recherche
// ==========================================

export interface SearchableItem {
  id: string
  title: string
  type: 'lesson' | 'exercise' | 'flashcard' | 'qcm'
  track?: Track
  content: string
  url: string
}

export function getSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = []

  // Ajouter les leçons
  for (const lesson of getAllLessons()) {
    items.push({
      id: lesson.id,
      title: lesson.title,
      type: 'lesson',
      track: lesson.track,
      content: lesson.content,
      url: `/lecons/${lesson.track}/${lesson.slug}`,
    })
  }

  // Ajouter les exercices
  for (const exercise of getAllExercises()) {
    items.push({
      id: exercise.id,
      title: exercise.title,
      type: 'exercise',
      content: exercise.statement,
      url: `/exercices/${exercise.id}`,
    })
  }

  // Ajouter les flashcards
  for (const flashcard of getAllFlashcards()) {
    items.push({
      id: flashcard.id,
      title: flashcard.front,
      type: 'flashcard',
      content: `${flashcard.front} ${flashcard.back}`,
      url: `/flashcards?id=${flashcard.id}`,
    })
  }

  // Ajouter les QCM
  for (const quiz of getAllQuizzes()) {
    items.push({
      id: quiz.id,
      title: quiz.title,
      type: 'qcm',
      content: quiz.questions.map((q) => q.question).join(' '),
      url: `/qcm/${quiz.id}`,
    })
  }

  return items
}

// ==========================================
// Parcours de révision
// ==========================================

export function getRevisionPaths() {
  const pathsFile = path.join(contentDirectory, 'paths.json')

  if (!fs.existsSync(pathsFile)) {
    return getDefaultPaths()
  }

  const content = fs.readFileSync(pathsFile, 'utf-8')
  return JSON.parse(content)
}

function getDefaultPaths() {
  return [
    {
      id: 'bac-30-jours',
      name: 'Révision Bac 30 jours',
      description: 'Parcours intensif pour préparer le bac en 30 jours',
      duration: '30 jours',
      tracks: ['spe'],
      difficulty: 'mixed',
    },
    {
      id: 'remise-niveau',
      name: 'Remise à niveau',
      description: 'Reprendre les bases avant d\'attaquer les chapitres avancés',
      duration: '15 jours',
      tracks: ['spe'],
      difficulty: 'progressive',
    },
    {
      id: 'mention',
      name: 'Objectif Mention',
      description: 'Maîtriser les points difficiles pour viser l\'excellence',
      duration: '45 jours',
      tracks: ['spe', 'expertes'],
      difficulty: 'hard',
    },
  ]
}
